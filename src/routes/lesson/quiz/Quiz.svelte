<script>
	import Volgorde from './Volgorde.svelte';
	import Paar from './Paar.svelte';
	import Luister from './Luister.svelte';

	export let data;
	const quiz = data.quiz;
</script>

<div />
<!-- {@debug quiz} -->
{#if quiz === 'volgorde'}
	<Volgorde data={data.zinnen} />
{:else if quiz === 'paar'}
	<Paar />
{:else}
	<Luister />
{/if}
