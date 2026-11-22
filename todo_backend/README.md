# Todo backend (course project)

Stores the todos (in memory for now).

- `GET /todos` returns the todos as JSON.
- `POST /todos` creates a todo. It accepts JSON (`{"todo": "text"}`) or a form post (`todo=text`). A form post is redirected to `REDIRECT_URL`.

Configuration: the ConfigMap `todo-backend-config` (`manifests/configmap.yaml`) sets `PORT` and `REDIRECT_URL`. The source has no hard-coded ports or URLs.

The [todo app](../todo_app) reads the todos from this service, and the Ingress routes `/todos` here, so the browser form posts directly to it.

## Run

All project resources are in the `project` namespace (`todo_app/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/todo-backend:2.6 .
docker push felixwickholm/todo-backend:2.6
kubectl apply -f ../todo_app/manifests/namespace.yaml
kubectl apply -f ../volumes -f manifests -f ../todo_app/manifests
curl -X POST -H 'Content-Type: application/json' -d '{"todo":"Test"}' http://localhost:8081/todos
```
