<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import {
		CreateCredentialModal,
		DEFAULT_VCS_TEMPLATES,
		IdentityDetails,
		getIdentitiy,
		getVerifiableCredentials,
		searchIdentityByDID,
		selectedIdentity,
		updateIdentityInSearchResults,
		loadingIdentity,
		authenticatedUserRole,
		Icon,
		type ActionButton,
		UserRoles,
		type VerifiableCredentialTemplate,
		getIdentityClaim
	} from '@iota/is-ui-components';

	import { Col, Container, Row } from 'sveltestrap';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let credentialsTemplate: VerifiableCredentialTemplate[] = DEFAULT_VCS_TEMPLATES;
	let isCreateCredentialModalOpen = false;
	$: $page.params.id, setIdentity($page.params.id);

	const detailViewButtons: ActionButton[] = [
		{
			label: 'Add credential',
			onClick: openCreateCredentialModal,
			icon: 'plus',
			color: 'dark',
			hidden: $authenticatedUserRole !== UserRoles.Admin
		}
	];

	async function setIdentity(id: string): Promise<void> {
		const identity = await getIdentitiy(id);
		selectedIdentity.set(identity);
		await loadIdentityDetails();
	}

	// Add the newly created credential to the selected identity
	async function onCreateCredentialSuccess(): Promise<void> {
		loadingIdentity.set(true);
		let identity = await searchIdentityByDID($selectedIdentity?.id);
		identity = { ...identity, numberOfCredentials: identity?.numberOfCredentials ?? 0 };
		if (identity) {
			updateIdentityInSearchResults(identity);
		}
		const verifiableCredentials = await getVerifiableCredentials($selectedIdentity?.id);
		selectedIdentity.update((identity) => ({ ...identity, verifiableCredentials }));
		loadingIdentity.set(false);
	}

	function handleBackClick(): void {
		goto('/identity-manager');
	}

	function openCreateCredentialModal(): void {
		isCreateCredentialModalOpen = true;
	}

	function closeCreateCredentialModal(): void {
		isCreateCredentialModalOpen = false;
	}

	async function loadIdentityDetails(): Promise<void> {
		loadingIdentity.set(true);
		const verifiableCredentials = await getVerifiableCredentials($selectedIdentity?.id);
		const claim = (await getIdentityClaim($selectedIdentity?.id)) as {};
		selectedIdentity.update((identity) => ({
			...identity,
			verifiableCredentials,
			claim: { ...claim, type: $selectedIdentity?.claim?.type }
		}));
		loadingIdentity.set(false);
	}

	onMount(async () => {
		if (!get(selectedIdentity)) {
			await setIdentity($page.params.id);
		}
		if (get(selectedIdentity)) await loadIdentityDetails();
	});
</script>

<svelte:head>
	<title>Identity Details</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 10, offset: 1 }}>
			<div class="mb-4 align-self-start">
				<button on:click={handleBackClick} class="btn d-flex align-items-center">
					<Icon type="arrow-left" size={16} />
					<span class="ms-2">Back to Identities</span>
				</button>
			</div>
			{#if $authenticatedUserRole && $selectedIdentity}
				<IdentityDetails
					loading={$loadingIdentity}
					actionButtons={detailViewButtons}
					onRevokeSuccess={updateIdentityInSearchResults}
					identity={$selectedIdentity}
					userRole={$authenticatedUserRole}
				/>
			{/if}

			<!-- TODO: add possility to not pass targetDid here -->
			<CreateCredentialModal
				isOpen={isCreateCredentialModalOpen}
				onModalClose={closeCreateCredentialModal}
				targetDid={$selectedIdentity?.id}
				onSuccess={onCreateCredentialSuccess}
				{credentialsTemplate}
			/>
		</Col>
	</Row>
</Container>
