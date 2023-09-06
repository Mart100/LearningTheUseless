<script lang="ts">
	import { goto } from '$app/navigation'
	import countryCodes from '$lib/countries.json'
	import { onDestroy, tick } from 'svelte'
	import type { GameStatsData } from '../../app.js'
	let countries = Object.values(countryCodes)

	import GameStats from '$lib/components/GameStats.svelte'

	export let data
	let { session, supabase } = data
	$: ({ session, supabase } = data)

	let started = false
	let ended = false
	let timeLeft = 5 * 60
	let flagTimeLeft = 100
	let score = 0
	let countryIdx = 0
	let country: { code: string; name: string } | undefined
	let countryInput: HTMLInputElement
	let restartBtn: HTMLButtonElement
	let countryInputSuggestions: string[] = []
	let mistakes: { name: string; flag: string }[] = []

	let interval: NodeJS.Timeout

	async function startGame() {
		score = 0
		countryIdx = 0
		started = true
		timeLeft = 5 * 60
		flagTimeLeft = 100

		// shuffle countries then sort on popularity
		countries.sort(() => Math.random() - 0.5).sort((a, b) => b.popularity - a.popularity)

		nextFlag()

		let intervalTick = 0
		interval = setInterval(() => {
			if (!started) {
				clearInterval(interval)
				return
			}

			intervalTick++

			if (intervalTick % 10 === 0) timeLeft--

			flagTimeLeft--
			if (flagTimeLeft === 0) {
				addMistake()
			}
		}, 100)

		await tick()

		if (countryInput) countryInput.focus()
	}

	function loadNextCountry() {
		let country = countries[countryIdx]
		let countryCode =
			Object.keys(countryCodes).find(
				(c) => countryCodes[c as keyof typeof countryCodes].name === country.name
			) ?? ''

		return { code: countryCode, name: country.name }
	}

	function formatTimeLeft(time: number) {
		let minutes = Math.floor(time / 60)
		let seconds = time % 60
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
	}

	function onInputKeypress(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault()
			if (countryInputSuggestions.length === 0) return
			countryInput.value = countryInputSuggestions[0]
			return
		} else if (event.key !== 'Enter') {
			let inputValue = countryInput.value
			if (event.key === 'Backspace') inputValue = inputValue.slice(0, -1)
			else if (/^[a-zA-Z]$/.test(event.key)) inputValue += event.key
			if (inputValue.length < 2) return
			countryInputSuggestions = countries
				.filter((c) => c.name.toLowerCase().startsWith(inputValue.toLowerCase()))
				.map((c) => c.name)
		}
	}

	function onSuggestionClick(event: MouseEvent) {
		let target = event.target as HTMLDivElement
		countryInput.value = target.innerText
		onInputSubmit()
	}

	function onInputSubmit() {
		if (!country) return

		let inputValue = countryInput.value
		console.log(inputValue, country.name)
		if (inputValue.toLowerCase() === country.name.toLowerCase()) {
			score++
			nextFlag()
		} else {
			addMistake()
		}
	}

	function addMistake() {
		if (!country) return
		mistakes = [
			...mistakes,
			{ name: country.name, flag: `/flags/${country.code.toLowerCase()}.svg` }
		]

		if (mistakes.length === 5) endGame()
		else nextFlag()
	}

	function endGame() {
		ended = true
		started = false
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
			const { error, status, data } = await supabase.from('game_flags').insert({ score }).select()

			if (data) {
				scoreSavingStatus = 'saved'
				if (gameStats && typeof gameStats === 'object') {
					gameStats.previousGames = [data[0], ...gameStats.previousGames]
					if (gameStats.highscore < score) gameStats.highscore = score
				}
			}
		}
	}

	function nextFlag() {
		if (countryInput) {
			countryInput.value = ''
			countryInput.focus()
		}
		country = loadNextCountry()
		countryIdx++
		countryInputSuggestions = []
		flagTimeLeft = 100
	}

	onDestroy(() => {
		clearInterval(interval)
	})

	let gameStatsStatus: 'guest' | 'loading' | 'error' | 'loaded' = 'guest'
	let gameStats: GameStatsData | null = null
	let globalGameStats: Record<string, number> | null = null

	if (session) gameStatsStatus = 'loading'

	Promise.all([data.streamed.gameStats, data.streamed.globalGameStats])
		.then(([stats, globalStats]) => {
			gameStats = stats
			globalGameStats = globalStats
			if (stats) gameStatsStatus = 'loaded'
		})
		.catch((e) => {
			console.error(e)
			gameStatsStatus = 'error'
		})
</script>

