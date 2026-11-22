# Ping-pong

- `GET /pingpong` responds with `pong N` and increases the counter N.
- `GET /pings` returns the counter as JSON (`{"pings": N}`). [Log output](../log_output) calls it over HTTP.

The counter is saved in a Postgres database. Postgres runs as a StatefulSet with one replica and a headless Service (`manifests/postgres.yaml`). Its volume comes from the k3s `local-path` storage class.

The database credentials are in a Secret. The repository has only the SOPS-encrypted version (`secrets/secret.enc.yaml`, age encryption). The age key is not in the repository.

It shares the Ingress of Log output (`log_output/manifests/ingress.yaml`). All resources are in the `exercises` namespace.

## Run

```sh
docker build -t felixwickholm/ping-pong:2.7 .
docker push felixwickholm/ping-pong:2.7
kubectl apply -f ../log_output/manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt secrets/secret.enc.yaml | kubectl apply -f -
kubectl apply -f manifests -f ../log_output/manifests
# open http://localhost:8081/pingpong and http://localhost:8081/status
```

To use your own credentials, write a plain `secret.yaml` with `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` under `stringData`, and encrypt it with `sops --encrypt --age <your public key> secret.yaml > secrets/secret.enc.yaml`.
