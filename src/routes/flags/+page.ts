import { fetchAllGameStats } from '$lib/fetchGameStats'

export const load = async ({ parent }) => {
	const streamed = parent().then(({ session, supabase }) => {
		return fetchAllGameStats(supabase, session, 'flags')
	})

	return {
		streamed
	}
}
