<script>
	import { onMount, onDestroy } from 'svelte';
	import md5 from 'md5';
	import RTCUser from './rtc/RTCUser';
	import Profile from './modal/Profile.svelte';
	import DropdownList from './DropdownList.svelte';
	import VideoLocal from './Video.local.svelte';
	import VideoRemote from './Video.remote.svelte';
	import CallButtonUser from './CallButtonUser.svelte';
	import Download from './Download.svelte';
	import AudioLocal from './Audio.local.svelte';
	import AudioRemote from './Audio.remote.svelte';
	import RecordedVideo from './RecordedVideo.svelte';

	export let abonent, em, operator;

	import { signal } from '$lib/js/stores.js';

	import _ from 'lodash';
	import './lib/icofont/icofont.min.css';

	import { msg_signal_user } from '$lib/js/stores.js';
	msg_signal_user.subscribe((data) => {
		if (data) {
			OnMessage(data);
		}
	});
	// $: if (msg['user']) {
	// 	OnMessage(msg['user']);
	// }

	let checked = false;

	const uid = md5(abonent + em + operator);

	$: if (rtc && !rtc.em) {
		console.log();
	}

	let rtc;
	let selected,
		inter,
		status = 'inactive',
		profile = false;

	let video_button_display = false;

	import { users } from '$lib/js/stores.js';

	$: if (status) {
		let user = _.find($users[0].staff, { email: em });
		if (user) user.status = status;
	}

	let progress = {
		display: 'none',
		value: 0
	};

	let video = {
		display: 'none'
	};

	let local = {
		video: {
			display: 'none',
			srcObject: ''
		},
		audio: {
			paused: true,
			src: ''
		}
	};

	let remote = {
		video: {
			display: 'none',
			srcObject: ''
		},
		audio: {
			muted: true,
			srcObject: ''
		}
	};

	let select = {
		display: false
	};

	let user = {
		em: em,
		abonent: abonent,
		type: 'user'
	};

	onMount(async () => {
		rtc = new RTCUser(user, uid, $signal);

		rtc.OnOpenDataChannel = () => {
			console.log('OnOpenDataChannel');
		};

		rtc.GetRemoteAudio = () => {
			return remote.audio.srcObject;
		};
		rtc.SetRemoteAudio = (src) => {
			remote.audio.srcObject = src;
		};
		rtc.SendToComponent = OnMessage;

		rtc.SetLocalVideo = (src) => {
			local.video.srcObject = src;
		};

		rtc.SetRemoteVideo = (src) => {
			remote.video.srcObject = src;
			remote.video.display = 'block';
			status = 'talk';
			local.audio.paused = true;
		};
	});

	// onDestroy();

	function OnLongPress() {
		select.display = true;
	}

	// async function SendCheck() {
	// 	let par = {};
	// 	par.proj = 'kolmit';
	// 	par.func = 'check';
	// 	par.status = 'check';
	// 	par.type = 'user';
	// 	par.abonent = abonent;
	// 	par.em = em;
	// 	par.uid = uid;

	// 	const description = par;

	// 	$signal.SendMessage(par, (resp) => {
	// 		checked = resp.check;
	// 	});
	// }

	function Call() {
		rtc.Call();

		// let par = {};
		// par.proj = 'kolmit';
		// par.func = 'call';
		// par.status = 'check';
		// par.type = 'user';
		// par.abonent = abonent;
		// par.operator = operator;
		// par.em = em;
		// par.uid = uid;

		// const description = par;

		// $signal.SendMessage(par);
	}

	function OnMute() {
		status = 'talk';
		OnClickCallButton();
	}

	function OnChangeFile(e) {
		try {
			let file = e.target.files[0];
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function (file) {
				rtc.DC.SendFile(file);
			};
		} catch (ex) {}
	}

	function OnMessage(data) {
		if (data.operators && data.operators[em]) {
			let res = _.groupBy(data.operators[em], 'status');
			try {
				if (res && res['offer']) {
					if (status !== 'call' && status !== 'wait') {
						status = 'active';
					}
				} else if (res['busy']) {
					if (status !== 'call') {
						status = 'busy';
					}
				} else if (
					res['close'] &&
					//  && res["close"].length === Object.keys(data.operators[rtc.abonent]).length
					status !== 'wait'
				) {
					local.video.display = 'none';
					remote.video.display = 'none';
					local.audio.paused = true;
					remote.audio.muted = true;
					//rtc.abonent = url.searchParams.get('abonent');
					status = 'inactive';
				}
			} catch (ex) {
				console.log(ex);
			}
		}

		if (data.operator && data.operator.em === rtc.em) {
			status = 'active';
		}

		// TODO: to delete
		if (data.desc && data.cand) {
			if (status === 'talk') {
				// status = 'talk';
			} else {
				// status = 'call';
			}
		}

		if (data.func === 'mute') {
			local.audio.paused = true;
			remote.audio.muted = true;
			video_button_display = false;
			local.video.display = 'none';
			remote.video.display = 'none';
			// rtc.abonent = url.searchParams.get('abonent');
			status = 'inactive';

			// const event = new Event('inactive');
			// window.frameElement.dispatchEvent(event);

			// if(url.searchParams.get("em")!==rtc.em)
			//   location.reload();

			// window.frameElement.style.width = '60px'
			// window.frameElement.style.height = '60px'
		}

		if (data.func === 'talk') {
			status = 'talk';
			clearInterval(inter);
			video_button_display = true;
			local.audio.paused = true;
			remote.audio.muted = false;
			video_button_display = 'block';
			// local.video.display = "block";
			video.display = 'block';
			// window.frameElement.style.maxWidth = "200px";
			// window.frameElement.style.maxHeight = "100px";
		}

		if (data.func === 'redirect') {
			status = 'call';
			local.audio.paused = true;
			remote.audio.muted = true;

			remote.video.srcObject = null;
			remote.video.display = 'none';
		}

		if (data.status === 'wait') {
			status = 'wait';
		}
	}

	async function OnClickCallButton() {
		try {
			// Fix up for prefixing
			if (!window.AudioContext) {
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				let audioCtx = new AudioContext();
				rtc.localSoundSrc = audioCtx.createMediaElementSource(rtc.localSound);
				rtc.localSoundSrc.connect(audioCtx.destination);
			}
		} catch (ex) {
			console.log('Web Audio API is not supported in this browser');
		}

		switch (status) {
			case 'inactive':
				// status = 'wait';
				// Call();
				// remote.video.srcObject = null;
				break;

			case 'wait':
				status = 'inactive';
				rtc.SendCheck();
				break;
			case 'active':
				function call() {
					Call();
					status = 'call';
					remote.video.srcObject = null;
				}
				if (!localStorage.getItem('kolmit_abonent') && false) {
					if (confirm('Could you introduce youself?')) {
						profile = true;
					} else {
						call();
					}
				} else {
					call();
				}

				break;
			case 'call':
				status = 'inactive';
				local.audio.paused = true;
				local.video.display = 'none';
				video_button_display = 'none';
				clearInterval(inter);
				rtc.Hangup();
				break;
			case 'talk':
				status = 'inactive';
				remote.audio.muted = true;
				local.video.display = 'none';
				remote.video.display = 'none';
				video_button_display = 'none';
				rtc.Hangup();
				break;
			case 'muted':
				status = 'inactive';
				//rtc.abonent = url.searchParams.get('abonent');
				video_button_display = 'none';
				break;
			case 'busy':
				Call();
				status = 'wait';
				break;
			default:
				return;
		}
	}
</script>

{#if profile}
	<Profile bind:profile bind:selected />
{/if}

<!-- svelte-ignore missing-declaration -->
<CallButtonUser {em} on:click={OnClickCallButton} on:mute={OnMute} bind:status {OnLongPress} />
