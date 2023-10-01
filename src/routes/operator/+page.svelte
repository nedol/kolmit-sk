<script>
	import { page } from '$app/stores';
	import { users } from '$lib/js/stores.js';
	import { onMount, setContext } from 'svelte';
	import * as cookie from 'cookie';
	import Operator from './Operator.svelte';
	import md5 from 'md5';

	export let data;
	let data_dict = data.dict;

	import { dicts } from '$lib/js/stores.js';
	dicts.set(data_dict);

	let tarif = '';
	let operator = {};
	let kolmit;
	let usrs = [];

	// console.log($page.url)

	operator.abonent = $page.url.searchParams.get('abonent');
	operator.email = $page.url.searchParams.get('operator');
	operator.psw = $page.url.searchParams.get('psw') ? md5($page.url.searchParams.get('psw')) : '';
	operator.lang = $page.url.searchParams.get('lang');

	import { langs } from '$lib/js/stores.js';
	langs.set(operator.lang);

	onMount(async () => {
		if (document.cookie) {
			if (cookie.parse(document.cookie)[operator.abonent]) {
				const cook = JSON.parse(cookie.parse(document.cookie)[operator.abonent]);
				operator.psw = cook.psw;
				operator.lang = cook.lang;
			} else {
				const keys = Object.keys(cookie.parse(document.cookie));
				const cook = JSON.parse(cookie.parse(document.cookie)[keys[0]]);
				operator.psw = cook.psw;
				operator.lang = cook.lang;
				document.cookie = operator.abonent + '=' + JSON.stringify(operator);
			}
		} else {
		}

		// if (!operator.psw) {
		//   operator.psw = md5(prompt('Введите пароль'));
		//   operator.lang = 'en';
		// }
	});

	export async function GetUsers() {
		let par = {};
		par.proj = 'kolmit';
		par.func = 'getusers';

		par.abonent = operator.abonent;
		par.em = operator.email;
		par.psw = operator.psw;

		// const json = await (await fetch('/operator/edit_cc/')).json();

		const response = await fetch('/operator/edit_cc/', {
			method: 'POST',
			body: JSON.stringify({
				par: par
			}),
			headers: {
				'content-type': 'application/json'
			}
		});

		let json = await response.json();

		console.log('data');

		// tarif = json.rows.tarif;

		users.set(json.rows.users);

		usrs = json.rows.users;
	}
</script>

<div>
	{#if usrs.length > 0}
		<div>
			<Operator {operator} {tarif} {data_dict} />
		</div>
	{/if}
</div>
