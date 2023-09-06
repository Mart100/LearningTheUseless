import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession()
	const userResponse = await supabase.auth.getUser()

	if (!session || !session.user || userResponse.data.user === null) {
		throw redirect(303, '/')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.eq('id', session.user.id)
		.single()
	if (!profile) throw redirect(303, '/')

	let { data: followers } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.contains('following', [session.user.id])
	if (!followers) followers = []

	let { data: following } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.eq('id', [profile.following])
	if (!following) following = []

	return { session, profile, user: userResponse.data.user, followers, following }
}

export const actions = {
	signout: async ({ locals: { supabase, getSession } }) => {
		const session = await getSession()
		if (session) {
			await supabase.auth.signOut()
			throw redirect(303, '/')
		}
	},
	searchFriends: async ({ request, locals: { supabase, getSession } }) => {
		const formData = await request.formData()
		const search = (formData.get('search') as string).toLowerCase().trim()

		const session = await getSession()
		if (!session) return

		let { data: profiles } = await supabase
			.from('profiles')
			.select(`id, username, avatar_url, following`)
			.ilike('username', `%${search}%`)
			.limit(5)

		if (profiles) profiles = profiles.filter((profile) => profile.id !== session.user.id)

		return { profiles }
	}
}
