#!/bin/bash
# Adds the exercise link to README.md (sorted by number), commits, pushes main, tags and creates the GitHub release.
# usage: scripts/release-exercise.sh <exercise> <title> <folder>
#   e.g. scripts/release-exercise.sh 3.1 "Pingpong GKE" ping_pong
set -euo pipefail
ex=$1; title=$2; folder=$3
cd "$(git rev-parse --show-toplevel)"
python3 - "$ex" "$title" "$folder" <<'PY'
import sys, re
ex, title, folder = sys.argv[1:]
s = open("README.md").read()
start = s.index("## Exercises\n") + len("## Exercises\n")
end = s.index("\n## ", start)
lines = [l for l in s[start:end].splitlines() if l.startswith("- [")]
lines = [l for l in lines if not l.startswith(f"- [{ex}]")]
lines.append(f"- [{ex}](https://github.com/felixwickholm/devops-with-kubernetes/tree/{ex}/{folder}) {title}")
key = lambda l: tuple(int(n) for n in re.match(r"- \[(\d+)\.(\d+)\]", l).groups())
lines.sort(key=key)
s = s[:start] + "\n" + "\n".join(lines) + "\n" + s[end:]
open("README.md", "w").write(s)
PY
git add -A
git commit -q -m "$ex $title"
git pull -q --rebase origin main
git push -q origin HEAD:main
git tag "$ex"
git push -q origin "$ex"
gh release create "$ex" --verify-tag --title "$ex" --notes "Exercise $ex: $title. Folder: $folder" >/dev/null
echo "released $ex -> https://github.com/felixwickholm/devops-with-kubernetes/releases/tag/$ex"
