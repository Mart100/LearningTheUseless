<script>
	import GameTile from '$lib/components/GameTile.svelte'
	import logo from '$lib/images/logo.png'

	import flagRegular from '$lib/svg/flag-icon.svg'
	import piSvg from '$lib/svg/Pi-icon.svg'
</script>

<svelte:head>
	<title>Learning The Useless</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<img id="logo" src={logo} alt="logo" />
		<span class="welcome">Welcome</span>
		<p>to the place to learn useless things!</p>
	</h1>
	<div class="games">
		<GameTile
			title="Digits of PI"
			href="./pi"
			description="Learn and test your knowledge of the digits of PI"
			svg={piSvg}
		/>
		<GameTile
			title="Flags"
			href="./flags"
			description="Learn the flags of all countries in the world"
			svg={flagRegular}
		/>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		font-size: 4rem;
		padding: 0 0 10% 0;
	}

	#logo {
		margin: auto;
		display: block;
	}

	.games {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
	}
</style>
