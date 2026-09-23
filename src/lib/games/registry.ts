export interface GameDefinition {
	/** URL-safe identifier, also used as route segment */
	slug: string
	/** Display name shown in UI */
	title: string
	/** Short description for game tile and meta tags */
	description: string
	/** Route href */
	href: string
	/** Inline SVG path or URL for the game icon */
	iconSrc: string
	/** Supabase table name where scores are stored */
	scoreTable: 'game_pi' | 'game_flags'
	/** Short meta description for SEO */
	metaDescription: string
}

export const games: GameDefinition[] = [
	{
		slug: 'pi',
		title: 'Digits of Pi',
		description: 'How many digits of π can you recite from memory?',
		href: '/pi',
		iconSrc: '/icons/pi.svg',
		scoreTable: 'game_pi',
		metaDescription:
			'Test how many digits of Pi (π) you can remember. Type them in order and beat your highscore!'
	},
	{
		slug: 'flags',
		title: 'World Flags',
		description: 'Name every country flag before the timer runs out.',
		href: '/flags',
		iconSrc: '/icons/flag.svg',
		scoreTable: 'game_flags',
		metaDescription:
			'Identify the flags of all countries in the world against the clock. How many can you name?'
	}
]

/** Look up a single game definition by slug. */
export function getGame(slug: string): GameDefinition | undefined {
	return games.find((g) => g.slug === slug)
}
