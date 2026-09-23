<script lang="ts">
	export let glow = false
	export let padding: 'sm' | 'md' | 'lg' = 'md'
</script>

<div class="card" class:glow class:pad-sm={padding === 'sm'} class:pad-lg={padding === 'lg'}>
	<slot />
</div>

<style lang="scss">
	.card {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		transition: box-shadow var(--transition-base);

		&.pad-sm {
			padding: var(--space-4);
		}

		&.pad-lg {
			padding: var(--space-8);
		}

		&.glow {
			border-color: var(--color-border);
			box-shadow: var(--shadow-glow);
		}
	}
</style>
