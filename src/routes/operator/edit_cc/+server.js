import pkg_e from 'nodemailer';
// @ts-ignore
const { Email } = pkg_e;
import stringHash from 'string-hash';
import pkg_l from 'lodash';
// @ts-ignore
const { _ } = pkg_l;
// @ts-ignore
global.rtcPull = { user: {}, operator: {} };

/** @type {import('./$types').RequestHandler} */
// @ts-ignore
export async function POST({ request, setHeaders, coockies, url }) {
	let sql = '',
		vals = '';

	let q = await request.json().then((data) => {
		return data.par;
	});

	let [rows, fields] = '';
	let err = '';
	// @ts-ignore
	let headers = '';
	switch (q.func) {
		case 'operator':
			if (q.send_mail && q.psw) {
				const ab = q.abonent ? q.abonent : q.send_mail;
				// @ts-ignore
				vals = [q.psw, q.send_mail, ab];
				sql = 'SELECT * FROM operators WHERE psw=? AND operator=? AND abonent=?';
				try {
					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);
					if (rows.length === 0) {
						// @ts-ignore
						vals = [q.psw, q.send_mail, ab, '{"name": "free", "start": "2021-12-14"}'];
						sql = 'INSERT INTO operators SET psw=?, operator=?, abonent=?, tarif=?';
						// @ts-ignore
						[rows, fields] = await pool.execute(sql, vals);

						const cookieId = crypto.randomUUID();

						SendEmail(q);
					} else {
					}
				} catch (ex) {
					// @ts-ignore
					if (ex.errno === 1062) {
						// @ts-ignore
						err = ex;
					}
				}

				// ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg:'Kolmit operator link was sent to '+q.send_mail})));
			}

			return new Response(JSON.stringify({ rows: rows, fields: fields, err: err }));

		case 'getusers':
			// this.SetParams( q, ws);

			if (q.abonent) {
				// @ts-ignore
				vals = [q.em, q.abonent, q.psw];

				sql =
					'SELECT tarif, users ' +
					'FROM operators, users ' +
					'WHERE operators.abonent = users.operator AND operators.operator=? AND operators.abonent=?  AND operators.psw=?'; // AND operators.psw=? /";
			} else {
				// @ts-ignore
				vals = [q.em, q.psw];

				sql =
					'SELECT tarif, users ' +
					'FROM operators, users ' +
					'WHERE operators.operator=users.operators.operator ';
				('AND operators.operator=? AND operators.psw=? AND operators.abonent=operators.operator');
			}
			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);

				if (rows[0]) {
					let res = false;
					// @ts-ignore
					let users = rows[0].users;
					for (let d in users) {
						if (users[d].admin.email === q.em) {
							res = true;
							break;
						}
						for (let s in users[d].staff) {
							if (users[d].staff[s].email === q.em) {
								res = true;
								break;
							}
						}
					}

					if (res) {
						// @ts-ignore
						rows = { tarif: rows[0].tarif, users: rows[0].users };
					}
				} else {
					// @ts-ignore
					rows = { users: [] };
				}
			} catch (ex) {
				// @ts-ignore
				console.log(ex.sql);
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message, users: [] }));
			}

			return new Response(JSON.stringify({ rows: rows, fields: fields, err: err }));

		case 'addoper':
			// @ts-ignore
			vals = [q.abonent ? q.abonent : q.em, q.em, q.abonent ? q.abonent : '', q.psw];
			sql =
				'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
				'FROM  operators as oper ' +
				'WHERE oper.operator=?  AND abonent=? AND psw=?';

			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);

				let usrs = [];
				if (rows[0]) {
					// @ts-ignore
					usrs = rows[0].users;
					let dep = _.find(usrs, { id: q.dep_id });

					let item = {
						id: dep.staff.length + 1,
						desc: '',
						name: '',
						role: 'operator',
						email: '',
						picture: { medium: './src/routes/assets/operator.svg' }
					};

					dep.staff.push(item);

					// @ts-ignore
					vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
					sql = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);

					return new Response(JSON.stringify({ func: q.func, dep: dep }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'changeoper':
			// @ts-ignore
			vals = [q.abonent ? q.abonent : q.em, q.em, q.abonent ? q.abonent : '', q.psw];
			sql =
				'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
				'FROM  operators as oper ' +
				'WHERE oper.operator=?  AND abonent=? AND psw=?';

			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);
				let usrs = [];
				if (rows[0]) {
					// @ts-ignore
					usrs = rows[0].users;
					let dep = _.find(usrs, { id: q.dep_id });
					let user;
					if (q.data.role === 'admin') {
						user = dep['admin'];
					} else {
						let ind = _.findIndex(dep.staff, { id: q.data.id });
						user = dep.staff[ind];
					}

					if (q.data.alias) user.alias = q.data.alias;
					if (q.data.picture) user.picture = q.data.picture;
					if (q.data.email) {
						if (q.data.email !== user.email) SendEmail(q, q.data.email);
						user.email = q.data.email;
					}
					if (q.data.name) user.name = q.data.name;
					if (q.data.desc) user.desc = q.data.desc;

					// @ts-ignore
					vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
					sql = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);
					return new Response(JSON.stringify({ func: q.func, dep: dep }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'remoper':
			// @ts-ignore
			vals = [q.abonent ? q.abonent : q.em, q.em, q.abonent ? q.abonent : '', q.psw];
			sql =
				'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
				'FROM  operators as oper ' +
				'WHERE oper.operator=?  AND abonent=? AND psw=?';
			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);

				let usrs = [];
				if (rows[0]) {
					// @ts-ignore
					usrs = rows[0].users;
					let dep = _.find(usrs, { id: q.dep });
					let ind = _.findIndex(dep.staff, { id: q.id });
					dep.staff.splice(ind, 1);

					// @ts-ignore
					vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
					sql = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);

					return new Response(JSON.stringify({ func: q.func, dep: dep }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'adddep':
			// @ts-ignore
			vals = [q.abonent ? q.abonent : q.em, q.em, q.abonent, q.psw];
			sql =
				'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
				'FROM  operators as oper ' +
				'WHERE oper.operator=?  AND abonent=? AND psw=?';
			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);
				let users = [];
				if (rows[0]) {
					// @ts-ignore
					users = rows[0].users;
					let ind = _.findIndex(users, { id: String(q.id) });
					// @ts-ignore
					if (ind === -1) return;

					users[q.id + 1] = {
						id: String(q.id + 1),
						alias: '',
						admin: {
							desc: '',
							name: '',
							role: 'admin',
							email: '',
							picture: { medium: './src/routes/assets/operator.svg' }
						},
						staff: []
					};
					// @ts-ignore
					vals = [JSON.stringify(users), q.em, q.abonent || q.em];
					sql = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';
					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);
					return new Response(JSON.stringify({ func: q.func, dep: users[q.id + 1] }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'changedep':
			// @ts-ignore
			vals = [q.abonent, q.em, q.psw];
			sql =
				'SELECT users FROM operators as oper, users as usr WHERE usr.operator=oper.abonent AND oper.abonent=? AND oper.operator=? AND oper.psw=?';
			try {
				// @ts-ignore
				[rows, fields] = await pool.query(sql, vals);

				if (rows[0]) {
					// @ts-ignore
					let users = rows[0].users;
					let ind = _.findIndex(users, { id: String(q.dep.id) });
					// @ts-ignore
					if (ind === -1) return;
					users[ind] = q.dep;
					// @ts-ignore
					vals = [JSON.stringify(users), q.em, q.abonent || q.em];
					sql = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ';

					// @ts-ignore
					[rows, fields] = await pool.query(sql, vals);
					return new Response(JSON.stringify({ dep: users[ind], fields: fields, err: err }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'remdep':
			// @ts-ignore
			vals = [q.em, q.psw];
			let query =
				'SELECT users FROM operators as oper, users as usr WHERE usr.operator=oper.abonent AND oper.operator=? AND oper.psw=?';
			try {
				// @ts-ignore
				[rows, fields] = await pool.query(query, vals);

				if (rows[0]) {
					// @ts-ignore
					let users = rows[0].users;
					// @ts-ignore
					_.remove(users, (n) => {
						return n.id === q.dep;
					});
					// @ts-ignore
					vals = [JSON.stringify(users), q.em, q.abonent || q.em];
					query = 'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ';

					// @ts-ignore
					[rows, fields] = await pool.query(query, vals);

					return new Response(JSON.stringify({ users: users, fields: fields, err: err }));
				}
			} catch (ex) {
				// @ts-ignore
				return new Response(JSON.stringify({ error: ex.message }));
			}

		case 'tarif':
			// @ts-ignore
			let tarif = tarifs[q.tarif];
			let users = [
				{
					id: '0',
					admin: {
						desc: 'Admin of admins',
						name: '',
						alias: '',
						role: 'admin',
						email: q.em,
						picture: {
							medium: './src/routes/assets/operator.svg'
						}
					},
					staff: []
				}
			];

			// @ts-ignore
			let paid = moment().add(tarif.trial, 'days').format('YYYY-MM-DD');
			// @ts-ignore
			let start = moment().format('YYYY-MM-DD');

			// @ts-ignore
			vals = [q.tarif, start, paid, q.em, q.psw, JSON.stringify(users)];

			sql = 'call ADD_NEW_TARIF(?,?,?,?,?,?)';

			// @ts-ignore
			[rows, fields] = await pool.query(sql, vals);

			return new Response(JSON.stringify({ rows: rows, fields: fields, err: err }));
	}
	// const cookies = cookie.parse(request.headers.get('cookie') || '');
	// const result = cookies['kolmit']

	// let dict = await (await fetch('http://localhost:5173/api/dict.json')).json();

	// return new Response(JSON.stringify({'data':'data'}));
}

// @ts-ignore
function SendEmail(q, new_email) {
	let em = new Email();
	const abonent = q.abonent ? '&abonent=' + q.abonent : '';
	const mail = q.send_mail || new_email;
	const hash = stringHash(mail);
	// @ts-ignore
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
		// @ts-ignore
		{
			ru: 'Новый оператор сети Колми',
			en: 'New Kolmi network operator',
			fr: 'Le nouvel opérateur de Kolmi'
		}[q.lang],
		html,
		// @ts-ignore
		(result) => {
			console.log();
		}
	);
}

// @ts-ignore
export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		// @ts-ignore
		throw error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
