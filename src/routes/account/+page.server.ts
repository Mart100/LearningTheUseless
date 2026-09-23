import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession()
	const userResponse = await supabase.auth.getUser()

	if (!session || !session.user || userResponse.data.user === null) {
		redirect(303, '/')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following, streak_current, streak_best, streak_last_date`)
		.eq('id', session.user.id)
		.single()
	if (!profile) redirect(303, '/')

	let { data: followers } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.contains('following', [session.user.id])
	if (!followers) followers = []

	let { data: following } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.in('id', profile.following)
	if (!following) following = []

	return { session, profile, user: userResponse.data.user, followers, following }
}

export const actions = {
	signout: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession()
		if (session) {
			await supabase.auth.signOut()
			redirect(303, '/')
		}
	},
	searchFriends: async ({ request, locals: { supabase, safeGetSession } }) => {
		const formData = await request.formData()
		const search = (formData.get('search') as string).toLowerCase().trim()

		const { session } = await safeGetSession()
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
