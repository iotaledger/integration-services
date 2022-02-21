## Setup Kong

1. Create namespace for kong:
```
kubectl create -f https://bit.ly/k4k8s
```

2. Open new terminal and type in
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
Should output the ip.

4. Open another terminal and type in:

```
minikube tunnel
```

--- 


## Create the kong cluster

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

3. Check if up and running:

```
curl -i http://127.0.0.1/ssi-bridge/info
```