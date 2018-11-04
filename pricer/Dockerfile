FROM node
RUN export NODE_ENV=production
RUN mkdir /pricer
COPY ./package.json /pricer/
COPY ./env.json /
WORKDIR /pricer
RUN npm install --production
COPY ./src /pricer
COPY ./env.json /
ENTRYPOINT [ "node","server.js"]