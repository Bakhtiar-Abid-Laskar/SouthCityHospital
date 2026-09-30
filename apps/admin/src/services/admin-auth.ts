import type {
  StaffAccount,
  CreateStaffAccountInput,
  AuthSession,
  UserRole,
} from "@sch/types";
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/server";

function mapDbAccountToStaffAccount(dbRow: Record<string, any>): StaffAccount {
  return {
    id: dbRow.id,
    email: dbRow.email,
    fullName: dbRow.full_name || dbRow.fullName || "",
    role: (dbRow.role as UserRole) || "staff",
    isActive: dbRow.is_active !== undefined ? Boolean(dbRow.is_active) : Boolean(dbRow.isActive),
    createdBy: dbRow.created_by || dbRow.createdBy || null,
    createdAt: dbRow.created_at || dbRow.createdAt || new Date().toISOString(),
    updatedAt: dbRow.updated_at || dbRow.updatedAt || new Date().toISOString(),
    lastLoginAt: dbRow.last_login_at || dbRow.lastLoginAt || null,
  };
}

/**
 * Authenticates an admin or staff user via Supabase Auth / Supabase Database.
 * Securely enforces account active status and sets up session.
 */
export async function authenticateAdminUser(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Please provide both email and password." };
  }

  const supabase = createClient();

  if (supabase) {
    // 1. Primary: Supabase Auth (Sign in with Supabase Auth credentials)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!authError && authData.user) {
        // Fetch staff profile from staff_accounts table
        const { data: staffData } = await supabase
          .from("staff_accounts")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (staffData && !staffData.is_active) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: "This staff account has been deactivated. Please contact an administrator.",
          };
        }

        const finalRole: UserRole =
          staffData?.role ||
          (authData.user.user_metadata?.role as UserRole) ||
          "admin";

        const fullName: string =
          staffData?.full_name ||
          authData.user.user_metadata?.full_name ||
          authData.user.email?.split("@")[0] ||
          "Administrator";

        if (!staffData) {
          // Automatically register newly created Supabase Auth user into staff_accounts
          try {
            await supabase.from("staff_accounts").upsert({
              id: authData.user.id,
              email: cleanEmail,
              full_name: fullName,
              role: finalRole,
              is_active: true,
              password_hash: "SUPABASE_AUTH_MANAGED",
              last_login_at: new Date().toISOString(),
            });
          } catch (upsertErr) {
            console.warn("Auto-provision staff account warning:", upsertErr);
          }
        } else if (staffData?.id) {
          // Update last login timestamp in staff_accounts
          await supabase
            .from("staff_accounts")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", staffData.id);
        }

        const session: AuthSession = {
          id: staffData?.id || authData.user.id,
          email: authData.user.email || cleanEmail,
          fullName,
          role: finalRole,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };

        return { success: true, session };
      }
    } catch (authErr) {
      console.warn("Supabase Auth sign-in attempted, evaluating database verification...", authErr);
    }

    // 2. Secondary: Supabase RPC (verify_staff_credentials with Postgres bcrypt/crypt)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "verify_staff_credentials",
        {
          p_email: cleanEmail,
          p_password: cleanPass,
        }
      );

      if (!rpcError && rpcData) {
        if (rpcData.success && rpcData.user) {
          const session: AuthSession = {
            id: rpcData.user.id,
            email: rpcData.user.email,
            fullName: rpcData.user.fullName || rpcData.user.full_name,
            role: rpcData.user.role as UserRole,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          };
          return { success: true, session };
        } else if (rpcData.error) {
          return { success: false, error: rpcData.error };
        }
      }
    } catch (rpcErr) {
      console.warn("Supabase RPC verify_staff_credentials fallback:", rpcErr);
    }
  }

  return { success: false, error: "Invalid email or password." };
}

/**
 * Lists all staff and admin accounts from Supabase.
 */
export async function listStaffAccounts(): Promise<StaffAccount[]> {
  const adminClient = createAdminClient();
  const supabase = adminClient || createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select("id, email, full_name, role, is_active, created_by, created_at, updated_at, last_login_at")
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map(mapDbAccountToStaffAccount);
      }
    } catch (err) {
      console.error("Supabase listStaffAccounts error:", err);
    }
  }

  return [];
}

