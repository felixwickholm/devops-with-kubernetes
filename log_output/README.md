# Log output

Two containers in one pod share an `emptyDir` volume:

- `writer/` generates a random string on startup and appends a line with a timestamp and the string to `files/log.txt` every 5 seconds.
- `reader/` serves the latest line and the ping-pong count. The Ingress routes `/status` to it, because the project uses `/`.

The reader gets the ping-pong count over HTTP from `GET /pings` of the [Ping-pong](../ping_pong) app (env `PINGPONG_URL`).

The ConfigMap `log-output-config` gives the reader the file `config/information.txt` (mounted as a volume) and the env variable `MESSAGE`. The reader prints both.

## Run

All resources are in the `exercises` namespace (`log_output/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/log-output-writer:1.10 writer
docker build -t felixwickholm/log-output-reader:2.5 reader
docker push felixwickholm/log-output-writer:1.10
docker push felixwickholm/log-output-reader:2.5
kubectl apply -f manifests/namespace.yaml
kubectl apply -f manifests -f ../ping_pong/manifests
# open http://localhost:8081/status
```
