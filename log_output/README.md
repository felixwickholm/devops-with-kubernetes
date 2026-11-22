# Log output

Two containers in one pod share an `emptyDir` volume:

- `writer/` generates a random string on startup and appends a line with a timestamp and the string to `files/log.txt` every 5 seconds.
- `reader/` serves the latest line and the ping-pong count. The Ingress routes `/status` to it, because the project uses `/`.

The reader gets the ping-pong count over HTTP from `GET /pings` of the [Ping-pong](../ping_pong) app (env `PINGPONG_URL`).

The reader has `GET /healthz`, which returns 200 only when Ping-pong answers. The ReadinessProbe uses it, so the pod shows 1/2 ready until Ping-pong and its database work.

The ConfigMap `log-output-config` gives the reader the file `config/information.txt` (mounted as a volume) and the env variable `MESSAGE`. The reader prints both.

## GitOps (exercise 4.7)

ArgoCD runs in the cluster and keeps Log output in sync with the `main` branch of this repository:

- `kustomization.yaml` lists the manifests and sets the image tags.
- `../argocd/log-output.yaml` is the ArgoCD `Application` (automatic sync with prune and self-heal).
- `../.github/workflows/log-output.yaml` runs on a push to `main` that changes `writer/` or `reader/`. It builds both images for amd64 and arm64, tags them with the commit SHA, pushes them to Docker Hub, sets the new tags in `kustomization.yaml` with `kustomize edit set image`, and commits the file. ArgoCD then deploys the new version.

The workflow needs the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`. Without them it skips the build with a notice.

Install ArgoCD and the Application once:

```sh
kubectl create namespace argocd
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v3.6.2/manifests/install.yaml
kubectl apply -f ../argocd/log-output.yaml
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d; echo
kubectl -n argocd port-forward svc/argocd-server 8443:443   # open https://localhost:8443, user admin
```

## Run (without ArgoCD)

All resources are in the `exercises` namespace (`log_output/manifests/namespace.yaml`).

```sh
docker build -t felixwickholm/log-output-writer:1.10 writer
docker build -t felixwickholm/log-output-reader:4.7 reader
docker push felixwickholm/log-output-writer:1.10
docker push felixwickholm/log-output-reader:4.7
kubectl apply -f manifests/namespace.yaml
kubectl apply -k .
kubectl apply -f ../ping_pong/manifests
# open http://localhost:8081/status
```
