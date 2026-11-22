# Project deployment (GitOps)

This directory is the deployable whole of the course project. `kustomization.yaml` combines:

- [todo_app](../todo_app): the web page and the image cache
- [todo_backend](../todo_backend): the todo API and its Postgres StatefulSet
- [broadcaster](../broadcaster): the NATS subscriber that forwards todo messages
- [todo_cronjob](../todo_cronjob): the hourly Wikipedia todo

It also sets the image tags.

## How an update reaches the cluster (exercise 4.8)

1. A commit to `main` changes code in one of the app folders.
2. GitHub Actions (`../.github/workflows/project.yaml`) builds the images for amd64 and arm64, tags them with the commit SHA, pushes them to Docker Hub, sets the tags here with `kustomize edit set image`, and commits this file.
3. ArgoCD (`../argocd/project.yaml`, automatic sync with prune and self-heal) sees the new commit on `main` and deploys it.

A commit that changes only manifests or this file is deployed by ArgoCD directly.

The workflow needs the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`. Without them it skips the build with a notice.

## Run

Once per cluster: NATS (see [broadcaster](../broadcaster)), ArgoCD (see [log_output](../log_output)) and the database Secret:

```sh
kubectl apply -f ../todo_app/manifests/namespace.yaml
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
sops --decrypt ../todo_backend/secrets/secret.enc.yaml | kubectl apply -f -
kubectl apply -f ../argocd/project.yaml
# without ArgoCD: kubectl apply -k .
```
