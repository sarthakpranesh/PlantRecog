FROM debian:bullseye as builder

ARG NODE_VERSION=16.17.0
ARG YARN_VERSION=1.22.19

RUN apt-get update; apt install -y curl
RUN apt install -y python3
RUN apt install -y build-essential
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION} yarn@${YARN_VERSION}

#######################################################################

RUN mkdir /app
WORKDIR /app

# Yarn will not install any package listed in "devDependencies" when NODE_ENV is set to "production"
# to install all modules: "yarn install --production=false"
# Ref: https://classic.yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-production-true-false

ENV NODE_ENV production

COPY . .

RUN yarn
FROM debian:bullseye

LABEL fly_launch_runtime="nodejs"

COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app /app

WORKDIR /app
ENV NODE_ENV production
ENV PATH /root/.volta/bin:$PATH

CMD [ "yarn", "run", "start" ]
