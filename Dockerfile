FROM node:14-alpine

WORKDIR /home
COPY *.js /home/

CMD [ "/home/app.js" ]
