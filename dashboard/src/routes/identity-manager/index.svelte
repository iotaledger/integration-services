<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { IdentityManager } from '@iota/is-ui-components';
	import { Col, Container, Row } from 'sveltestrap';
</script>

<svelte:head>
	<title>Identity Manager</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 10, offset: 1 }}>
			<IdentityManager />
		</Col>
	</Row>
</Container>
