import { writable } from 'svelte/store';

// export let window = window;//{location:{href:'http://nedol.ru'}};

export let editable = writable(false);

export let view = writable();

export let langs = writable();

export let pswd = writable();

let lang = 'en';
const us_lang = langs.subscribe((data) => {
	lang = data;
});

// export let psw = '';

// (async () => {
// 	try {
// 		lang = JSON.parse(localStorage.getItem('kolmit'))['lang'];
// 		psw = JSON.parse(localStorage.getItem('kolmit'))['psw'];
// 	} catch (ex) {
// 		localStorage.setItem('kolmit', JSON.stringify({ lang: lang }));
// 	}
// 	langs.set(lang);
// 	pswd.set(psw);
// })();

export let posterst = writable();

export let msg_signal_user = writable();

export let msg_signal_oper = writable();

export let signal = writable();

export let dicts = writable();

export let credentials = writable();

export let users = writable();

export let statust = writable();

export let ice_conf = writable();

export let pool = writable();
