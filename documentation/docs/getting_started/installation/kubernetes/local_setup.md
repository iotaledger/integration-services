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
* [helm](https://helm.sh/)

## Minikube

Start your cluster by running the following command:

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

1. Install helm by running the following command:

```bash
brew install helm
```  

2. Add helm repo by running the following command:

```bash
helm repo add kong https://charts.konghq.com
```

3. Install kong using helm by running the following command:
```bash
helm install kong kong/kong
```

4. Open another terminal and type run the following command to expose the kong service:

```bash
minikube tunnel
```

5. Start a tunnel for the Kong service by opening a new terminal window and running the following command:
```bash
minikube service kong --url
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

6. Open another terminal and export the PROXY_IP variable by running the following command replacing `http://127.0.0.1:56203` with the first IP which was outputted in step 2. :

```bash
export PROXY_IP=http://127.0.0.1:56203
```

You can check that you have exported the variable correctly by running the following command: 

```bash
echo $PROXY_IP
```
It should output the IP you have exported, in this example `http://127.0.0.1:56203`.



## Create the Kong Cluster

1. Apply the Kubernetes cluster to kong by running the following command:

```bash
kubectl apply -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```

2. You can check if the services are up and running with the following command:

```bash
kubectl get services
```

**Expected output**:

```plaintext
NAME              TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
audit-trail-gw    ClusterIP      10.105.148.167   <none>        3000/TCP                     17h
kong-kong-proxy   LoadBalancer   10.97.208.78     127.0.0.1     80:30959/TCP,443:32326/TCP   17h
kubernetes        ClusterIP      10.96.0.1        <none>        443/TCP                      21h
mongodb-service   ClusterIP      10.106.253.44    <none>        27017/TCP                    17h
ssi-bridge        ClusterIP      10.110.29.161    <none>        3000/TCP                     17h
```

You can check if the pods are running with the following command:
```bash
kubectl get pods
```

**Expected output**:
```plaintext

NAME                                  READY   STATUS      RESTARTS        AGE
audit-trail-gw-557959d777-52p94       1/1     Running     0               9m8s
audit-trail-gw-557959d777-cmqvg       1/1     Running     0               9m8s
generate-key--1-zbz7x                 0/1     Completed   0               9m8s
kong-75757c49b6-pptwm                 2/2     Running     0               26m
kong-75757c49b6-zgqkg                 2/2     Running     0               26m
kong-postgresql-0                     1/1     Running     0               26m
mongodb-deployment-5f89c7c88f-nr5xv   1/1     Running     0               9m9s
ssi-bridge-f849f7fc7-fhg6g            1/1     Running     2 (7m42s ago)   9m8s
ssi-bridge-f849f7fc7-t4msg            1/1     Running     2 (7m42s ago)   9m8s
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
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```


### Delete All References and Recreate From Scratch

1. Shut down the cluster by running:

```bash
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```

2. Close all open terminal windows.

3. Delete the kong load balancer by running the following command:
   
```bash
helm delete kong
```

4. Once you have stopped kong and deleted all services, you can recreate it by referring to the [Set Up Kong section](#set-up-kong).
