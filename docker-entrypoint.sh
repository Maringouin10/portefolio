#!/bin/sh
set -e

mkdir -p /app/data /app/storage/uploads

npx prisma migrate deploy

exec "$@"
