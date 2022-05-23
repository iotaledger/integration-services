<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { Col, Container, Row } from 'sveltestrap';
	import { HistoryForm } from '@iota/is-ui-components';
</script>

<svelte:head>
	<title>History</title>
</svelte:head>
<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 6, offset: 3 }}>
			<HistoryForm />
		</Col>
	</Row>
</Container>
