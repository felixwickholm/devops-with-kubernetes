# Log output

Two containers in one pod share an `emptyDir` volume:

- `writer/` generates a random string on startup and appends a line with a timestamp and the string to `files/log.txt` every 5 seconds.
- `reader/` serves the latest line and the ping-pong count at `GET /`.

The ping-pong count comes from `pingpong.txt` on the PersistentVolume that the [Ping-pong](../ping_pong) app also uses (see [volumes](../volumes)).

## Run

```sh
docker build -t felixwickholm/log-output-writer:1.10 writer
docker build -t felixwickholm/log-output-reader:1.11 reader
docker push felixwickholm/log-output-writer:1.10
docker push felixwickholm/log-output-reader:1.11
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube && chmod 777 /tmp/kube"
kubectl apply -f ../volumes -f manifests -f ../ping_pong/manifests
# open http://localhost:8081
```
