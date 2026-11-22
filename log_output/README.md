# Log output

Two containers in one pod share an `emptyDir` volume:

- `writer/` generates a random string on startup and appends a line with a timestamp and the string to `files/log.txt` every 5 seconds.
- `reader/` serves the file content at `GET /`.

## Run

```sh
docker build -t felixwickholm/log-output-writer:1.10 writer
docker build -t felixwickholm/log-output-reader:1.10 reader
docker push felixwickholm/log-output-writer:1.10
docker push felixwickholm/log-output-reader:1.10
kubectl apply -f manifests
# open http://localhost:8081
```
