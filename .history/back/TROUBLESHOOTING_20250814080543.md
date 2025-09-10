# ❗ Problemas Comuns no Cadastro - Lista de Verificação

## 🔍 Diagnóstico dos Problemas no Cadastro

### 1. **Verificar se MySQL está rodando**
```bash
# No Windows, verifique se o serviço MySQL está ativo
# Você pode verificar nos serviços do Windows ou tentar conectar via MySQL Workbench
```

### 2. **Verificar se o banco de dados existe**
```sql
-- Execute no MySQL Workbench ou linha de comando do MySQL:
SHOW DATABASES;
-- Deve aparecer 'micro_midia' na lista

-- Se não existir, crie o banco:
CREATE DATABASE micro_midia;
```

### 3. **Verificar se as tabelas existem**
```sql
USE micro_midia;
SHOW TABLES;
-- Deve mostrar: usuarios, postagens, comentarios, curtidas, negocios

-- Se não existir, execute o arquivo SQL completo:
-- c:\Users\anna_\Desktop\micromidiaaa\front\SQL\micro_midia.sql
```

### 4. **Verificar configurações no .env**
Arquivo: `c:\Users\anna_\Desktop\micromidiaaa\back\.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Se sua instalação MySQL tem senha, coloque aqui
DB_NAME=micro_midia
JWT_SECRET=sua_chave_secreta_jwt_aqui_mude_em_producao
PORT=3000
```

### 5. **Testar conexão manual com MySQL**
Você pode testar se consegue conectar ao MySQL usando:
- MySQL Workbench
- Linha de comando: `mysql -u root -p`
- phpMyAdmin (se estiver usando XAMPP/WAMP)

### 6. **Verificar logs do servidor**
O servidor agora tem logs detalhados. Quando tentar cadastrar, os logs aparecerão no terminal onde o servidor está rodando.

## 🚀 Soluções Rápidas

### Solução 1: Se MySQL não estiver instalado
- Instale XAMPP (inclui MySQL): https://www.apachefriends.org/
- Ou instale MySQL Community Server: https://dev.mysql.com/downloads/mysql/

### Solução 2: Se o banco não existir
Execute este comando no MySQL:
```sql
SOURCE c:/Users/anna_/Desktop/micromidiaaa/front/SQL/micro_midia.sql;
```

### Solução 3: Se a senha do MySQL for diferente
Atualize o arquivo `.env` com a senha correta:
```
DB_PASSWORD=sua_senha_mysql
```

### Solução 4: Teste manual via curl
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Teste\",\"email\":\"teste@exemplo.com\",\"senha\":\"123456\"}"
```

## 📋 Próximos Passos

1. Abra o MySQL Workbench ou phpMyAdmin
2. Verifique se o banco `micro_midia` existe
3. Se não existir, execute o script SQL
4. Teste o cadastro novamente
5. Verifique os logs no terminal do servidor

## 🆘 Se ainda houver problemas

Compartilhe a mensagem de erro específica que aparece quando tenta cadastrar, e eu posso ajudar a resolver.
