# Volumes

Cluster-level storage, kept apart from the apps. A local PersistentVolume on node `k3d-k3s-default-agent-0` and a claim for it:

- `todo-pv` / `todo-claim`: image cache of the project (`/tmp/kube-todo`).

The volume shared by Log output and Ping-pong (exercise 1.11) was removed in exercise 2.1.

## Run

Create the directory on the node first:

```sh
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube-todo && chmod 777 /tmp/kube-todo"
kubectl apply -f .
```
