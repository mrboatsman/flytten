# En bild för både webbappen och uppdateringsjobbet.
#   Webb:  docker run -p 3000:3000 -e DATABASE_URL=... <image>
#   Jobb:  docker run -e DATABASE_URL=... -e ANTHROPIC_API_KEY=... <image> npm run jobb:uppdatering
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
# Jobbet körs med tsx direkt mot källfilerna och delar databaslagret i src/lib.
COPY jobs ./jobs
COPY src ./src
EXPOSE 3000
ENV PORT=3000
USER node
CMD ["node", "build"]
