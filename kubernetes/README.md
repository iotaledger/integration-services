# README

This file explain how a full integration service API can be installed on a kubernetes cluster.
This installation is tested on Kubenetes 1.21.

# Minikube

In order to have a simple single-node kubernetes cluster we suggest to install [minikube](https://minikube.sigs.k8s.io/docs/start/)

Once minikube is installed you will need to reference an IOTA Hornet Node and a MongoDB database.

We offer the possibility to setup a simple MongoDB database using the `optional` directory:

```
kubectl apply 
    -f optional/mongo-deployment.yaml \
    -f optional/mongo-init-config.yaml \
    -f optional/mongo-secret.yaml \
    -f optional/mongo-service.yaml
```

The previous command create a mongodatabase with an ephemeral storage (no persistent volume bound) with `admin` as 
username and password for administration and `username` and `password` as credential for the database `integration-service-db`

-rw-rw-r-- 1 michele michele  927 ott 28 15:26 ingress.yaml

Optional Components Are:

MongoDB (it could be external)

Hornet node (it could be external)

Mandatory Components Are:

integration-service

integration-service-fe

