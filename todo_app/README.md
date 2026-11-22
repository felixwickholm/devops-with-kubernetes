# Todo app (course project)

A web server that serves an HTML page at `/` with a random image from Lorem Picsum, a todo input (max 140 characters), a send button, the list of todos not done (each with a "Mark as done" button that sends `PUT /todos/<id>`) and the list of done todos.

The todos are stored in the [todo backend](../todo_backend). The page gets them from `TODO_BACKEND_URL` when it renders. The form posts to `/todos`, which the Ingress routes to the backend.

- The image is cached in `files/` on a PersistentVolumeClaim (`manifests/persistentvolumeclaim.yaml`, k3s `local-path` storage class), so it survives container restarts.
- The image stays the same for 10 minutes. After that, the old image is served one more time and a new one is fetched for the next request.
- Probes: `GET /readyz` (readiness) returns 200 when the app works and the backend answers. `GET /healthz` (liveness) returns 500 after someone presses "Break the app". The liveness probe then restarts the container, and the app is healthy again.
- Configuration: the source has no hard-coded ports or URLs. The ConfigMap `todo-app-config` (`manifests/configmap.yaml`) sets `PORT`, `IMAGE_DIR`, `IMAGE_URL`, `IMAGE_TTL_MINUTES` and `TODO_BACKEND_URL`. The app exits if one is missing.

## Run

The manifests have no namespace. The [project](../project) overlays deploy them to the namespaces `staging` and `production`.

The cluster maps host port 8081 to the load balancer (Ingress) on port 80:

```sh
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
docker build -t felixwickholm/todo-app:4.8 .
docker push felixwickholm/todo-app:4.8
kubectl apply -k ../project/overlays/staging   # the whole project, see ../project
# open http://localhost:8081
```
