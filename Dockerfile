FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
EXPOSE 8000
RUN npm install
COPY . .
CMD ["node", "server.js"]
