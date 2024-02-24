FROM debian:bullseye as builder

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        python3 \
        wget \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.17.0

# Install nvm with node and npm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm install --global yarn@${YARN_VERSION}

#######################################################################

RUN mkdir /app
WORKDIR /app

# Yarn will not install any package listed in "devDependencies" when NODE_ENV is set to "production"
# to install all modules: "yarn install --production=false"
# Ref: https://classic.yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-production-true-false

ENV NODE_ENV production

COPY . .

RUN yarn

# COPY --from=builder /usr/local/nvm /usr/local/nvm
# COPY --from=builder /app /app

# WORKDIR /app
ENV NODE_ENV production

CMD [ "yarn", "run", "start" ]
