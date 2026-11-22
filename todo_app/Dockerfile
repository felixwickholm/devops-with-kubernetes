FROM node:22-alpine
WORKDIR /usr/src/app
COPY package.json index.js ./
RUN mkdir files && chown node:node files
ENV PORT=3000
USER node
CMD ["node", "index.js"]
