# Volumes

Cluster-level storage, kept apart from the apps. A local PersistentVolume on node `k3d-k3s-default-agent-0` and a claim for it.

## Run

Create the directory on the node first:

```sh
docker exec k3d-k3s-default-agent-0 sh -c "mkdir -p /tmp/kube && chmod 777 /tmp/kube"
kubectl apply -f .
```
