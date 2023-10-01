import { json } from '@sveltejs/kit';
// import { OperatorWaiting } from '$lib/server/db.js'; //src\lib\server\server.db.js

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const { par } = await event.request.json();
	const q = par;
	let resp = {};

	try {
		let promise = new Promise((resolve, reject) => {
			try {
				OperatorWaiting(q, resolve);
			} catch (ex) {
				console.log(ex);
			}
		});

		resp = await promise;

		// console.log(resp);
	} catch (ex) {
		console.log(ex);
	}

	// if (resp.em === q.em) {
	resp = JSON.stringify(resp);
	return json({ resp });
	// }
	// } else {
	// 	resp = '{}';
	// }
}
function OperatorWaiting(q, resolve) {
	try {
		if (!rtcPull[q.type][q.abonent]) rtcPull[q.type][q.abonent] = {};
		if (!rtcPull[q.type][q.abonent][q.em]) rtcPull[q.type][q.abonent][q.em] = { resolve: '' };
		rtcPull[q.type][q.abonent][q.em].resolve = resolve;
	} catch (ex) {
		console.log();
	}
}
