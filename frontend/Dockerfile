FROM node:12 as builder

RUN mkdir -p /build
WORKDIR /build

COPY package.json package-lock.json .eslintrc.js .eslintignore .prettierignore .prettierrc.js /build/
RUN npm ci
COPY . /build
RUN npm run build-next

FROM node:12-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json server.js /app/
RUN npm ci --only=production
COPY --from=builder /build/.next /app/.next
COPY /public /app/public

USER node

EXPOSE 3000
CMD ["npm", "run", "start-next-prod"]
