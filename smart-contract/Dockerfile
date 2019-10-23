FROM node:alpine

WORKDIR /home/app

# Get and install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn --frozen-lockfile --non-interactive --production

# Copy the actual code
COPY . .
RUN chown 1000:1000 -R /home/app

USER 1000:1000
