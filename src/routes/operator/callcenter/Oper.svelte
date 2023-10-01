<script>
	import { onMount, onDestroy, getContext } from 'svelte';

	import loadImage from 'blueimp-load-image/js/load-image.js';
	import 'blueimp-load-image/js/load-image-scale.js';

	import User from '../../user/User.svelte';

	import Forward from './Forward.svelte';
	import FileTransfer from './FileTransfer.svelte';
	import _ from 'lodash';

	import { langs } from '$lib/js/stores.js';

	export let operator;
	export let id;
	export let dep;
	export let user;

	let files, user_status, placeholder_name, placeholder_email, placeholder_desc, upload;

	import { dicts } from '$lib/js/stores.js';
	let dict = $dicts;

	if (dict) {
		placeholder_name = dict['input operator name'][$langs];
		placeholder_email = dict['input operator email'][$langs];
		placeholder_desc = dict['input description'][$langs];
	}

	import operator_svg from '$lib/images/operator.svg';
	let user_pic = operator_svg;
	if (user.picture.medium) user_pic = user.picture.medium;

	import { statust } from '$lib/js/stores.js';

	// import { pswd } from '$lib/js/stores.js';
	// let psw = $pswd;

	export let edited_display;
	let readonlyOper = true;
	let readonlyAdm = true;

	import { editable } from '$lib/js/stores.js';
	// const us_edit = editable.subscribe((data) => {
	$: if ($editable) {
		edited_display = $editable;
		readonlyOper = !edited_display;
		readonlyAdm = !edited_display;
	}
	// });

	// $: if (readonly) {
	//   readonlyOper = readonly;

	//   if (dep.id === "0" && user.role === "admin") {
	//     readonlyAdm = true;
	//   } else {
	//     readonlyAdm = readonly;
	//   }
	// } else {
	//   if (dep.id !== "0") {
	//     readonlyAdm = readonly;
	//   }
	// }

	user.abonent = operator.abonent; //'white@house.usa';

	user.email = user.email ? user.email : '';

	const titleize = (s) => (s ? s.replace(/^([a-z])/, (_, r) => r.toUpperCase()) : '');

	user.name = titleize(user.name);

	import { posterst } from '$lib/js/stores.js';
	let oper_admin_div;

	$: if (user.email && operator.em === user.email) {
		console.log(operator.em + ' ' + user.email);
		$posterst = oper_admin_div;
	}

	onMount(() => {});

	// onDestroy();

	function OnClickUpload(ev) {
		let event = new MouseEvent('click', {
			bubbles: false,
			cancelable: true,
			view: window
		});

		if (upload) upload.dispatchEvent(event);
	}

	let width, height;
	function OnChangeFile(e) {
		try {
			loadImage(
				e.target.files[0],
				function (img, data) {
					if (img.type === 'error') {
						console.error('Error loading image ');
					} else {
						width = img.width;
						height = img.height;
						user.picture = { medium: img.toDataURL() };
						OnChange();
					}
				},
				{
					orientation: true,
					maxWidth: 100,
					maxHeight: 100,
					minWidth: 50,
					minHeight: 50,
					canvas: true
				}
			);
		} catch (ex) {
			console.log(ex);
		}
	}

	async function OnChange(ev) {
		let par = {};
		par.proj = 'kolmit';
		par.func = 'changeoper';
		par.abonent = operator.abonent;
		par.em = operator.email;
		par.dep_id = dep.id;
		// par.psw = psw;
		par.data = user;
		par.lang = $langs;

		const res = fetch('/operator/edit_cc/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify({
				par: par
			})
		});
	}

	async function OnRemoveOper(u) {
		let user = dep.staff[id];
		if (!user) {
			return;
		}

		if (confirm('Delete ' + user.name)) {
			let par = {};
			par.proj = 'kolmit';
			par.func = 'remoper';
			par.em = operator.email;
			par.id = user.id;
			par.dep = dep.id;
			par.lang = $langs;
			par.abonent = operator.abonent;
			// par.psw = psw;

			const res = fetch('/operator/edit_cc/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					// 'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: JSON.stringify({
					par: par
				})
			});

			const data = await (await res).json();
			dep.staff = data.dep.staff;
		}
	}
</script>

<div
	bind:this={oper_admin_div}
	style="display:flex; flex-wrap: nowrap;justify-content: space-between; padding-bottom:20px"
