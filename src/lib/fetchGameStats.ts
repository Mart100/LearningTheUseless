import type { Session } from '@supabase/supabase-js'
import type { GameLeaderboardFriend, GameStatsData } from '../app'
import type { Database } from '../database.types'

type Game = 'pi' | 'flags'
type GameTable = `game_${Game}`

export async function fetchAllGameStats(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	session: Session | null,
	game: Game
) {
	return {
		gameStats: fetchGameStats(session, supabase, game),
		globalGameStats: fetchGlobalGameStats(supabase, game),
		friendsLeaderboard: fetchFriendsLeaderboard(session, supabase, game)
	}
}

async function fetchFriendsLeaderboard(
	session: Session | null,
	supabase: any,
	game: Game
): Promise<GameLeaderboardFriend[] | null> {
	if (!session) return null

	const profile = await fetchProfile(session, supabase)
	if (!profile) return null

	const table: GameTable = `game_${game}`

	console.log(profile.following)

	const { data, error: error1 } = await supabase
		.from(table)
		.select('user_id, score')
		.in('user_id', profile.following)

	if (error1) {
		console.error(error1)
		return null
	}

	const highscores = data.reduce(
		(acc: Record<string, number>, curr: { user_id: string; score: number }) => {
			if (acc[curr.user_id] == null) {
				acc[curr.user_id] = curr.score
			} else {
				if (curr.score > acc[curr.user_id]) {
					acc[curr.user_id] = curr.score
				}
			}
			return acc
		},
		{} as Record<string, number>
	)

	console.log(data, highscores)

	const { data: following, error: error2 } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.in('id', profile.following)

	if (error2) {
		console.error(error2)
		return null
	}

	const friends: GameLeaderboardFriend[] = following.map(
		(friend: { id: string; username: string; avatar_url: string; following: string[] }) => {
			return {
				...friend,
				highscore: highscores[friend.id] ?? 0
			}
		}
	)

	friends.sort((a, b) => b.highscore - a.highscore)

	return friends
}

async function fetchProfile(session: Session | null, supabase: any) {
	if (!session) return null

	const { data, error } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url, following`)
		.eq('id', session.user.id)
		.single()

	if (error) {
		console.error(error)
		return null
	}

	return data
}

async function fetchGlobalGameStats(supabase: any, game: Game) {
	const { data, error } = await supabase.from(`game_stats`).select().eq('game', game)
	if (error) {
		console.error(error)
		return null
	} else {
		return data[0].data as Record<string, number>
	}
}

async function fetchGameStats(
	session: Session | null,
	supabase: any,
	game: Game
) {
	if (session == null) return null
	const user = session.user

	const gameStats: GameStatsData = {
		previousGames: [],
		highscore: 0
	}

	if (user) {
		const { data, error } = await supabase
			.from(`game_${game}`)
			.select()
			.eq('user_id', user.id)
			.order('played_at', { ascending: false })
		if (error) {
			console.error(error)
			return null
		} else {
			gameStats.previousGames = data

			const highscore = data.reduce((acc: number, curr: { score: number }) => {
				if (curr.score > acc) return curr.score
				return acc
			}, 0)
			gameStats.highscore = highscore
		}

		return gameStats
	}
	return null
}
