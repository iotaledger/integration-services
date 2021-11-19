# Local Setup

This section is a complete walkthrough to deploy Integration Service API on a Kubernetes cluster. 

You can read more about configuration [here](configuration.md).

You can learn more how setup a production-ready Integration Service API in your Cloud provider [here](cloud.md).

The installation was tested on Kubenetes 1.21.

## Minikube

In order to have a simple single-node Kubernetes cluster we need to install [minikube](https://minikube.sigs.k8s.io/docs/start/).

Once minikube is installed you can start your cluster and enable Ingress Controller (to expose service to the host) with the following:

```
$ minikube start
```

## Integration Services deployment

Clone the project:

```
$ git clone https://github.com/iotaledger/integration-services.git
```

Deploy Kubernetes resources for Integration Service APIs:

```
$ kubectl apply -f integration-services/kubernetes/optional
$ kubectl apply -f integration-services/kubernetes
```

The previous command create a single MongoDB instance with an ephemeral storage (i.e. no persistent volume bound) with `admin` as 
username and password for administration purpose and `username` and `password` as credentials for the database `integration-service-db`.

You can find information on how to configure Integration Service with a production-ready database [here](configuration.md).

## Startup

The Kubernetes resources will instantiate a Kubernetes Job that is responsible to ensure that the database have
one and only one root server identity and a replicated backend service for Integration Service API.

The initialization job is able to check if a root identity already exists in the database in case database is not an empty one (so it will not damage database with existing data).

The Integration Service APIs is deployed as a replica set of 5 instances. This means that once all the Pod will be up, there will be 5 instances of the APIs ready to serve external traffic.