>
	<!-- {@debug operator, user} -->
	<!-- {#if user.email !== operator.em} -->
	<div class="user_pic_div" style="position:relative; width: 100px; height:100px">
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<video
			id="localVideo"
			class="user_pic is-rounded"
			poster={user_pic}
			autoplay
			playsinline
			muted
			on:click={OnClickUpload}
			style="display: block; position:absolute; top:0px; width:100px; height: 100px;"
		/>
		<!-- <img
			class="user_pic is-rounded"
			src={user_pic}
			alt=""
			on:click={OnClickUpload}
			style="border-radius: 5px; float:right; max-width:100%"
		/> -->
		{#if edited_display}
			<input
				bind:this={upload}
				class="file-upload"
				on:change={OnChangeFile}
				accept="image/png, image/jpeg"
				bind:files
				id="avatar"
				name="avatar"
				type="file"
				style="display: none"
			/>
		{/if}

		<!-- src="/kolmit/user/iframe.html?em=oper@komi&abonent={user.email}" -->
		<!-- {#if edited_display} -->
		<!-- {@debug dep, user} -->
		{#if user.email && operator.em !== user.email}
			<!-- {@debug user} -->
			<User em={user.email} operator={operator.em} abonent={user.abonent} />
		{/if}
		<!-- {/if} -->

		{#if edited_display}
			{#if dep.admin.email === operator.email && operator.email !== user.email && user.role === 'operator'}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<svg
					height="30"
					width="30"
					on:click={OnRemoveOper(user)}
					style="position: absolute;bottom: -15px;left: -9px;"
				>
					<glyph glyph-name="minus-circle" unicode="&#xefc0;" horiz-adv-x="50" />
					<g class="currentLayer">
						<path
							d="M500.2 62.5c-241.8 0-437.7 195.89999999999998-437.7 437.3 0 241.8 195.89999999999998 437.7 437.7 437.7 241.40000000000003 0 437.3-195.89999999999998 437.3-437.7 0-241.40000000000003-195.89999999999998-437.3-437.3-437.3z m301.59999999999997 466.5c-0.6999999999999318 9-2.199999999999932 19.100000000000023-4.699999999999932 30.299999999999955h-593.9000000000001c-2.499999999999943-11.199999999999932-4.299999999999926-21.699999999999932-5.0999999999999375-31.399999999999977-0.6999999999999886-9.699999999999932-1.0999999999999943-19.799999999999955-1.0999999999999943-30.299999999999955 0-9 0.4000000000000057-18 1.0999999999999943-26.700000000000045 0.700000000000017-9 2.5-19.099999999999966 5.099999999999994-30.299999999999955h593.9000000000001c2.4999999999998863 11.199999999999989 3.9999999999998863 21.599999999999966 4.699999999999818 31.399999999999977 1.1000000000000227 9.699999999999989 1.400000000000091 19.80000000000001 1.400000000000091 30.30000000000001 0.09999999999990905 9.099999999999966-0.3000000000000682 17.69999999999999-1.400000000000091 26.69999999999999z"
							transform="scale(.03)"
							style="fill:lightgrey; stroke:black; stroke-width:20px"
						/>
					</g>
				</svg>
			{/if}
		{/if}
	</div>

	<div style="flex:1; margin-left:10px">
		{#if dict}
			<input
				type="text"
				class="user_name"
				placeholder={placeholder_name}
				on:change={OnChange}
				bind:value={user.name}
				readonly={readonlyOper}
				style="width:80%;"
			/>
			<input
				type="text"
				class="user_email"
				placeholder={placeholder_email}
				on:change={OnChange}
				bind:value={user.email}
				readonly={readonlyAdm}
				style="width:100%; max-height: 100px;"
			/>
		{/if}
		<textarea
			type="text"
			rows="3"
			class="user_desc"
			placeholder={placeholder_desc}
			on:change={OnChange}
			bind:value={user.desc}
			readonly={readonlyOper}
			style="width:85%;overflow:auto;max-height: 100px;resize:none"
		/>
	</div>

	<div style="display: flex;flex-flow: row nowrap; align-items: flex-start;flex-direction: column;">
		{#if $statust === 'talk' && user_status === 'active' && user.email !== operator.email}
			<Forward bind:$statust operator={user.email}>
				<img
					src="./src/routes/assets/call-forward.svg"
					alt="call-forward"
					width="30px"
					height="30px"
				/>
			</Forward>
		{/if}
		{#if user_status === 'talk' || ($statust === 'talk' && user.email === operator.email)}
			<FileTransfer {$statust} operator={user.email}>
				<img
					src="./src/routes/assets/file-transfer.svg"
					alt="file-transfer"
					width="30px"
					height="30px"
				/>
			</FileTransfer>
		{/if}
	</div>
	<!-- {/if} -->
</div>

<style>
	textarea:not([readonly]),
	input:not([readonly]) {
		color: rgb(35, 33, 158);
	}
	textarea:not([readonly])::placeholder,
	input:not([readonly])::placeholder {
		color: rgb(41, 128, 155);
	}

	input,
	input:hover,
	input:focus,
	input:active,
	textarea {
		background: transparent;
		border: 0;
		border-style: none;
		border-color: transparent;
		outline: none;
		outline-offset: 0;
		box-shadow: none;
		padding: 0;
		font-size: 0.7em;
	}
</style>
