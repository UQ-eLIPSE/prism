FROM node:16-alpine

# Create a temporary work directory

WORKDIR /var/www/server

RUN apk add openssh

# Install packages

# Creating a temporary admin folder so we can build our node_modules

RUN mkdir -p /tmp/server

RUN mkdir /root/.ssh/

ADD package.json /tmp/server/

# Use the key used for Manta

ADD ./tmp/id_rsa /root/.ssh/

RUN cd /tmp/server && yarn

RUN cd /var/www/server && ln -s /tmp/server/node_modules

RUN npm i -g manta

CMD /bin/bash -c "source /root/.bashrc"

RUN eval $(ssh-agent -s)

# Copy code

ADD . /var/www/server

ENTRYPOINT cd /var/www/server && yarn watch

