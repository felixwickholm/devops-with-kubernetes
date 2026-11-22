# Project deployment (GitOps)

The deployable whole of the course project, built with Kustomize:

- `base/` combines [todo_app](../todo_app), [todo_backend](../todo_backend), [broadcaster](../broadcaster) and [todo_cronjob](../todo_cronjob), without a namespace.
- `overlays/staging/` deploys to the namespace `staging`.
- `overlays/production/` deploys to the namespace `production`.

| | staging | production |
|---|---|---|
| Deployed from | every commit to `main` | every tagged commit |
| ArgoCD Application | `../argocd/project-staging.yaml` (follows `main`) | `../argocd/project-production.yaml` (follows the branch `production`) |
| Broadcaster | only logs the messages (no `WEBHOOK_URL`) | forwards the messages to the external service (`webhook-receiver.yaml`) |
| Database backup | none | daily `pg_dump` CronJob (`backup-cronjob.yaml`) |
| NATS subject | `todos-staging` | `todos-production` |
| Address | http://staging.localhost:8081 | http://localhost:8081 |

## How an update reaches the cluster

- **Staging (exercise 4.8 and 4.9):** a commit to `main` that changes app code runs `../.github/workflows/project.yaml`. It builds the images for amd64 and arm64, tags them with the commit SHA, pushes them to Docker Hub, sets the tags in `overlays/staging/kustomization.yaml` and commits the file. ArgoCD deploys `main` to staging. Commits that change only manifests are deployed by ArgoCD directly.
- **Production (exercise 4.9):** a pushed tag runs `../.github/workflows/project-production.yaml`. It builds the images of the tagged commit, sets the tags in `overlays/production/kustomization.yaml`, commits that on top of the tagged commit, and force-moves the branch `production` there. ArgoCD deploys the branch `production`.

The image builds need the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`. Without them the workflows skip the builds with a notice. The production branch still moves to each tagged commit.

## Run

Once per cluster: NATS (see [broadcaster](../broadcaster)) and ArgoCD (see [log_output](../log_output)). The database Secret is applied outside ArgoCD:

```sh
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt
for env in staging production; do
  kubectl create namespace $env
  sops --decrypt ../todo_backend/secrets/secret.enc.yaml | kubectl apply -n $env -f -
  kubectl apply -f ../argocd/project-$env.yaml
done
# without ArgoCD: kubectl apply -k overlays/staging (or overlays/production)
```
