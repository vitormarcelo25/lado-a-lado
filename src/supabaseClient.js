import { createClient } from '@supabase/supabase-js';

// Substitua pelas credenciais do painel do seu projeto no Supabase (Project Settings > API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);