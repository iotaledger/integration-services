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

## Set Up Kong

1. Create a namespace for kong by running the following command:
```bash
kubectl create -f https://bit.ly/k4k8s
```

2. Start a tunnel for the Kong service by opening a new terminal window and running the following command:
```bash
minikube service -n kong kong-proxy --url
```

**Expected output**:

```plaintext
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

3. Open another terminal and export the PROXY_IP variable by running the following command replacing `http://127.0.0.1:56203` with the first IP which was outputted in step 2. :

```bash
export PROXY_IP=http://127.0.0.1:56203
```

You can check that you have exported the variable correctly by running the following command: 

```bash
echo $PROXY_IP
```
It should output the IP you have exported, in this example `http://127.0.0.1:56203`.

4. Open another terminal and type run the following command to expose the kong service:

```bash
minikube tunnel
```



## Create the Kong Cluster

1. Apply the Kubernetes cluster to kong by running the following command:

```bash
kubectl apply -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw --namespace=kong
```

2. You can check if the services are up and running with the following command:

```bash
kubectl get services -n kong
```

**Expected output**:

```plaintext
NAME                      TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
audit-trail-gw            ClusterIP      10.103.130.76    <none>        3002/TCP                     6s
kong-proxy                LoadBalancer   10.109.251.223   127.0.0.1     80:30175/TCP,443:30790/TCP   66s
kong-validation-webhook   ClusterIP      10.101.48.173    <none>        443/TCP                      65s
mongodb-service           ClusterIP      10.106.69.114    <none>        27017/TCP                    7s
ssi-bridge                ClusterIP      10.99.146.170    <none>        3001/TCP                     6s
```

You can check if the pods are running with the following command:
```bash
kubectl get pods -n kong
```

**Expected output**:
```plaintext

NAME                                       READY   STATUS                       RESTARTS       AGE
audit-trail-gw-6d4f66494c-6nw8k            1/1     Running                      0              84s
generate-key--1-m5wvv                      0/1     Completed                    0              84s
ingress-kong-67ffbc788d-xkgmj              2/2     Running                      2 (84s ago)    84s
mongodb-deployment-7456899d7b-khb7v        1/1     Running                      0              85s
ssi-bridge-bc7f94d79-4vz7p                 1/1     Running                      1 (62s ago)    84s
```

3. Check if the services are up and running:

In few minutes, depending on how many resources you allocated, the Integration Service API will be ready to handle
requests. Once the generate-key pod is completed and the audit-trail and ssi-bridge pods are running, you can check if they are available with following two commands:

```bash
curl -i $PROXY_IP/ssi-bridge/info
curl -i $PROXY_IP/audit-trail-gw/info
```


## Notes

The previous commands will create:

- A single MongoDB instance with an ephemeral storage (i.e. no persistent bound volume) with `root` as username and `rootpassword`as password for administration purpose and `username` and `password` as credentials for the
  database `integration-service`.
- A Kubernetes Job that will create a root identity in the database if there is not one yet.
- A replicated backend service for Integration Service API (2 replicas as default value).

You can find information on how to configure Integration Service with a production-ready database in
the [configuration section](configuration.md).


## Optional Instructions

### Shut Down the Cluster

You can shut down the cluster by running the following commands:

```bash
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw --namespace=kong
```


### Delete All References and Recreate From Scratch

1. Shut down the cluster by running:

```bash
kubectl delete all --all -n kong
```

2. Close all open terminal windows.

3. Delete the kong namespace by running the following command:
   
```bash
kubectl delete namespace kong
```

4. Once you have stopped kong and deleted its namespace, you can recreate it by referring to the [Set Up Kong section](#set-up-kong).
