# 🚀 INÍCIO RÁPIDO - Sistema de Fila de Atendimento

## ⚡ Instalação Rápida (Windows)

### 1️⃣ Abra o PowerShell ou CMD na pasta do projeto

```powershell
cd C:\Users\seu_usuario\Documents\fila_atendimento
```

### 2️⃣ Instale as dependências (PRIMEIRA VEZ APENAS)

```powershell
npm install
```

### 3️⃣ Inicie o servidor

```powershell
npm start
```

Você verá uma mensagem como:
```
Servidor rodando em http://localhost:3000
√ Banco de dados conectado
```

---

## 🌐 Acesse as Interfaces

Abra seu navegador (Chrome, Firefox, Edge) e acesse:

| Interface | URL | Descrição |
|-----------|-----|-----------|
| 👤 Usuário | http://localhost:3000/usuario | Retirada de senha |
| 👨‍💼 Atendente | http://localhost:3000/atendente | Chamada de senhas |
| 📺 Painel Público | http://localhost:3000/painel | Exibição em TV |
| ⚙️ Admin | http://localhost:3000/admin | Gerenciamento |

---

## 🎮 Teste Agora Mesmo

### Para testar tudo funcionar:

1. **Abra 2 ou 3 navegadores/abas**
   - Aba 1: http://localhost:3000/usuario
   - Aba 2: http://localhost:3000/atendente
   - Aba 3: http://localhost:3000/painel

2. **Na Aba 1 (Usuário)**
   - Clique em um setor
   - Escolha tipo de atendimento
   - Uma senha será gerada

3. **Na Aba 2 (Atendente)**
   - Escolha um setor e mesa
   - Clique "Chamar Próxima"

4. **Na Aba 3 (Painel)**
   - A senha aparecerá no grande display

---

## 🔐 SENHA ADMINISTRATIVA

Para resetar as senhas no painel admin:

**Senha:** `SUA SENHA`

⚠️ **IMPORTANTE** ⚠️: Mude esta senha antes de usar em produção!

---

## 🛑 Parar o Servidor

Pressione `Ctrl + C` no PowerShell/CMD

---

## ❓ Problemas Comuns

### "Porta 3000 já está em uso"
```powershell
# Use outra porta
$env:PORT=3001; npm start
```

### "npm não reconhecido"
- Instale Node.js em https://nodejs.org/
- Reinicie o PowerShell/CMD

### Banco de dados com erro
```powershell
# Delete a pasta data e reinicie
Remove-Item data -Recurse -Force
npm start
```

---

## 📖 Para saber mais

Leia o arquivo `README.md` para documentação completa.

---

**🎉 Pronto para usar!**

