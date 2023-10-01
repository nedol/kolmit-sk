<script>
	import Quiz from './quiz/Quiz.svelte';
	export let data;

	export let view;
	let display = 'none';
	$: if (view === 'lesson') {
		display = 'block';
	} else {
		display = 'none';
	}

	let theme = 'Theme';
	let les = '2';
	let quizShow = false;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- {@debug display} -->
<div style="display:{display};overflow-y: auto;height: 400px;">
	{#if quizShow}
		<!-- {@debug data} -->
		<Quiz {data} />
	{:else}
		<h1>{theme}</h1>
		<h3>Les {les}</h3>

		<div>
			<a
				on:click={() => {
					quizShow = true;
					data.quiz = 'luister';
					data.name = 'Quiz 1';
					data.path = 'text.1.txt';
				}}>Familie van Marc 1</a
			>
		</div>
		<div style="height:30px" />
		<div>
			<a
				on:click={() => {
					quizShow = true;
					data.quiz = 'luister';
					data.name = 'Quiz 2';
					data.path = 'text.2.txt';
				}}>Familie van Marc 2</a
			>
		</div>
		<div>Content</div>
	{/if}
</div>
