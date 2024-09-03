ARG ALPINE_VERSION=3.20

FROM node:20-alpine${ALPINE_VERSION} AS builder
WORKDIR /build-stage
COPY package*.json ./

RUN npm ci
COPY . ./
RUN npm run build

FROM php:8.2-fpm-alpine

WORKDIR /var/www

RUN apk add --no-cache \
    build-base \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    curl \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql mbstring exif pcntl bcmath gd

RUN apk add --update bash  sqlite supervisor npm && npm install -g npm@latest

# Копируем файлы приложения
COPY . .

# Устанавливаем Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY --from=builder /build-stage/node_modules ./node_modules
COPY --from=builder /build-stage/public/ ./public

# Устанавливаем зависимости проекта через Composer
RUN composer install --no-dev --optimize-autoloader

EXPOSE 5173
EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=8080
