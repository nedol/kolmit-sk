<script>
	import { onMount } from 'svelte';

	export let display = 'block';
	export let srcObject = '';
	let lv;

	// import { posterst } from '$lib/js/stores.js';

	onMount(async () => {
		lv = document.getElementById('localVideo');
	});

	$: if (lv && srcObject) {
		lv.srcObject = srcObject;
	} else if (lv && lv.srcObject) {
		lv.srcObject.getVideoTracks().forEach((track) => {
			track.stop();
			lv.srcObject.removeTrack(track);
		});
		lv.src = '';
	}
</script>

<video
	id="localVideo"
	autoplay
	playsinline
	muted
	style="
        display: {display};
        position:absolute;
        top:25px;
        width:100px;
        height: 100px;
        z-index: 20;"
/>
<slot name="footer" />
