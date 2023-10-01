<script>
	export let open;
	export let duration;
	export let width;
	export let padding;
	export let paddingTop;
	export let backgroundColor;
	export let menuColor;
</script>

<div
	id="container"
	style="position:fixed;z-index:1;background-color: {backgroundColor}; color: {menuColor}; width: {width}; right: {open
		? '0px'
		: '-' + (parseInt(width) + 10) + 'px'}; transition: right {duration}s ease-in-out"
>
	<div id="menu" style="padding: {padding}; padding-top: {paddingTop};">
		<slot />
	</div>
</div>

<style>
	#container {
		position: absolute;
		height: 100vh;
		top: 0px;
		overflow-y: auto;
	}

	#menu {
		text-align: left;
	}
</style>
