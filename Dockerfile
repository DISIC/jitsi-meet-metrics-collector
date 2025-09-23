FROM node:bookworm

WORKDIR .

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["nest", "start"]