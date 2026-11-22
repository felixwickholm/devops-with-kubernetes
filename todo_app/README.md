# Todo app (course project)

A web server that serves an HTML page at `/`. The `PORT` environment variable sets the port (default 3000).

## Run

The cluster maps host port 8081 to the load balancer (Ingress) on port 80:

```sh
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
docker build -t felixwickholm/todo-app:1.5 .
docker push felixwickholm/todo-app:1.5
kubectl apply -f manifests
# open http://localhost:8081
```
