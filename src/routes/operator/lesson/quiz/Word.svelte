<script>
	import { onMount } from 'svelte';
	import translate from 'translate';
	import _ from 'lodash';
	import { langs } from '$lib/js/stores.js';
	export let text, woorden;
	let trans = 'trans';
	translate.from = 'nl';
	translate.engine = 'google';

	$: if ($langs && text) {
		Translate(text);
	}

	async function onClickWord(el) {
		if (el.currentTarget.firstChild)
			setTimeout(
				async (elem) => {
					elem.style.visibility = 'hidden';
				},
				2000,
				el.currentTarget.firstChild
			);

		el.currentTarget.firstChild.style.visibility = 'visible';
	}
	async function Translate(text) {
		for (const key of Object.keys(woorden)) {
			if (text.toLowerCase().includes(`${key}`) && woorden[key][$langs]) {
				trans = woorden[key][$langs];
				return;
			}
		}

		trans = await translate(text.trim().toLowerCase(), $langs);
	}
	onMount(() => {});
</script>

<!-- <div on:click={onClickSentence} style="display: inline;position:relative"> -->
<span class="a" on:click|preventDefault|stopPropagation={onClickWord}
	><sup class="trans">{trans}</sup>{text}</span
>

<!-- </div> -->

<style>
	sup.trans {
		/* display: inline; */
		visibility: hidden;
		position: absolute;
		width: 100px;
		top: 0.6px;
		color: darkblue;
		background-color: whitesmoke;
	}
	span.a {
		display: inline;
		color: red;
		position: relative;
		/* width: 100px;
		height: 100px; */
		padding: 1px;
		/* border: 1px solid blue;
		background-color: yellow; */
	}
</style>
