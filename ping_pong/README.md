# Ping-pong

- `GET /pingpong` responds with `pong N` and increases the counter N.
- `GET /pings` returns the counter as JSON (`{"pings": N}`). [Log output](../log_output) calls it over HTTP.
- `GET /healthz` returns 200 only when the database answers. The ReadinessProbe uses it, so the pod is not ready (0/1) until Postgres is available.

The counter is saved in a Postgres database. Postgres runs as a StatefulSet with one replica and a headless Service (`manifests/postgres.yaml`). Its volume comes from the k3s `local-path` storage class.

The database credentials are in a Secret. The repository has only the SOPS-encrypted version (`secrets/secret.enc.yaml`, age encryption). The age key is not in the repository.

## Canary updates (exercise 4.4)

Ping-pong runs as an Argo Rollouts `Rollout` (`manifests/rollout.yaml`) with a canary strategy: 50 % of the pods get the new version, then the AnalysisTemplate `cpu-usage` (`manifests/analysistemplate.yaml`) runs.

The analysis asks Prometheus for the CPU usage rate sum of all containers in the `exercises` namespace once a minute for 5 minutes. If one value is 0.1 CPU or more, the analysis fails and the Rollout reverts to the stable version. The normal usage is about 0.01 CPU.

It shares the Ingress of Log output (`log_output/manifests/ingress.yaml`). All resources are in the `exercises` namespace.

## Run

```sh
docker build -t felixwickholm/ping-pong:4.4 .
docker push felixwickholm/ping-pong:4.4
kubectl apply -f ../log_output/manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt secrets/secret.enc.yaml | kubectl apply -f -
# Argo Rollouts is needed once per cluster:
kubectl create namespace argo-rollouts
kubectl apply --server-side -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/download/v1.10.2/install.yaml
kubectl apply -f manifests -f ../log_output/manifests
# open http://localhost:8081/pingpong and http://localhost:8081/status
kubectl argo rollouts -n exercises get rollout ping-pong-rollout --watch
```

To check that an update is reverted when the limit is too low, set the limit to 0.001 and change the image:

```sh
sed 's/result < 0.1/result < 0.001/' manifests/analysistemplate.yaml | kubectl apply -f -
kubectl argo rollouts -n exercises set image ping-pong-rollout ping-pong=felixwickholm/ping-pong:4.1
kubectl argo rollouts -n exercises get rollout ping-pong-rollout --watch   # ends Degraded, stable image stays
kubectl apply -f manifests/analysistemplate.yaml
```

To use your own credentials, write a plain `secret.yaml` with `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` under `stringData`, and encrypt it with `sops --encrypt --age <your public key> secret.yaml > secrets/secret.enc.yaml`.
