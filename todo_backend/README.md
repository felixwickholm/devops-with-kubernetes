# Todo backend (course project)

Stores the todos in Postgres.

- `GET /todos` returns the todos as JSON.
- `POST /todos` creates a todo. It accepts JSON (`{"todo": "text"}`) or a form post (`todo=text`). A form post is redirected to `REDIRECT_URL`.
- `PUT /todos/<id>` sets the `done` field. The body `{"done": true}` (or no body) marks the todo as done.

When a todo is created or updated, the backend publishes `{"action", "todo"}` to the NATS subject `todos`. The [broadcaster](../broadcaster) forwards it to a chat service.

Todos over `TODO_MAX_LENGTH` (140) characters are rejected with status 400.

Every request is logged (method, path, status, time), and every received, created and rejected todo is logged. The logs can be read in Grafana with Loki (see [monitoring](../monitoring)).

The [todo app](../todo_app) reads the todos from this service, and the Ingress routes `/todos` here, so the browser form posts directly to it.

`GET /healthz` returns 200 only when the database answers. The ReadinessProbe uses it.

Postgres runs as a StatefulSet with one replica and a headless Service (`manifests/postgres.yaml`).

Configuration:

- The ConfigMap `todo-backend-config` (`manifests/configmap.yaml`) sets `PORT`, `REDIRECT_URL`, `TODO_MAX_LENGTH`, `PGHOST`, `NATS_URL` and `NATS_SUBJECT`.
- The Secret `todo-postgres-secret` has the database user, password and name. The repository has only the SOPS-encrypted version (`secrets/secret.enc.yaml`, age encryption). The age key is not in the repository.

## Run

All project resources are in the `project` namespace (`todo_app/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/todo-backend:4.6 .
docker push felixwickholm/todo-backend:4.6
kubectl apply -f ../todo_app/manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt secrets/secret.enc.yaml | kubectl apply -f -
kubectl apply -f ../volumes -f manifests -f ../todo_app/manifests
curl -X POST -H 'Content-Type: application/json' -d '{"todo":"Test"}' http://localhost:8081/todos
# a todo over 140 characters is blocked:
curl -i -X POST -H 'Content-Type: application/json' -d "{\"todo\":\"$(printf 'x%.0s' $(seq 141))\"}" http://localhost:8081/todos
```
