# 🔧 GUIA DE DESENVOLVIMENTO

## Arquitetura do Projeto

### Backend (Node.js + Express)
- `server.js` - Servidor principal e rotas da API
- `database.js` - Gerenciador de banco de dados SQLite

### Frontend (HTML + CSS + JavaScript)
- `usuario.html/css/js` - Interface para retirada de senha
- `atendente.html/css/js` - Interface do atendente
- `painel.html/css/js` - Painel público exibição
- `admin.html/css/js` - Painel administrativo
- `styles.css` - Estilos globais e variáveis CSS

---

## 🔄 Fluxo de Dados

```
Usuario retira senha
    ↓
API POST /api/gerar-senha
    ↓
Banco registra senha
    ↓
Socket.IO emite 'nova-senha'
    ↓
Atendente vê na interface
    ↓
Atendente clica "Chamar Próxima"
    ↓
API POST /api/proxima-senha
    ↓
Socket.IO emite 'senha-chamada'
    ↓
Painel Público atualiza
```

---

## 📝 ENDPOINTS DA API

### Gerar Senha
```
POST /api/gerar-senha
Body: { setor: 'ouvidoria', tipo: 'normal' }
Returns: { senha, setor, tipo, filaAtual }
```

### Próxima Senha
```
POST /api/proxima-senha
Body: { mesa: 1, setor: 'ouvidoria' }
Returns: { senha, tipo, mesa, setor }
```

### Chamar Específica
```
POST /api/chamar-senha-especifica
Body: { senhaNumero: 'A001', mesa: 1, setor: 'ouvidoria' }
```

### Senhas Recentes
```
GET /api/senhas-recentes
Returns: [{ numero, setor, mesa }, ...]
```

### Painel Atual
```
GET /api/painel-atual
Returns: { numero, setor, mesa }
```

### Resetar Senhas
```
POST /api/resetar-senhas
Body: { senha: 'AGR.Senhas' }
```

### Histórico
```
GET /api/historico
Returns: [{ numero, setor, tipo, mesa, tempo_espera }, ...]
```

---

## 🎨 VARIÁVEIS CSS

Edite em `styles.css` na seção `:root`:

```css
--cor-primaria: #2563eb;           /* Cor principal */
--cor-primaria-escura: #1e40af;    /* Tons de primária */
--cor-primaria-clara: #dbeafe;
--cor-secundaria: #10b981;         /* Cor secundária */
--cor-alerta: #f59e0b;             /* Alertas */
--cor-perigo: #ef4444;             /* Ações perigosas */
```

---

## 📱 MEDIA QUERIES

Breakpoints utilizados:
- `1024px` - Tablets
- `768px` - Tablets pequenos
- `480px` - Celulares

---

## 🔐 SEGURANÇA

### Pontos de Atenção:

1. **Senha Admin**: Está hardcoded em `server.js`
   - Localize: `if (senha !== 'SUA SENHA')`
   - Mude para seu ambiente de produção

2. **CORS**: Está aberto para qualquer origem
   - Edite em `server.js`: `cors({ ... })`

3. **Validação**: Implemente validação robusta
   - Verifique entrada do usuário
   - Sanitize dados

---

## 🚀 MELHORIAS FUTURAS

### Curto Prazo
- [ ] Adicionar autenticação para atendentes
- [ ] Exportar relatórios em PDF
- [ ] Gráficos de tempo de espera
- [ ] Sistema de login para admin

### Médio Prazo
- [ ] Múltiplos servidores com load balancing
- [ ] Cache em Redis
- [ ] Notificações via SMS/WhatsApp
- [ ] Dashboard com analytics

### Longo Prazo
- [ ] Aplicativo mobile nativo
- [ ] Integração com RH/CRM
- [ ] Machine learning para previsão de tempo
- [ ] API pública para terceiros

---

## 🧪 TESTES

Para adicionar testes com Jest/Mocha:

```bash
npm install --save-dev jest
npm install --save-dev mocha chai
```

Estrutura sugerida:
```
tests/
  ├── api.test.js
  ├── database.test.js
  └── socket.test.js
```

---

## 📦 DEPLOY

### Heroku

1. Criar `Procfile`:
```
web: node server.js
```

2. Deploy:
```bash
heroku create app-name
git push heroku main
```

### DigitalOcean / VPS

1. SSH into server
2. `git clone repo`
3. `npm install`
4. `npm start` ou usar PM2

### Docker

Criar `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔍 DEBUGGING

### Logs

Adicione logs debug:
```javascript
console.log('[DEBUG]', variavel);
console.error('[ERROR]', erro);
console.warn('[WARN]', aviso);
```

### DevTools

- Abra F12 no navegador
- Aba "Network" para checar requisições
- Aba "Console" para erros JavaScript
- Aba "Application" para localStorage

### Server Logs

Erros aparecem no terminal onde rodou `npm start`

---

## 🤝 CONTRIBUINDO

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcao`)
3. Commit mudanças (`git commit -m 'Add nova funcao'`)
4. Push para a branch (`git push origin feature/nova-funcao`)
5. Abra Pull Request

---

## 📚 RECURSOS

- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [SQLite3 Node](https://github.com/mapbox/node-sqlite3)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 📞 SUPORTE TÉCNICO

Para dúvidas:
1. Verifique a documentação (README.md)
2. Confira console do navegador (F12)
3. Verifique logs do servidor

---

**Happy coding! 🚀**

