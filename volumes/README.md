# Volumes

Cluster-level storage, kept apart from the apps. Local PersistentVolumes on node `k3d-k3s-default-agent-0` and claims for them:

- `shared-pv` / `shared-claim`: shared by Log output and Ping-pong (`/tmp/kube`).
- `todo-pv` / `todo-claim`: image cache of the project (`/tmp/kube-todo`).

## Run

Create the directories on the node first:

```sh
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube /tmp/kube-todo && chmod 777 /tmp/kube /tmp/kube-todo"
kubectl apply -f .
```
