import { json } from '@sveltejs/kit';
import { CreateOperator, CheckOperator } from '$lib/server/db.js'; //src\lib\server\server.db.js
import _ from 'lodash';
import { Email } from 'nodemailer';
import md5 from 'md5';

// /** @type {import('./$types').RequestHandler} */
// export async function POST(event) {
// 	const body = await event.request.body;

// 	// log all fields
// 	console.log([...body]);

// 	return json({
// 		// get a specific field's value
// 		name: body.get('name') ?? 'world'
// 	});
// }
/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies, url }) {
	let abonent = url.searchParams.get('abonent');
	const { par } = await request.json();
	const q = par;
	let res = cookies.get('abonent:' + abonent);
	let kolmit;
	if (res) {
		kolmit = JSON.parse(res);
	} else {
		kolmit = { psw: md5('demo') };
	}
	let resp = {};
	// console.log(q);

	switch (par.func) {
		case 'operator':
			if (q.email && q.psw) {
				if (CreateOperator(q)) {
					cookies.set(
						// 'abonent:' + q.abonent,
						JSON.stringify({
							operator: q.email,
							abonent: q.abonent,
							psw: q.psw,
							lang: q.lang
						})
					);
					resp = JSON.stringify({
						func: par.func,
						operator: q.email,
						abonent: q.email,
						lang: q.lang
					});
				}
			}
			break;

		case 'check':
			SetParams(q);

			if (q.type === 'user') {
				let cnt_queue = 0;
				let item = rtcPull[q.type][q.abonent][q.em][q.uid];
				// try {
				// 	// for (let uid in rtcPull[q.type][q.abonent]) {
				// 	//     if (rtcPull[q.type][q.abonent][q.em][uid])
				// 	//         if (rtcPull[q.type][q.abonent][q.em][uid].status === 'call' ||
				// 	//             rtcPull[q.type][q.abonent][q.em][uid].status === 'wait')
				// 	//             if (rtcPull[q.type][q.abonent][q.em][uid].uid === q.uid) {
				// 	//                 cnt_queue++;
				// 	//             }
				// 	// }
				// } catch (ex) {
				// 	return json({
				// 		ex: ex,
				// 		func: q.func,
				// 		check: true,
				// 		queue: String(cnt_queue)
				// 	});
				// }

				resp = {
					func: q.func,
					type: q.type,
					check: true,
					queue: String(cnt_queue)
				};

				SendOperatorStatus(q);

				return json({ resp });
			} else if (q.type === 'operator') {
				q.psw = kolmit.psw;
				// console.log(q.em)
				resp = await CheckOperator(q);
				console.log(resp);
			}

			break;
		case 'offer':
			try {
				SetParams(q);
				BroadcastOperatorStatus(q, 'offer');
			} catch (ex) {
				console.log();
			}
			break;

		case 'call':
			HandleCall(q);
			break;

		case 'status':
			if (q.status === 'call') {
				if (q.type === 'operator') {
					let item = global.rtcPull[q.type][q.abonent][q.em][q.uid];
					if (item) item.status = 'busy';
					BroadcastOperatorStatus(q, 'busy');
					// global.rtcPull['operator'][q.abonent][q.em].shift();
				}
				break;
			}
			if (q.status === 'close') {
				try {
					let item = global.rtcPull[q.type][q.abonent][q.em][q.uid];
					if (item) {
						item.status = q.status;
						if (q.type === 'operator') BroadcastOperatorStatus(q, 'close');
					}
				} catch (ex) {}
				//this.RemoveAbonent(q);
				break;
			}

			SetParams(q);

			break;
	}

	return json({ resp });
}

