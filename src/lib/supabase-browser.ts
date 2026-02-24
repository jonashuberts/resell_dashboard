import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function createBrowserClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split('; ').reduce((acc, current) => {
            const [key, value] = current.split('=')
            if (key) acc.push({ name: key, value })
            return acc
          }, [] as { name: string; value: string }[])
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              document.cookie = `${name}=${value}`
            })
          } catch {
            // Unlikely to happen in browser
          }
        },
      },
    }
  )
}
