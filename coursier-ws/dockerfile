FROM node
RUN mkdir /coursier-ws
COPY ./package.json /coursier-ws/
WORKDIR /coursier-ws
RUN npm install --production
COPY ./index.js /coursier-ws
ENTRYPOINT [ "node","index.js"]