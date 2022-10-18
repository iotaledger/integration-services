
## Local development

1. Run API Services

In order to connect the dashboard to your integration services you need to run them in advance. You can run them using the following command in the root folder of this repository: 
```
docker-compose up -d
```
Since it will also start its own instance of the dashboard, it must be killed using: `docker kill is-dashboard`.


2. Install dependencies

```bash
npm install
```

3. Create a `.env` in the root of the projects and add the corresponding necessary configuration:

```bash
VITE_IOTA_IS_SDK_API_KEY="XXXXXXXXXX"
VITE_IOTA_IS_SDK_GATEWAY_URL="XXXXXXXXXX"
```

For instance it could look as the following:
```bash
VITE_IOTA_IS_SDK_GATEWAY_URL=http://0.0.0.0:3000
```

4. Start the dashboard

```bash
npm run dev
```

The dashboard should be available at default port __3055__.

## Trouble Shooting

### CORS

Since the frontend and the backend run on different ports it will create CORS issues when making a request. To avoid this problem you can make use of several cors plugin preventing the browser to run into them. For production use the frontend and backend is deployed together with an api gateway fixing this problem.

### PopperJs
There is a known problem with the `@popperjs` dependency. It will cause problems when reloading the dashboard during development. In order to avoid this reloading problem do the following:

```bash
nano node_modules/@popperjs/core/package.json
```

And add `"type":"module"` to the end of the json object like:
```json
{
  // ...  
  {
    // ...
    "rollup": "^2.39.0",
    "rollup-plugin-flow-entry": "^0.3.3",
    "rollup-plugin-license": "^2.2.0",
    "rollup-plugin-terser": "^7.0.2",
    "rollup-plugin-visualizer": "^4.2.0",
    "serve": "^11.3.2",
    "typescript": "^4.1.5"
  },
  "type":"module"
}
```