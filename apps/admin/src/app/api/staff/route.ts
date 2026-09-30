import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  listStaffAccounts,
  createStaffAccount,
  toggleStaffActive,
  resetStaffPassword,
} from "@/services/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const accounts = await listStaffAccounts();
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const result = await createStaffAccount(body, admin.id);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Account ID is required." },
        { status: 400 }
      );
    }

    const result = await toggleStaffActive(accountId);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { accountId, newPassword } = body;

    if (!accountId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Account ID and new password are required." },
        { status: 400 }
      );
    }

    const result = await resetStaffPassword(accountId, newPassword);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin role required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
}
