FROM node
RUN mkdir /statistics
COPY ./package.json /statistics/
WORKDIR /statistics
RUN npm install --production
COPY ./src /statistics
ENTRYPOINT [ "node","server.js"]