<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import countryCodes from '$lib/countries.json'
	import { onDestroy, tick } from 'svelte'
	import type { GameLeaderboardFriend, GameStatsData } from '../../app.js'
	import GameStats from '$lib/components/GameStats.svelte'
	import ShareCard from '$lib/components/ShareCard.svelte'
	import { updateStreakAfterDaily } from '$lib/fetchGameStats'
	import { todayUTC, dailySeedString, seededShuffle } from '$lib/seededRandom'

	$: isDaily = $page.url.searchParams.get('daily') === '1'

	// Build a list of entries that have a capital (filter out Antarctica and EU pseudo-entries)
	type CountryEntry = { code: string; name: string; capital: string; popularity: number }
	const allCountries: CountryEntry[] = Object.entries(countryCodes)
		.filter(([, d]) => d.capital && d.capital !== 'N/A')
		.map(([code, d]) => ({ code, name: d.name, capital: d.capital!, popularity: d.popularity }))

	export let data
	let { session, supabase } = data
	$: ({ session, supabase } = data)

	let started = false
	let ended = false
	let isPreloading = false
	let timeLeft = 5 * 60
	let flagTimeLeft = 100
	let score = 0
	let countryIdx = 0
	let currentCountry: CountryEntry | undefined
	let countryInput: HTMLInputElement
	let restartBtn: HTMLButtonElement
	let inputSuggestions: string[] = []
	let mistakes: { country: string; capital: string; flagCode: string }[] = []
	let countries: CountryEntry[] = []

	let interval: ReturnType<typeof setInterval>

	// ── Flag preloading ───────────────────────────────────────────────────────

	function preloadFlagImage(src: string): Promise<void> {
		return new Promise((resolve) => {
			const img = new Image()
			img.onload = () => resolve()
			img.onerror = () => resolve()
			img.src = src
		})
	}

	/** Fire-and-forget: cache `count` flags starting at `fromIdx`. */
	function preloadAhead(fromIdx: number, count = 5): void {
		for (let i = 0; i < count; i++) {
			const c = countries[fromIdx + i]
			if (c) preloadFlagImage(`/flags/${c.code.toLowerCase()}.svg`)
		}
	}

	// ── Game logic ────────────────────────────────────────────────────────────

	async function startGame() {
		score = 0
		countryIdx = 0
		ended = false
		timeLeft = 5 * 60
		flagTimeLeft = 100
		mistakes = []

		if (isDaily) {
			countries = seededShuffle(allCountries, dailySeedString('capitals'))
		} else {
			countries = [...allCountries]
				.sort(() => Math.random() - 0.5)
				.sort((a, b) => b.popularity - a.popularity)
		}

		// Kick off background preload; await only the very first flag so the
		// timer never ticks while the opening image is still in flight.
		preloadAhead(0, 6)
		if (countries[0]) {
			isPreloading = true
			await preloadFlagImage(`/flags/${countries[0].code.toLowerCase()}.svg`)
			isPreloading = false
		}

		started = true

		nextCountry()

		let intervalTick = 0
		interval = setInterval(() => {
			if (!started) {
				clearInterval(interval)
				return
			}
			intervalTick++
			if (intervalTick % 10 === 0) timeLeft--
			flagTimeLeft--
			if (flagTimeLeft === 0) addMistake()
		}, 100)

		await tick()
		if (countryInput) countryInput.focus()
	}

	function formatTimeLeft(time: number) {
		let minutes = Math.floor(time / 60)
		let seconds = time % 60
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
	}

	function onInputKeypress(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault()
			if (inputSuggestions.length === 0) return
			countryInput.value = inputSuggestions[0]
			return
		} else if (event.key !== 'Enter') {
			let inputValue = countryInput.value
			if (event.key === 'Backspace') inputValue = inputValue.slice(0, -1)
			else if (/^[a-zA-Z ,.'()é-]$/i.test(event.key)) inputValue += event.key
			if (inputValue.length < 2) return
			inputSuggestions = allCountries
				.filter((c) => c.capital.toLowerCase().startsWith(inputValue.toLowerCase()))
				.map((c) => c.capital)
		}
	}

	function onSuggestionClick(event: MouseEvent) {
		let target = event.target as HTMLDivElement
		countryInput.value = target.innerText
		onInputSubmit()
	}

	function onInputSubmit() {
		if (!currentCountry) return
		const inputValue = countryInput.value.trim()
		if (inputValue.toLowerCase() === currentCountry.capital.toLowerCase()) {
			score++
			nextCountry()
		} else {
			addMistake()
		}
	}

	function addMistake() {
		if (!currentCountry) return
		mistakes = [
			...mistakes,
			{
				country: currentCountry.name,
				capital: currentCountry.capital,
				flagCode: currentCountry.code
			}
		]
		if (mistakes.length === 5) endGame()
		else nextCountry()
	}

	function endGame() {
		ended = true
		started = false
		clearInterval(interval)
	}

	function restartGame() {
		mistakes = []
		ended = false
		scoreSavingStatus = 'idle'
		startGame()
	}

	let scoreSavingStatus: 'idle' | 'saving' | 'saved' = 'idle'
	async function saveScore() {
		if (session === null) goto('/signup')
		else {
			scoreSavingStatus = 'saving'
			const today = todayUTC()
			const { data } = await supabase
				.from('game_capitals')
				.insert({ score, is_daily: isDaily, daily_date: isDaily ? today : null })
				.select()

			if (data) {
				scoreSavingStatus = 'saved'
				if (gameStats && typeof gameStats === 'object') {
					gameStats.previousGames = [data[0], ...gameStats.previousGames]
					if (gameStats.highscore < score) gameStats.highscore = score
				}
				if (isDaily && session) {
					await updateStreakAfterDaily(supabase, session.user.id)
				}
			}
		}
	}

	function nextCountry() {
		if (countryInput) {
			countryInput.value = ''
			countryInput.focus()
		}
		if (countryIdx >= countries.length) {
			endGame()
			return
		}
		currentCountry = countries[countryIdx]
		countryIdx++
		inputSuggestions = []
		flagTimeLeft = 100

		// Keep a warm lookahead buffer as the player advances
		preloadAhead(countryIdx, 5)
	}

	onDestroy(() => clearInterval(interval))

	let gameStatsStatus: 'guest' | 'loading' | 'error' | 'loaded' = 'guest'
	let gameStats: GameStatsData | null = null
	let globalGameStats: Record<string, number> | null = null
	let friendsLeaderboardStats: GameLeaderboardFriend[] | null = null

	if (session) gameStatsStatus = 'loading'

	Promise.all([
		data.streamed.gameStats,
		data.streamed.globalGameStats,
		data.streamed.friendsLeaderboard
	])
		.then(([stats, globalStats, friendsLeaderboard]) => {
			gameStats = stats
			globalGameStats = globalStats
			friendsLeaderboardStats = friendsLeaderboard
			if (stats) gameStatsStatus = 'loaded'
		})
		.catch((e) => {
			console.error(e)
			gameStatsStatus = 'error'
		})
</script>

<svelte:head>
	<title>World Capitals — Learning The Useless</title>
	<meta name="description" content="Type the capital city for each country shown." />
	<meta property="og:title" content="World Capitals — Learning The Useless" />
	<meta
		property="og:description"
		content="Test your world geography — type the capital city for each country. How many can you name?"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="page">
	<h1>World Capitals{isDaily ? ' — Daily' : ''}</h1>

	{#if isDaily}
		<p class="daily-badge">Today's daily challenge · {todayUTC()}</p>
	{/if}

	{#if !started && !ended}
		<p class="instructions">
			A country name appears. Type its capital city. Five minutes on the clock; five mistakes ends
			the game.
		</p>
		<button
			on:click={startGame}
			id="startBtn"
			class="button primary"
			disabled={isPreloading}
		>
			{#if isPreloading}Loading flags…{:else}Start{/if}
		</button>
	{:else}
		<div id="topInfo">
			<span>{formatTimeLeft(timeLeft)}</span>
			<span class="score-display">{score} correct</span>
		</div>

		{#if ended}
			<p class="game-over">{score} capitals named.</p>
			<div class="button-row">
				<button id="restart" class="button" on:click={restartGame} bind:this={restartBtn}>
					Try again
				</button>
				{#if scoreSavingStatus !== 'saved'}
					<button
						id="saveScore"
						class="button primary"
						on:click={saveScore}
						disabled={scoreSavingStatus === 'saving'}
					>
						{scoreSavingStatus !== 'saving' ? 'Save score' : 'Saving…'}
					</button>
				{/if}
				<ShareCard
					headline="{score} capitals"
					detail="in {formatTimeLeft(5 * 60 - timeLeft)} · World Capitals"
				/>
			</div>
		{:else if started && currentCountry}
			<div id="countryDisplay">
				<img
					class="flag"
					src="/flags/{currentCountry.code.toLowerCase()}.svg"
					alt="Flag of {currentCountry.name}"
				/>
				<p class="country-name">{currentCountry.name}</p>
			</div>
			<div id="flagTime"><div class="inner" style="width:{flagTimeLeft}%"></div></div>

			<form autocomplete="off" class="inputForm" on:submit|preventDefault={onInputSubmit}>
				<div class="autocomplete">
					<input
						id="capitalInput"
						class="input"
						type="text"
						autocapitalize="off"
						autocomplete="off"
						autocorrect="off"
						placeholder="Capital city"
						spellcheck="false"
						data-form-type="other"
						bind:this={countryInput}
						on:keydown={onInputKeypress}
					/>
					{#if inputSuggestions.length > 0}
						<div class="suggestions">
							{#each inputSuggestions.slice(0, 5) as suggestion}
								<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
								<div on:click={onSuggestionClick}>{suggestion}</div>
							{/each}
						</div>
					{/if}
				</div>
				<input type="submit" class="button submit primary" value="→" />
			</form>
		{/if}
	{/if}

	{#if mistakes.length > 0}
		<div class="mistakes-section">
			<h2>Missed ({mistakes.length}/5)</h2>
			<div class="mistakes">
				{#each mistakes as m}
					<div class="mistake">
						<img
							src="/flags/{m.flagCode.toLowerCase()}.svg"
							alt={m.country}
							class="mistake-flag"
						/>
						<span class="mistake-country">{m.country}</span>
						<span class="mistake-capital">{m.capital}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if gameStatsStatus === 'guest'}
		<p class="stats-nudge"><a href="/signup">Sign in</a> to save and compare scores.</p>
	{:else if gameStatsStatus === 'loading'}
		<p class="stats-nudge">Loading stats…</p>
	{:else if gameStatsStatus === 'error'}
		<p class="stats-nudge">Couldn't load stats.</p>
	{:else if gameStats && globalGameStats && friendsLeaderboardStats}
		<GameStats
			stats={gameStats}
			globalStats={globalGameStats}
			friendsLeaderboard={friendsLeaderboardStats}
			{supabase}
		/>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.daily-badge {
		font-size: 0.8rem;
		color: var(--fg-muted);
		margin-bottom: 1.25rem;
	}

	.instructions {
		font-size: 0.875rem;
		color: var(--fg-muted);
		max-width: 36rem;
		margin-bottom: 1.25rem;
	}

	#startBtn {
		font-size: 1rem;
		padding: 0.6rem 1.75rem;
	}

	#topInfo {
		display: flex;
		gap: 2rem;
		align-items: baseline;
		margin-bottom: 1.25rem;
		font-size: 1.25rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.score-display {
		color: var(--fg-muted);
		font-weight: 400;
		font-size: 1rem;
	}

	.game-over {
		font-size: 1rem;
		color: var(--fg-muted);
		margin-bottom: 1rem;
	}

	.button-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	#countryDisplay {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.flag {
		width: 80px;
		border: 1px solid var(--border);
		flex-shrink: 0;
	}

	.country-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	#flagTime {
		width: 280px;
		height: 3px;
		background: var(--border);
		margin-bottom: 1rem;
		border-radius: 2px;
		overflow: hidden;
	}

	#flagTime .inner {
		height: 100%;
		background: var(--fg);
		transition: width 0.08s linear;
	}

	.inputForm {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.autocomplete {
		position: relative;
		width: 280px;
	}

	.autocomplete input {
		width: 100%;
	}

	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		border: 1px solid var(--border);
		border-top: none;
		background: var(--bg);
		z-index: 10;
		border-radius: 0 0 4px 4px;
	}

	.suggestions div {
		padding: 0.4rem 0.75rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.suggestions div:hover {
		background: var(--bg-inset);
	}

	.submit {
		cursor: pointer;
		height: 38px;
		padding: 0 1rem;
	}

	.mistakes-section {
		margin-top: 2rem;
	}

	.mistakes-section h2 {
		margin-bottom: 0.75rem;
	}

	.mistakes {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.mistake {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.mistake-flag {
		width: 70px;
		border: 1px solid var(--border);
	}

	.mistake-country {
		font-size: 0.7rem;
		color: var(--fg-muted);
		text-align: center;
		max-width: 80px;
	}

	.mistake-capital {
		font-size: 0.8rem;
		font-weight: 600;
		text-align: center;
		max-width: 80px;
	}

	.stats-nudge {
		margin-top: 2rem;
		font-size: 0.875rem;
		color: var(--fg-muted);
	}
</style>
