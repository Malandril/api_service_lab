FROM node
RUN mkdir /catalog
COPY ./package.json /catalog/
WORKDIR /catalog
RUN npm install --production
COPY ./src /catalog
ENTRYPOINT [ "node","server.js"]