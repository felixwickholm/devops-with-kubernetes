# Ping-pong on Knative (serverless)

Exercise 5.7. Ping-pong runs as a Knative Service in the Knative cluster from [knative](../knative). Log output, the greeter and Postgres run as normal workloads in the namespace `exercises`.

- `manifests/ping-pong-ksvc.yaml`: Ping-pong (image `felixwickholm/ping-pong:4.4`) as a Knative Service. Knative sets `PORT` from `containerPort`. It scales to zero after about 60 seconds without requests.
- `manifests/log-output.yaml`: Log output calls Ping-pong with the fully qualified name `http://ping-pong.exercises.svc.cluster.local/pings`. It has no readiness probe, because a probe that calls Ping-pong every few seconds would keep Ping-pong from scaling to zero. Without Traefik there is no Ingress controller, so Log output uses NodePort 30080 (`localhost:8182`).
- `manifests/postgres.yaml`, `configmap.yaml`, `greeter.yaml`: as in the other folders. The database Secret is the SOPS file `../ping_pong/secrets/secret.enc.yaml`.

## Run

```sh
kubectl config use-context k3d-knative
kubectl apply -f manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt ../ping_pong/secrets/secret.enc.yaml | kubectl apply -f -
kubectl apply -f manifests
kubectl -n exercises get ksvc ping-pong
curl -H "Host: ping-pong.exercises.<ip>.sslip.io" http://localhost:8181/pingpong   # host from the ksvc URL
curl http://localhost:8182/                                                        # Log output
```

## Result

```
$ curl -H "Host: ping-pong.exercises.192.168.80.3.sslip.io" http://localhost:8181/pingpong
pong 0
$ curl http://localhost:8182/
file content: this text is from file
env variable: MESSAGE=hello world
2026-11-22T21:27:11.563Z: 0c4f63cb-0e9f-4b62-b32f-c9b7d08227d2.
Ping / Pongs: 3
greetings: Hello from greeter v1
```

After 60 seconds without requests Ping-pong had zero pods. The next request to Log output started a new Ping-pong pod and returned `Ping / Pongs: 3` after about 9 seconds (cold start). The counter is in Postgres, so it survives the scale to zero.
