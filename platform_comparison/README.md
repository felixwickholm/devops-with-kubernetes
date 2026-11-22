# Platform comparison: Rancher vs OpenShift

Exercise 5.5. I chose Rancher as the "better" platform and argue for it against OpenShift.

## Rancher is better

- **Works with the Kubernetes you already have.** Rancher manages any CNCF-conformant cluster: EKS, GKE, AKS, on-premises clusters, and its own RKE2 and K3s. OpenShift is its own distribution, so you adopt the whole OpenShift stack.
- **One place for many clusters.** Rancher is built for multi-cluster management: access control, policies, monitoring and app catalogs for all clusters from one UI. OpenShift needs Advanced Cluster Management (an extra product) for the same.
- **Less lock-in.** Rancher deploys standard Kubernetes resources (Deployment, Ingress, Helm charts). OpenShift adds its own objects (Route, DeploymentConfig, BuildConfig, ImageStream), and manifests that use them do not move easily to other clusters.
- **Lighter and cheaper to start.** Rancher and K3s are open source and free; paid support (Rancher Prime) is optional. OpenShift needs a subscription priced per core, and its control plane needs more hardware. (OKD is the free community version, but without Red Hat support.)
- **Good for the edge.** K3s from the Rancher family runs on small machines like a Raspberry Pi. This course uses K3s through k3d. OpenShift has edge options too, but they are heavier.
- **Easy to learn from standard Kubernetes skills.** Everything I learned in this course with kubectl, Helm and plain manifests applies directly in Rancher.

## Where OpenShift is stronger (and why it still loses here)

- **More built in for developers:** Source-to-Image builds, OpenShift Pipelines (Tekton), GitOps (Argo CD), an internal image registry and a developer console. But teams can add the same tools to Rancher-managed clusters as standard components (for example Argo CD and GitHub Actions, as in this course).
- **Stricter security by default:** containers do not run as root, Security Context Constraints, and integrated OAuth. Rancher can reach the same level with Pod Security Admission, policies and NeuVector, but you must turn it on.
- **One vendor for the whole stack:** Red Hat supports everything from the operating system (RHEL CoreOS) to the platform. This is valuable for large regulated companies, but it costs more and gives less choice.

## Verdict

Rancher wins for most teams because it gives central management of standard Kubernetes clusters anywhere, with less cost and less lock-in. OpenShift is the better fit only when a company wants one vendor and a complete, opinionated developer platform and is ready to pay for it.
