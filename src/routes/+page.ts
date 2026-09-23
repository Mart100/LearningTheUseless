import { fetchStreak, fetchTodaysDailies } from '$lib/fetchGameStats'

export const load = async ({ parent }) => {
	const { session, supabase } = await parent()

	if (!session?.user) {
		return { dailies: null, streak: null }
	}

	const userId = session.user.id
	return {
		dailies: fetchTodaysDailies(supabase as any, userId),
		streak: fetchStreak(supabase as any, userId)
	}
}
