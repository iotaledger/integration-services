<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { Col, Container, Row } from 'sveltestrap';
	import { onMount } from 'svelte';
	import {
		selectedChannel,
		ChannelDetails,
		Icon,
		WriteMessageModal,
		selectedChannelSubscriptions,
		subscriptionStatus,
		loadingChannel,
		acceptSubscription,
		rejectSubscription,
		getSubscriptions,
		selectedChannelBusy,
		requestSubscription,
		requestUnsubscription,
		getSubscriptionStatus,
		getChannelInfo,
		stopReadingChannel,
		searchChannelsResults,
		ChannelType,
		SubscriptionState,
		type ActionButton
	} from '@iota/is-ui-components';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';

	let currentSubscriptionStatus: SubscriptionState;
	$: $subscriptionStatus, updateChannelList();
	let isWriteMesageModalOpen: boolean = false;
	let subscriptionTimeout: number;
	const messageFeedButtons = [
		{
			label: 'Write a message',
			onClick: openWriteMessageModal,
			icon: 'chat-square-dots',
			color: 'dark'
		}
	] as ActionButton[];

	onMount(async () => {
		if (!get(selectedChannel)) {
			const channel = await getChannelInfo($page.params.channelAddress);
			selectedChannel.set(channel);
		}
		const status = await getSubscriptionStatus($selectedChannel?.channelAddress);
		currentSubscriptionStatus = status;
		subscriptionStatus.set(status);

		const subscriptions = await getSubscriptions($selectedChannel?.channelAddress);
		selectedChannelSubscriptions.set(subscriptions);
	});

	async function handleBackClick(): Promise<void> {
		goto('/streams-manager');
	}

	async function updateChannelList(): Promise<void> {
		if (get(subscriptionStatus) !== currentSubscriptionStatus) {
			const channelInfo = await getChannelInfo(get(selectedChannel)?.channelAddress);
			if (channelInfo) {
				const searchResults = get(searchChannelsResults);
				const index = searchResults.indexOf($selectedChannel);
				searchResults.splice(index, 1, channelInfo);
				searchChannelsResults.set(searchResults);
			}
		}
	}

	async function handleAcceptSubscription(subscriptionId: string): Promise<void> {
		loadingChannel.set(true);
		// ---- Avoid locked channel error when accepting subscriptions ----
		while ($selectedChannelBusy) {
			if (subscriptionTimeout) {
				clearTimeout(subscriptionTimeout);
			}
			subscriptionTimeout = setTimeout(handleAcceptSubscription, 100);
			return;
		}
		// ----------------------------------------------------------
		await acceptSubscription($selectedChannel?.channelAddress, subscriptionId, true);
		await updateSubscriptions();
		loadingChannel.set(false);
	}

	async function handleRejectSubscription(subscriptionId: string): Promise<void> {
		loadingChannel.set(true);
		// ---- Avoid locked channel error when rejecting subscriptions ----
		while ($selectedChannelBusy) {
			if (subscriptionTimeout) {
				clearTimeout(subscriptionTimeout);
			}
			subscriptionTimeout = setTimeout(handleRejectSubscription, 100);
			return;
		}
		// ----------------------------------------------------------
		await rejectSubscription($selectedChannel?.channelAddress, subscriptionId, true);
		await updateSubscriptions();
		loadingChannel.set(false);
	}

	async function updateSubscriptions(): Promise<void> {
		const channelSubscriptions = await getSubscriptions($selectedChannel?.channelAddress);
		selectedChannelSubscriptions.set(channelSubscriptions);
	}

	function onSubscriptionAction() {
		get(subscriptionStatus) === SubscriptionState.NotSubscribed ? subscribe() : unsubscribe();
	}

	async function subscribe(): Promise<void> {
		if (!get(selectedChannel)) {
			return;
		}
		loadingChannel.set(true);
		const response = await requestSubscription($selectedChannel?.channelAddress);
		if (response) {
			$selectedChannel.type === ChannelType.private || $selectedChannel.type === ChannelType.privatePlus
				? subscriptionStatus.set(SubscriptionState.Requested)
				: subscriptionStatus.set(SubscriptionState.Authorized);
			await updateSubscriptions();
		}
		loadingChannel.set(false);
	}

	async function unsubscribe(): Promise<void> {
		stopReadingChannel();
		loadingChannel.set(true);
		const response = await requestUnsubscription($selectedChannel?.channelAddress);
		if (response) {
			subscriptionStatus.set(SubscriptionState.NotSubscribed);
			await updateSubscriptions();
		}
		loadingChannel.set(false);
	}

	function openWriteMessageModal(): void {
		isWriteMesageModalOpen = true;
	}
	function closeWriteMessageModal(): void {
		isWriteMesageModalOpen = false;
	}
</script>

<svelte:head>
	<title>Channel Details</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 10, offset: 1 }}>
			{#if $subscriptionStatus && $selectedChannel && $selectedChannelSubscriptions}
				<div class="mb-4 align-self-start">
					<button on:click={handleBackClick} class="btn d-flex align-items-center">
						<Icon type="arrow-left" size={16} />
						<span class="ms-2">Back to Channels</span>
					</button>
				</div>
				<ChannelDetails
					{handleRejectSubscription}
					{handleAcceptSubscription}
					{onSubscriptionAction}
					loading={$loadingChannel}
					subscriptionStatusValue={$subscriptionStatus}
					subscriptions={$selectedChannelSubscriptions}
					channel={$selectedChannel}
					{messageFeedButtons}
				/>
				<WriteMessageModal
					isOpen={isWriteMesageModalOpen}
					onModalClose={closeWriteMessageModal}
					address={$selectedChannel?.channelAddress}
					channelType={$selectedChannel?.type}
				/>
			{/if}
		</Col>
	</Row>
</Container>
