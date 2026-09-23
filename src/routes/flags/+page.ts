import { fetchAllGameStats } from '$lib/fetchGameStats'

export const load = async ({ parent }) => {
	const { session, supabase } = await parent()
	const { gameStats, globalGameStats, friendsLeaderboard } = await fetchAllGameStats(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		supabase as any,
		session,
		'flags'
	)
	return {
		streamed: { gameStats, globalGameStats, friendsLeaderboard }
	}
}
