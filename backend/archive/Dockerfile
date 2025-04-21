FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "main.js"]

# docker rm --force gemc && docker build -t gem . &&  docker run --name gemc -p 8000:8000 -t gem