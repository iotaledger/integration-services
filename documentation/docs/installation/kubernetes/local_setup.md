# Local Setup

This section is a complete walkthrough to deploy Integration Service API on a Kubernetes cluster. 

You can read more about configuration [here](configuration.md).

You can learn more how to export Integration Service API in your Cloud provider [here](expose_apis#loadbalancer-service).

The installation was tested on Kubenetes 1.21.

## Prerequisite

Install the following:

* [minikube](https://minikube.sigs.k8s.io/docs/start/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

## Minikube

You can start your cluster with the following:

```
$ minikube start
```

## Integration Services deployment

Clone the project:

```
$ git clone https://github.com/iotaledger/integration-services.git

$ cd integration-services/api
```

Deploy Kubernetes resources for Integration Service APIs:

```
$ kubectl apply -f kubernetes/optional
$ kubectl apply -f kubernetes
```

In few minutes, depending on resources allocated, the Integration Service API
will be ready to serve requests 

## Notes

The previous command create:
- a single MongoDB instance with an ephemeral storage (i.e. no persistent volume bound) with `admin` as 
username and password for administration purpose and `username` and `password` as credentials for the database `integration-service-db`
- a Kubernetes Job that will create a root identity in the database if there isn't one yet
- a replicated backend service for Integration Service API (5 replicas as default value)

You can find information on how to configure Integration Service with a production-ready database [here](configuration.md).
