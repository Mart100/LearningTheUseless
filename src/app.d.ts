// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import { SupabaseClient, Session } from '@supabase/supabase-js'

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient
			getSession(): Promise<Session | null>
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}

export interface GameStatsData {
	previousGames: {
		id: number
		played_at: string
		score: number
		user_id: string
	}[]
	highscore: number
}

export interface UserProfile {
	id: string
	username: string
	avatar_url: string
	following: string[]
}

export interface UserProfileFull {
	id: string
	username: string
	avatar_url: string
	followers: UserProfile[]
	following: UserProfile[]
}

export interface GameLeaderboardFriend extends Omit<UserProfile, 'following'> {
	highscore: number
}
