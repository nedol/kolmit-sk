import { json } from '@sveltejs/kit';
// import { CallWaiting } from '$lib/server/db.js'; //src\lib\server\server.db.js

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	// const body = await event.request.formData();
	// // log all fields
	// console.log([...body]);
	// return json({
	// 	// get a specific field's value
	// 	name: body.get('name') ?? 'world'
	// });

	//global.global_test = global_test;

	const { par } = await event.request.json();
	const q = par;
	let resp;

	switch (q.func) {
		case 'callwaiting':
			try {
				let promise = new Promise((resolve, reject) => {
					// if (rtcPull[q.type][q.abonent][q.em].post_resolve)
					// 	rtcPull[q.type][q.abonent][q.em].post_resolve(resolve);
					CallWaiting(q, resolve);
					if (rtcPull[q.type][q.abonent][q.em].resolve_post)
						rtcPull[q.type][q.abonent][q.em].resolve_post();
				});
				resp = await promise;
				rtcPull[q.type][q.abonent][q.em].promise = new Promise((resolve, reject) => {
					rtcPull[q.type][q.abonent][q.em].resolve_post = resolve;
				});
			} catch (ex) {
				console.log(ex);
			}
			break;
	}
	// console.log(resp);
	// if (resp.em === q.em)
	resp = JSON.stringify(resp);
	return json({ resp });
}

function CallWaiting(q, resolve) {
	try {
		if (!rtcPull[q.type][q.abonent]) rtcPull[q.type][q.abonent] = {};
		if (!rtcPull[q.type][q.abonent][q.em]) rtcPull[q.type][q.abonent][q.em] = { resolve: '' };
		rtcPull[q.type][q.abonent][q.em].resolve = resolve;
	} catch (e) {
		console.log();
	}
}
