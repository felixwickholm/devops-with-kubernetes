# DevOps with Kubernetes 2026 (University of Helsinki MOOC)

Exercise submissions for https://courses.mooc.fi/org/uh-cs/courses/devops-with-kubernetes-2026

Each exercise has a GitHub release named after its number. The links below point to that release and the folder for the exercise.

## Exercises

- [1.1](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.1/log_output) Getting started
- [1.2](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.2/todo_app) The project, step 1
- [1.3](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.3/log_output) Declarative approach
- [1.4](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.4/todo_app) The project, step 2
- [1.5](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.5/todo_app) The project, step 3
- [1.6](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.6/todo_app) The project, step 4
- [1.7](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.7/log_output) External access with Ingress
- [1.8](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.8/todo_app) The project, step 5
- [1.9](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.9/ping_pong) More services
- [1.10](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.10/log_output) Even more services
- [1.11](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.11/log_output) Persisting data (also ping_pong, volumes)
- [1.12](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.12/todo_app) The project, step 6
- [1.13](https://github.com/felixwickholm/devops-with-kubernetes/tree/1.13/todo_app) The project, step 7
- [2.1](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.1/log_output) Connecting pods (also ping_pong)
- [2.2](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.2/todo_app) The project, step 8 (also todo_backend)
- [2.3](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.3/log_output) Keep them separated (also ping_pong)
- [2.4](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.4/todo_app) The project, step 9 (also todo_backend)
- [2.5](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.5/log_output) Documentation and ConfigMaps
- [2.6](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.6/todo_app) The project, step 10 (also todo_backend)
- [2.7](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.7/ping_pong) Stateful applications
- [2.8](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.8/todo_backend) The project, step 11
- [2.9](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.9/todo_cronjob) The project, step 12
- [2.10](https://github.com/felixwickholm/devops-with-kubernetes/tree/2.10/todo_backend) The project, step 13 (also monitoring)
- [4.1](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.1/ping_pong) Readiness probe (also log_output)
- [4.2](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.2/todo_app) The project, step 21 (also todo_backend)
- [4.3](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.3/monitoring) Prometheus
- [4.4](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.4/ping_pong) Your canary
- [4.5](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.5/todo_app) The project, step 22 (also todo_backend)
- [4.6](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.6/broadcaster) The project, step 23 (also todo_backend)
- [4.7](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.7/log_output) Baby steps to GitOps (also argocd, .github/workflows)
- [4.8](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.8/project) The project, step 24 (also argocd, .github/workflows)
- [4.9](https://github.com/felixwickholm/devops-with-kubernetes/tree/4.9/project) The project, step 25 (also argocd, .github/workflows)
- [4.10](https://github.com/felixwickholm/devops-with-kubernetes-config/tree/4.10) The project, the grande finale (configuration repository; code in this repository at tag 4.10)
- [5.1](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.1/dummysite) DIY CRD & Controller
- [5.2](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.2/istio) Getting started with Istio service mesh
- [5.3](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.3/greeter) Log app, the Service Mesh Edition (also log_output)
- [5.4](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.4/wikipedia_app) Wikipedia with init and sidecar
- [5.5](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.5/platform_comparison) Platform comparison
- [5.6](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.6/knative) Trying serverless
- [5.7](https://github.com/felixwickholm/devops-with-kubernetes/tree/5.7/ping_pong_serverless) Deploy to serverless

## Notes

- Chapter 4 (exercises 3.1 to 3.12) needs Google Kubernetes Engine and is not done yet.
- The project configuration (Kubernetes manifests, environments, ArgoCD Applications) is in the separate repository https://github.com/felixwickholm/devops-with-kubernetes-config (exercise 4.10). This repository has the code and the image build workflows.
- Everything else runs on a local k3d cluster (`k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2`). Each app folder has a README with the commands.
- Secrets are only in the repository as SOPS (age) encrypted files (`*/secrets/secret.enc.yaml`). The age key is not in the repository.
- `scripts/release-exercise.sh` adds an exercise link here and creates the tag and the release.

## How AI was used

The course allows LLM tools ("Using LLM:s", Chapter 1). I directed an AI coding agent (Claude) to write and debug the apps and Kubernetes configs, and I take responsibility for the result.
