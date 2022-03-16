FROM node:16-alpine

# Create a temporary work directory
WORKDIR /var/www/server

# Install packages
# Creating a temporary admin folder so we can build our node_modules
RUN mkdir -p /tmp/server

ADD package.json /tmp/server/

RUN cd /tmp/server && yarn

RUN cd /var/www/server && ln -s /tmp/server/node_modules

# Copy code
ADD . /var/www/server
ENTRYPOINT cd /var/www/server && yarn watch