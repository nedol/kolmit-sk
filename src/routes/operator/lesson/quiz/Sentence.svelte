<script>
	import { onMount } from 'svelte';

	import Word from './Word.svelte';

	export let text;
	let textAr, keys;
	let woorden, focus;

	fetch('/operator/lesson?path=woorden.1_2.json')
		.then((response) => response.json())
		.then((data) => {
			woorden = JSON.parse(data.data);
			//data = data.replace(/(?:\\[rn])+/g, '<br>'); //.replace('    ', '&nbsp;&nbsp;&nbsp;&nbsp;');
			// print = JSON.parse(data).text;
		})
		.catch((error) => {
			console.log(error);
			return [];
		});

	$: if (woorden) {
		keys = Object.keys(woorden);

		let res = keys.map((word) => {
			let expr = word.trim().replaceAll(' ', '&nbsp;');
			text = text.replaceAll(word, expr);
			return text;
		});

		let repl = text.replaceAll(' ', ' ю');
		textAr = repl.split('ю');

		textAr = textAr.map((word, i) => {
			return word.replaceAll('&nbsp;', ' ');
		});
	}

	function isInWoorden(text) {
		for (let i in keys) {
			if (text.trim().toLowerCase().includes(keys[i])) {
				return true;
			}
		}

		return false;
	}

	onMount(() => {
		focus.scrollIntoView();
	});
</script>

<!-- <span>{text}</span> -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<!-- {text} -->
<div>
	{#if keys}
		{#each textAr as text, i (i)}
			{#if isInWoorden(text)}
				<Word {text} {woorden} />
			{:else}
				{text}
			{/if}
		{/each}
	{/if}
</div>
<div bind:this={focus} />
<div style="height:10px" />
