<script context="module" lang="ts">
	export const SITE_PAGES = [
		{ title: 'Identity Manager', url: '/identity-manager' },
		{ title: 'Streams Manager', url: '/streams-manager' },
		{ title: 'Channel History', url: '/history' },
		{ title: 'Verify Credential', url: '/verify-credential' }
	];
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import {
		startPollExpirationCheckJWT,
		stopPollExpirationCheckJWT,
		NotificationManager,
		logout,
		isAuthenticated
	} from '@iota/is-ui-components';
	import logo from '/src/assets/logo.png';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { onMount } from 'svelte';
	import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'sveltestrap';

	let isOpen = false;

	onMount(() => {
		startPollExpirationCheckJWT();
		return () => {
			stopPollExpirationCheckJWT();
		};
	});

	function handleCollapse(event) {
		isOpen = event.detail.isOpen;
	}

	async function _logout() {
		await goto('/');
		logout();
	}
</script>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/">
		<div class="me-2 d-flex align-items-center">
			<img src={logo} alt="" height="40" width="40" />
		</div>
		<div>
			<h4 class="mt-2 fw-light">Integration Services</h4>
		</div>
	</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	<Collapse {isOpen} navbar expand="md" on:update={handleCollapse}>
		<Nav class="ms-auto" navbar>
			{#each SITE_PAGES as page}
				{#if $isAuthenticated}
					<NavItem>
						<NavLink href={page.url}>{page.title}</NavLink>
					</NavItem>
				{/if}
			{/each}
			{#if $isAuthenticated}
				<NavItem><hr class="me-3" /></NavItem>
				<NavItem><NavLink on:click={_logout}>Logout</NavLink></NavItem>
			{/if}
		</Nav>
	</Collapse>
</Navbar>

<main>
	<slot />
</main>

<NotificationManager />

<style lang="scss">
	hr {
		margin-top: 10px;
		margin-bottom: 0px;
		border: 0;
		height: 24px;
		width: 1px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
	}
	:global(.navbar) {
		:global(.navbar-brand) {
			display: flex;

			.info {
				h1 {
					font-size: 20px;
					font-weight: 600;
				}
				h2 {
					font-size: 16px;
				}
			}
		}
		:global(.nav-link) {
			@media (min-width: 990px) {
				margin-right: 16px;
			}
		}
	}
</style>
