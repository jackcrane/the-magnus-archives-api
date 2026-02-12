#!/usr/bin/env bash
set -euo pipefail

PGDATA=${PGDATA:-/var/lib/postgresql/data}
export POSTGRES_USER=${POSTGRES_USER:-postgres}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
export POSTGRES_DB=${POSTGRES_DB:-tma}

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
fi

PG_VERSION_DIR=$(ls /usr/lib/postgresql | sort -Vr | head -n1)
PG_BIN="/usr/lib/postgresql/${PG_VERSION_DIR}/bin"

init_needed=false
if [ ! -s "${PGDATA}/PG_VERSION" ]; then
  init_needed=true
fi

mkdir -p "${PGDATA}"
chown -R postgres:postgres "$(dirname "${PGDATA}")" "${PGDATA}"

if [ "${init_needed}" = true ]; then
  su - postgres -c "${PG_BIN}/initdb -D ${PGDATA}"
  echo "listen_addresses='localhost'" >> "${PGDATA}/postgresql.conf"
  echo "host all all 127.0.0.1/32 md5" >> "${PGDATA}/pg_hba.conf"
  echo "host all all ::1/128 md5" >> "${PGDATA}/pg_hba.conf"
fi

su - postgres -c "${PG_BIN}/pg_ctl -D ${PGDATA} -w start"

if [ "${init_needed}" = true ]; then
  su - postgres -c "${PG_BIN}/psql -c \"ALTER USER ${POSTGRES_USER} PASSWORD '${POSTGRES_PASSWORD}';\""
  su - postgres -c "${PG_BIN}/createdb ${POSTGRES_DB}"
fi

yarn build_db
node processTranscripts.js

exec yarn start
