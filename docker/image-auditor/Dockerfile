FROM node:14.16.1

RUN apt-get update && \ 
   apt-get install -y nano

COPY src /opt/app/

CMD ["node", "/opt/app/auditor.js"]