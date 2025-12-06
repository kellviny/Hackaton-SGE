# Sistema de Gestão de E-mails (SGE) - Hackaton IFPI 2025

![Status](https://img.shields.io/badge/Status-Finalizado-success)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue)
![License](https://img.shields.io/badge/License-ISC-lightgrey)

O **SGE (Sistema de Gestão de E-mails)** é uma solução desenvolvida durante o **Hackaton do Curso de TADS - IFPI Campus Piripiri**. O objetivo do sistema é centralizar, organizar e classificar e-mails comerciais, permitindo que colaboradores e gestores tenham uma visão analítica das demandas recebidas por localização geográfica.

---

## Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração e Instalação](#-configuração-e-instalação)
- [Configurando a API do Google (Gmail)](#-configurando-a-api-do-google-gmail)
- [Documentação da API](#-documentação-da-api)
- [Banco de Dados](#-banco-de-dados)
- [Autores](#-autores)

---

## 📖 Sobre o Projeto

Em muitas empresas, o controle de e-mails enviados a clientes é descentralizado. O **SGE** resolve isso atuando como um "hub" central.
1.  **Captura:** Colaboradores enviam e-mails com cópia (CC) para a conta monitorada pelo sistema.
2.  **Processamento:** O sistema captura automaticamente essas mensagens via API do Gmail.
3.  **Classificação:** Um operador acessa o sistema para indicar o **Estado (UF)** e **Município** de origem da demanda.
4.  **Inteligência:** O sistema gera gráficos e relatórios para tomada de decisão.

---

## Funcionalidades Principais

### 1. Integração Automática com Gmail
* **Sincronização em Background:** Utiliza `node-cron` para verificar a caixa de entrada a cada **20 minutos**.
* **Tratamento de Mensagens:**
    * Filtra apenas e-mails não lidos (`is:unread`).
    * Remove a flag "Não Lida" após a importação para evitar duplicidade.
    * Verifica se o e-mail já existe no banco de dados antes de inserir.
* **Sincronização Manual:** Botão no painel para forçar a busca imediata de novos e-mails.

### 2. Dashboard Analítico (KPIs)
* **Cards de Status:** Visualização rápida do Total de E-mails, Pendentes e Classificados.
* **Gráfico de Barras (Estados):** Ranking visual dos estados com maior volume de demandas.
* **Gráfico de Linha (Tendência):** Evolução do recebimento de e-mails nos últimos 7 dias.
* **Top 3 Destinatários:** Lista dos clientes que mais demandam atenção.

### 3. Gestão de Pendências (Fluxo de Trabalho)
* **Tabela de Classificação:** Interface ágil para definir Estado e Cidade de múltiplos e-mails.
* **Integração IBGE:** Ao selecionar um Estado, o sistema busca automaticamente as cidades correspondentes via API pública do IBGE.
* **Ação em Lote:** Botão "Salvar Tudo" para processar várias classificações de uma única vez.

### 4. Histórico e Auditoria
* **Busca Avançada:** Filtros por Remetente, Destinatário, Assunto ou Localização.
* **Filtros Temporais:** Seleção de e-mails por data específica.
* **Visualização Detalhada:** Modal para leitura do corpo completo da mensagem.
* **Exportação:** Capacidade de exportar o histórico filtrado para CSV.
* **Exclusão:** Remoção de registros incorretos ou obsoletos.

### 5. Cadastro Manual
* Formulário para registrar demandas que chegaram por outros canais (telefone, WhatsApp), mantendo a centralização dos dados.

---

## Arquitetura e Tecnologias

O projeto segue o padrão **MVC (Model-View-Controller)** adaptado para uma API RESTful consumida por um Frontend estático.

### Backend (Server-Side)
* **Runtime:** [Node.js](https://nodejs.org/) (ES Modules).
* **Framework:** [Express.js](https://expressjs.com/) v5.x.
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Driver `pg`).
* **Integração Gmail:** `googleapis` (OAuth2).
* **Agendamento:** `node-cron`.
* **Variáveis de Ambiente:** `dotenv`.

### Frontend (Client-Side)
* **Linguagens:** HTML5, CSS3, JavaScript (Vanilla ES6+).
* **Bibliotecas:** [Chart.js](https://www.chartjs.org/) para gráficos.
* **Estilização:** CSS nativo com variáveis (Custom Properties) e Design Responsivo.

---

## Estrutura de Pastas

```text
hackaton-sge/
├── public/                 # Arquivos estáticos (Frontend)
│   ├── app.js              # Lógica da aplicação cliente (SPA)
│   ├── index.html          # Interface única (Dashboard/Tabelas/Form)
│   └── styles.css          # Folhas de estilo
├── src/                    # Código fonte do Backend
│   ├── config/
│   │   └── db.js           # Configuração de conexão com PostgreSQL (SSL)
│   ├── controllers/        # Controladores (Email e Localização)
│   ├── data/
│   │   └── states.js       # Dados estáticos de UF para performance
│   ├── models/             # Camada de acesso a dados (Queries SQL)
│   ├── routes/             # Rotas da API (Express Router)
│   ├── services/           # Regras de Negócio e Integrações (Gmail/Email)
│   ├── utils/
│   │   └── seed.js         # Script para popular banco com dados falsos
│   ├── app.js              # Configuração do App Express (Middlewares)
│   ├── cron.js             # Definição dos Jobs agendados
│   └── server.js           # Entry point do servidor (Porta/Listen)
├── .env                    # Credenciais (NÃO COMMITAR)
└── package.json            # Dependências do projeto

Pré-requisitosPara rodar este projeto localmente, você precisará de:Node.js (v18 ou superior) instalado.PostgreSQL instalado e rodando (ou acesso a um banco na nuvem como Render/Neon).Uma conta Google Cloud Platform ativa para configurar a API do Gmail.⚙️ Configuração e Instalação1. Clonar o RepositórioBashgit clone [https://github.com/seu-usuario/hackaton-sge.git](https://github.com/seu-usuario/hackaton-sge.git)
cd hackaton-sge
2. Instalar DependênciasBashnpm install
3. Configurar Variáveis de AmbienteCrie um arquivo .env na raiz do projeto. Copie o modelo abaixo e preencha com seus dados:Ini, TOML# Configuração do Servidor
PORT=3000

# Banco de Dados (PostgreSQL)
# Exemplo local: postgres://user:senha@localhost:5432/sge_db
# Exemplo nuvem: postgres://user:senha@host.render.com/sge_db?sslmode=require
DATABASE_URL=sua_string_de_conexao_aqui

# Integração Google (Gmail API)
GOOGLE_CLIENT_ID=seu_client_id_do_gcp
GOOGLE_CLIENT_SECRET=seu_client_secret_do_gcp
GOOGLE_REDIRECT_URI=[https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
GOOGLE_REFRESH_TOKEN=seu_refresh_token_obtido
4. Inicializar o Banco de DadosO sistema cria a tabela emails automaticamente ao iniciar, caso ela não exista. Certifique-se apenas de que o banco de dados (database) apontado na URL já esteja criado.5. Rodar o ProjetoModo de Desenvolvimento (com Nodemon):Bashnpm start
O servidor estará rodando em: http://localhost:3000Popular com Dados de Teste (Seed):Se quiser testar o dashboard sem esperar e-mails reais:Bashnode src/utils/seed.js

Configurando a API do Google (Gmail)Para que a sincronização funcione, siga estes passos:
Acesse o Google Cloud Console.
Crie um novo Projeto.Vá em APIs & Services > Library e ative a Gmail API.Vá em APIs & Services > OAuth consent screen:Selecione External.
Adicione o seu próprio e-mail como Test User.
Vá em Credentials > Create Credentials > OAuth Client ID.Tipo: Web Application.Authorized redirect URIs: https://developers.google.com/oauthplaygroundCopie o Client ID e Client Secret para o seu .env.Acesse o OAuth 2.0 Playground:Em configurações (engrenagem), marque "Use your own OAuth credentials" e cole seus ID/Secret.
Em "Input your own scopes", digite: https://www.googleapis.com/auth/gmail.modifyClique em "Authorize APIs" e faça login com a conta de e-mail que será monitorada.
Clique em "Exchange authorization code for tokens".
Copie o Refresh Token gerado para o seu .env.📚 Documentação da APIA aplicação expõe uma API REST consumida pelo frontend.
Endpoints de E-mailMétodoRotaDescrição
GET/api/emailsRetorna todos os e-mails (histórico).
GET/api/emails/pendingRetorna apenas e-mails não classificados.
GET/api/emails/classifiedRetorna apenas e-mails classificados.
GET/api/emails/syncDispara a sincronização manual com o Gmail.
POST/api/emailsCria um novo e-mail (Cadastro Manual).
PUT/api/emails/:id/classifyAtualiza estado e cidade de um e-mail.DELETE/api/emails/:idRemove um registro do banco de dados.

Endpoints de LocalizaçãoMétodoRotaDescrição
GET/api/location/statesLista todos os estados (UF) disponíveis.
GET/api/location/cities/:stateLista cidades de um estado específico.

Banco de DadosTabela principal: emailsSQLCREATE TABLE IF NOT EXISTS emails (
  id BIGINT PRIMARY KEY,              -- ID único (Timestamp ou ID do Gmail)
  sender VARCHAR(255) NOT NULL,       -- Remetente
  recipient VARCHAR(255) NOT NULL,    -- Destinatário
  subject VARCHAR(255),               -- Assunto
  body TEXT,                          -- Corpo da mensagem
  date TIMESTAMP WITH TIME ZONE,      -- Data de envio
  state VARCHAR(5),                   -- UF (Classificação)
  city VARCHAR(255),                  -- Cidade (Classificação)
  classified BOOLEAN DEFAULT false    -- Status
);
