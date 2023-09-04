import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession()
	const userResponse = await supabase.auth.getUser()

	if (!session || !session.user || userResponse.data.user === null) {
		throw redirect(303, '/')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', session.user.id)
		.single()

	return { session, profile, user: userResponse.data.user }
}

export const actions = {
	signout: async ({ locals: { supabase, getSession } }) => {
		const session = await getSession()
		if (session) {
			await supabase.auth.signOut()
			throw redirect(303, '/')
		}
	}
}
