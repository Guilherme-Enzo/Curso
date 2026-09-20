# Deploy na Contabo

Arquivos de infraestrutura dos sites AutoEletrica e Retrato Imaginado. Nenhum segredo deve
ser salvo neste diretorio.

Ambiente oficial:

- AutoEletrica: `https://autoeletrica.cgialabs.com.br`
- Retrato Imaginado: `https://retratoimaginado.cgialabs.com.br`
- DNS/proxy: Cloudflare
- Proxy de origem e HTTPS: Caddy com Let's Encrypt
- A Azure esta desativada e nao participa da operacao.

A configuracao versionada do proxy esta em `Caddyfile`. Na instalacao ela deve
ser validada e instalada em `/etc/caddy/Caddyfile` antes do reload.

## Caminhos do servidor

- Codigo: `/srv/apps/curso`
- Compose dos sites: `/srv/stacks/sites/sites.compose.yaml`
- Compose do Portainer: `/srv/stacks/portainer/compose.yaml`
- Dados persistentes: `/srv/data`
- Segredos: `/srv/secrets`
- Backups: `/srv/backups`

Os sites ficam vinculados somente a `127.0.0.1` e sao publicados pelo Caddy.

## Backup

O timer executa diariamente por volta das 03:30, mantem sete dias de backups e
possui `Persistent=true`. Cada backup contem dumps PostgreSQL, uploads e
checksums. Uma copia externa ainda deve ser configurada para proteger contra a
perda total da VPS.

O procedimento de recuperacao operacional esta em
`/srv/backups/README-RESTORE.txt` no servidor e em `RESTORE.md` neste
repositorio. O procedimento da migracao final esta em `CUTOVER.md`.
