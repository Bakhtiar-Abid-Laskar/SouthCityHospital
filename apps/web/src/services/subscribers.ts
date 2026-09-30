import { createClient } from "@/lib/supabase/client";

export interface SubscriberInput {
  name: string;
  phone: string;
}

export interface SubscriberResult {
  success: boolean;
  error?: string;
}

/**
 * register_subscriber — Single authority function for the "Stay Updated" popup.
 * Dispatches to the Supabase register_subscriber SECURITY DEFINER RPC when
 * configured, or returns a simulated success for local development.
 */
export async function registerSubscriber(
  input: SubscriberInput
): Promise<SubscriberResult> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("register_subscriber", {
        p_name: input.name.trim(),
        p_phone: input.phone.trim(),
      });

      if (error) {
        console.warn("register_subscriber RPC error:", error.message);
        return { success: false, error: error.message };
      }

      if (data && data.success === false) {
        if (data.error === "rate_limited") {
          return {
            success: false,
            error: "Too many attempts. Please try again later.",
          };
        }
        return { success: false, error: data.error || "Something went wrong." };
      }

      return { success: true };
    } catch (err: any) {
      console.warn("register_subscriber RPC threw:", err);
      return { success: false, error: "Connection error. Please try again." };
    }
  }

  // Local dev fallback — simulate a successful registration
  await new Promise((r) => setTimeout(r, 600));
  return { success: true };
}