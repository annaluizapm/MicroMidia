# 🎯 MicroMidia

Uma plataforma social focada em marketing digital e micro-empresas, oferecendo ferramentas de diagnóstico e um fórum colaborativo para empreendedores.

## 📋 Sobre o Projeto

MicroMidia é uma aplicação web full-stack que conecta empreendedores e oferece:
- **Fórum interativo** para discussões sobre marketing digital
- **Sistema de diagnóstico** personalizado para empresas
- **Perfis de usuário** com upload de fotos
- **Gestão de postagens** e interações sociais

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **Multer** - Upload de arquivos
- **dotenv** - Gerenciamento de variáveis de ambiente

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização responsiva
- **JavaScript (Vanilla)** - Interatividade e comunicação com API
- **Fetch API** - Requisições HTTP

## 📁 Estrutura do Projeto

```
MicroMidia/
├── back/                   # Backend da aplicação
│   ├── server.js          # Servidor principal
│   ├── db_config.js       # Configuração do banco
│   ├── package.json       # Dependências do backend
│   └── SQL/
│       └── micro_midia.sql # Schema do banco de dados
├── front/                  # Frontend da aplicação
│   ├── HTML/              # Páginas HTML
│   │   ├── index.html     # Página inicial
│   │   ├── login.html     # Login de usuários
│   │   ├── cadastro.html  # Cadastro de usuários
│   │   ├── feed.html      # Feed/Fórum de postagens
│   │   ├── busca.html     # Busca de conteúdo
│   │   ├── usuarios.html  # Listagem de usuários
│   │   ├── perfil.html    # Perfil do usuário
│   │   ├── formulario.html # Diagnóstico de marketing
│   │   └── chat.html      # Chat entre usuários
│   ├── CSS/               # Estilos
│   │   ├── style.css      # Estilos principais
│   │   ├── feed.css       # Estilos do feed
│   │   ├── perfil.css     # Estilos do perfil
│   │   ├── usuarios.css   # Estilos da página de usuários
│   │   ├── busca.css      # Estilos da busca
│   │   ├── chat.css       # Estilos do chat
│   │   ├── formulario.css # Estilos do formulário
│   │   └── logincadastro.css # Estilos de login/cadastro
│   ├── JS/                # Scripts JavaScript
│   │   ├── script.js      # Funcionalidades principais
│   │   ├── perfil.js      # Funcionalidades do perfil
│   │   ├── header.js      # Funcionalidades compartilhadas do header
│   │   ├── formulario.js  # Funcionalidades do diagnóstico
│   │   └── debug.js       # Utilitários de debug
│   └── assets/            # Recursos estáticos
│       └── Logo.png       # Logo da aplicação
├── uploads/               # Arquivos de upload (criado automaticamente)
├── .env                   # Variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md             # Este arquivo
```

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- MySQL (v8 ou superior)
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/annaluizapm/MicroMidia.git
cd MicroMidia
```

### 2. Configure o banco de dados
1. Crie um banco de dados MySQL chamado `micro_midia`
2. Execute o script SQL localizado em `back/SQL/micro_midia.sql`

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=micro_midia

# Configurações do Servidor
PORT=3002
NODE_ENV=development

# Configurações de Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 4. Instale as dependências
```bash
cd back
npm install
```

### 5. Execute a aplicação
```bash
npm start
```

A aplicação estará disponível em: `http://127.0.0.1:3002`

## 🎯 Funcionalidades

### 👤 Gestão de Usuários
- [x] Cadastro de novos usuários
- [x] Login e autenticação
- [x] Upload de foto de perfil
- [x] Edição de perfil

### 💬 Fórum
- [x] Criação de postagens
- [x] Visualização de postagens
- [x] Sistema de usuários interativo

### 📊 Diagnóstico de Marketing
- [x] Formulário de avaliação empresarial
- [x] Recomendações personalizadas
- [x] Análise de presença digital

### 🔧 Sistema
- [x] API RESTful completa
- [x] Upload seguro de arquivos
- [x] Validação de dados
- [x] Tratamento de erros

## 🔌 Endpoints da API

### Usuários
```
GET    /api/usuarios        # Listar todos os usuários
POST   /api/usuarios        # Criar novo usuário
GET    /api/usuarios/:id    # Buscar usuário por ID
PUT    /api/usuarios/:id    # Atualizar usuário
DELETE /api/usuarios/:id    # Deletar usuário
POST   /api/usuarios/:id/foto        # Upload de foto (multipart)
POST   /api/usuarios/:id/foto-base64 # Upload de foto (base64)
```

### Postagens
```
GET    /api/postagens       # Listar todas as postagens
POST   /api/postagens       # Criar nova postagem
PUT    /api/postagens/:id   # Atualizar postagem
DELETE /api/postagens/:id   # Deletar postagem
```

### Sistema
```
GET    /api/test           # Teste de conectividade
GET    /                   # Página inicial da aplicação
```

## 🗄️ Banco de Dados

### Tabela: usuarios
- `id` - Chave primária auto-incremento
- `nome` - Nome do usuário (VARCHAR 100)
- `email` - Email único (VARCHAR 255)
- `senha` - Senha do usuário (VARCHAR 255)
- `bio` - Biografia (TEXT)
- `foto_perfil` - URL da foto (VARCHAR 500)
- `criado_em` - Data de criação (TIMESTAMP)

### Tabela: postagens
- `id` - Chave primária auto-incremento
- `usuario_id` - Referência ao usuário (FK)
- `titulo` - Título da postagem (VARCHAR 255)
- `conteudo` - Conteúdo (TEXT)
- `criado_em` - Data de criação (TIMESTAMP)

## 🛡️ Segurança

- Validação de tipos de arquivo no upload
- Sanitização de dados de entrada
- Proteção contra SQL injection
- Headers CORS configurados
- Limitação de tamanho de arquivo (5MB)

## 🚀 Deploy

### Opções de Deploy
1. **Heroku** - Para aplicações Node.js
2. **Vercel** - Para frontend estático
3. **DigitalOcean** - Para VPS completo
4. **AWS** - Para infraestrutura escalável

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
DB_HOST=seu_host_producao
DB_USER=usuario_producao
DB_PASSWORD=senha_producao
PORT=80
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👩‍💻 Autor

**Anna Luiza** - [@annaluizapm](https://github.com/annaluizapm)

## 🔗 Links Úteis

- [Repositório no GitHub](https://github.com/annaluizapm/MicroMidia)
- [Documentação do Express.js](https://expressjs.com/)
- [Documentação do MySQL](https://dev.mysql.com/doc/)

---

⭐ **Gostou do projeto? Deixe uma estrela no repositório!**
