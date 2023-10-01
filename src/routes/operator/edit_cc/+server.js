import * as cookie from 'cookie';
import pkg_e from 'nodemailer';
const { Email } = pkg_e;
import stringHash from 'string-hash';
import pkg_l from 'lodash';
const { _ } = pkg_l;
global.rtcPull = { user: {}, operator: {} };

import {
	AddDep,
	ChangeDep,
	RemDep,
	AddOperator,
	ChangeOperator,
	RemoveOperator
} from '$lib/server/db.js';

import user_pic from '$lib/images/operator.svg';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies, setHeaders, url }) {
	const { par } = await request.json();
	const q = par;
	const psw = JSON.parse(cookies.get('abonent:' + q.abonent)).psw;
	q.psw = psw;
	let data = {};
	switch (q.func) {
		case 'addoper':
			q.psw = psw;
			data = AddOperator(q);
			return new Response(JSON.stringify({ data: data }));
		case 'changeoper':
			q.psw = psw;
			data = ChangeOperator(q);
			return new Response(JSON.stringify({ data: data }));

		case 'remoper':
			q.psw = psw;
			data = RemoveOperator(q);
			return new Response(JSON.stringify({ data: data }));
		case 'adddep':
			q.psw = psw;
			data = AddDep(q);

		case 'changedep':
			q.psw = psw;
			data = ChangeDep(q);
			return new Response(JSON.stringify({ data: data }));

		case 'remdep':
			q.psw = psw;
			data = RemDep(q);
			return new Response(JSON.stringify({ data: data }));
		// case 'tarif':
		// 	let tarif = tarifs[q.tarif];
		// 	let users = [
		// 		{
		// 			id: '0',
		// 			admin: {
		// 				desc: 'Admin of admins',
		// 				name: '',
		// 				alias: '',
		// 				role: 'admin',
		// 				email: q.em,
		// 				picture: {
		// 					medium: { user_pic }
		// 				}
		// 			},
		// 			staff: []
		// 		}
		// 	];

		// 	let paid = moment().add(tarif.trial, 'days').format('YYYY-MM-DD');
		// 	let start = moment().format('YYYY-MM-DD');

		// 	vals = [q.tarif, start, paid, q.em, q.psw, JSON.stringify(users)];

		// 	sql = 'call ADD_NEW_TARIF(?,?,?,?,?,?)';

		// 	[rows, fields] = await pool.query(sql, vals);

		// 	return new Response(JSON.stringify({ rows: rows, fields: fields, err: err }));
	}
	// const cookies = cookie.parse(request.headers.get('cookie') || '');
	// const result = cookies['kolmit']

	// let dict = await (await fetch('http://localhost:5173/api/dict.json')).json();

	// return new Response(JSON.stringify({ data: data }));
}

function SendEmail(q, new_email) {
	let em = new Email();
	const abonent = q.abonent ? '&abonent=' + q.abonent : '';
	const mail = q.send_mail || new_email;
	const hash = stringHash(mail);
	let text = {
		ru: '<h1>Присоединиться к сети</h1></a>',
		en: '<h1>Join network</h1></a>',
		fr: '<h1>Rejoindre le réseau</h1></a>'
	}[q.lang];
	let html =
		"<div><a href='http://nedol.ru/kolmit/site/operator.html?operator=" +
		(q.send_mail || new_email) +
		abonent +
		'&hash=' +
		hash +
		"'>" +
		text +
		'</a></div>';

	em.SendMail(
		'nedol.kolmit@gmail.com',
		q.send_mail || new_email,
		{
			ru: 'Новый оператор сети Колми',
			en: 'New Kolmi network operator',
			fr: 'Le nouvel opérateur de Kolmi'
		}[q.lang],
		html,
		(result) => {
			console.log();
		}
	);
}

export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		throw error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