function SendEmail(q, new_email) {
	let em = new Email();
	const abonent = q.abonent ? '&abonent=' + q.abonent : '';
	const mail = q.send_mail || new_email;
	const hash = this.getHash(mail);
	let text = {
		ru: '<h1>Присоединиться к сети</h1></a>',
		en: '<h1>Join network</h1></a>',
		fr: '<h1>Rejoindre le réseau</h1></a>'
	}[q.lang];
	let html =
		"<div><a href='http://localhost:5000/kolmit/site/operator.html?operator=" +
		(q.send_mail || new_email) +
		abonent +
		'&hash=' +
		hash +
		"'>" +
		text +
		'</a></div>';

	em.SendMail(
		'nedol@narod.ru',
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

function SetParams(q) {
	if (!rtcPull[q.type][q.abonent]) {
		rtcPull[q.type][q.abonent] = {};
	}

	if (!rtcPull[q.type][q.abonent][q.em]) rtcPull[q.type][q.abonent][q.em] = [];

	let item;
	if (q.type === 'user') {
		item = rtcPull[q.type][q.abonent][q.em][q.uid];
	} else item = rtcPull[q.type][q.abonent][q.em][0];

	if (!item) {
		item = {};
		item.cand = [];
		rtcPull[q.type][q.abonent][q.em][q.uid] = item;
	}

	item.uid = q.uid;
	item.status = q.status;
	item.abonent = q.abonent;
	item.operator = q.em;

	if (q.desc) item.desc = q.desc;
	if (Array.isArray(q.cand)) {
		q.cand.forEach((cand, index) => {
			item.cand.push(cand);
		});
	} else if (q.cand) item.cand.push(q.cand);

	// ws.onclose = function (ev) {
	// 	if (q.type === 'operator') {
	// 		let item = _.find(rtcPull[q.type][q.abonent][q.em], {
	// 			uid: q.uid
	// 		});
	// 		if (item) item.status = 'close';
	// 		that.BroadcastOperatorStatus(q, 'close');
	// 		const ind = _.findIndex(rtcPull[q.type][q.abonent][q.em], {
	// 			uid: q.uid
	// 		});
	// 		rtcPull[q.type][q.abonent][q.em].splice(ind, 1);
	// 	} else if ((q.type = 'user')) {
	// 		if (rtcPull[q.type][q.abonent]) {
	// 			that.SendUserStatus(q);
	// 			const index = _.findIndex(rtcPull[q.type][q.abonent][q.em], {
	// 				uid: q.uid
	// 			});
	// 			rtcPull[q.type][q.abonent][q.em].splice(index, 1);
	// 		}
	// 	}
	// };
}

function BroadcastOperatorStatus(q, status) {
	try {
		let queue = 0;
		if (!global.rtcPull['user'][q.abonent]) return;
		for (let uid in global.rtcPull['user'][q.abonent][q.em]) {
			if (q.uid && global.rtcPull['user'][q.abonent][q.em][uid]) {
				queue++;
			}
		}
		let type = q.type === 'operator' ? 'user' : 'operator';

		let operators = { [q.em]: {} };
		for (let uid in global.rtcPull['operator'][q.abonent][q.em]) {
			if (uid !== 'resolve')
				operators[q.em][uid] = {
					type: q.type,
					abonent: q.abonent,
					em: q.em,
					uid: q.uid,
					status: global.rtcPull['operator'][q.abonent][q.em][uid].status,
					queue: queue
				};
		}

		for (let em in global.rtcPull[type][q.abonent]) {
			if (em === q.em && q.status === 'call')
				//not to send to yourself
				continue;
			for (let uid in global.rtcPull[type][q.abonent][em]) {
				let item = global.rtcPull[type][q.abonent][em][uid];
				let offer = _.find(operators[q.em], { status: 'offer' });
				if (
					offer &&
					// && item.abonent === q.em
					item.uid !== q.uid
				) {
					if (item.status === 'wait') {
						let oper = global.rtcPull['operator'][q.abonent][q.em][q.uid];

						let remAr = {
							func: q.func,
							type: type,
							abonent: q.abonent,
							oper_uid: q.uid,
							desc: oper.desc,
							cand: oper.cand
						};
						if (global.rtcPull[type][q.abonent][em].resolve)
							global.rtcPull[type][q.abonent][em].resolve(remAr);
					} else {
						if (global.rtcPull[type][q.abonent][em].resolve)
							global.rtcPull[type][q.abonent][em].resolve({
								func: q.func,
								type: type,
								abonent: q.abonent,
								em: q.em,
								uid: q.uid,
								operators: operators
							});
					}
				} else {
					if (global.rtcPull[type][q.abonent][em].resolve)
						global.rtcPull[type][q.abonent][em].resolve({
							func: q.func,
							type: type,
							abonent: q.abonent,
							em: em,
							uid: q.uid,
							operators: operators
						});
				}
			}
		}

		operators = '';
	} catch (ex) {
		console.log(ex);
	}
}

function SendOperatorStatus(q) {
	if (
		rtcPull['operator'] &&
		rtcPull['operator'][q.abonent] &&
		rtcPull['operator'][q.abonent][q.em]
	) {
		for (let uid in rtcPull['operator'][q.abonent][q.em]) {
			if (rtcPull['operator'][q.abonent][q.em][uid].status === 'offer') {
				let operator = {
					abonent: q.abonent,
					em: q.em,
					uid: uid,
					status: rtcPull['operator'][q.abonent][q.em][uid].status,
					desc: rtcPull['operator'][q.abonent][q.em][uid].desc,
					cand: rtcPull['operator'][q.abonent][q.em][uid].cand
				};

				if (q.type === 'user') {
					let item = rtcPull['user'][q.abonent][q.em][q.uid];

					rtcPull['user'][q.abonent][q.em].resolve({ operator: operator });
				}
			}
		}
	}
}

let remAr = [];
async function HandleCall(q) {
	if (q.type === 'user') {
		if (q.desc || q.cand) {
			remAr.push({
				func: q.func,
				desc: q.desc,
				cand: q.cand,
				abonent: q.abonent,
				user: q.em
				// "abonent": q.em
			});
			let item = rtcPull['operator'][q.abonent][q.em][q.oper_uid];

			if (item) {
				await rtcPull['operator'][q.abonent][q.em].promise;
				rtcPull['operator'][q.abonent][q.em].resolve(remAr);
				remAr = [];
			}
		} else {
			let item = rtcPull['user'][q.abonent][q.em][q.uid];
			if (item) {
				let oper_check = _.findKey(rtcPull['operator'][q.abonent][q.em], {
					status: 'check'
				});
				let oper_offer_key = _.findKey(rtcPull['operator'][q.abonent][q.em], {
					status: 'offer'
				});

				let oper_offer = rtcPull['operator'][q.abonent][q.em][oper_offer_key];

				if (oper_offer) {
					remAr.push({
						func: q.func,
						abonent: q.abonent,
						uid: q.uid,
						oper_uid: oper_offer.uid,
						desc: oper_offer.desc,
						cand: oper_offer.cand
					});
					await rtcPull['operator'][q.abonent][q.em].promise;
					rtcPull['user'][q.abonent][q.operator].resolve(remAr);
					//console.log('after HandleCall:user '+JSON.stringify(remAr));
					remAr = [];
				} else {
					item.status = 'wait';
					remAr.push({
						func: q.func,
						abonent: q.abonent,
						status: 'wait'
					});
					await rtcPull['operator'][q.abonent][q.em].promise;
					rtcPull['user'][q.abonent][q.em].resolve(remAr);

					if (oper_check && oper_check.resolve) {
						const remAr = {
							func: q.func,
							abonent: q.abonent,
							user_uid: item.uid,
							status: 'wait'
						};
						oper_check.resolve(remAr);
						remAr = [];
					}
				}
			}
		}
	}
}