<svelte:head>
	<title>Learn Flags</title>
	<meta name="description" content="Learn All the country flags on this page" />
</svelte:head>

<div class="column">
	<div class="center">
		<h1>Flags game</h1>
		{#if !started && !ended}
			<button on:click={startGame} id="startBtn" class="button primary">PLAY</button>
		{:else}
			<div id="topInfo">
				<div id="time">Time:<br /> {formatTimeLeft(timeLeft)}</div>
				<div id="score">Score:<br /> {score}</div>
			</div>
			{#if ended}
				<h2>Game over!</h2>
				<div id="bottomButtonRow">
					<button id="restart" class="button" on:click={restartGame} bind:this={restartBtn}
						>Try again</button
					>
					{#if scoreSavingStatus !== 'saved'}
						<button
							id="saveScore"
							class="button primary"
							on:click={saveScore}
							disabled={scoreSavingStatus === 'saving'}
							>{scoreSavingStatus !== 'saving' ? 'Save Score' : 'Saving...'}</button
						>
					{/if}
				</div>
			{:else if started}
				<div id="flag">
					<img src="/flags/{country?.code.toLowerCase()}.svg" alt="Country flag" />
				</div>
				<div id="flagTime"><div class="inner" style="width:{flagTimeLeft}%" /></div>
				<form autocomplete="off" class="inputForm" on:submit|preventDefault={onInputSubmit}>
					<div class="autocomplete">
						<input
							id="countryInput"
							class="input"
							type="text"
							autocapitalize="off"
							autocomplete="off"
							autocorrect="off"
							placeholder="Country name"
							spellcheck="false"
							data-form-type="other"
							bind:this={countryInput}
							on:keydown={onInputKeypress}
						/>
						{#if countryInputSuggestions.length > 0}
							<div class="suggestions">
								{#each countryInputSuggestions.slice(0, 5) as suggestion}
									<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
									<div on:click={onSuggestionClick}>{suggestion}</div>
								{/each}
							</div>
						{/if}
					</div>
					<input type="submit" class="button submit primary" />
				</form>
			{/if}
		{/if}
	</div>

	{#if mistakes.length > 0}
		<h2 class="mistakesTitle">Mistakes ({mistakes.length}/5)</h2>
		<div class="mistakes">
			{#each mistakes as mistake}
				<div class="mistake">
					<span class="name">{mistake.name}</span>
					<img src={mistake.flag} alt="Country flag" />
				</div>
			{/each}
		</div>
	{/if}
	{#if gameStatsStatus === 'guest'}
		<div id="stats"><h2>Sign in to view/save and compare your scores!</h2></div>
	{:else if gameStatsStatus === 'loading'}
		<div id="stats"><h2>Loading stats...</h2></div>
	{:else if gameStatsStatus === 'error'}
		<div id="stats"><h2>Error loading stats</h2></div>
	{:else if gameStats && globalGameStats}
		<GameStats stats={gameStats} globalStats={globalGameStats} />
	{/if}
</div>

<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 10vh;

		.center {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
	}

	#startBtn {
		text-align: center;
		display: inline-block;
		font-size: 20px;
		font-weight: 500;
		padding: 15px 32px;
	}

	.button {
		font-size: 16px;
	}

	.inputForm {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;

		.autocomplete {
			position: relative;
			width: 300px;
			height: 40px;
			margin-bottom: 20px;

			#countryInput {
				width: 300px;
				height: 40px;
				font-size: 20px;
				text-align: center;
			}

			.suggestions {
				position: absolute;
				top: 100%;
				left: 0;
				width: 100%;
				border: 1px solid black;
				background-color: var(--bg-color);
				border-top: none;
				z-index: 1;

				div {
					padding: 5px;
					cursor: pointer;

					&:hover {
						background-color: rgba(200, 200, 200, 0.1);
					}
				}
			}
		}

		.submit {
			cursor: pointer;
			height: 40px;
		}
	}

	#flagTime {
		width: 300px;
		height: 10px;
		position: relative;
		text-align: center;

		.inner {
			position: relative;
			height: 100%;
			margin: auto;
			background-color: white;
		}
	}

	#topInfo {
		display: flex;
		justify-content: space-around;
		width: 300px;
		margin-bottom: 20px;

		div {
			font-size: 30px;
			text-align: center;
		}
	}

	#flag {
		width: 200px;
	}

	.mistakesTitle {
		font-size: 30px;
	}

	.mistakes {
		display: flex;
		flex-direction: row;

		.mistake {
			margin: 5px;
			font-size: 80%;

			.name {
				display: block;
				text-align: center;
				margin-bottom: 5px;
			}

			img {
				width: 100px;
			}
		}
	}
</style>
