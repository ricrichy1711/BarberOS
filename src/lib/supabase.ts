/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://falta-configurar-supabase.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'falta-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Faltan las credenciales de Supabase. La app no funcionará hasta que configures VITE_SUPABASE_URL en Vercel/Netlify.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
