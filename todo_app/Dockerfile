FROM node:22-alpine
WORKDIR /usr/src/app
COPY package.json index.js ./
ENV PORT=3000
USER node
CMD ["node", "index.js"]
