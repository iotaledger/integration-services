# Kubernetes

In this section This file explain how a full integration service API can be installed on a kubernetes cluster.

The installation was tested on Kubenetes 1.21.

## Requirements for local development

In order to have a simple single-node kubernetes cluster we suggest to install [minikube](https://minikube.sigs.k8s.io/docs/start/).

Once minikube is installed you will need to reference an IOTA Hornet Node and a MongoDB database: you can find this and all others 
configurations in the file `kubernetes/is-config.yaml`.

### Self-service MongoDB

In case MongoDB is not available on local environment you can install in kubernetes using the `kubernetes/optional` directory:

```
kubectl apply \
    -f kubernetes/optional/mongo-deployment.yaml \
    -f kubernetes/optional/mongo-init-config.yaml \
    -f kubernetes/optional/mongo-secret.yaml \
    -f kubernetes/optional/mongo-service.yaml
```

The previous command create a MongoDB instance with an ephemeral storage (i.e. no persistent volume bound) with `admin` as 
username and password for administration purpose and `username` and `password` as credentials for the database `integration-service-db`.

With the previous default setup you'll be able to reference the database from inside the cluster via the following URL:

`mongodb://username:password@mongodb-service.default.svc.cluster.local:27017/integration-service-db?readPreference=primary&appname=integration-service-api&ssl=false`

### Configuration

In order to configure the deployment you need to insert in `is-secrets.yaml` the `SERVER_SECRET` and the `API_KEY`.
Those values are base64 encoded so you can obtain them with the following:

`echo -n ...SERVER_SECRET_KEY or API_KEY... | base64`

Current values has `PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa` as `SERVER_SECRET` and `94F5BA49-12B6-4E45-A487-BF91C442276D` as `API_KEY`

All others configuration can be found in the resource file `is-config.yaml` inside `kubernetes` directory.

## Deployment

You can deply Integration Service API with the following command:

```
kubectl apply \
    -f kubernetes/is-config.yaml \
    -f kubernetes/is-deployment.yaml \
    -f kubernetes/is-init-job.yaml \
    -f kubernetes/is-pvc.yaml \
    -f kubernetes/is-secrets.yaml \
    -f kubernetes/is-service.yaml
```

## Startup

The Kubernetes resources will instantiate a Kubernetes Job that is responsible to ensure that the database have
one and only one root server identity and a replicated backend service for Integration Service API.

The initialization job is able to check if a root identity already exists in the database in case database is not an empty one.

The replicated service is able instead to check if a root identity exists and restart itself if this is not present yet: this
allows services to run in parallel without race conditions.

## Access to APIs

Once the service is ready there are different way to access to the API:

### Port forward

Service can be exposed outside the cluster via Kubernetes port forward command:

`kubectl port-forward svc/integration-service-api 3000:3000`

In case you prefer some visual tool we suggest to use: [Kube Forwarder]([https://link](https://kube-forwarder.pixelpoint.io/)).

### Ingress

Another way to expose resources outside the cluster is using an Ingress. 
This requires a special service called Ingress Controller that run in the cluster and is accessible on a given port. 

In minikube you can install Nginx Ingress Controller with the following:

`minikube addons enable ingress`

After deploying of ingress controller, is possible to route traffic from outside to kubernetes services with Ingress resources.

Change the domain name in the file `optional/ingress.yaml` (default is `ensuresec.solutions.iota.org`).

Install ingress resource:

`kubectl apply -f optional/ingress.yaml`

Query deployed ingress with the following:

`kubectl get ingress`

The output should be like

```
NAME                      CLASS    HOSTS                          ADDRESS        PORTS   AGE
integration-service-api   <none>   ensuresec.solutions.iota.org   192.168.49.2   80      10m
```

Now is possible to query the deployed API

`curl -H 'Host: ensuresec.solutions.iota.org' http://192.168.49.2/info`

You can avoid using `Host` header simply mapping the host/IP association in `/etc/hosts`.
In that case you could use directly `http://ensuresec.solutions.iota.org/info` in your default browser.


