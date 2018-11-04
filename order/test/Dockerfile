FROM node
RUN mkdir /test
COPY ./package.json /test/
WORKDIR /test
RUN npm install --production
COPY ./test.js /test
ENTRYPOINT [ "node","test.js"]