/**
 * Creates a new staff or admin account in Supabase.
 */
export async function createStaffAccount(
  input: CreateStaffAccountInput,
  createdByAdminId?: string
): Promise<{ success: boolean; account?: StaffAccount; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.fullName.trim();
  const cleanPass = input.password.trim();

  if (!cleanEmail || !cleanName || !cleanPass) {
    return { success: false, error: "All fields are required." };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { success: false, error: "Database admin client is not configured on the server." };
  }

  try {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPass,
      email_confirm: true,
      user_metadata: { full_name: cleanName, role: input.role }
    });

    if (authError) {
      if (authError.message.includes("already exists") || authError.message.includes("already registered")) {
        return { success: false, error: "An account with this email address already exists." };
      }
      return { success: false, error: authError.message };
    }

    const authUserId = authData.user.id;

    const { data, error } = await adminClient
      .from("staff_accounts")
      .insert({
        id: authUserId,
        email: cleanEmail,
        full_name: cleanName,
        role: input.role,
        password_hash: "SUPABASE_AUTH_MANAGED",
        is_active: true,
        created_by: createdByAdminId || null,
      })
      .select()
      .single();

    if (!error && data) {
      return { success: true, account: mapDbAccountToStaffAccount(data) };
    } else if (error) {
      await adminClient.auth.admin.deleteUser(authUserId);
      return { success: false, error: error.message };
    }
  } catch (err: any) {
    console.error("Supabase admin create user error:", err);
    return { success: false, error: err.message || "Failed to create staff account." };
  }

  return { success: false, error: "Failed to create staff account." };
}

/**
 * Toggles a staff account's active state in Supabase.
 */
export async function toggleStaffActive(
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient();
  const supabase = adminClient || createClient();
  if (!supabase) {
    return { success: false, error: "Database client unavailable." };
  }

  try {
    const { data: target, error: fetchError } = await supabase
      .from("staff_accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (fetchError || !target) {
      return { success: false, error: fetchError?.message || "Account not found." };
    }

    if (target.role === "admin" && target.is_active) {
      const { count } = await supabase
        .from("staff_accounts")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true);

      if (count !== null && count <= 1) {
        return {
          success: false,
          error: "Cannot deactivate the only active Administrator account in the system.",
        };
      }
    }

    const { error: updateError } = await supabase
      .from("staff_accounts")
      .update({ is_active: !target.is_active, updated_at: new Date().toISOString() })
      .eq("id", accountId);

    if (!updateError) {
      return { success: true };
    }
    return { success: false, error: updateError.message };
  } catch (err: any) {
    console.error("toggleStaffActive error:", err);
    return { success: false, error: err.message || "Failed to toggle account status." };
  }
}

/**
 * Resets a staff member's password in Supabase.
 */
export async function resetStaffPassword(
  accountId: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPass = newPasswordPlain.trim();
  if (!cleanPass) {
    return { success: false, error: "Password cannot be empty." };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { success: false, error: "Database admin client is not configured." };
  }

  try {
    const { error: authError } = await adminClient.auth.admin.updateUserById(accountId, {
      password: cleanPass
    });
    
    if (authError) {
      const { data: rpcData, error: rpcError } = await adminClient.rpc("reset_staff_password", {
        p_account_id: accountId,
        p_new_password: cleanPass,
      });

      if (!rpcError && rpcData?.success) {
        return { success: true };
      }
      return { success: false, error: rpcError?.message || authError.message || "Failed to reset password." };
    } else {
       await adminClient
         .from("staff_accounts")
         .update({
           password_hash: "SUPABASE_AUTH_MANAGED",
           updated_at: new Date().toISOString(),
         })
         .eq("id", accountId);
       return { success: true };
    }
  } catch (err: any) {
    console.error("Supabase reset password error:", err);
    return { success: false, error: err.message || "Failed to reset password." };
  }
}
