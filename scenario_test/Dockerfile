FROM node
RUN mkdir /scenario_test
COPY ./package.json /scenario_test/
WORKDIR /scenario_test
RUN npm install --production
COPY ./kafka_test.js /scenario_test
ENTRYPOINT [ "npm","run","start"]