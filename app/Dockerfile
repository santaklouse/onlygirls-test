ARG ALPINE_VERSION=3.20

FROM node:20-alpine${ALPINE_VERSION} AS builder
WORKDIR /build-stage
COPY package*.json ./

RUN npm ci
COPY . ./
RUN npm run build

FROM php:8.2-fpm-alpine

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
    bash  \
    sqlite \
    npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql mbstring exif pcntl bcmath gd \
    && npm install -g npm@latest

COPY --from=builder /build-stage/node_modules /var/www/node_modules
COPY --from=builder /build-stage/public/ /var/www/public

ENV COMPOSER_HOME /composer
ENV PATH ./vendor/bin:/composer/vendor/bin:$PATH
ENV COMPOSER_ALLOW_SUPERUSER 1
RUN curl -s https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin/ --filename=composer

WORKDIR /var/www

COPY . /var/www
COPY --chown=www-data:www-data . /var/www

#USER www-data

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

RUN composer install

CMD npm install && npm run dev --host & composer install ; php artisan serve --host=0.0.0.0 --port=8080

EXPOSE 5173
EXPOSE 8080
