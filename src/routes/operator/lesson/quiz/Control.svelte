<script lang="ts">
	// import { Button, Offcanvas, Icon } from 'sveltestrap';
	import 'bootstrap/dist/css/bootstrap.min.css';
	export let bottomOpen = false;
	const toggleBottom = () => (bottomOpen = !bottomOpen);
	export let onContinueClick;
</script>

<!-- <Offcanvas isOpen={bottomOpen} toggle={toggleBottom} placement="bottom"> -->
<div class="flex_container">
	<!-- <div style="display: flex; justify-content: center;"> -->
	<button color="danger" on:click={onContinueClick}>>></button>
</div>

<!-- </div> -->

<!-- </Offcanvas> -->

<style>
	.flex_container {
		display: flex;
		position: fixed;
		bottom: 0;
		right: 50%;
	}
	.offcanvas {
		background-color: transparent important;
	}
	.offcanvas-header {
		display: none;
	}
	button.btn {
		width: 10px;
	}
</style>
