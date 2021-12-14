# Expose APIs

Once the service is deployed in the Kubernetes cluster and ready to serve requests there are different way to access to the APIs.

## Minikube Nginx Ingress

In minikube you can install Nginx Ingress Controller with the following:

`minikube addons enable ingress`

Install Ingress resource:

`kubectl apply -f kubernetes/optional/ingress.yaml`

Query deployed ingress with the following:

`kubectl get ingress`

After a while the output should be like

```
NAME                      CLASS    HOSTS                          ADDRESS        PORTS   AGE
integration-service-api   <none>   ensuresec.solutions.iota.org   192.168.49.2   80      10m
```

Now is possible to query the deployed API

`curl -H 'Host: ensuresec.solutions.iota.org' http://192.168.49.2/info`

You can avoid using `Host` header simply mapping the host/IP association in `/etc/hosts`.
In that case you could use directly `http://ensuresec.solutions.iota.org/info` in your default browser.

You can see how to change domain name [here](configuration.md).

## Port forward

Service can even be exposed outside the cluster via `kubectl port forward` command:

`kubectl port-forward svc/integration-service-api 3000:3000`

The previous command will expose APIs on port 3000 of the local host.

In case you prefer some visual tool we suggest to use: [Kube Forwarder]([https://link](https://kube-forwarder.pixelpoint.io/)).

## LoadBalancer service

This is the the best solution for deployments in cloud providers (AWS, Azure, GCP...).

You need to set the value `LoadBalancer` for the `.spec.type` field of `kubernetes/is-service.yaml` before deploy.

In this way Cloud Provider will be instructed to create an external endpoint for that service and specify it in the `EXTERNAL-IP` column of the Service details:

This is an example on a EKS (AWS Kubernetes cluster) on AWS: 

```
$ kubectl get svc
NAME                      TYPE           CLUSTER-IP       EXTERNAL-IP                                                              PORT(S)          AGE
integration-service-api   LoadBalancer   10.100.219.204   <UNIQUE-NUMBER>.us-west-2.elb.amazonaws.com   3000:30733/TCP   22h
kubernetes                ClusterIP      10.100.0.1       <none>                                                                   443/TCP          7d1h
mongodb-service           ClusterIP      10.100.175.101   <none>                                                                   27017/TCP        22h
```

## Kubernetes Ingress

When you use minikube you can install an Ingress Controller simply via `addons enable`.

Kubernetes ecosystem however has different Ingress Controllers.

For a list of popular Kubernetes ingress controllers you can see [here](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).

