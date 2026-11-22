# Todo CronJob (course project)

A CronJob that runs every hour. It asks `https://en.wikipedia.org/wiki/Special:Random` for a random article, reads the redirect `Location`, and creates the todo `Read <URL>` with `POST /todos` in the [todo backend](../todo_backend).

## Run

```sh
docker build -t felixwickholm/todo-cronjob:2.9 .
docker push felixwickholm/todo-cronjob:2.9
kubectl apply -f manifests
# run it once now instead of waiting for the next hour:
kubectl -n project create job --from=cronjob/wikipedia-todo-cronjob wikipedia-todo-manual
kubectl -n project logs job/wikipedia-todo-manual
```
