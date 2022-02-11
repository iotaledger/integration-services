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

1.
