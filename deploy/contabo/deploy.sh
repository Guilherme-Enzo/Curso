#!/usr/bin/env bash
set -euo pipefail

echo "=== Deploy Contabo $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

cd /srv/apps/curso

# 1. Backup antes de qualquer coisa
echo "[1/7] Backup pre-deploy..."
/usr/local/sbin/backup-cursos || true

# 2. Pull das alterações
echo "[2/7] Git pull..."
git fetch origin main
git reset --hard origin/main

# 3. Copiar Caddyfile e aplicar
echo "[3/7] Atualizar Caddy..."
cp deploy/contabo/Caddyfile /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy

# 4. Copiar Compose e aplicar
echo "[4/7] Atualizar Docker Compose..."
cp deploy/contabo/sites.compose.yaml /srv/stacks/sites/sites.compose.yaml

# 5. Build das imagens
echo "[5/7] Build Docker..."
cd /srv/stacks/sites
docker compose -f sites.compose.yaml build --no-cache

# 6. Aplicar migration SQL
echo "[6/7] Prisma migrate..."
docker compose -f sites.compose.yaml exec -T autoeletrica npx prisma migrate deploy
docker compose -f sites.compose.yaml exec -T fotoia npx prisma migrate deploy

# 7. Restart dos containers
echo "[7/7] Restart containers..."
docker compose -f sites.compose.yaml up -d --force-recreate

# 8. Validação
echo "=== Validacao ==="
sleep 10
echo "AutoEletrica:" && curl -sk -o /dev/null -w "%{http_code}" https://autoeletrica.cgialabs.com.br/
echo ""
echo "Retrato Imaginado:" && curl -sk -o /dev/null -w "%{http_code}" https://retratoimaginado.cgialabs.com.br/
echo ""
echo "API AutoEletrica:" && curl -sk -o /dev/null -w "%{http_code}" https://autoeletrica.cgialabs.com.br/api/modules/public
echo ""
echo "API FotoIA:" && curl -sk -o /dev/null -w "%{http_code}" https://retratoimaginado.cgialabs.com.br/api/modules/public
echo ""

# 9. Status
docker compose -f sites.compose.yaml ps

echo "=== Deploy concluido ==="
