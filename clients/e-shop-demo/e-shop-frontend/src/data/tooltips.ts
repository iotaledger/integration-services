import { Step } from 'react-joyride';

export const steps: Step[] = [
	// Tour 0
	{
		title: "Let's begin",
		target: 'body',
		content: 'This demo will show you how to verify your age in an online shop with a Verifiable Credential that is linked to your identity.',
		placement: 'center'
	},
	// Tour 1
	{
		title: 'Shop',
		target: '.tourProducts',
		content: 'Start by adding items to your shopping cart.',
		placement: 'bottom'
	},
	// Tour 2
	{
		title: 'Shop',
		target: '.ageRestrictedtrue',
		content: 'Make sure to add at least one age restricted item to your cart.',
		placement: 'bottom'
	},
	// Tour 3
	{
		title: 'Checkout',
		target: '.cartButton',
		content: 'Pay your cart and verify your age.',
		placement: 'bottom'
	},
	// Tour 4
	{
		title: 'Checkout',
		target: '.form-select',
		content: 'Select one of the example credentials to verify your age. In a real-world scenario the credential would be provided by your wallet, ie., after issued by a bank',
		placement: 'bottom'
	},
	// Tour 5
	{
		title: 'Checkout',
		target: '.verifyButton',
		content:
			'Verify your credential. By verifying your credential the online shop can check your age and proof that the credential was not manipulated.',
		placement: 'bottom'
	},
	// Tour 6 (credential not over 18)
	{
		title: 'Checkout',
		target: '.credentialAgeRestriction',
		content: 'The credential proofs that you are under the age of 18 or submitted an invalid credential and are not allowed to buy liquor. Try the adult credential.',
		placement: 'bottom'
	},
	// Tour 7 (credential  over 18)
	{
		title: 'Checkout',
		target: '.credentialVerified',
		content: 'The credential proofs that you are over the age of 18 and allowed to buy liquor.',
		placement: 'bottom'
	},
	// Tour 8
	{
		title: 'Checkout',
		target: '.authenticateButton',
		content:
			'Next you have to verify that you are the owner of the credential. Normally this is done by signing the credential with your secret key. For demo purposes we are doing the authentication for you.',
		placement: 'bottom'
	},
	// Tour 9
	{
		title: 'Checkout',
		target: '.credentialSuccessful',
		content: 'You confirmed that the credential belongs to your Identity. You can now proceed to checkout.',
		placement: 'bottom'
	},
	// Tour 10
	{
		title: 'Checkout',
		target: '.checkoutButton',
		content: 'Checkout your cart to finish the tour.',
		placement: 'bottom'
	}
];
