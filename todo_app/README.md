# Todo app (course project)

A web server that serves an HTML page at `/`. The `PORT` environment variable sets the port (default 3000).

## Run

```sh
docker build -t felixwickholm/todo-app:1.5 .
docker push felixwickholm/todo-app:1.5
kubectl apply -f manifests/deployment.yaml
kubectl port-forward deployment/todo-app-dep 3003:3001
# open http://localhost:3003
```
