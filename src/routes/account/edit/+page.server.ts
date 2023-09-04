import { fail, redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession()

	if (!session) {
		throw redirect(303, '/')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', session.user.id)
		.single()

	return { session, profile }
}

export const actions = {
	update: async ({ request, locals: { supabase, getSession } }) => {
		const formData = await request.formData()
		const username = formData.get('username') as string
		const avatarUrl = formData.get('avatarUrl') as string

		const session = await getSession()

		const { error } = await supabase.from('profiles').upsert({
			id: session?.user.id,
			username,
			avatar_url: avatarUrl,
			updated_at: new Date()
		})

		if (error) {
			let errorMsg = ''
			if (error.code === '23514') errorMsg = 'Username is too long or too short!'
			else if (error.code === '23505') errorMsg = 'Username is already taken!'
			else {
				errorMsg = 'Something went wrong.'
				console.log('Account Update Error: ', error)
			}
			return fail(422, {
				username,
				avatarUrl,
				errorMsg
			})
		}

		return {
			username,
			avatarUrl
		}
	},
	signout: async ({ locals: { supabase, getSession } }) => {
		const session = await getSession()
		if (session) {
			await supabase.auth.signOut()
			throw redirect(303, '/')
		}
	}
}
