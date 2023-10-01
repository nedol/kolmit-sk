<script>
  import { onMount } from 'svelte';
  export let display = 'none';
  export let srcObject = '';
  let lv;
  onMount(async () => {});

  $: if (lv && srcObject) {
    lv.srcObject = srcObject;
  } else if (lv && lv.srcObject) {
    lv.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
      lv.srcObject.removeTrack(track);
    });
    lv.src = '';
  }
</script>

<video
  bind:this={lv}
  id="localVideo"
  autoplay
  playsinline
  muted
  style="
        display: {display};
        position: absolute;
        bottom:18px;
        right:0px;   
        max-height: 25%;
        z-index: 20;"
/>
