FROM node
RUN mkdir /restaurant
COPY ./package.json /restaurant/
WORKDIR /restaurant
RUN npm install --production
COPY ./src /restaurant
ENTRYPOINT [ "node","server.js"]