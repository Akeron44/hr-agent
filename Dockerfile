
FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate


COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev:all"]