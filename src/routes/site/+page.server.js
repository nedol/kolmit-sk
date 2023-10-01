// @ts-nocheck
import md5 from 'md5';
import { dict } from '$lib/dict/dict';
import { ice_conf } from '$lib/ice_conf';

global.rtcPull = { user: {}, operator: {} };

import { CreatePool, GetUsers } from '$lib/server/db.js'; //src\lib\server\server.db.js

let kolmit;

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, cookies, route, url }) {
	// let operator = url.searchParams.get('operator');
	let abonent = url.searchParams.get('abonent');
	// let lang = url.searchParams.get('lang');

	// cookies.set(
	// 	'kolmit',
	// 	JSON.stringify({
	// 		operator: operator,
	// 		abonent: abonent,
	// 		psw: md5('demo'),
	// 		lang: 'en'
	// 	}),
	// 	{
	// 		path: '/site'
	// 	}
	// );

	CreatePool();

	let res;
	let resp = {
		dict: dict,
		ice_conf: ice_conf
	};
	try {
		res = cookies.get('abonent:' + abonent);
		if (res) {
			kolmit = JSON.parse(res);
		} else {
			resp.check = false;
			resp.abonent = abonent;
			resp.users = '{}';
			return resp;
		}
	} catch (ex) {
		console.log();
	}

	let params = {
		operator: kolmit.operator,
		abonent: abonent,
		psw: kolmit.psw
	};

	res = await GetUsers(params);

	if (!res) {
		(resp.operator = kolmit.operator), (resp.abonent = kolmit.abonent), (resp.check = true);
		resp.users = '{}';
		return resp;
	}

	return {
		check: true,
		operator: kolmit.operator,
		abonent: abonent,
		lang: kolmit.lang,
		dict: dict,
		users: res.users || '',
		tarif: res.tarif || '',
		ice_conf: ice_conf
	};
}
