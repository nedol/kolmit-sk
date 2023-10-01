<script>
	import { onMount } from 'svelte';
	export let status;
	export let operator;

	async function OnClick() {
		let iframe = document.querySelector("[src*='" + operator + "']");
		let cb = iframe.contentWindow.document.querySelector('.callButton');
		// cb.dispatchEvent(new Event('mute'));

		let promise = new Promise(function (resolve, reject) {
			if (window.rtc.DC) {
				window.rtc.DC.SendRedirect({ operator }, resolve);
				window.rtc.OnMessage({ func: 'mute' });
			}
		});

		let data = await promise;

		status = 'mute';
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style="position: relative;right: 0px; top:70px" on:click={OnClick}>
	<slot />
</div>
