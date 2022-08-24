export const externalDriverCredential1 = {
  '@context': 'https://www.w3.org/2018/credentials/v1',
  id: 'did:iota:G5MfzLpMpRsTtmGochhrbXiSrbTKDvgC5Bgw7HdU85pV',
  type: ['VerifiableCredential', 'VerifiedIdentityCredential'],
  credentialSubject: {
    id: 'did:iota:G5MfzLpMpRsTtmGochhrbXiSrbTKDvgC5Bgw7HdU85pV',
    '@context': 'https://schema.org/',
    initiator: 'did:iota:AUKN9UkJrTGGBcTZiYC3Yg2FLPQWnA11X8z6D6DDn56Y',
    issuanceDate: '2021-12-08T06:47:29.668Z',
    type: 'Person'
  },
  issuer: 'did:iota:BPvL2gG71pcNCnqpk1uqFYRK25ELxoVKLDW18reyCnfy',
  issuanceDate: '2022-08-24T13:14:08Z',
  credentialStatus: {
    id: 'did:iota:BPvL2gG71pcNCnqpk1uqFYRK25ELxoVKLDW18reyCnfy#signature-bitmap-0',
    type: 'RevocationBitmap2022',
    revocationBitmapIndex: '15'
  },
  proof: {
    type: 'JcsEd25519Signature2020',
    verificationMethod: 'did:iota:BPvL2gG71pcNCnqpk1uqFYRK25ELxoVKLDW18reyCnfy#sign-0',
    signatureValue:
      '2dxcQ6NkypKhRKD21M19eUFaajdRg2cc2WjnKtYnhm2fZVuYLJ1brqz5gBa3xSyFfovs9U9Fq1zqZtM9wUBg7Ny7'
  }
};
