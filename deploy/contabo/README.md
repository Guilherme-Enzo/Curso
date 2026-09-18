# Deploy na Contabo

Arquivos de infraestrutura dos sites AutoEletrica e FotoIA. Nenhum segredo deve
ser salvo neste diretorio.

## Caminhos do servidor

- Codigo: `/srv/apps/curso`
- Compose dos sites: `/srv/stacks/sites/sites.compose.yaml`
- Compose do Portainer: `/srv/stacks/portainer/compose.yaml`
- Dados persistentes: `/srv/data`
- Segredos: `/srv/secrets`
- Backups: `/srv/backups`

Os sites ficam vinculados somente a `127.0.0.1`. A publicacao deve ser feita por
um proxy reverso com HTTPS.

## Backup

O timer executa diariamente por volta das 03:30, mantem sete dias de backups e
possui `Persistent=true`. Cada backup contem dumps PostgreSQL, uploads e
checksums. Uma copia externa ainda deve ser configurada para proteger contra a
perda total da VPS.

O procedimento de recuperacao operacional esta em
`/srv/backups/README-RESTORE.txt` no servidor.
