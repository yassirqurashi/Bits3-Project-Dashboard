const DEFAULT_SUPABASE_URL = 'https://tyjfyyehhepjqfyekwhb.supabase.co'

export const getSupabaseUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL

  try {
    const parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)

    if (!parsedUrl.hostname.includes('supabase.co')) {
      return DEFAULT_SUPABASE_URL
    }

    return `${parsedUrl.protocol}//${parsedUrl.hostname}`
  } catch {
    return DEFAULT_SUPABASE_URL
  }
}
