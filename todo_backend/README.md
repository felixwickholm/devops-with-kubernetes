# Todo backend (course project)

Stores the todos (in memory for now).

- `GET /todos` returns the todos as JSON.
- `POST /todos` creates a todo. It accepts JSON (`{"todo": "text"}`) or a form post (`todo=text`). A form post is redirected back to `/`.

The [todo app](../todo_app) reads the todos from this service, and the Ingress routes `/todos` here, so the browser form posts directly to it.

## Run

```sh
docker build -t felixwickholm/todo-backend:2.2 .
docker push felixwickholm/todo-backend:2.2
kubectl apply -f manifests -f ../todo_app/manifests
curl -X POST -H 'Content-Type: application/json' -d '{"todo":"Test"}' http://localhost:8081/todos
```
