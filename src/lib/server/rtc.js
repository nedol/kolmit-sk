export function SetParams(q) {
	if (!rtcPull[q.type][q.abonent]) {
		rtcPull[q.type][q.abonent] = {};
	}

	if (!rtcPull[q.type][q.abonent][q.operator]) rtcPull[q.type][q.abonent][q.operator] = [];

	let item;
	if (q.type === 'user') {
		item = _.find(rtcPull[q.type][q.abonent][q.operator], { uid: q.uid });
	} else item = rtcPull[q.type][q.abonent][q.operator][0];

	if (!item) {
		item = {};
		item.cand = [];
		rtcPull[q.type][q.abonent][q.operator].push(item);
	}

	item.uid = q.uid;
	item.status = q.status;
	item.abonent = q.abonent;
	// item.oper_uid = q.oper_uid;
	if (q.desc) item.desc = q.desc;
	if (Array.isArray(q.cand)) {
		q.cand.forEach((cand, index) => {
			item.cand.push(cand);
		});
	} else if (q.cand) item.cand.push(q.cand);

	// ws.onclose = function (ev) {
	// 	if (q.type === 'operator') {
	// 		let item = _.find(rtcPull[q.type][q.abonent][q.operator], {
	// 			uid: q.uid
	// 		});
	// 		if (item) item.status = 'close';
	// 		that.BroadcastOperatorStatus(q, 'close');
	// 		const ind = _.findIndex(rtcPull[q.type][q.abonent][q.operator], {
	// 			uid: q.uid
	// 		});
	// 		rtcPull[q.type][q.abonent][q.operator].splice(ind, 1);
	// 	} else if ((q.type = 'user')) {
	// 		if (rtcPull[q.type][q.abonent]) {
	// 			that.SendUserStatus(q);
	// 			const index = _.findIndex(rtcPull[q.type][q.abonent][q.operator], {
	// 				uid: q.uid
	// 			});
	// 			rtcPull[q.type][q.abonent][q.operator].splice(index, 1);
	// 		}
	// 	}
	// };
}
export function CallWaiting(q, resolve) {
	rtcPull[q.type][q.abonent][q.operator].resolve = resolve;
}
