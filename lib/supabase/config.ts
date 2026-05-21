const DEFAULT_SUPABASE_URL = 'https://tyjfyyehhepjqfyekwhb.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-rkIeRGCHoa6KRdVOF0cdg_Nu8fAIwd'

export const getSupabaseUrl = () => {
  return DEFAULT_SUPABASE_URL
}

export const getSupabaseAnonKey = () => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return envKey && envKey.length > 20 ? envKey : DEFAULT_SUPABASE_ANON_KEY
}
