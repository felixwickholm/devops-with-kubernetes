# Wikipedia with init and sidecar

One pod with three containers that share an `emptyDir` volume (the public www directory of nginx):

- init container `fetch-kubernetes-page` (curl) saves https://en.wikipedia.org/wiki/Kubernetes as `index.html` before nginx starts
- main container `nginx` serves whatever is in the directory
- sidecar `random-page-sidecar` (curl) waits a random time between 5 and 15 minutes, saves a random article from https://en.wikipedia.org/wiki/Special:Random as `index.html`, and repeats

No custom image is needed. The wait range comes from `MIN_WAIT_SECONDS` and `MAX_WAIT_SECONDS`.

## Run

```sh
kubectl apply -f ../log_output/manifests/namespace.yaml
kubectl apply -f manifests
# open http://wikipedia.localhost:8081
kubectl -n exercises logs deploy/wikipedia-dep -c random-page-sidecar -f
```

Quick test with short waits:

```sh
kubectl -n exercises set env deploy/wikipedia-dep -c random-page-sidecar MIN_WAIT_SECONDS=5 MAX_WAIT_SECONDS=10
```
