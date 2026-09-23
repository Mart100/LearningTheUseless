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
	scoreTable: 'game_pi' | 'game_flags' | 'game_capitals' | 'game_elements'
	/** Short meta description for SEO */
	metaDescription: string
	/** Whether this game supports daily challenges */
	supportsDaily: boolean
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
			'Test how many digits of Pi (π) you can remember. Type them in order and beat your highscore!',
		supportsDaily: true
	},
	{
		slug: 'flags',
		title: 'World Flags',
		description: 'Name every country flag before the timer runs out.',
		href: '/flags',
		iconSrc: '/icons/flag.svg',
		scoreTable: 'game_flags',
		metaDescription:
			'Identify the flags of all countries in the world against the clock. How many can you name?',
		supportsDaily: true
	},
	{
		slug: 'capitals',
		title: 'World Capitals',
		description: 'Match each country to its capital city.',
		href: '/capitals',
		iconSrc: '/icons/capitals.svg',
		scoreTable: 'game_capitals',
		metaDescription:
			'Test your world geography — type the capital city for each country shown. How many can you name?',
		supportsDaily: true
	},
	{
		slug: 'elements',
		title: 'Chemical Elements',
		description: 'Name the element for each symbol. Streak until wrong.',
		href: '/elements',
		iconSrc: '/icons/elements.svg',
		scoreTable: 'game_elements',
		metaDescription:
			'How far can you go naming chemical elements by their symbol? Streak until wrong.',
		supportsDaily: true
	}
]

/** Look up a single game definition by slug. */
export function getGame(slug: string): GameDefinition | undefined {
	return games.find((g) => g.slug === slug)
}
