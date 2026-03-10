# ❓ FAQ - Perguntas Frequentes

## Instalação e Setup

### P: Como instalar o projeto?
**R:** Abra o PowerShell na pasta do projeto e execute:
```powershell
npm install
npm start
```
Ou simplesmente dê duplo clique em `iniciar.bat`

### P: Node.js não está reconhecido
**R:** Instale Node.js em https://nodejs.org/
Escolha a versão LTS (recomendada)
Reinicie o computador depois

### P: Posso usar outra porta?
**R:** Sim! Execute:
```powershell
$env:PORT=3001; npm start
```

### P: Posso usar em outro computador?
**R:** Sim! Use o IP do computador:
- Mesmo WiFi: `http://[IP]:3000/usuario`
- Para saber seu IP: `ipconfig` no PowerShell

---

## Uso e Operação

### P: Qual é a senha do admin?
**R:** `AGR.Senhas`
⚠️ **Mude em produção!**

### P: Como mudo a senha do admin?
**R:** Edite `server.js`, linha com:
```javascript
if (senha !== 'AGR.Senhas')
```

### P: Como adiciono novos setores?
**R:** Edite `usuario.html` e `database.js`
Veja [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md)

### P: Posso rodar sem som?
**R:** Sim, sons são auxiliares. Se tiver erro, verifique permissão de áudio do navegador.

### P: Como reinicio senhas do dia?
**R:** Vá para http://localhost:3000/admin
Digite `AGR.Senhas` em "Resetar Todos os Dados"

### P: Onde as senhas são salvas?
**R:** Em `data/fila.db` (banco SQLite)
Esse arquivo é criado automaticamente

---

## Temas e Personalização

### P: Como mudo a cor primária?
**R:** 
Opção 1 (Admin):
- Vá a http://localhost:3000/admin
- Altere a "Cor Primária"

Opção 2 (CSS):
- Edite `public/styles.css`
- Altere `--cor-primaria: #2563eb;`

### P: Como adiciono um logotipo?
**R:**
1. Vá para http://localhost:3000/admin
2. Cole a URL da imagem em "Logotipo"
3. Clique "Aplicar"

### P: Las cores não estão mudando?
**R:** Limpe cache:
- Windows: Ctrl+Shift+Del
- Mac: Cmd+Shift+Del

---

## Problemas Técnicos

### P: "Porta 3000 já está em uso"
**R:** 
Opção 1: Use outra porta (3001, 3002...)
Opção 2: Feche o programa usando porta 3000
```powershell
netstat -ano | findstr :3000    # Descobre qual processo
taskkill /PID [numero] /F       # Mata o processo
```

### P: Navegador diz "Conexão recusada"
**R:**
1. Servidor está rodando?
2. Porta está correta?
3. Verifique se é http:// (não https://)

### P: Console mostra erros JavaScript
**R:** Abra F12 > Console e copie o erro
Procure a solução em [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md)

### P: Senhas não aparecem no painel
**R:**
1. Verifique se há senhas na fila (usuário/usuario)
2. Confirme que atendente chamou (atendente.js)
3. Revise Socket.IO (F12 > Network)

### P: Som não toca
**R:**
1. Verifique volume do PC
2. Verifique se navegador permite áudio
3. Teste em outro navegador

---

## Banco de Dados

### P: Como faço backup dos dados?
**R:** Copie o arquivo `data/fila.db` para outro local

### P: Como restauro um backup?
**R:** Cole o arquivo `fila.db` de volta em `data/`

### P: Como apago tudo e começo do zero?
**R:**
```powershell
Remove-Item data -Recurse -Force
npm start
```

### P: Quantas senhas pode armazenar?
**R:** Teoricamente ilimitado (SQLite suporta GB de dados)

---

## Performance e Escalabilidade

### P: Funciona com muitos usuários?
**R:** Sim! Socket.IO é otimizado para isso
Recomendado até ~1000 usuários simultâneos
Para mais, considere Redis + Node.js cluster

### P: O painel demora para atualizar?
**R:** Normalmente <100ms
Se > 1s, verifique conexão internet/WiFi

### P: Muito lento em mobile?
**R:** Verifique:
- Velocidade internet (WiFi melhor)
- Recurso do telefone
- Browser atualizado

