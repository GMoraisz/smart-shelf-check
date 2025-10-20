# Smart Shelf Check

Sistema inteligente de verificação de preços com scanner QR/Barcode integrado.

## Características

- 🔐 Autenticação por email e telefone (SMS)
- 📱 Scanner de códigos QR e Barcode integrado
- 📊 Histórico de produtos escaneados
- 💡 Recomendações baseadas no histórico do utilizador
- 👤 Perfil de utilizador personalizado
- 🎨 Interface moderna e responsiva

## Tecnologias

- React + TypeScript
- Vite
- Supabase (Backend)
- Tailwind CSS
- Shadcn/ui
- html5-qrcode

## Rotas da Aplicação

- `/` - Dashboard principal (Home)
- `/scanner` - Scanner de códigos QR/Barcode
- `/historico` - Histórico de scans
- `/perfil` - Perfil do utilizador
- `/login` - Autenticação

## Estrutura do Projeto

```
src/
├── pages/
│   ├── Home.tsx          # Dashboard principal
│   ├── Scanner.tsx       # Scanner de códigos
│   ├── ScanHistory.tsx   # Histórico de scans
│   ├── Profile.tsx       # Perfil do utilizador
│   └── Login.tsx         # Autenticação
├── components/
│   ├── Layout.tsx        # Layout principal com navegação
│   ├── ProtectedRoute.tsx
│   └── ui/               # Componentes UI
├── contexts/
│   └── AuthContext.tsx   # Context de autenticação
└── integrations/
    └── supabase/         # Cliente Supabase
```

## Configuração do Supabase

### Tabelas Principais

1. **profiles** - Dados dos utilizadores
   - `id` (UUID, FK para auth.users)
   - `full_name` (TEXT)
   - `avatar_url` (TEXT)

2. **products** - Catálogo de produtos
   - `id` (BIGINT)
   - `name` (TEXT)
   - `barcode` (TEXT)
   - `price` (NUMERIC)
   - `stock` (BIGINT)
   - `image_url` (TEXT)
   - `description` (TEXT)

3. **scan_history** - Histórico de scans
   - `id` (BIGINT)
   - `user_id` (UUID)
   - `product_id` (BIGINT)
   - `created_at` (TIMESTAMP)

### Autenticação

Configure os providers no Supabase:
- **Email**: Para desenvolvimento, desabilite a confirmação de email
- **SMS**: Configure um provider (Twilio, MessageBird, etc.)

### RLS (Row Level Security)

Todas as tabelas possuem RLS ativo para proteger os dados dos utilizadores.

## Instalação e Execução

1. Clone o repositório
```bash
git clone <url-do-repo>
cd smart-shelf-check
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
As credenciais do Supabase já estão configuradas em `src/integrations/supabase/client.ts`

4. Execute em modo desenvolvimento
```bash
npm run dev
```

5. Build para produção
```bash
npm run build
```

## Deploy

O projeto está configurado para SPA routing com o arquivo `_redirects` na pasta `public`:
```
/* /index.html 200
```

Isso garante que todas as rotas funcionem corretamente após o deploy, inclusive ao dar refresh (F5).

## Funcionalidades

### Scanner
- Scanner de câmara em tempo real
- Entrada manual de códigos
- Suporta QR codes e códigos de barras
- Remove automaticamente o prefixo "qr-" dos códigos
- Busca automática de produtos na base de dados
- Registo automático no histórico

### Perfil
- Avatar com iniciais do nome
- Lista de produtos mais escaneados
- Recomendações personalizadas baseadas no histórico

### Histórico
- Lista completa de todos os scans realizados
- Ordenado por data (mais recentes primeiro)
- Informação detalhada de cada produto

---

Desenvolvido com ❤️ usando React e Supabase
