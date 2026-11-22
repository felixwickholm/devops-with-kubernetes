# Todo backend (course project)

Stores the todos in Postgres.

- `GET /todos` returns the todos as JSON.
- `POST /todos` creates a todo. It accepts JSON (`{"todo": "text"}`) or a form post (`todo=text`). A form post is redirected to `REDIRECT_URL`.

The [todo app](../todo_app) reads the todos from this service, and the Ingress routes `/todos` here, so the browser form posts directly to it.

Postgres runs as a StatefulSet with one replica and a headless Service (`manifests/postgres.yaml`).

Configuration:

- The ConfigMap `todo-backend-config` (`manifests/configmap.yaml`) sets `PORT`, `REDIRECT_URL` and `PGHOST`.
- The Secret `todo-postgres-secret` has the database user, password and name. The repository has only the SOPS-encrypted version (`secrets/secret.enc.yaml`, age encryption). The age key is not in the repository.

## Run

All project resources are in the `project` namespace (`todo_app/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/todo-backend:2.8 .
docker push felixwickholm/todo-backend:2.8
kubectl apply -f ../todo_app/manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt secrets/secret.enc.yaml | kubectl apply -f -
kubectl apply -f ../volumes -f manifests -f ../todo_app/manifests
curl -X POST -H 'Content-Type: application/json' -d '{"todo":"Test"}' http://localhost:8081/todos
```
