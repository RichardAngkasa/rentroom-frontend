# BUILDER STAGE
FROM node:18-alpine AS builder

# INSTALL PNPM
RUN npm install -g pnpm

WORKDIR /app

# DEPENDENCY FILES
COPY package*.json ./
COPY pnpm-lock.yaml ./

# INSTALL DEPENDENCIES
RUN pnpm install

# BUILD
COPY . .
RUN pnpm run build

# PRODUCTION STAGE  
FROM nginx:stable-alpine

# COPY BUILT FILES
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80