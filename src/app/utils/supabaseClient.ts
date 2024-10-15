
import { createClient, Session} from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const email = process.env.NEXT_PUBLIC_SUPABASE_EMAIL || '';
const password = process.env.NEXT_PUBLIC_SUPABASE_EMAIL_PASSWORD || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
        
export async function signInWithPassword(): Promise<{ data: Session | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (data && data.session) {
    return { data: data.session, error: error };
  } else {
    return { data: null, error: error };
  }
}