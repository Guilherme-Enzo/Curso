#!/bin/sh
set -eu

AUTO_PASSWORD="$(tr -d '\n' < /run/secrets/autoeletrica_db_password)"
FOTO_PASSWORD="$(tr -d '\n' < /run/secrets/fotoia_db_password)"

psql --set ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<SQL
CREATE ROLE autoeletrica LOGIN PASSWORD '${AUTO_PASSWORD}';
CREATE ROLE fotoia LOGIN PASSWORD '${FOTO_PASSWORD}';
CREATE DATABASE autoeletrica OWNER autoeletrica;
CREATE DATABASE fotoia OWNER fotoia;
SQL
