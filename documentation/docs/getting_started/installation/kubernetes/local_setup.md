---
image: /img/integration-services/logo/integration_services.png
description: This section will guide you in installing and deploying the Integration Service API on a Kubernetes cluster.
keywords:
- install integration services
- deploy integration services
- Kubernetes
- requirements
- configuration
- MongoDB
- API
- minikube
---

# Local Setup

This section will guide you in installing and deploying the Integration Service API on a Kubernetes cluster.

This installation was tested on [Kubernetes 1.21](https://kubernetes.io/releases/_print/#release-v1-21).

## Requirements

Please make sure to have the following installed before moving forward:

* [minikube](https://minikube.sigs.k8s.io/docs/start/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

## Minikube

You can start your cluster by running the following command:

```bash
minikube start
```

## Integration Services Deployment

Please follow these steps to deploy the Integration Services:

1. Clone the project:

    ```bash
    git clone https://github.com/iotaledger/integration-services.git
    ```

2. Change directory to your freshly cloned project:

    ```bash
    cd integration-services
    ```
3. Deploy Kubernetes resources for the Integration Service APIs:

    ```bash
    kubectl apply -f kubernetes/optional -f kubernetes/
    ```

In few minutes, depending on how many resources you allocated, the Integration Service API will be ready to handle
requests.

## Notes

The previous commands will create:

- A single MongoDB instance with an ephemeral storage (i.e. no persistent bound volume) with `admin` as username and
  password for administration purpose and `username` and `password` as credentials for the
  database `integration-service-db`.
- A Kubernetes Job that will create a root identity in the database if there is not one yet.
- A replicated backend service for Integration Service API (5 replicas as default value).

You can find information on how to configure Integration Service with a production-ready database in
the [configuration section](configuration.md).
