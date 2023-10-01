<script>
	import { onMount, setContext } from 'svelte';
	import SelectMenu from './SelectMenu.svelte';
	import Operator from '../operator/Operator.svelte';
	import Login from './Login.svelte';
	// import Content from '../operator/modal/Content.svelte';
	// import Modal from 'svelte-simple-modal';
	// import md5 from 'md5';

	// import { page, navigating } from '$app/stores';

	export let data;

	// const us_global_test = global_test.subscribe((data) => {
	// 	if (data) {
	// 		console.log(data);
	// 	}
	// });

	let checked = data.check;
	let tarif;

	let user_pic = data.picture ? data.picture.medium : '';

	const email = data.operator,
		abonent = data.abonent;
	let hash = null;

	import { SignalingChannel } from './signalingChannel';

	import { signal } from '$lib/js/stores.js';

	import { langs } from '$lib/js/stores.js';
	$langs = data.lang;

	import { dicts } from '$lib/js/stores.js';
	$dicts = data.dict[0];

	import { ice_conf } from '$lib/js/stores.js';
	$ice_conf = data.ice_conf;

	import { users } from '$lib/js/stores.js';
	$users = JSON.parse(data.users);
	setContext('users', $users);

	$signal = new SignalingChannel(email);

	onMount(async () => {});
</script>

{#if checked}
	<Operator {email} {abonent} />
{:else}
	<SelectMenu bind:$langs />
	<Login {abonent} {user_pic} lang={$langs} bind:checked />
{/if}

<style>
</style>
