# Todo app (course project)

A web server. The `PORT` environment variable sets the port (default 3000).

## Run

```sh
docker build -t felixwickholm/todo-app:1.2 .
docker push felixwickholm/todo-app:1.2
kubectl create deployment todo-app-dep --image=felixwickholm/todo-app:1.2
kubectl set env deployment/todo-app-dep PORT=3001
kubectl logs -f deployment/todo-app-dep
```
