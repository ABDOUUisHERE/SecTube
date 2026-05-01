FROM node:20-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
RUN mkdir -p uploads videos thumbnails avatars streams
EXPOSE 5000 1935
CMD ["node", "src/server.js"]
