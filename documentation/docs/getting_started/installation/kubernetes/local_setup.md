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

## Clone Integration Services Repository

Please follow these steps to clone the Integration Services:

1. Clone the project:

    ```bash
    git clone https://github.com/iotaledger/integration-services.git
    ```

2. Change directory to your freshly cloned project:

    ```bash
    cd integration-services
    ```

## Setup Kong

1. Create a namespace for kong by running the following command:
```
kubectl create -f https://bit.ly/k4k8s
```

2. Start a tunnel for the Kong service by opening a new terminal window and running the following command:
```
minikube service -n kong kong-proxy --url
```
> It will create the following output:

```
🏃  Starting tunnel for service kong-proxy.
|-----------|------------|-------------|------------------------|
| NAMESPACE |    NAME    | TARGET PORT |          URL           |
|-----------|------------|-------------|------------------------|
| kong      | kong-proxy |             | http://127.0.0.1:56203 |
|           |            |             | http://127.0.0.1:56204 |
|-----------|------------|-------------|------------------------|
http://127.0.0.1:56203
http://127.0.0.1:56204
❗  Because you are using a Docker driver on darwin, the terminal needs to be open to run it.
```

3. Open another terminal and type in:

```
export PROXY_IP=http://127.0.0.1:56203
```
You select the first IP of the output above.

```
echo $PROXY_IP
```
It should output the ip, as for instance `http://127.0.0.1:56203`

4. Open another terminal and type in:

```
minikube tunnel
```



## Create the Kong cluster

1. Apply kubernetes cluster to kong

```
kubectl apply -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw --namespace=kong
```
2. Check if services are up and running:

```
kubectl get services -n kong
```
Should return an output like:
```
NAME                      TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
audit-trail-gw            ClusterIP      10.103.130.76    <none>        3002/TCP                     6s
kong-proxy                LoadBalancer   10.109.251.223   127.0.0.1     80:30175/TCP,443:30790/TCP   66s
kong-validation-webhook   ClusterIP      10.101.48.173    <none>        443/TCP                      65s
mongodb-service           ClusterIP      10.106.69.114    <none>        27017/TCP                    7s
ssi-bridge                ClusterIP      10.99.146.170    <none>        3001/TCP                     6s
```

Check if the pods are running:
```
kubectl get pods -n kong
```

Should return an output like:
```

NAME                                       READY   STATUS                       RESTARTS       AGE
audit-trail-gw-6d4f66494c-6nw8k            1/1     Running                      0              84s
generate-key--1-m5wvv                      0/1     Completed                    0              84s
ingress-kong-67ffbc788d-xkgmj              2/2     Running                      2 (84s ago)    84s
mongodb-deployment-7456899d7b-khb7v        1/1     Running                      0              85s
ssi-bridge-bc7f94d79-4vz7p                 1/1     Running                      1 (62s ago)    84s
```

3. Check if the services are up and running:

In few minutes, depending on how many resources you allocated, the Integration Service API will be ready to handle
requests. If the generate-key pod is completed and the audit-trail and ssi-bridge pod are running you can check if they are available using the following two commands:

```
curl -i $PROXY_IP/ssi-bridge/info
curl -i $PROXY_IP/audit-trail-gw/info
```



## Optional Instructions

### Shut down the cluster

```
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw --namespace=kong
```

---

### Delete all references and recreate from scratch

1. Shut down the cluster:

```
kubectl delete all --all -n kong
```

2. Exit/Close all opened terminals

3. Delete namespace
   
```
kubectl delete namespace kong
```

4. Start again from __Setup Kong__

## Notes

The previous commands will create:

- A single MongoDB instance with an ephemeral storage (i.e. no persistent bound volume) with `root` as username and `rootpassword`as password for administration purpose and `username` and `password` as credentials for the
  database `integration-service`.
- A Kubernetes Job that will create a root identity in the database if there is not one yet.
- A replicated backend service for Integration Service API (2 replicas as default value).

You can find information on how to configure Integration Service with a production-ready database in
the [configuration section](configuration.md).
