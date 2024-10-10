FROM dunglas/frankenphp:1.0-php8.3

RUN install-php-extensions \
    @composer \
    pcntl \
    gd \
    intl \
    bcmath \
    intl \
    pdo \
    pdo_mysql \
    mbstring \
    opcache \
    apcu \
    exif

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN cp $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini; \
    sed -i 's/variables_order = "GPCS"/variables_order = "EGPCS"/' $PHP_INI_DIR/php.ini;

ENTRYPOINT ["/bin/sh", "-c" , "composer install && php artisan octane:frankenphp --caddyfile=./Caddyfile --workers=8 --max-requests=500 --server=frankenphp --host=localhost --port=80 --admin-port=2019"]
