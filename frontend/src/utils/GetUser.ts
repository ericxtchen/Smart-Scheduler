import { SupabaseClient } from "@supabase/supabase-js";

export default async function GetUser(token: string | undefined, supabase: SupabaseClient) {
  const gettoken = token!.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(gettoken);
    if (error || !user) {
      throw error;
    }
    return user;
  } catch (error) {
    if (error instanceof Error) {
      alert(`${error.message}`);
    }
    return;
  }

}
