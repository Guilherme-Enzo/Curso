# Restauracao

Os backups diarios ficam em `/srv/backups/daily/AAAAmmddTHHMMSSZ/`.

Cada pasta contem os dumps PostgreSQL, os uploads dos dois sites e o arquivo
`SHA256SUMS`. Os comandos abaixo substituem os dados atuais. Confira o caminho
selecionado antes de executar a restauracao.

## Restaurar bancos e uploads

```bash
BACKUP=/srv/backups/daily/AAAAmmddTHHMMSSZ
sudo sha256sum -c "$BACKUP/SHA256SUMS"

sudo docker compose -f /srv/stacks/sites/sites.compose.yaml stop autoeletrica fotoia

sudo docker exec cursos-postgres psql -U postgres -c \
  "DROP DATABASE autoeletrica WITH (FORCE);"
sudo docker exec cursos-postgres psql -U postgres -c \
  "CREATE DATABASE autoeletrica OWNER autoeletrica;"
sudo sh -c "docker exec -i cursos-postgres pg_restore --exit-on-error --no-owner --role=autoeletrica -U postgres -d autoeletrica < '$BACKUP/autoeletrica.dump'"

sudo docker exec cursos-postgres psql -U postgres -c \
  "DROP DATABASE fotoia WITH (FORCE);"
sudo docker exec cursos-postgres psql -U postgres -c \
  "CREATE DATABASE fotoia OWNER fotoia;"
sudo sh -c "docker exec -i cursos-postgres pg_restore --exit-on-error --no-owner --role=fotoia -U postgres -d fotoia < '$BACKUP/fotoia.dump'"

sudo mv /srv/data/autoeletrica/uploads /srv/data/autoeletrica/uploads.before-restore
sudo tar -xzf "$BACKUP/autoeletrica-uploads.tar.gz" -C /srv/data/autoeletrica
sudo chown -R 1001:1001 /srv/data/autoeletrica/uploads

sudo mv /srv/data/fotoia/uploads /srv/data/fotoia/uploads.before-restore
sudo tar -xzf "$BACKUP/fotoia-uploads.tar.gz" -C /srv/data/fotoia
sudo chown -R 1001:1001 /srv/data/fotoia/uploads

sudo docker compose -f /srv/stacks/sites/sites.compose.yaml up -d autoeletrica fotoia
sudo docker compose -f /srv/stacks/sites/sites.compose.yaml ps
```

Mantenha os diretorios `*.before-restore` ate validar os dois sites.

## Limite do backup local

O backup atual fica no mesmo disco da VPS. Ele protege contra exclusao e erros
da aplicacao, mas nao contra perda total do servidor. Uma copia externa deve ser
configurada antes do corte de producao.
