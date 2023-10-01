'use strict';

// import {log} from './utils'

import { msg_signal_oper, msg_signal_user } from '$lib/js/stores.js';

// export const msg = writable('');

export class SignalingChannel {
	constructor(operator) {
		this.msg_signal_oper = msg_signal_oper;
		this.msg_signal_user = msg_signal_user;
		this.operator = operator;
	}

	async SendMessage(par, cb) {
		par.operator = this.operator;
		let response;
		try {
			response = await fetch('/site', {
				method: 'POST',
				body: JSON.stringify({ par }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
		} catch (ex) {}

		const { resp } = await response.json();
		//console.log(resp);
		if (cb) cb(resp);
	}

	async CallWaiting(par) {
		par.func = 'callwaiting';
		const response = await fetch('/operator/rtc', {
			method: 'POST',
			body: JSON.stringify({ par }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { resp } = await response.json();
		let remAr = JSON.parse(resp);
		if (Array.isArray(remAr)) {
			remAr.map((resp) => {
				msg_signal_oper.set(resp);
			});
		} else {
			msg_signal_oper.set(remAr);
		}
		//console.log(resp);
		this.CallWaiting(par);
	}

	async OperatorWaiting(par) {
		const response = await fetch('/user/rtc', {
			method: 'POST',
			body: JSON.stringify({ par }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { resp } = await response.json();

		//console.log(resp);
		let remAr = JSON.parse(resp);
		if (Array.isArray(remAr)) {
			remAr.map((resp) => {
				msg_signal_user.set(resp);
			});
		} else {
			msg_signal_user.set(remAr);
		}

		this.OperatorWaiting(par);
	}
}