---

## Screenshot e Prints

### P: Como faço screenshot da senha?
**R:** Na página de usuário, aperte Print Screen
Ou use F12 > DevTools > bota de câmera

### P: Como imprimo a senha?
**R:** Clique "Imprimir Senha" na interface do usuário
Aparecerá uma janela com formato pronto para impressora

### P: Qual é o tamanho ideal para painel em TV?
**R:** Depende da TV
Recomendado: 55" ou maior
Distância mínima: 2-3 metros

---

## Segurança

### P: É seguro para senha de admin?
**R:** Não! Está hardcoded
Para produção, use:
- Variáveis de ambiente (.env)
- Hashing (bcrypt)
- Rate limiting
- HTTPS

### P: Dados são criptografados?
**R:** Não. Apenas senhas administrativas.
Para PII (dados pessoais), use criptografia.

### P: Alguém pode alterar dados?
**R:** Apenas quem conhece a senha admin
Use autenticação mais forte em produção

---

## Deploy e Produção

### P: Posso usar em produção?
**R:** Sim! Mas configure:
- Senha admin forte
- HTTPS/SSL
- Firewall
- Backup automático
- Monitoramento

### P: Onde faço deploy?
**R:** Opções:
1. **Heroku** (grátis com limitações)
2. **DigitalOcean** (barato)
3. **AWS** (escalável)
4. **VPS** próprio
5. **Servidor local** (se estável)

### P: Como faço deploy?"
**R:** Veja [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) seção "Deploy"

---

## Customização Avançada

### P: Como adiciono mais campos?
**R:** Edite `database.js` tabelas e `server.js` rotas

### P: Como integro com outro sistema?
**R:** Use as APIs REST
Endpoints em [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md)

### P: Como adiciono autenticação?
**R:** Use bibliotecas como:
- JWT (jsonwebtoken)
- Passport.js
- bcrypt

### P: Como adiciono gráficos?
**R:** Use bibliotecas:
- Chart.js
- Plotly
- D3.js

---

## Suporte e Ajuda

### P: Onde encontro mais ajuda?
**R:**
1. Veja [README.md](README.md)
2. Leia [TESTES.md](TESTES.md)
3. Consulte [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md)

### P: Como faço uma sugestão?
**R:** Documente bem e abra uma Issue no repositório

### P: Como reporte um bug?
**R:** Descreva:
1. O que esperava acontecer
2. O que realmente aconteceu
3. Passos para reproduzir
4. Screenshots se possível

### P: Alguém pode fazer melhorias?
**R:** Sim! Veja [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) seção "Contribuindo"

---

## Dicas e Truques

### 💡 Dica 1: DevTools
Aperte F12 para abrir ferramentas de desenvolvedor
- **Console**: Veja erros
- **Network**: Veja requisições
- **Application**: Clear cache

### 💡 Dica 2: Acesso Remoto
Para acessar de outro PC:
```
http://[IP_DO_SERVIDOR]:3000/usuario
```

### 💡 Dica 3: Múltiplas Mesas
Cada atendente pode ter sua própria mesa
Útil para escalabilidade

### 💡 Dica 4: Customização Rápida
Use `localStorage` para salvar preferências

### 💡 Dica 5: Backup Diário
Copie `data/fila.db` automaticamente ao final do dia

---

## Glossário

| Termo | Significado |
|-------|------------|
| **Socket.IO** | Sistema de comunicação real-time |
| **HTTP** | Protocolo de internet base |
| **HTTPS** | HTTP com criptografia |
| **API** | Interface para requerer dados |
| **REST** | Estilo de API (GET, POST, etc) |
| **SQLite** | Banco de dados simples |
| **Node.js** | Servidor JavaScript |
| **Express** | Framework para rotas |
| **localhost** | Seu próprio computador |
| **Port** | Porta de comunicação (ex: 3000) |

---

## 📞 Contato e Suporte

Se a resposta não está aqui:
1. Revise os arquivos documentação
2. Verifique o console do navegador (F12)
3. Procure logs do servidor
4. Tente reiniciar tudo

---

**Última atualização**: 2024
**Versão do Sistema**: 1.0.0

---

**Tem mais dúvidas? Leia a documentação! 📚**
