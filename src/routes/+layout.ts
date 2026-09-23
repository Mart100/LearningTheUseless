import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import type { Database } from '../database.types'
import { dev } from '$app/environment'
import { inject } from '@vercel/analytics'

export const load = async ({ fetch, data, depends }) => {
	inject({ mode: dev ? 'development' : 'production' })

	depends('supabase:auth')

	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: {
					getAll: () => data.cookies,
					setAll: () => {}
				}
			})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	const {
		data: { user }
	} = await supabase.auth.getUser()

	return { supabase, session, user }
}
