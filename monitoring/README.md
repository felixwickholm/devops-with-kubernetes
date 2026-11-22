# Monitoring

Prometheus, Loki, Alloy (k8s-monitoring chart) and Grafana, installed with Helm into the namespace `monitoring`. The values files follow the course material, with two changes so the stack fits a local k3d cluster:

- `loki-values.yaml` lowers the chunks cache memory to 256 MB (the default asks for about 8 GB).
- `prom-values.yaml` also disables the Prometheus pushgateway subchart.
- `grafana-values.yaml` has no admin password; the chart generates one into the Secret `grafana`.

## Run

```sh
./install.sh
kubectl get pods --namespace monitoring
kubectl -n monitoring get secret grafana -o jsonpath='{.data.admin-password}' | base64 -d; echo
kubectl port-forward --namespace monitoring svc/grafana 3000:80
# open http://localhost:3000, log in as admin
```

In Explore, pick Loki and query `{namespace="project"} |= "Rejected"` to see todos that the backend blocked (exercise 2.10):

![Rejected todos in Grafana](grafana-rejected-todos.png)

## Prometheus query (exercise 4.3)

```sh
kubectl port-forward svc/prom-prometheus-server -n monitoring 9090:80
# open http://localhost:9090
```

Number of pods created by StatefulSets in the namespace where Prometheus runs (`monitoring`):

```promql
count(kube_pod_info{namespace="monitoring", created_by_kind="StatefulSet"})
```

The value is 3 (`loki-0`, `loki-chunks-cache-0`, `loki-results-cache-0`):

![StatefulSet pods in Prometheus](prometheus-statefulset-pods.png)
