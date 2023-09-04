import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'
import type { GameStatsData } from '../../app'

//src/routes/pi/+page.ts
export const load = async ({ parent }) => {
	const streamed = parent().then(({ session, supabase }) => {
		if (!session) return { gameStats: null, globalGameStats: null }
		return {
			gameStats: fetchGameStats(session, supabase),
			globalGameStats: fetchGlobalGameStats(supabase)
		}
	})

	return {
		streamed
	}
}

async function fetchGlobalGameStats(supabase: SupabaseClient<Database>) {
	const { data, error } = await supabase.from('game_stats').select().eq('game', 'pi')
	if (error) {
		console.error(error)
		return null
	} else {
		return data[0].data as Record<string, number>
	}
}

async function fetchGameStats(session: Session, supabase: SupabaseClient<Database>) {
	const user = session.user

	const gameStats: GameStatsData = {
		previousGames: [],
		highscore: 0
	}

	if (user) {
		const { data, error } = await supabase
			.from('game_pi')
			.select()
			.eq('user_id', user.id)
			.order('played_at', { ascending: false })
		if (error) {
			console.error(error)
			return null
		} else {
			gameStats.previousGames = data

			const highscore = data.reduce((acc, curr) => {
				if (curr.score > acc) return curr.score
				return acc
			}, 0)
			gameStats.highscore = highscore
		}

		return gameStats
	}
	return null
}
