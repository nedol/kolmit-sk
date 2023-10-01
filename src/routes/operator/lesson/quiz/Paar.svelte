<script>
	import { users } from '$lib/js/stores.js';

	console.log($users[0].staff);
</script>

<div />
{#each $users[0].staff as user, i}
	<div>{user.name}</div>
{/each}
