# 🚀 Portal Drift Brasil

Sistema completo de plataforma educacional para cursos de drift, com painel administrativo, gamificação e catálogo de peças.

## 🌐 Deploy Atual: (Frontend + Backend)

**Status:** ✅ Pronto para produção
**Última atualização:** $(Get-Date -Format "dd/MM/yyyy HH:mm") - Deploy HostGator configurado

### 📋 Pré-requisitos HostGator

- ✅ Node.js 18+ instalado
- ✅ PM2 instalado globalmente
- ✅ PostgreSQL ou MySQL no cPanel
- ✅ Plano com pelo menos 2GB RAM

## 🚀 Deploy Automático

### Opção 1: Script Automático (Recomendado)

```bash
# 1. Verificar se tudo está pronto
chmod +x verificar-deploy.sh
./verificar-deploy.sh

# 2. Executar deploy (no servidor HostGator)
chmod +x deploy-hostgator-simples.sh
./deploy-hostgator-simples.sh
```

### Opção 2: Passo a Passo

```bash
# Upload dos arquivos para public_html/ via FTP/cPanel
# Conectar via SSH no servidor

cd public_html
npm install --production
npx prisma generate
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

## 🔍 Verificação

```bash
# Status da aplicação
pm2 status

# Logs da aplicação
pm2 logs portal-drift-brasil

# Teste online
curl https://portal.klaus-driftbrasil.com.br/api/health
```

## 📁 Estrutura de Arquivos

```
public_html/
├── server.js                 # Servidor Node.js
├── ecosystem.config.js       # Config PM2
├── .env.production          # Variáveis ambiente
├── package.json             # Dependências
├── prisma/                  # Schema banco
├── src/                     # Código fonte
└── public/                  # Arquivos estáticos
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar banco local
cp .env.example .env
# Editar DATABASE_URL no .env

# Gerar Prisma client
npx prisma generate

# Executar migrações
npx prisma db push

# Iniciar servidor desenvolvimento
npm run dev
```

## 📚 Documentação

- 📖 **[Guia Completo HostGator](DEPLOY_HOSTGATOR_COMPLETO.md)**
- 📋 **[Checklist Deploy](CHECKLIST_DEPLOY_HOSTGATOR.md)**
- 🔧 **[Solução de Problemas](DEPLOY_HOSTGATOR_COMPLETO.md#troubleshooting)**

## 🌐 URLs de Produção

- **Site:** https://portal.klaus-driftbrasil.com.br
- **Admin:** https://portal.klaus-driftbrasil.com.br/admin
- **API:** https://portal.klaus-driftbrasil.com.br/api/

## 📞 Suporte

Para dúvidas sobre deploy ou configuração, consulte:
1. `CHECKLIST_DEPLOY_HOSTGATOR.md`
2. `DEPLOY_HOSTGATOR_COMPLETO.md`
3. Logs do PM2: `pm2 logs portal-drift-brasil`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
