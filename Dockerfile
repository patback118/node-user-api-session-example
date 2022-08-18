FROM node:14
WORKDIR /tests-backend
COPY ./package.json .
RUN npm install
COPY . .
CMD npm start