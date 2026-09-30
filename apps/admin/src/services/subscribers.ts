import { createClient } from "@/lib/supabase/client";

export interface Subscriber {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("update_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscribers:", error);
    throw new Error(error.message);
  }

  return (data || []) as Subscriber[];
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("update_subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting subscriber:", error);
    throw new Error(error.message);
  }

  return true;
}