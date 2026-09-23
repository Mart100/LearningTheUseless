/**
 * Deterministic PRNG seeded by a string (Mulberry32 algorithm).
 * All daily challenges use UTC dates so every player worldwide faces the same
 * challenge for a given calendar day, regardless of their local timezone.
 */
export function seededRandom(seed: string): () => number {
	let h = [...seed].reduce((acc, c) => (Math.imul(31, acc) + c.charCodeAt(0)) | 0, 0)
	return () => {
		h |= 0
		h = (h + 0x6d2b79f5) | 0
		let t = Math.imul(h ^ (h >>> 15), 1 | h)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

/** Return today's date as YYYY-MM-DD in UTC. */
export function todayUTC(): string {
	const d = new Date()
	const yyyy = d.getUTCFullYear()
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
	const dd = String(d.getUTCDate()).padStart(2, '0')
	return `${yyyy}-${mm}-${dd}`
}

/** Deterministic seed string for a game's daily challenge. */
export function dailySeedString(gameSlug: string, date?: string): string {
	return `${date ?? todayUTC()}-${gameSlug}`
}

/** Seeded Fisher-Yates shuffle. Returns a new array; does not mutate the input. */
export function seededShuffle<T>(array: readonly T[], seed: string): T[] {
	const rng = seededRandom(seed)
	const arr = [...array]
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}
