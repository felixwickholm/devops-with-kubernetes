# Log output

Generates a random string on startup and prints it with a timestamp every 5 seconds.
`GET /` returns the current timestamp and the random string.

## Run

The cluster maps host port 8081 to the load balancer (Ingress) on port 80:

```sh
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
docker build -t felixwickholm/log-output:1.7 .
docker push felixwickholm/log-output:1.7
kubectl apply -f manifests
# open http://localhost:8081
```
