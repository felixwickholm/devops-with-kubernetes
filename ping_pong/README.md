# Ping-pong

- `GET /pingpong` responds with `pong N` and increases the counter N (kept in memory).
- `GET /pings` returns the counter as JSON (`{"pings": N}`). [Log output](../log_output) calls it over HTTP.

It shares the Ingress of Log output (`log_output/manifests/ingress.yaml`).

## Run

All resources are in the `exercises` namespace (`log_output/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/ping-pong:2.1 .
docker push felixwickholm/ping-pong:2.1
kubectl apply -f ../log_output/manifests/namespace.yaml
kubectl apply -f manifests -f ../log_output/manifests
# open http://localhost:8081/pingpong and http://localhost:8081/status
```
