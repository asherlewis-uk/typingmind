#!/bin/bash
set -e

# NexumChat Self-Hosted Setup Script
# Run after first `docker compose up -d --build`

echo "=== NexumChat Self-Hosted Setup ==="

# Load environment
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DOMAIN=${DOMAIN:-nexumchat.yourdomain.com}

echo ""
echo "Waiting for services to be healthy..."
sleep 5

# Check API health
echo ""
echo "Checking API health..."
if docker compose ps | grep -q api; then
  echo "API container is running."
else
  echo "WARNING: API container not found. Check logs with: docker compose logs api"
  exit 1
fi

# Check databases
echo ""
echo "Checking MySQL..."
docker compose exec -T mysql mysql -u nexumchat -p"${MYSQL_PASSWORD}" -e "SELECT 1" nexumchat >/dev/null 2>&1 && echo "MySQL OK" || echo "MySQL not ready yet (this is normal on first boot)"

echo ""
echo "Checking PostgreSQL..."
docker compose exec -T postgres psql -U nexumchat -c "SELECT 1" >/dev/null 2>&1 && echo "PostgreSQL OK" || echo "PostgreSQL not ready yet (this is normal on first boot)"

echo ""
echo "Checking MinIO..."
docker compose exec -T minio mc alias set local http://localhost:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" >/dev/null 2>&1 || true
if docker compose exec -T minio mc ls local/${MINIO_BUCKET} >/dev/null 2>&1; then
  echo "MinIO bucket '${MINIO_BUCKET}' exists."
else
  echo "MinIO bucket not found. The API should auto-create it on first startup."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Ensure your domain DNS points to this server."
echo "  2. Ensure Caddyfile domain matches: ${DOMAIN}"
echo "  3. Verify config: curl https://${DOMAIN}/config.json"
echo "  4. Verify health:  curl https://${DOMAIN}/api/health"
echo ""
