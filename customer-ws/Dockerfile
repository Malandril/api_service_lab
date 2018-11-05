FROM node
RUN mkdir /customer-ws
COPY ./package.json /customer-ws/
WORKDIR /customer-ws
RUN npm install --production
COPY ./src /customer-ws
ENTRYPOINT [ "node","index.js"]