## Setup Kong

0. Start minikube

```
minikube start
```

1. Install helm:
```
brew install helm
```  

2. Add helm repo

```
helm repo add kong https://charts.konghq.com
```

3. Install kong using helm
```
helm install kong kong/kong
```

4. Open another terminal and type in:

```
minikube tunnel
```

5. Open new terminal and type in
```
export PROXY_IP=$(kubectl get -o jsonpath="{.status.loadBalancer.ingress[0].ip}" service kong-kong-proxy)
echo $PROXY_IP
```
> It will create the following output:

```
127.0.0.1
```

You can access kong via this url.

--- 


## Create the Kong cluster

1. Apply kubernetes cluster to kong

```
kubectl apply -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```
2. Check if services are up and running:

```
kubectl get services
```
Should return an output like:
```
NAME                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
audit-trail-gw       ClusterIP   10.109.143.231   <none>        3000/TCP                     9m27s
kong                 NodePort    10.109.196.88    <none>        80:30368/TCP,443:32425/TCP   26m
kong-postgresql      ClusterIP   10.104.194.254   <none>        5432/TCP                     26m
kong-postgresql-hl   ClusterIP   None             <none>        5432/TCP                     26m
kubernetes           ClusterIP   10.96.0.1        <none>        443/TCP                      65m
mongodb-service      ClusterIP   10.96.36.17      <none>        27017/TCP                    9m28s
ssi-bridge           ClusterIP   10.96.210.228    <none>        3000/TCP                     9m27s
```

Check if the pods are running:
```
kubectl get pods
```

Should return an output like:
```
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

3. Check if up and running:

If the generate-key pod is completed and the audit-trail and ssi-bridge pod are running you can check if they are available using the following two commands:
```
curl -i $PROXY_IP/ssi-bridge/info
curl -i $PROXY_IP/audit-trail-gw/info
```

---

# Optional

## Shut down the cluster

```
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```

---

## Delete all references and recreate from scratch

1. Shut down the cluster:

```
kubectl delete -f kubernetes/optional -f kubernetes/ -f kubernetes/kong-gw
```

2. Uninstall helm release

```
helm delete kong
```

3. Exit/Close all opened terminals

4. Start again from __Setup Kong__