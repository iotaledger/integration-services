# README

This file explain how a full integration service API can be installed on a kubernetes cluster.
This installation is tested on Kubenetes 1.21.

# Minikube

In order to have a simple single-node kubernetes cluster we suggest to install [minikube](https://minikube.sigs.k8s.io/docs/start/)

Once minikube is installed you will need to reference an IOTA Hornet Node and a MongoDB database.

## MongoDB

We offer the possibility to setup a simple MongoDB database using the `optional` directory:

```
kubectl apply \
    -f optional/mongo-deployment.yaml \
    -f optional/mongo-init-config.yaml \
    -f optional/mongo-secret.yaml \
    -f optional/mongo-service.yaml
```

The previous command create a mongodatabase with an ephemeral storage (no persistent volume bound) with `admin` as 
username and password for administration and `username` and `password` as credential for the database `integration-service-db`

Now you can reference the database from inside cluster with the following URL:

`mongodb://username:password@mongodb-service.default.svc.cluster.local:27017/integration-service-db?readPreference=primary&appname=integration-service-api&ssl=false`

## Configuration

In order to configure the deployment you need to insert in `is-secrets.yaml` the `SERVER_SECRET` and the `API_KEY`.
Those values are base64 encoded so you can obtain them with the following:

`echo -n ...SERVER_SECRET_KEY or API_KEY... | base64`

Current values has `PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa` as `SERVER_SECRET` and `94F5BA49-12B6-4E45-A487-BF91C442276D` as `API_KEY`

## Deployment

You can deply Integration Service API with the following command:

```
kubectl apply \
    -f is-config.yaml \
    -f is-deployment.yaml \
    -f is-pvc.yaml \
    -f is-secrets.yaml \
    -f is-service.yaml
```

## Access to APIs

Once deployed the Integration Service API is accessible via port forward:

`kubectl port-forward svc/integration-service-api 3000:3000`

In case you prefer some visual tool we suggest to use: [Kube Forwarder]([https://link](https://kube-forwarder.pixelpoint.io/)).

## Ingress controller

In order to access to API from outside a cluster a ingress controller need to be deployed.

In minikube you can install Nginx ingression controller with the following:

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

Finally mapping the host/IP association in `/etc/hosts` is possible to use the URL `http://ensuresec.solutions.iota.org/info` in default browser.


