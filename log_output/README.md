# Log output

Generates a random string on startup and prints it with a timestamp every 5 seconds.

## Run

```sh
docker build -t felixwickholm/log-output:1.1 .
docker push felixwickholm/log-output:1.1
kubectl create deployment log-output-dep --image=felixwickholm/log-output:1.1
kubectl logs -f deployment/log-output-dep
```
