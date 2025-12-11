# Aviso do npm: `--production` está depreciado

## Problema

O npm está mostrando o seguinte aviso:

```
npm warn config production Use `--omit=dev` instead.
```

## Solução

### O que foi feito

1. **Arquivo `.npmrc` criado**: Configura o npm para usar `omit=dev` por padrão
2. **Scripts atualizados**: Adicionados scripts `install:prod` e `install:dev` no `package.json`

### Como usar

#### Instalação de produção (sem dependências de desenvolvimento)

```bash
# Nova sintaxe (recomendada)
npm install --omit=dev

# Ou use o script criado
npm run install:prod
```

#### Instalação completa (com dependências de desenvolvimento)

```bash
# Sintaxe padrão
npm install

# Ou use o script criado
npm run install:dev
```

## Nota

Este aviso é apenas informativo e não quebra a funcionalidade. A flag `--production` ainda funciona, mas está sendo depreciada em favor de `--omit=dev`.

## Referência

- [Documentação do npm sobre omit](https://docs.npmjs.com/cli/v9/using-npm/config#omit)
- [Changelog do npm v7+](https://github.com/npm/cli/blob/latest/CHANGELOG.md)
