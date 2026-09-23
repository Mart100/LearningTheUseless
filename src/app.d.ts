import type { SupabaseClient, Session, User } from '@supabase/supabase-js'
import type { Database } from './database.types'

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>
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
