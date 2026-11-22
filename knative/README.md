# Knative Serving (serverless)

Exercise 5.6. Knative Serving v1.24.0 with the Kourier network layer and Magic DNS (sslip.io) on a separate k3d cluster without Traefik.

## Install

```sh
k3d cluster create knative --port 8182:30080@agent:0 -p 8181:80@loadbalancer --agents 2 \
  --k3s-arg "--disable=traefik@server:0" --image rancher/k3s:v1.34.1-k3s1
B=https://github.com/knative/serving/releases/download/knative-v1.24.0
kubectl apply -f $B/serving-crds.yaml
kubectl apply -f $B/serving-core.yaml
kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.24.0/kourier.yaml
kubectl patch configmap/config-network --namespace knative-serving --type merge \
  --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'
kubectl apply -f $B/serving-default-domain.yaml
```

### The crashing pods

`controller`, `webhook` and `net-kourier-controller` went to `CrashLoopBackOff`. The log said:

```
kubernetes version "1.34.1+k3s1" is not compatible, need at least "1.35.0-0"
(this can be overridden with the env var "KUBERNETES_MIN_VERSION")
```

Knative 1.24 wants Kubernetes 1.35, but the course cluster runs 1.34. The fix is the variable from the log:

```sh
for d in controller webhook activator autoscaler net-kourier-controller; do
  kubectl -n knative-serving set env deploy/$d KUBERNETES_MIN_VERSION=1.34.0
done
```

After that all pods ran and the `default-domain` job completed.

## Examples tried

Services are reached through the load balancer with the sslip.io host from `kubectl get ksvc`:

```sh
curl -H "Host: hello.default.192.168.80.3.sslip.io" http://localhost:8181
```

1. **Deploying a Knative Service** (`hello.yaml`): `Hello World!`.
2. **Autoscaling:** with no requests, the pod count went to zero after about 60 seconds. The next request started a new pod (cold start about 9 seconds) and answered `Hello World!`.
3. **Traffic splitting:** `hello-v2.yaml` changed `TARGET` to `Knative` (revision `hello-00002`). `hello-split.yaml` splits traffic 50/50 between `hello-00001` and the latest revision. 40 requests gave 21 × `Hello Knative!` and 19 × `Hello World!`.
