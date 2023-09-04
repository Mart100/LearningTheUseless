<script lang="ts">
	export let title: string
	export let svg: string
	export let description: string
	export let href: string
</script>

<a class="gameTile" {href}>
	<img src={svg} alt={title} />
	<h1>{title}</h1>
	<p>{description}</p>
</a>

<style lang="scss">
	.gameTile {
		width: 50%;
		max-width: 300px;
		aspect-ratio: 1;
		height: auto;
		padding: 50px;
		margin: 20px;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 5px;
		text-align: center;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
		transition-duration: 100ms;
		cursor: pointer;
		text-decoration: none;

		&:hover {
			transform: translateY(-10px);
			box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
		}

		img {
			width: 30%;
			height: auto;
			filter: brightness(0) invert(1);
		}

		h1 {
			font-size: 2rem;
			margin: 0;
		}

		p {
			font-size: 1rem;
		}
	}
</style>
