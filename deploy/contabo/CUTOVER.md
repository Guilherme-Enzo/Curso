# Sincronizacao final e cutover

Status: concluido em 18/09/2026. Este arquivo preserva apenas o registro do
procedimento; nao deve ser executado novamente.

## Preparacao

1. Reduzir o TTL dos registros DNS para 300 segundos com antecedencia.
2. Configurar Caddy na Contabo sem alterar o DNS publico.
3. Testar os dois sites por resolucao local ou tunel SSH.
4. Executar e validar um backup da Contabo.
5. Criar uma chave temporaria exclusiva para a copia Azure para Contabo.
6. Avisar os usuarios sobre a janela sem gravacoes.

## Congelamento na Azure

1. Impedir novos acessos de escrita ou ativar uma pagina de manutencao.
2. Parar `autoeletrica.service` e `fotoia.service`.
3. Gerar novos dumps com `pg_dump -Fc` para `autoeletrica` e `fotoia`.
4. Sincronizar os dois diretorios `public/uploads` com `rsync`.
5. Registrar checksums dos dumps e contagens dos uploads.

Os servicos devem permanecer parados ate a decisao de concluir ou reverter o
corte. Isso impede que Azure e Contabo recebam gravacoes diferentes.

## Restauracao na Contabo

1. Parar somente os containers `autoeletrica` e `fotoia`.
2. Restaurar os dumps finais no PostgreSQL da Contabo.
3. Confirmar proprietarios, tabelas, usuarios, modulos e contagens.
4. Ajustar a propriedade dos uploads para UID/GID `1001:1001`.
5. Iniciar os sites e aguardar os healthchecks.
6. Testar pagina inicial, `/fotoia`, APIs, login, sessao, PDF e escrita.

As sessoes antigas podem exigir novo login porque a Contabo usa outro
`JWT_SECRET`. As senhas dos usuarios e seus hashes permanecem no banco.

## Publicacao

1. Abrir as portas 80 e 443 no UFW somente quando Caddy estiver pronto.
2. Alterar os registros DNS para a Contabo.
3. Confirmar certificados TLS validos e redirecionamento HTTP para HTTPS.
4. Repetir os testes pelas URLs publicas em desktop e celular.
5. Monitorar logs, uso de disco, banco e respostas 5xx.
6. Remover a chave temporaria de migracao.

## Pos-corte

1. A Contabo e o unico ambiente operacional.
2. Confirmar diariamente os backups local e externo.
3. Rotacionar chaves de API e demais credenciais que tenham sido expostas.
4. Nao religar ou sincronizar o ambiente legado.
