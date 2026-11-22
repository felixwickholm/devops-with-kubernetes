# Ping-pong

`GET /pingpong` responds with `pong N` and increases the counter N.
The counter is saved to `files/pingpong.txt` on the shared PersistentVolume (see [volumes](../volumes)).
It shares the Ingress of [Log output](../log_output) (`log_output/manifests/ingress.yaml`).

## Run

```sh
docker build -t felixwickholm/ping-pong:1.11 .
docker push felixwickholm/ping-pong:1.11
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube && chmod 777 /tmp/kube"
kubectl apply -f ../volumes -f manifests -f ../log_output/manifests
# open http://localhost:8081/pingpong and http://localhost:8081
```
