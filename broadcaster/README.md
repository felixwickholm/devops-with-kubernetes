# Broadcaster (course project)

Sends status messages of the todos to an external chat service.

- The [todo backend](../todo_backend) publishes a message to the NATS subject `todos` when it creates or updates a todo.
- The broadcaster subscribes to `todos` in the queue group `broadcaster`. NATS gives each message to only one member of the group, so the broadcaster can run with 6 replicas without duplicate messages.
- The broadcaster sends each message to `WEBHOOK_URL` in the "Generic" format: `{"user": "bot", "message": "A todo was created: ..."}`.
- Without `WEBHOOK_URL`, the broadcaster only logs the messages.

The external service here is a local stand-in: `manifests/webhook-receiver.yaml` runs an echo server that logs every payload. To use a real service, set `WEBHOOK_URL` in `manifests/configmap.yaml`.

## Run

NATS is installed with Helm once per cluster:

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
helm upgrade --install my-nats nats/nats --namespace nats --create-namespace --set promExporter.enabled=true
```

Then:

```sh
docker build -t felixwickholm/broadcaster:4.6 .
docker push felixwickholm/broadcaster:4.6
kubectl apply -f manifests -f ../todo_backend/manifests
# create a todo, then read the messages that arrived:
curl -X POST -H 'Content-Type: application/json' -d '{"todo":"Hello NATS"}' http://localhost:8081/todos
kubectl -n project logs deployment/webhook-receiver-dep | grep '"message": "'
```

Test with 6 replicas (9 events gave 9 messages, each once, spread over the replicas):

```sh
for p in $(kubectl -n project get pods -l app=broadcaster -o name); do echo "$p $(kubectl -n project logs $p | grep -c Forwarded)"; done
kubectl -n project logs deployment/webhook-receiver-dep | grep '"message": "' | sort | uniq -c
```
