# Ping-pong

`GET /pingpong` responds with `pong N` and increases the counter N (kept in memory).
It shares the Ingress of [Log output](../log_output) (`log_output/manifests/ingress.yaml`).

## Run

```sh
docker build -t felixwickholm/ping-pong:1.9 .
docker push felixwickholm/ping-pong:1.9
kubectl apply -f manifests -f ../log_output/manifests
# open http://localhost:8081/pingpong
```
