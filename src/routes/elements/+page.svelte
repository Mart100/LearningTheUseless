<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { tick } from 'svelte'
	import elementsData from '$lib/elements.json'
	import type { GameLeaderboardFriend, GameStatsData } from '../../app.js'
	import GameStats from '$lib/components/GameStats.svelte'
	import ShareCard from '$lib/components/ShareCard.svelte'
	import { updateStreakAfterDaily } from '$lib/fetchGameStats'
	import { todayUTC, dailySeedString, seededShuffle } from '$lib/seededRandom'

	$: isDaily = $page.url.searchParams.get('daily') === '1'

	export let data
	let { session, supabase } = data
	$: ({ session, supabase } = data)

	type Element = { number: number; symbol: string; name: string }
	const allElements: Element[] = elementsData

	let started = false
	let ended = false
	let score = 0
	let elementIdx = 0
	let currentElement: Element | undefined
	let elementInput: HTMLInputElement
	let restartBtn: HTMLButtonElement
	let wrongAnswer: string | false = false
	let elements: Element[] = []

	async function startGame() {
		score = 0
		elementIdx = 0
		started = true
		ended = false
		wrongAnswer = false

		if (isDaily) {
			elements = seededShuffle(allElements, dailySeedString('elements'))
		} else {
			elements = [...allElements].sort(() => Math.random() - 0.5)
		}

		nextElement()
		await tick()
		if (elementInput) elementInput.focus()
	}

	function nextElement() {
		if (elementInput) {
			elementInput.value = ''
			elementInput.focus()
		}
		if (elementIdx >= elements.length) {
			// All 118 answered correctly — treat as win
			endGame()
			return
		}
		currentElement = elements[elementIdx]
		elementIdx++
		wrongAnswer = false
	}

	function onInputSubmit() {
		if (!currentElement || wrongAnswer !== false) return
		const inputValue = elementInput.value.trim()
		if (inputValue.toLowerCase() === currentElement.name.toLowerCase()) {
			score++
			nextElement()
		} else {
			wrongAnswer = inputValue || '(empty)'
			ended = true
			started = false
		}
	}

	async function restartGame() {
		wrongAnswer = false
		ended = false
		scoreSavingStatus = 'idle'
		await startGame()
	}

	function endGame() {
		ended = true
		started = false
	}

	async function onKeypress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onInputSubmit()
		}
	}

	let scoreSavingStatus: 'idle' | 'saving' | 'saved' = 'idle'
	async function saveScore() {
		if (session === null) goto('/signup')
		else {
			scoreSavingStatus = 'saving'
			const today = todayUTC()
			const { data } = await supabase
				.from('game_elements')
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
	<title>Chemical Elements — Learning The Useless</title>
	<meta name="description" content="Name every element by its symbol. Streak until wrong." />
	<meta property="og:title" content="Chemical Elements — Learning The Useless" />
	<meta
		property="og:description"
		content="How far can you go naming chemical elements by their symbol? Streak until wrong."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="page">
	<h1>Chemical Elements{isDaily ? ' — Daily' : ''}</h1>

	{#if isDaily}
		<p class="daily-badge">Today's daily challenge · {todayUTC()}</p>
	{/if}

	{#if !started && !ended}
		<p class="instructions">
			An element symbol appears. Type the element's name. Keep going until you get one wrong.
		</p>
		<button on:click={startGame} id="startBtn" class="button primary">Start</button>
	{:else if started && currentElement && wrongAnswer === false}
		<div id="game">
			<div class="element-card">
				<span class="element-number">{currentElement.number}</span>
				<span class="element-symbol">{currentElement.symbol}</span>
			</div>
			<p class="streak-count">{score} in a row</p>
			<div class="inputRow">
				<input
					id="elementInput"
					class="input"
					type="text"
					autocapitalize="off"
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					placeholder="Element name"
					bind:this={elementInput}
					on:keypress={onKeypress}
				/>
				<button class="button primary submit" on:click={onInputSubmit}>→</button>
			</div>
		</div>
	{:else if ended}
		<div class="game-over-block">
			{#if wrongAnswer !== false && currentElement}
				<p class="game-over">
					<span class="symbol-reveal">{currentElement.symbol}</span> is
					<strong>{currentElement.name}</strong>, not "{wrongAnswer}".
				</p>
			{:else}
				<p class="game-over">You named all 118 elements. Phenomenal.</p>
			{/if}
			<p class="score-line">{score} correct</p>
			<div class="button-row">
				<button class="button" on:click={restartGame} bind:this={restartBtn}>Try again</button>
				{#if scoreSavingStatus !== 'saved'}
					<button
						class="button primary"
						on:click={saveScore}
						disabled={scoreSavingStatus === 'saving'}
					>
						{scoreSavingStatus !== 'saving' ? 'Save score' : 'Saving…'}
					</button>
				{/if}
				<ShareCard headline="{score} elements" detail="Chemical Elements · streak" />
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
		max-width: 34rem;
		margin-bottom: 1.25rem;
	}

	#startBtn {
		font-size: 1rem;
		padding: 0.6rem 1.75rem;
	}

	#game {
		margin: 0.5rem 0 1.5rem;
	}

	.element-card {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
		border: 1.5px solid var(--border);
		border-radius: 4px;
		background: var(--bg-inset, #f4f3f0);
		margin-bottom: 1rem;
	}

	.element-number {
		font-size: 0.75rem;
		color: var(--fg-muted);
		font-variant-numeric: tabular-nums;
		line-height: 1;
		margin-bottom: 0.2rem;
	}

	.element-symbol {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1;
		color: var(--fg);
	}

	.streak-count {
		font-size: 0.875rem;
		color: var(--fg-muted);
		margin: 0 0 0.75rem;
	}

	.inputRow {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.inputRow .input {
		width: 220px;
	}

	.submit {
		cursor: pointer;
		height: 38px;
		padding: 0 1rem;
	}

	.game-over-block {
		margin: 0.5rem 0;
	}

	.game-over {
		font-size: 1rem;
		color: var(--fg-muted);
		margin: 0 0 0.5rem;
	}

	.symbol-reveal {
		font-weight: 700;
		color: var(--fg);
	}

	.score-line {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 1rem;
	}

	.button-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.stats-nudge {
		margin-top: 2rem;
		font-size: 0.875rem;
		color: var(--fg-muted);
	}
</style>
