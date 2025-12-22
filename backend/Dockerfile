FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p public/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5006

EXPOSE 5006

CMD ["npm", "start"]