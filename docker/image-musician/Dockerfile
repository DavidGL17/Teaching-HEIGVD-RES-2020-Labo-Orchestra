FROM node:14.16.1

RUN apt-get update && \ 
   apt-get install -y nano

COPY src /opt/app/
WORKDIR /opt/app

ENTRYPOINT ["node", "musician.js"]