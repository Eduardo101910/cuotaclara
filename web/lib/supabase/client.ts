import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu archivo .env.local."
  );
}

// Un solo cliente para todo el navegador. La ANON KEY es pública por diseño:
// la seguridad real la dan las políticas de RLS que ya creamos en Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);