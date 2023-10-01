import { error } from '@sveltejs/kit';
// import {promisify} from 'node:util'
import { page } from '$app/stores';

import { dict } from '../site/data.js';

export function load() {
  // console.log(dict);
  return {
    dict: dict,
  };
}

async function GetUsers() {
  let operator = {};

  operator.abonent = page.url.searchParams.get('abonent');
  operator.email = url.searchParams.get('operator');
  operator.psw = url.searchParams.get('psw');

  let par = {};
  par.proj = 'kolmit';
  par.func = 'getusers';

  par.abonent = operator.abonent;
  par.em = operator.email;
  par.psw = operator.psw;

  // const json = await (await fetch('/operator/api/edit_cc/')).json();

  const response = await fetch('/operator/api/edit_cc/', {
    method: 'POST',
    body: JSON.stringify({
      par: par,
    }),
    headers: {
      'content-type': 'application/json',
    },
  });

  let json = await response.json();

  console.log('data');

  // tarif = json.rows.tarif;

  users.set(json.rows.users);

  usrs = json.rows.users;
}
