FROM node:16

ENV API_KEY
ENV SHEET_ID

ENV PRIV_KEY
ENV PUB_KEY

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "yarn", "start", "--private-key", "$PRIV_KEY", "--data", "test.eth.json", "--sheet", "$SHEET_ID" ]
