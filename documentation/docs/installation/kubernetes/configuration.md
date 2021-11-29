# Configuration

In this section are reported all the configuration parameters that can be used. 
All values must be changed before deployment. 
In case a deployment is already running you can apply again your configuration and run again the following commands:

```
$ kubectl apply -f integration-services/kubernetes/optional
$ kubectl apply -f integration-services/kubernetes
```

### Database

You can connect Integration Service APIs to any MongoDB database specifying in file `kubernetes/is-config.yaml`:
- `DATABASE_URL` with the connection string 
- `DATABASE_NAME` with the database name

Default value references a single-instance MongoDB instance that is deployed 
using `kubernetes/optional/mongo-*.yaml` files in the `default` namespace.

### Secrets

Integration Services APIs are protected by a fixed api key. Moreover data on database are encrypted using a server key. 

Both those key are defined in `is-secrets.yaml`: those values are base64 encoded so you can obtain them with the following:

`echo -n ...SERVER_SECRET_KEY or API_KEY... | base64`

Current values are:
- `PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa` as `SERVER_SECRET` and 
- `94F5BA49-12B6-4E45-A487-BF91C442276D` as `API_KEY`

### Number of replicas

You can setup initial number of replicas in the `.spec.replicas` field in `kubernetes/is-deployment.yaml` file.

### Ingress Hostname

In case you are accessing service via Ingress resource you can set the 
domain name in `kubernetes/optional/ingress.yaml` (default is `ensuresec.solutions.iota.org`).

### Private Tangle

You can reference your own private IOTA node (either from mainnet tangle or a private one) 
changing in `kubernetes/is-config.yaml` the fields `IOTA_PERMA_NODE` and `IOTA_HORNET_NODE`
