<script>
	import md5 from 'md5';
	import loadImage from 'blueimp-load-image/js/load-image.js';
	import 'blueimp-load-image/js/load-image-scale.js';
	import { signal } from '$lib/js/stores.js';

	export let user_name, user_pic;

	export let lang, checked, abonent, upload, files;
	let email = '',
		psw = '',
		psw_2 = '';

	let width, height;

	import operator_svg from '$lib/images/operator.svg';

	if (!user_pic) {
		user_pic = operator_svg;
	}

	async function OnEmail(params) {
		let par = {};
		par.proj = 'kolmit';
		par.func = 'operator';
		par.abonent = abonent;
		par.email = email;
		par.psw = md5(psw);
		par.img = user_pic;
		// par.tarif = 'free';
		par.lang = lang;
		let promise = new Promise((resolve, reject) => {
			$signal.SendMessage(par, (data) => {
				resolve(data);
			});
		});
		let res = await promise;

		if (res.func === par.func) {
			checked = true;
		}
	}

	function OnClickUpload(ev) {
		let event = new MouseEvent('click', {
			bubbles: false,
			cancelable: true,
			view: window
		});

		if (upload) upload.dispatchEvent(event);
	}

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
						user_pic = img.toDataURL();
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
</script>

<form>
	<div id="inputs">
		<input type="email" placeholder="input your email" bind:value={email} required />
		<input type="text" placeholder="input your name" bind:value={user_name} required />
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
		<div>
			<img
				class="user_pic is-rounded"
				src={user_pic}
				alt=""
				on:click={OnClickUpload}
				style="border-radius: 5px;  max-width:10%"
			/>
		</div>
		<div>
			<input type="password" placeholder="input your password" bind:value={psw} required />
			<input
				type="password"
				placeholder="repeat your password"
				bind:value={psw_2}
				on:change={OnEmail}
				required
			/>
		</div>
	</div>
</form>
