<script>
// @ts-nocheck

	import { page } from '$app/stores';
	import { onMount, getContext, setContext } from 'svelte';
	import '../assets/icofont/icofont.min.css';

	// import {Dict} from '$lib/js/$dicts'
	import Callcenter from './callcenter/Callcenter.svelte';
	let callcenter;
	import Landpage from './callcenter/Landpage.svelte';
	import { RTCOperator } from './rtc/RTCOperator.js';
	// import * as cookie from 'cookie';

	import CallButton from './callbutton/CallButtonOperator.svelte';
	import BurgerMenu from './menu/BurgerMenu.svelte';
	import VideoLocal from './Video.local.svelte';
	import VideoRemote from './Video.remote.svelte';

	import Download from './Download.svelte';
	import AudioLocal from './Audio.local.svelte';
	import AudioRemote from './Audio.remote.svelte';

	import RecordedVideo from './RecordedVideo.svelte';

	import Lesson from './lesson/Lesson.svelte';

	import md5 from 'md5';

	import { dicts } from '$lib/js/stores.js';

	import { langs } from '$lib/js/stores.js';

	import { signal } from '$lib/js/stores.js';

	import { users } from '$lib/js/stores.js';

	import { msg_signal_oper } from '$lib/js/stores.js';
	$: if ($msg_signal_oper) {
		OnMessage($msg_signal_oper);
	}

	let rtc;

	import { view } from '$lib/js/stores.js';

	export let tarif;

	// isPaid = false;
	// if (tarif && tarif.paid) {
	// 	isPaid = new Date(tarif.paid) > Date.now();
	// }

	let selected;
	let call_cnt,
		status = 'inactive',
		inter;
	let video_button_display = false;
	let edited_display = false;

	import { statust } from '$lib/js/stores.js';
	$: statust.set(status);

	import { editable } from '$lib/js/stores.js';
	$: if ($editable) {
		edited_display = $editable;
	}

	export let email, abonent;
	const uid = md5(email);
	let operator = { type: 'operator', em: email, abonent: abonent, uid: uid };
	if (operator.em === abonent) {
		operator.role = 'admin';
	} else {
		operator.role = 'user';
	}

	import { dc_msg } from './rtc/DataChannelOperator.js';
	$: if ($dc_msg) {
		OnMessage($dc_msg);
	}

	let container;

	import { posterst } from '$lib/js/stores.js';
	$: if (container && $posterst) {
		// console.log($posterst);
		container.appendChild($posterst);
	}

	onMount(async () => {
		try {
			rtc = new RTCOperator(operator, uid, $signal);
			initRTC();
			rtc.SendCheck();
			$signal.CallWaiting(operator);
		} catch (ex) {
			console.log();
		}
	});

	let progress = {
		display: 'block',
		value: 0
	};

	let local = {
		video: {
			display: 'none',
			srcObject: '',
			poster: ''
		},
		audio: {
			paused: true,
			src: ''
		}
	};

	let remote = {
		text: {
			display: 'none',
			msg: 'You have a call from:',
			name: '',
			email: ''
		},
		video: {
			display: 'none',
			srcObject: '',
			poster: ''
		},
		audio: {
			muted: true,
			srcObject: ''
		}
	};

	let profile = {
		display: 'none'
	};

	function onTransFile(params) {
		let event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		document.getElementById('files').dispatchEvent(event);
	}

	$: if (selected)
		switch (selected) {
			case 1:
				break;
			case 2:
				edited_display = true;
				break;

			case 10:
				break;
		}

	setContext('operator', { getOperator: () => this });

	// const SendToComponent = OnMessage;

	function OnSelected(ev) {
		$langs = ev.target.attributes[2].nodeValue;
	}

	async function initRTC() {
		// rtc ..set(rtc .;
		//rtc .type = "operator";

		rtc.PlayCallCnt = () => {
			call_cnt = 10;

			local.audio.paused = false;

			inter = setInterval(function () {
				call_cnt--;

				if (call_cnt === 0) {
					clearInterval(inter);
					local.audio.paused = true;
				}
			}, 2000);
		};
		// rtc .SendToComponent = OnMessage;
		rtc.GetRemoteAudio = () => {
			return remote.audio.srcObject;
		};
		rtc.SetRemoteAudio = (src) => {
			if (src) remote.audio.srcObject = src;
		};
		rtc.GetRemoteVideo = () => {
			return remote.video.srcObject;
		};
		rtc.SetLocalVideo = (src) => {
			if (src) local.video.srcObject = src;
		};

		rtc.SetRemoteVideo = (src) => {
			if (status === 'talk') {
				remote.video.poster = '';
				remote.video.srcObject = src;
				remote.video.display = 'block';
				local.audio.paused = true;
			}
		};
	}

	function OnLongPress() {
		select.display = true;
	}

	function OnClickCallButton() {
		try {
			// Fix up for prefixing
			if (!window.AudioContext) {
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				let audioCtx = new AudioContext();
				rtc.localSoundSrc = audioCtx.createMediaElementSource(window.user.localSound);
				rtc.localSoundSrc.connect(audioCtx.destination);
			}
		} catch (ex) {
			console.log('Web Audio API is not supported in this browser');
		}

		switch (status) {
			case 'inactive':
				rtc.Offer();
				status = 'active';
				break;

			case 'active':
				status = 'inactive';
				rtc.OnInactive();

				break;
			case 'call':
				status = 'talk';
				clearInterval(inter);
				local.audio.paused = true;
				remote.audio.muted = false;
				rtc.OnTalk();
				video_button_display = true;
				remote.text.display = 'block';
				const event = new Event('talk');
				document.getElementsByTagName('body')[0].dispatchEvent(event);
				break;
			case 'talk':
				rtc.OnInactive();
				remote.audio.muted = true;
				local.video.display = 'none';
				video_button_display = false;
				remote.video.display = 'none';
				remote.video.srcObject = '';
				remote.video.poster = '';
				remote.text.display = 'none';
				remote.text.name = '';
				remote.text.email = '';
				status = 'inactive';
				// local.video.poster = UserSvg;
				break;
			case 'muted':
				status = 'inactive';

				local.video.srcObject = '';
				remote.audio.muted = true;
				remote.video.display = 'none';
				remote.video.srcObject = '';
				remote.video.poster = '';
				remote.text.display = 'none';
				// local.video.poster = UserSvg;
				rtc.OnInactive();
				break;
			default:
				return;
		}
	}

	function openProfile(id) {
		profile.display = 'block';
	}

	function OnClickVideoButton() {
		status = 'talk';
		local.audio.paused = true;
		local.video.display = 'block';

		if (rtc.DC.dc.readyState === 'open') {
			rtc.GetUserMedia({ audio: 1, video: 1 }, function () {
				rtc.SendVideoOffer(rtc.main_pc);
			});
		}
	}

	function OnMessage(data, resolve) {
		if (data.func === 'mute') {
			local.audio.paused = true;
			remote.audio.muted = true;
			video_button_display = false;
			local.video.display = 'none';
			local.video.srcObject = '';
			// local.video.display = 'block';
			remote.video.srcObject = '';
			remote.video.poster = '';
			remote.video.display = 'none';
			remote.text.name = '';
			remote.text.email = '';
			remote.text.display = 'none';
			// local.video.poster = UserSvg;
			rtc.OnInactive();
			if (status === 'talk') {
				status = 'inactive';
				// rtc .OnInactive();
			} else if (status === 'call') {
				status = 'inactive';
				rtc.OnMute();
				// callcenter.GetUsers();
				OnClickCallButton();
			}
			if (resolve) resolve();
		}

		if (data.call || data.func === 'call') {
			status = 'call';

			rtc.OnCall();

			remote.text.display = 'block';

			if (data.profile) {
				let profile = JSON.parse(data.profile);
				let avatar = profile.src;
				remote.video.poster = avatar;
				if (avatar) remote.video.display = 'block';

				remote.text.name = profile.name;
				remote.text.email = profile.email;
			}
		}

		if (data.desc) {
			// $('.callObject').css('cb_display', 'block');
			//status ='call';
		}

		if (data.camera) {
			local.video.src = that.localStream;
		}

		if (data.status === 'wait') {
			(remote.text.display = 'block'), (remote.text.msg = 'You have a waiting call');
		}
	}
