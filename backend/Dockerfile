# Dockerfile - Backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]


#RUN npm install --omit=dev
