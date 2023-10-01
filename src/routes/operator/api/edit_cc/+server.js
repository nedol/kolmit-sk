import pkg from 'mysql2';
const { pool } = pkg;
import * as cookie from 'cookie';
import pkg_e from 'nodemailer';
const { Email } = pkg_e;
import stringHash from 'string-hash';
import pkg_l from 'lodash';
const { _ } = pkg_l;
global.rtcPull = { user: {}, operator: {} };

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, setHeaders, url }) {
  let sql = '',
    vals = '';

  let q = await request.json().then((data) => {
    // do something with the formdata sent in the request
    return data.par;
  });

  let [rows, fields] = '';
  let err = '';
  let headers = '';
  switch (q.func) {
    case 'operator':
      if (q.send_mail && q.psw) {
        const ab = q.abonent ? q.abonent : q.send_mail;
        vals = [q.psw, q.send_mail, ab];
        sql =
          'SELECT * FROM operators WHERE psw=? AND operator=? AND abonent=?';
        try {
          [rows, fields] = await pool.query(sql, vals);
          if (rows.length === 0) {
            vals = [
              q.psw,
              q.send_mail,
              ab,
              '{"name": "free", "start": "2021-12-14"}',
            ];
            sql =
              'INSERT INTO operators SET psw=?, operator=?, abonent=?, tarif=?';
            [rows, fields] = await pool.execute(sql, vals);

            const cookieId = crypto.randomUUID();

            headers = {
              'Set-cookie': cookie.serialize('session_id', cookieId, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax',
                path: '/',
              }),
            };

            SendEmail(q);
          } else {
          }
        } catch (ex) {
          if (ex.errno === 1062) {
            err = ex;
          }
        }

        // ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg:'Kolmit operator link was sent to '+q.send_mail})));
      }

      return new Response(
        JSON.stringify({ rows: rows, fields: fields, err: err })
      );

    case 'getusers':
      // this.SetParams( q, ws);

      if (q.abonent) {
        vals = [q.em, q.abonent, q.psw];

        sql =
          'SELECT tarif, users ' +
          'FROM operators, users ' +
          'WHERE operators.abonent = users.operator AND operators.operator=? AND operators.abonent=?  AND operators.psw=?'; // AND operators.psw=? /";
      } else {
        vals = [q.em, q.psw];

        sql =
          'SELECT tarif, users ' +
          'FROM operators, users ' +
          'WHERE operators.operator=users.operators.operator ';
        ('AND operators.operator=? AND operators.psw=? AND operators.abonent=operators.operator');
      }
      try {
        [rows, fields] = await pool.query(sql, vals);

        if (rows[0]) {
          let res = false;
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
            rows = { tarif: rows[0].tarif, users: rows[0].users };
          }
        } else {
          rows = { users: [] };
        }
      } catch (ex) {
        console.log(ex.sql);
        return new Response(JSON.stringify({ error: ex.message, users: [] }));
      }

      return new Response(
        JSON.stringify({ rows: rows, fields: fields, err: err })
      );

    case 'addoper':
      vals = [
        q.abonent ? q.abonent : q.em,
        q.em,
        q.abonent ? q.abonent : '',
        q.psw,
      ];
      sql =
        'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
        'FROM  operators as oper ' +
        'WHERE oper.operator=?  AND abonent=? AND psw=?';

      try {
        [rows, fields] = await pool.query(sql, vals);

        let usrs = [];
        if (rows[0]) {
          usrs = rows[0].users;
          let dep = _.find(usrs, { id: q.dep_id });

          let item = {
            id: dep.staff.length + 1,
            desc: '',
            name: '',
            role: 'operator',
            email: '',
            picture: { medium: './src/routes/assets/operator.svg' },
          };

          dep.staff.push(item);

          vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
          sql =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

          [rows, fields] = await pool.query(sql, vals);

          return new Response(JSON.stringify({ func: q.func, dep: dep }));
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'changeoper':
      vals = [
        q.abonent ? q.abonent : q.em,
        q.em,
        q.abonent ? q.abonent : '',
        q.psw,
      ];
      sql =
        'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
        'FROM  operators as oper ' +
        'WHERE oper.operator=?  AND abonent=? AND psw=?';

      try {
        [rows, fields] = await pool.query(sql, vals);
        let usrs = [];
        if (rows[0]) {
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

          vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
          sql =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

          [rows, fields] = await pool.query(sql, vals);
          return new Response(JSON.stringify({ func: q.func, dep: dep }));
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'remoper':
      vals = [
        q.abonent ? q.abonent : q.em,
        q.em,
        q.abonent ? q.abonent : '',
        q.psw,
      ];
      sql =
        'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
        'FROM  operators as oper ' +
        'WHERE oper.operator=?  AND abonent=? AND psw=?';
      try {
        [rows, fields] = await pool.query(sql, vals);

        let usrs = [];
        if (rows[0]) {
          usrs = rows[0].users;
          let dep = _.find(usrs, { id: q.dep });
          let ind = _.findIndex(dep.staff, { id: q.id });
          dep.staff.splice(ind, 1);

          vals = [JSON.stringify(usrs), q.em, q.abonent || q.em];
          sql =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';

          [rows, fields] = await pool.query(sql, vals);

          return new Response(JSON.stringify({ func: q.func, dep: dep }));
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'adddep':
      vals = [q.abonent ? q.abonent : q.em, q.em, q.abonent, q.psw];
      sql =
        'SELECT *, (SELECT users FROM users WHERE operator=?) as users ' +
        'FROM  operators as oper ' +
        'WHERE oper.operator=?  AND abonent=? AND psw=?';
      try {
        [rows, fields] = await pool.query(sql, vals);
        let users = [];
        if (rows[0]) {
          users = rows[0].users;
          let ind = _.findIndex(users, { id: String(q.id) });
          if (ind === -1) return;

          users[q.id + 1] = {
            id: String(q.id + 1),
            alias: '',
            admin: {
              desc: '',
              name: '',
              role: 'admin',
              email: '',
              picture: { medium: './src/routes/assets/operator.svg' },
            },
            staff: [],
          };
          vals = [JSON.stringify(users), q.em, q.abonent || q.em];
          sql =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?';
          [rows, fields] = await pool.query(sql, vals);
          return new Response(
            JSON.stringify({ func: q.func, dep: users[q.id + 1] })
          );
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'changedep':
      vals = [q.abonent, q.em, q.psw];
      sql =
        'SELECT users FROM operators as oper, users as usr WHERE usr.operator=oper.abonent AND oper.abonent=? AND oper.operator=? AND oper.psw=?';
      try {
        [rows, fields] = await pool.query(sql, vals);

        if (rows[0]) {
          let users = rows[0].users;
          let ind = _.findIndex(users, { id: String(q.dep.id) });
          if (ind === -1) return;
          users[ind] = q.dep;
          vals = [JSON.stringify(users), q.em, q.abonent || q.em];
          sql =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ';

          [rows, fields] = await pool.query(sql, vals);
          return new Response(
            JSON.stringify({ dep: users[ind], fields: fields, err: err })
          );
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'remdep':
      vals = [q.em, q.psw];
      let query =
        'SELECT users FROM operators as oper, users as usr WHERE usr.operator=oper.abonent AND oper.operator=? AND oper.psw=?';
      try {
        [rows, fields] = await pool.query(query, vals);

        if (rows[0]) {
          let users = rows[0].users;
          _.remove(users, (n) => {
            return n.id === q.dep;
          });
          vals = [JSON.stringify(users), q.em, q.abonent || q.em];
          query =
            'UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ';

          [rows, fields] = await pool.query(query, vals);

          return new Response(
            JSON.stringify({ users: users, fields: fields, err: err })
          );
        }
      } catch (ex) {
        return new Response(JSON.stringify({ error: ex.message }));
      }

    case 'tarif':
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
              medium: './src/routes/assets/operator.svg',
            },
          },
          staff: [],
        },
      ];

      let paid = moment().add(tarif.trial, 'days').format('YYYY-MM-DD');
      let start = moment().format('YYYY-MM-DD');

      vals = [q.tarif, start, paid, q.em, q.psw, JSON.stringify(users)];

      sql = 'call ADD_NEW_TARIF(?,?,?,?,?,?)';

      [rows, fields] = await pool.query(sql, vals);

      return new Response(
        JSON.stringify({ rows: rows, fields: fields, err: err })
      );
  }
  // const cookies = cookie.parse(request.headers.get('cookie') || '');
  // const result = cookies['kolmit']

  // let dict = await (await fetch('http://localhost:5173/api/dict.json')).json();

  // return new Response(JSON.stringify({'data':'data'}));
}

function SendEmail(q, new_email) {
  let em = new Email();
  const abonent = q.abonent ? '&abonent=' + q.abonent : '';
  const mail = q.send_mail || new_email;
  const hash = stringHash(mail);
  let text = {
    ru: '<h1>Присоединиться к сети</h1></a>',
    en: '<h1>Join network</h1></a>',
    fr: '<h1>Rejoindre le réseau</h1></a>',
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
      fr: 'Le nouvel opérateur de Kolmi',
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
    throw error(
      400,
      'min and max must be numbers, and min must be less than max'
    );
  }

  const random = min + Math.random() * d;

  return new Response(String(random));
}
