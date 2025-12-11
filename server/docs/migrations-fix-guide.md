# Guia: Corrigindo Tabela \_prisma_migrations Vazia

## Problema

A tabela `_prisma_migrations` está vazia, o que significa que o Prisma não tem registro de que as migrações foram aplicadas ao banco de dados.

## Causas Possíveis

1. **Banco criado manualmente**: O banco foi criado usando `prisma db push` ou SQL direto, sem usar `prisma migrate deploy`
2. **Migrações nunca executadas**: As migrações foram criadas mas nunca aplicadas ao banco
3. **Tabela criada mas nunca populada**: A tabela `_prisma_migrations` foi criada mas os registros nunca foram inseridos

## Soluções

### Solução 1: Se o banco já tem todas as tabelas (criado manualmente)

Se você já tem todas as tabelas do schema no banco, mas a tabela `_prisma_migrations` está vazia, você precisa marcar a migração como aplicada:

```bash
# Encontrar o nome da migração mais recente
ls prisma/migrations

# Marcar a migração como aplicada (substitua NOME_DA_MIGRACAO)
npx prisma migrate resolve --applied NOME_DA_MIGRACAO

# Exemplo:
npx prisma migrate resolve --applied 20251204133513_
```

### Solução 2: Se o banco não tem as tabelas

Se o banco não tem as tabelas, execute as migrações:

```bash
# Aplicar todas as migrações pendentes
npm run prisma:migrate:deploy

# Ou diretamente:
npx prisma migrate deploy
```

### Solução 3: Usar o script automatizado

Execute o script que diagnostica e corrige automaticamente:

```bash
npm run migrate:fix

# Ou diretamente:
node scripts/fix-migrations.js
```

## Verificação

Após aplicar a solução, verifique se a tabela foi populada:

```sql
SELECT * FROM _prisma_migrations;
```

Você deve ver pelo menos um registro com o nome da migração e a data de aplicação.

## Prevenção

Para evitar esse problema no futuro:

1. **Sempre use migrações**: Use `prisma migrate dev` para desenvolvimento e `prisma migrate deploy` para produção
2. **Não use `prisma db push` em produção**: Este comando não registra migrações na tabela `_prisma_migrations`
3. **Verifique antes de fazer deploy**: Execute `npm run migrate:validate` antes de aplicar migrações

## Comandos Úteis

```bash
# Validar migrações
npm run migrate:validate

# Criar backup antes de migrar
npm run migrate:backup

# Executar migração segura (com backup e validação)
npm run migrate:safe

# Aplicar migrações em produção
npm run prisma:migrate:deploy

# Ver status das migrações
npx prisma migrate status
```
