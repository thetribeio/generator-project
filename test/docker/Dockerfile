FROM node:14.17.1

RUN userdel node

ARG UID
RUN useradd --non-unique --uid $UID --create-home user
USER user

WORKDIR /usr/src/project/test

ENV PATH="/usr/src/project/test/node_modules/.bin:${PATH}"

CMD ["yarn", "start"]
