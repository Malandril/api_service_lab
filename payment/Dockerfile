FROM node
RUN export NODE_ENV=production
RUN mkdir /payment
COPY ./package.json /payment/
COPY ./env.json /
WORKDIR /payment
RUN npm install --production
COPY ./src /payment
COPY ./env.json /
ENTRYPOINT [ "node","server.js"]