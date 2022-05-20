<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { History } from '@iota/is-ui-components';
	import { Col, Container, Row } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';

	let channelType = writable('');
	let presharedKey = writable('');
	let channelAddress;
	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		channelType.set(urlParams.get('type'));
		presharedKey.set(urlParams.get('preshared-key'));
		channelAddress = $page.params.channelAddress;
	});
</script>

<svelte:head>
	<title>History</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 10, offset: 1 }}
			><History {channelAddress} channelType={$channelType} presharedKey={$presharedKey} />
		</Col>
	</Row>
</Container>
