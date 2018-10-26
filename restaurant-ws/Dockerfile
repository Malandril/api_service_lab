FROM node
RUN mkdir /restaurant-ws
COPY ./package.json /restaurant-ws/
WORKDIR /restaurant-ws
RUN npm install --production
COPY ./index.js /restaurant-ws
ENTRYPOINT [ "node","index.js"]