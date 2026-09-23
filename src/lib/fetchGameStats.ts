import type { Session } from '@supabase/supabase-js'
import type { GameLeaderboardFriend, GameStatsData } from '../app'
import { todayUTC } from './seededRandom'

export type Game = 'pi' | 'flags' | 'capitals' | 'elements'
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
		return (data[0]?.data ?? {}) as Record<string, number>
	}
}

async function fetchGameStats(session: Session | null, supabase: any, game: Game) {
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

/** Fetch today's daily score for the signed-in user across all four games. */
export async function fetchTodaysDailies(
	supabase: any,
	userId: string
): Promise<Record<Game, { played: boolean; score: number | null }>> {
	const today = todayUTC()
	const games: Game[] = ['pi', 'flags', 'capitals', 'elements']
	const result: Record<Game, { played: boolean; score: number | null }> = {
		pi: { played: false, score: null },
		flags: { played: false, score: null },
		capitals: { played: false, score: null },
		elements: { played: false, score: null }
	}

	await Promise.all(
		games.map(async (game) => {
			const { data } = await supabase
				.from(`game_${game}`)
				.select('score')
				.eq('user_id', userId)
				.eq('is_daily', true)
				.eq('daily_date', today)
				.maybeSingle()
			if (data) {
				result[game] = { played: true, score: data.score }
			}
		})
	)

	return result
}

/** Fetch streak data from the user's profile. */
export async function fetchStreak(
	supabase: any,
	userId: string
): Promise<{ streakCurrent: number; streakBest: number } | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('streak_current, streak_best')
		.eq('id', userId)
		.single()
	if (error || !data) return null
	return { streakCurrent: data.streak_current ?? 0, streakBest: data.streak_best ?? 0 }
}

/**
 * Update the user's streak after a daily score is saved.
 * Call this client-side immediately after a successful daily insert.
 * Streak rule: consecutive UTC calendar days with at least one completed daily.
 */
export async function updateStreakAfterDaily(supabase: any, userId: string): Promise<void> {
	const today = todayUTC()

	const { data: profile, error } = await supabase
		.from('profiles')
		.select('streak_current, streak_best, streak_last_date')
		.eq('id', userId)
		.single()

	if (error || !profile) return

	const lastDate: string | null = profile.streak_last_date
	let current: number = profile.streak_current ?? 0
	let best: number = profile.streak_best ?? 0

	if (lastDate === today) {
		// Already counted today — nothing to do.
		return
	}

	const yesterday = (() => {
		const d = new Date(today + 'T00:00:00Z')
		d.setUTCDate(d.getUTCDate() - 1)
		return d.toISOString().slice(0, 10)
	})()

	if (lastDate === yesterday) {
		current += 1
	} else {
		current = 1
	}

	if (current > best) best = current

	await supabase
		.from('profiles')
		.update({ streak_current: current, streak_best: best, streak_last_date: today })
		.eq('id', userId)
}