</script>

<div style="display:flex; min-height:100px; flex-wrap: nowrap;justify-content: space-between;">
	<div style="flex:1">
		<VideoRemote {...remote.video} />

		<CallButton on:click={OnClickCallButton} bind:status {OnLongPress}>
			<b
				class="call_cnt"
				style="display:none;position: absolute;left:22px;top:10px;color:#0e0cff;font-size: 12px;"
				>100</b
			>
			<span
				class="badge badge-primary badge-pill call-queue"
				style="display:none;position: absolute;right:0px;bottom:0px;color:#0e0cff;font-size: 12px;opacity:1"
				>0</span
			>
		</CallButton>
		<div
			style="display:{remote.text.display};
                                position: absolute;
                                z-index: 10;
                                background-color: rgba(125, 125, 125, 0.8);
                                top: 90px;
                                left: 2px;"
		>
			<p style="font-size: .7em; white-space: nowrap; color:white;margin:auto;text-align: center;">
				{remote.text.msg} <br />
				{remote.text.name}
			</p>
		</div>
	</div>

	<div style="position:absolute;flex:1 1 0%">
		<VideoLocal {...local.video}>
			<svelte:fragment slot="footer">
				<div bind:this={container} />
			</svelte:fragment>
		</VideoLocal>

		{#if video_button_display}
			<div class="video" style="position: absolute;top: 0;width: 100px; height:100px;">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<svg
					height="30"
					width="30"
					style="position: absolute;
                        bottom: 70px;
                        right: 0px;
                        z-index: 30;"
					on:click={OnClickVideoButton}
				>
					<glyph glyph-name="ui-video-chat" unicode="&#xec90;" horiz-adv-x="50" />
					<g
						class="currentLayer"
						style=" position: absolute; right: 0; top: 0; stroke:grey; stroke-width:2px;fill:lightgrey;font-size: 30px;"
					>
						<path
							d="M891.5 23h-783c-59.7 0-108.5 48.8-108.5 108.5v466.20000000000005c0 59.59999999999991 48.8 108.5 108.5 108.5h222.39999999999998v270.5999999999999l270.70000000000005-270.5999999999999h289.9c59.700000000000045 0 108.5-48.90000000000009 108.5-108.5v-466.20000000000005c0-59.7-48.799999999999955-108.5-108.5-108.5z m-223.5 370l-252.8 134.70000000000005c-26.30000000000001 14-47.89999999999998 1.099999999999909-47.89999999999998-28.700000000000045v-262.9c0-29.900000000000034 21.599999999999966-42.80000000000001 47.89999999999998-28.80000000000001l252.8 134.7c26.299999999999955 14 26.299999999999955 37 0 51z"
							transform="scale(.03)"
							style="fill:lightgrey; stroke:black; stroke-width:20px"
						/>
					</g>
				</svg>

				<!-- <i class="video icofont-ui-video-chat"  on:click = {OnClickVideoButton}
                        style="position: absolute; right: 0; top: 0; stroke:black; stroke-width: 2px; color: lightgrey; font-size: 30px; z-index: 20;"></i>  -->
			</div>
		{/if}
	</div>

	<div style="flex:3">
		<AudioLocal {...local.audio} bind:paused={local.audio.paused} />
		<AudioRemote {...remote.audio} bind:srcObject={remote.audio.srcObject} />

		<RecordedVideo />
		<Download />
	</div>

	<BurgerMenu padding={'25px'}>
		{@debug $langs}
		{$dicts['Language Select'][$langs]}:

		<div style="display: flex; margin-bottom:20px">
			<label style="flex:1">
				<input type="radio" bind:group={$langs} name="lang" value={'en'} on:change={OnSelected} />
				<img src="https://www.sic-info.org/wp-content/uploads/2014/01/gb.png" alt="English" />
			</label>

			<label style="flex:1">
				<input type="radio" bind:group={$langs} name="lang" value={'fr'} on:change={OnSelected} />
				<img src="https://www.sic-info.org/wp-content/uploads/2014/01/fr.png" alt="French" />
			</label>

			<label style="flex:1">
				<input type="radio" bind:group={$langs} name="lang" value={'ru'} on:change={OnSelected} />
				<img src="https://www.sic-info.org/wp-content/uploads/2014/01/ru.png" alt="Russian" />
			</label>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		{#if operator.role == 'admin'}
			{#if !edited_display}
				<h5 on:click={() => ($editable = true)}>{$dicts['Edit Call Center'][$langs]}</h5>
			{:else}
				<h5 on:click={() => ($editable = false)}>
					{$dicts['Cancel Edit Call Center'][$langs]}
				</h5>
			{/if}
		{/if}

		{#if operator.role == 'user'}
			<h5 on:click={() => {}}>
				{$dicts['Create my own net'][$langs]}
			</h5>
		{/if}
	</BurgerMenu>
</div>

<progress
	id="dataProgress"
	value={progress.value}
	max="100"
	duration="200"
	style="display:{progress.display};top:100px;width:98%;"
/>

<Callcenter view={$view} bind:this={callcenter} bind:status bind:operator {tarif} />

<Lesson view={$view} data={$users[0].staff} />
