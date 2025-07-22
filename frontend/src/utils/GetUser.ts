import { SupabaseClient } from "@supabase/supabase-js";

export default async function GetUser(supabase: SupabaseClient) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw error
    }
    return user!.id;
  } catch {
    alert("Error getting user information.");
  }

}
