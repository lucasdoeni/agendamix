# AgendaMix — Plataforma de Agendamento Online para Beleza & Estética

Plataforma moderna, intuitiva e completa desenvolvida com **Frontend em React + Vite** e **Backend REST em Node.js / Express integrado ao banco de dados relacional MySQL**.

---

## 🏗️ Arquitetura do Projeto

O projeto foi dividido em duas pastas principais para garantir modularidade e facilitar a manutenção:

```
agendamix/
├── backend/                  # API REST em Node.js + Express + Multer + MySQL
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # Pool de conexões MySQL2 gerenciado por variáveis de ambiente
│   │   ├── controllers/      # Regras de negócio e persistência no banco
│   │   │   ├── adminController.js         # Gerenciamento administrativo e manutenção
│   │   │   ├── authController.js          # Autenticação de profissionais e clientes
│   │   │   ├── professionalsController.js # Catálogo e perfil completo
│   │   │   ├── servicesController.js      # Gerenciamento de procedimentos e serviços
│   │   │   ├── scheduleController.js      # Jornada de trabalho e bloqueios
│   │   │   ├── bookingsController.js      # Motor anti-conflito e reservas
│   │   │   └── uploadController.js        # Upload de imagens e avatars
│   │   ├── routes/           # Mapeamento de rotas HTTP REST
│   │   ├── database/
│   │   │   ├── schema.sql    # DDL com tabelas relacionais e chaves estrangeiras
│   │   │   └── seed.js       # População inicial de dados
│   │   ├── uploads/          # Armazenamento local de mídias enviadas
│   │   └── server.js         # Ponto de entrada Express
│   ├── .env.example          # Modelo de variáveis de ambiente
│   └── package.json
│
├── frontend/                 # Aplicação SPA em React + Vite + CSS Variables
│   ├── src/
│   │   ├── components/       # Componentes de UI, layout e agendamento
│   │   ├── context/          # Gerenciamento de estado global (Auth, Toast)
│   │   ├── pages/            # Telas da aplicação (Home, Explore, Painéis, etc.)
│   │   ├── services/         # Comunicação com a API REST e uploads
│   │   └── styles/           # Design system
│   └── package.json
│
├── iniciar.bat               # Inicializador rápido para desenvolvimento local
├── package.json              # Scripts npm centralizados
└── README.md
```

---

## 🗄️ Banco de Dados (MySQL)

- **Database:** `agendamix_db`
- **Charset:** `utf8mb4`
- **Tabelas Relacionais:**
  1. `professionals`: Dados cadastrais, bio, fotos, categorias e formas de pagamento.
  2. `clients`: Cadastro de clientes com autenticação segura.
  3. `services`: Procedimentos vinculados com preço e duração em minutos.
  4. `schedules`: Configuração semanal de horários, expediente e intervalos.
  5. `blocked_slots`: Bloqueios manuais pontuais de horários por data.
  6. `bookings`: Reservas de clientes com validação de conflito de horário.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- MySQL Server (v8.0+)
- Git

### 1. Configurar o Banco de Dados e Variáveis de Ambiente
1. Crie o banco de dados MySQL:
   ```sql
   CREATE DATABASE agendamix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Na pasta `backend/`, duplique o arquivo `.env.example` e renomeie para `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Preencha as credenciais do seu banco de dados no arquivo `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=seu_usuario_mysql
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=agendamix_db
   CLIENT_URL=http://localhost:5173
   ```

### 2. Inicialização Rápida (Windows)
Dê um duplo clique no arquivo **`iniciar.bat`** na raiz do projeto. Ele abrirá simultaneamente o backend na porta 5000 e o frontend na porta 5173.

### 3. Inicialização Manual via Terminal

#### Backend:
```bash
cd backend
npm install
npm run seed      # (Opcional) Popula dados de demonstração
npm run dev       # Inicia o servidor na porta 5000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev       # Inicia a aplicação na porta 5173
```

Acesse a aplicação no navegador em: **`http://localhost:5173`**

---

## 🛡️ Segurança e Boas Práticas

- Variáveis de ambiente e credenciais locais são estritamente excluídas do controle de versão via `.gitignore`.
- Senhas de usuários e clientes são criptografadas utilizando `bcryptjs` antes de serem armazenadas no banco de dados.
- Uploads de fotos são sanitizados no backend com geração de identificadores únicos para evitar sobreposição ou injeção de arquivos maliciosos.
