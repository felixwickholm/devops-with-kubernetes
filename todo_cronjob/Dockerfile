FROM alpine:3.20
RUN apk add --no-cache curl
COPY create-todo.sh /usr/local/bin/create-todo.sh
USER nobody
CMD ["create-todo.sh"]
