---
image: /img/integration-services/logo/integration_services.png
description: This section will show you an example on how to authenticate using Java.
keywords:
- how to
- authentication
- jwt
- nonce
- not-authenticated
- 401
- java
---


# Java

:::caution
The [Integration Services Java library](https://github.com/albydeca/iota-is-sdk) is still in BETA. Please note that not everything may yet run smoothly.
:::

In this example, you will learn to authenticate your identity using Java. Make sure to read the [general authentication concept](https://wiki.iota.org/integration-services/authentication) so you can fully understand the [Authentication Workflow](https://wiki.iota.org/integration-services/authentication#authentication-workflow).

This example uses the following identity: 

```js
{
    identityId: 'did:iota:8BAmUqAg4aUjV3T9WUhPpDnFVbJSk16oLyFq3m3e62MF',
    secretKey: '5N3SxG4UzVDpNe4LyDoZyb6bSgE9tk3pE2XP5znXo5bF'
}
```

## Prerequisites 

* [JDK 16](https://openjdk.java.net/projects/jdk/16/) (recommended)
* A reference to an instance of the [Integration Services API](https://github.com/iotaledger/integration-services)
* [Maven](https://maven.apache.org/)

### Required Packages 

Ideally every dependency listed in the project's [POM](https://github.com/albydeca/iota-is-sdk/blob/main/pom.xml) (`mvn clean install`). This example uses in particular:

* `org.apache.commons.codec.digest`
* `org.apache.http.*`
* `org.bitcoinj.core.Base58`
* `org.bouncycastle.crypto`
* `org.json.*`

## Authentication Workflow

### 1. Request a Nonce

First, request a nonce and supply your id.

:::info
You can find your current API version using the [http://localhost:3000/info](http://localhost:3000/info) endpoint. This example uses `v0.1`.
:::

```java
private String createNonce(String didId)
			throws IOException, URISyntaxException, ParseException, InvalidAPIResponseException {
		final String endpoint = "authentication/prove-ownership/" + didId;

		JSONObject response = sendIOTAGetRequest(endpoint, null, false);
		return response.getString("nonce");
	}

public JSONObject sendIOTAGetRequest(String endpoint, Map<String, String> params, boolean withAuth)
			throws ClientProtocolException, IOException, URISyntaxException, ParseException,
			InvalidAPIResponseException {
		CloseableHttpClient client = HttpClients.createDefault();
		final HttpEntity response_body = sendGetRequest(endpoint, params, withAuth, null, client); // see last step of tutorial for implementation of this method
		if (response_body == null) {
			return null;
		}

		JSONObject result = new JSONObject(EntityUtils.toString(response_body, StandardCharsets.UTF_8));
		client.close();
		return result;
	}
```

The returned response body  will look like this .js object.

```js
{ nonce: '3eaf8814caa842d94fdb96fc26d02f7c339e65ff' }
```

### 2. Hash the Nonce

After you have retrieved the nonce, you should hash it. You can use insert java method to hash the nonce with the SHA-256 hash function and convert it to hexadecimal.

```java
public void hashAndSignNonce(String privateKey, String publicKey, String nonce, String didId)
			throws IOException, CryptoException, URISyntaxException, InvalidAPIResponseException {

		byte[] b58key = Base58.decode(privateKey); // Decode a base58 key and encode it as hex key
		String b58keyHex = DatatypeConverter.printHexBinary(b58key).toLowerCase();
		byte[] convertKey = DatatypeConverter.parseHexBinary(b58keyHex);

		String hashNonceHex = DigestUtils.sha256Hex(nonce); // Hash a nonce with SHA-256 (apache_commons)
		byte[] convertNonce = DatatypeConverter.parseHexBinary(hashNonceHex);
        [...]
```
The example's nonce will generate the following hash:

```
6d748f209e5af1f5b8825f7822d6659c45c874076cd2b3337c7861fd94cd3ba5
```

### 3. Sign the Hashed Nonce

Your secret key is encoded in Base58 and has to be decoded. Once it has been decoded, the nonce is signed with your encoded secret key and saved as a hexadecimal string.

:::danger
Never save your secret key in plain text in your code. Use local environment variables or IOTA [Stronghold](https://wiki.iota.org/stronghold.rs/welcome) to store your secret keys securely.
:::

```java
        [...]

		Ed25519PrivateKeyParameters privateKeyParams = new Ed25519PrivateKeyParameters(convertKey, 0); // Encode in
																										// PrivateKey
		Signer signer = new Ed25519Signer(); // Sign a nonce using the private key
		signer.init(true, privateKeyParams);
		signer.update(convertNonce, 0, convertNonce.length);
		byte[] signature = signer.generateSignature();

		String sign = DatatypeConverter.printHexBinary(signature).toLowerCase();
        [...]
```

The example's nonce and secret key will generate the following signed nonce:

```
270c2e502c5c753e39159683981e452444f81a10d798f56406a9c471d672a5ede1792cb7f97d4f9c9efeec7bf35577dd1f8482afca7e3710291868a65bf91e07
```

### 4. Request the JWT

The last step is to request the JWT. You can use the following code snippet with your signed nonce in the request body.

```java
    [...]
        final String endpoint = "authentication/prove-ownership/" + didId;

		JSONObject json = new JSONObject().put("signedNonce", sign);

		JSONObject response = sendIOTAPostRequest(endpoint, json, false);
		byte[] b58keyPrimary = Base58.decode(publicKey);
		String b58keyPrimaryHex = DatatypeConverter.printHexBinary(b58keyPrimary).toLowerCase();
		byte[] convert_primarykey = DatatypeConverter.parseHexBinary(b58keyPrimaryHex);

		Ed25519PublicKeyParameters primaryKeyVerify = new Ed25519PublicKeyParameters(convert_primarykey, 0);
		Signer verifier = new Ed25519Signer();
		verifier.init(false, primaryKeyVerify);
		verifier.update(convertNonce, 0, convertNonce.length);
		boolean verified = verifier.verifySignature(signature);

		System.out.println("Verify Signature: " + verified);
		this.jwt = response.getString("jwt");

	}
```

The returned JS object will contain the following JWT:

```js
{
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6OEJBbVVxQWc0YVVqVjNUOVdVaFBwRG5GVmJKU2sxNm9MeUZxM20zZTYyTUYiLCJwdWJsaWNLZXkiOiI3WFRYVlJ5M0cxTVhjbURrejJiUUNiV3B2OEF6b1FSZ3hHdjVtRG0xRkoxdCIsInVzZXJuYW1lIjoiVGltMTIzNDUiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMi0xOFQwNzo0ODo0NSswMTowMCIsImNsYWltIjp7InR5cGUiOiJQZXJzb24ifSwicm9sZSI6IlVzZXIifSwiaWF0IjoxNjQ1MTc3OTg1LCJleHAiOjE2NDUyNjQzODV9.-O2UpPyfWOvtLV2cUF9fPVhgCGDCVwFU9zXrpn_uKU0'
}
```

### 5. Set the JWT as Request Header

This is an example of a GET request to the API with the JWT from the last step included in the `Authorization`:

```java
private HttpEntity sendGetRequest(String endpoint, Map<String, String> params, boolean needsBearer,
			String presharedKey, CloseableHttpClient client) throws URISyntaxException, ClientProtocolException,
			IOException, ParseException, InvalidAPIResponseException {
		URIBuilder builder = new URIBuilder(this.baseUrl + endpoint);

		if (params != null) {
			for (Map.Entry<String, String> e : params.entrySet()) {
				builder.setParameter(e.getKey(), e.getValue());
			}
		}
		if (presharedKey != null) {
			builder.setParameter("preshared-key", presharedKey);
		}

		builder.setParameter("api-key", this.apiKey);
		final URI urlFinal = builder.build();
		System.out.println("GET " + urlFinal.toString());
		HttpGet httpGet = new HttpGet(urlFinal);

		httpGet.setHeader(HttpHeaders.ACCEPT, "application/json");
		if (needsBearer && this.jwt != null) {
			httpGet.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + this.jwt);
		}

		CloseableHttpResponse response = client.execute(httpGet);
		final HttpEntity response_body = response.getEntity();
		int statusCode = response.getStatusLine().getStatusCode();
		if (statusCode != 200) {
			throw new InvalidAPIResponseException(
					statusCode + EntityUtils.toString(response_body, StandardCharsets.UTF_8));
		}
		return response_body;
	}

```

##  Putting It All Together

You can find the complete code example [here](https://github.com/albydeca/iota-is-sdk/blob/main/src/main/java/net/gradbase/clients/BaseClient.java). All snippets above are taken from there.

