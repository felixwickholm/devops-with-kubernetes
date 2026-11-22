# Todo app (course project)

A web server that serves an HTML page at `/` with a random image from Lorem Picsum.

- The image is cached in `files/` on a PersistentVolume (see [volumes](../volumes)), so it survives container restarts.
- The image stays the same for 10 minutes. After that, the old image is served one more time and a new one is fetched for the next request.
- Environment: `PORT` (default 3000), `IMAGE_DIR`, `IMAGE_URL`, `IMAGE_TTL_MINUTES` (default 10).

## Run

The cluster maps host port 8081 to the load balancer (Ingress) on port 80:

```sh
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube-todo && chmod 777 /tmp/kube-todo"
docker build -t felixwickholm/todo-app:1.12 .
docker push felixwickholm/todo-app:1.12
kubectl apply -f ../volumes -f manifests
# open http://localhost:8081
```
