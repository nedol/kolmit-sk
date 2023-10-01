import { json } from '@sveltejs/kit';
import fs from 'fs';

export async function GET({ url, fetch }) {
	const path = url.searchParams.get('path');
	const key = url.searchParams.get('key');
	if (path) {
		let resp = await fetch('/src/lib/lessen/' + path);
		let text = await resp.text();
		let items = text.split('\r\n');
		return json({ items });
	} else if (key) {
		let resp = await fetch('/src/routes/operator/lesson/audio.json');

		resp = await resp.json();
		let audio = resp[key];
		return json({ audio });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url, fetch }) {
	const { voice } = await request.json();
	let key = Object.keys(voice)[0];
	let resp = await fetch('/src/routes/operator/lesson/audio.json');
	let audio = await resp.json();
	audio[key] = voice[key];
	fs.writeFile('./src/routes/operator/lesson/audio.json', JSON.stringify(audio), (err) => {
		if (err) {
			return new Response(json('Error writing file:' + err));
		} else {
			return new Response(json('Successfully wrote file'));
		}
	});
}
