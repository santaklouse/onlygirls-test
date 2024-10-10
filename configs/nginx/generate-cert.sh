#!/bin/bash

SSL_DIR="/etc/nginx/ssl"

# Создаем директорию для сертификатов, если она не существует
mkdir -p "$SSL_DIR"

# Генерируем самоподписанный сертификат, если его нет
if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/key.pem" ]; then
    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost"
fi

# Запускаем Nginx
nginx -g "daemon off;"
