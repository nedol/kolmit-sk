<script>
	import { onMount } from 'svelte';
	import md5 from 'md5';

	import Sentence from './Sentence.svelte';
	import Control from './Control.svelte';
	let api_key = ['d1654c16b135479cbe429e3d2967a5fb', '7a4b7dd989dd4086a626f34dbf21d3a9'];

	export let data;
	let video,
		selected_sentence,
		audio_data = {},
		paused,
		speech,
		text,
		cnt = 0,
		cnt_prnt = 0,
		spanAr = [];

	let bottomOpen = true;

	fetch('/operator/lesson?path=' + data.path)
		.then((response) => response.text())
		.then((data) => {
			//data = data.replace(/(?:\\[rn])+/g, '<br>'); //.replace('    ', '&nbsp;&nbsp;&nbsp;&nbsp;');
			// print = JSON.parse(data).text;

			text = JSON.parse(data).data;
			// .replace(/^\s+|\s+$/gm, '')
			text = text.replaceAll('\r\n', '');
			text = text.replaceAll('.', '..');
			// .split(/(?:[\r\n]|.  )+/g);
			text = text.split('. ');

			text = text.map((txt) => {
				return txt.trim();
			});

			fetchText();
		})
		.catch((error) => {
			console.log(error);
			return [];
		});

	function fetchText() {
		if (!text[cnt]) {
			return;
		}
		if (text[cnt]) {
			fetch('/operator/lesson?key=' + md5(text[cnt]))
				.then((response) => response.text())
				.then((data) => {
					if (JSON.parse(data).audio) {
						speech = JSON.parse(data).audio;
						audio_data[md5(text[cnt])] = speech;
						spanAr.push(text[cnt]);
						spanAr = spanAr; //Object.assign(text[cnt], spanAr); //["<span onclick='{onClickSpan}'>" + text[cnt] + '. </span>', ...spanAr];
					} else {
						fetchVoice();
					}
				})
				.catch((error) => {
					console.log(error);
					return [];
				});
			// speech = audio[md5(text[cnt])];
		} else {
			fetchVoice();
		}
	}

	function fetchVoice() {
		fetch(
			`https://api.voicerss.org/?key=${api_key[0]}&hl=nl-be&c=MP3&f=16khz_16bit_mono&r=0&b64=true
				&src=${encodeURIComponent(text[cnt])}`
		)
			.then((response) => response.text())
			.then((data) => {
				speech = data;
				let key = md5(text[cnt]);
				audio_data[key] = data;

				fetch('/operator/lesson', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
						// 'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: JSON.stringify({
						voice: { [key]: data }
					})
				})
					.then((response) => response.text())
					.then((data) => {
						spanAr.push(text[cnt]);
						spanAr = spanAr;
					});
			})
			.catch((error) => {
				console.log(error);
				return [];
			});
	}

	function onEnded() {
		selected_sentence.style.fontWeight = 100;
		if (paused) return;

		cnt++;

		cnt_prnt = cnt;

		if (cnt >= text.length) {
		} else {
			fetchText();
		}
	}

	onMount(() => {
		try {
			video.playbackRate = 0;
		} catch (ex) {
			console.log(ex);
		}
	});

	function onPlay() {
		selected_sentence.style.fontWeight = 500;
	}
	function onClickSentence(ev) {
		speech = '';
		video.src = '';
		paused = true;
		selected_sentence.style.fontWeight = 100;
		let this_cnt = ev.currentTarget.attributes.cnt.nodeValue;
		ev.currentTarget.style.fontWeight = 500;
		speech = audio_data[md5(text[this_cnt])];
		selected_sentence = ev.currentTarget;
	}

	function onContinueClick() {
		paused = false;
		cnt++;
		fetchText();
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
	/>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
	/>
</svelte:head>

<div>
	{#each spanAr as text, i}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- {@debug i} -->
		<div class="selected_sentence" bind:this={selected_sentence} on:click={onClickSentence} cnt={i}>
			<Sentence {text} />
		</div>
	{/each}
</div>

<Control {bottomOpen} {onContinueClick} />
<!-- svelte-ignore a11y-media-has-caption -->
<audio
	autoplay
	name="media"
	bind:this={video}
	src={speech}
	on:canplay={onPlay}
	on:ended={onEnded}
/>

<div style="height:200px" />

<style>
	.selected_sentence {
		font-weight: 100;
	}
</style>
