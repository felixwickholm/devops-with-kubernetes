#!/bin/sh
# Creates a "Read <URL>" todo with a random Wikipedia article.
set -eu

: "${RANDOM_ARTICLE_URL:?missing}"
: "${TODO_BACKEND_URL:?missing}"

ARTICLE_URL=$(curl -s -o /dev/null -A "dwk-todo-cronjob/1.0" -w '%{redirect_url}' "$RANDOM_ARTICLE_URL")
if [ -z "$ARTICLE_URL" ]; then
  echo "No redirect from $RANDOM_ARTICLE_URL" >&2
  exit 1
fi

echo "Creating todo: Read $ARTICLE_URL"
curl -s -f -X POST -H 'Content-Type: application/json' \
  -d "{\"todo\": \"Read $ARTICLE_URL\"}" "$TODO_BACKEND_URL"
echo
