# 🧪 GUIA DE TESTES

Após instalar o projeto, siga este guia para testar todas as funcionalidades.

---

## 🚀 Pré-requisitos

1. Node.js instalado
2. Servidor rodando (`npm start`)
3. Bateria de testes abaixo

---

## 📋 TESTE 1: Interface do Usuário

### Objetivo
Verificar se o usuário consegue retirar uma senha

### Passo a Passo
1. Abra http://localhost:3000/usuario
2. Clique em um setor (ex: "Ouvidoria")
3. Escolha um tipo de atendimento (ex: "Normal")
4. Verá a senha gerada (ex: A001)
5. Clique "Imprimir Senha" (abrirá janela de impressão)
6. Clique "Nova Senha" para voltar

### ✅ Esperado
- Senha é gerada automaticamente
- Número da posição na fila aparece
- Som toca ao gerar
- Impressão funciona
- Layout responsivo em qualquer tamanho

### ❌ Se houver erro
- Verifique se o servidor está rodando
- Limpe cache do navegador (Ctrl+Shift+Del)
- Revise console (F12 > Console)

---

## 📋 TESTE 2: Interface do Atendente

### Objetivo
Verificar se o atendente consegue chamar senhas

### Passo a Passo
1. Abra http://localhost:3000/atendente
2. Selecione setor: "Ouvidoria"
3. Digite mesa: 1
4. Clique "Acessar Painel"
5. Clique "Chamar Próxima"
6. Veja a senha atual aparecer
7. Digite uma senha específica no campo
8. Clique "Chamar"
9. Teste "Pular Senha" e "Finalizar"

### ✅ Esperado
- Login funciona
- Painel carrega
- Próxima senha é chamada
- Som toca (2 notas)
- Histórico atualiza
- Ações funcionam

### ❌ Se houver erro
- Verifique se o setor está correto
- Revise console do navegador
- Certifique-se que há senhas na fila

---

## 📋 TESTE 3: Painel Público

### Objetivo
Verificar exibição pública em tempo real

### Passo a Passo
1. Abra 3 abas/janelas:
   - Aba A: http://localhost:3000/usuario
   - Aba B: http://localhost:3000/atendente
   - Aba C: http://localhost:3000/painel

2. Na Aba A: Retire uma senha
3. Na Aba B: Faça login e chame a senha
4. Observe Aba C:
   - Senha aparece em grande display
   - Número da mesa aparece
   - Histórico atualiza
   - Som toca

### ✅ Esperado
- Atualização em tempo real (sem F5)
- Senha aparece grande e destacada
- Histórico com cores diferentes
- Avisos/notícias visíveis
- Layout responsivo

### ❌ Se houver erro
- Verifique conexão Socket.IO (F12 > Network)
- Reinicie o navegador
- Limpe cache

---

## 📋 TESTE 4: Painel Administrativo

### Objetivo
Verificar gerenciamento e reset

### Passo a Passo
1. Abra http://localhost:3000/admin
2. Veja estatísticas do dia
3. Visualize histórico de atendimentos
4. Em "Resetar Todos os Dados":
   - Digite SENHA ERRADA: "123"
   - Clique "Resetar Senhas"
   - Veja mensagem de erro
5. Digite SENHA CORRETA: "SUA SENHA"
6. Clique "Resetar Senhas"
7. Confirme no diálogo
8. Verifique que senhas foram apagadas

### ✅ Esperado
- Rejeita senha errada
- Aceita senha correta
- Mostra confirmação
- Limpa histórico
- Estatísticas zeradas

### ❌ Se houver erro
- Verifique exatamente a senha
- Revise console do servidor
- Confira arquivo database.js

---

## 📋 TESTE 5: Responsividade

### Teste Desktop (1920x1080+)
1. Abra qualquer interface
2. Veja layout completo
3. Elementos bem distribuído

### Teste Tablet (768px)
1. Redimensione navegador
2. Veja layout adaptado
3. Botões ainda clicáveis

### Teste Mobile (480px)
1. Abra DevTools (F12)
2. Clique "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Escolha um smartphone
4. Veja menu otimizado
5. Textos legíveis
6. Botões grandes

### ✅ Esperado
- Funciona em todos os tamanhos
- Scroll horizontal mínimo
- Botões clicáveis em mobile
- Fontes legíveis

---

## 📋 TESTE 6: Multiple Users

### Objetivo
Verificar múltiplos usuários simultâneos

### Passo a Passo
1. Abra 4 abas:
   - Aba 1: Atendente 1 (Setor: Ouvidoria, Mesa: 1)
   - Aba 2: Atendente 2 (Setor: Finanças, Mesa: 2)
   - Aba 3: Usuário (Retira múltiplas senhas)
   - Aba 4: Painel Público

2. Gere 5 senhas na Aba 3
3. Chame na Aba 1 e 2
4. Observe Aba 4 sincronizar

### ✅ Esperado
- Sincronização sem delay
- Sem erros no console
- Todas as senhas aparecem

---

## 📋 TESTE 7: Persistência

### Objetivo
Testar se dados persistem

### Passo a Passo
1. Gere algumas senhas
2. Feche o navegador
3. Reabra http://localhost:3000/admin
4. Veja histórico mantido
5. Reinicie servidor (Ctrl+C + npm start)
6. Reabra admin
7. Histórico ainda lá

### ✅ Esperado
- Dados persistem no refresh
- Dados persistem após restart
- Banco SQLite funciona

---

## 📋 TESTE 8: Sons

### Teste Som do Usuário
1. Abra http://localhost:3000/usuario
2. Retire uma senha
3. Ouça "bip" simples

### Teste Som do Atendente
1. Abra http://localhost:3000/atendente
2. Faça login
3. Chame próxima
4. Ouça 2 "bips" diferentes

### Teste Som do Painel
1. Use os 3 passo anteriores
2. Abra painel
3. Ouça 3 "bips" ao chamar

### ✅ Esperado
- Sons diferentes em cada interface
- Sons audíveis
- Sem erros no console

---

## 📋 TESTE 9: Arquivo de Configuração

### Passo a Passo
1. Abra `package.json`
2. Verifique dependências
3. Abra `server.js`
4. Verifique porta 3000
5. Abra `database.js`
6. Verifique tabelas criadas

### ✅ Esperado
- Todos os arquivos presentes
- Sem erros de sintaxe
- Dependências corretas

---

## 📋 TESTE 10: Customização

### Logo
1. Vá para http://localhost:3000/admin
2. Em "Logotipo", cole URL: 
   `https://via.placeholder.com/200`
3. Clique "Aplicar"
4. Veja logo aparecer

### Cor
1. Em "Cor Primária", altere para: `#ff6b6b` (vermelho)
2. Clique "Aplicar"
3. Veja cores mudarem site todo

### ✅ Esperado
- Logo aparece
- Cores mudam
- Persistem ao refresh

---

## 🐛 CHECKLIST DE BUGS

- [ ] Nenhum erro no console (F12)
- [ ] Nenhum erro no terminal
- [ ] Socket.IO conecta
- [ ] Banco de dados funciona
- [ ] Senhas incrementam corretamente
- [ ] Atendimento finaliza
- [ ] Reset trabalha com senha correta
- [ ] Interface responsiva
- [ ] Sons tocam
- [ ] Prioridade preferencial funciona

---

## 📊 RELATÓRIO DE TESTES

Após completar todos os testes, você deve ter:

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Usuário | ✅ | |
| 2. Atendente | ✅ | |
| 3. Painel | ✅ | |
| 4. Admin | ✅ | |
| 5. Responsividade | ✅ | |
| 6. Multiple Users | ✅ | |
| 7. Persistência | ✅ | |
| 8. Sons | ✅ | |
| 9. Configuração | ✅ | |
| 10. Customização | ✅ | |

---

## 🎉 PRÓXIMOS PASSOS

Se todos os testes passarem:
1. Sistema está pronto para uso
2. Customize colors/logo para seu ambiente
3. Altere senha admin
4. Faça deploy em servidor
5. Configure para produção

Se houver erros:
1. Revise console (F12)
2. Revise terminal do servidor
3. Limpe cache/cookies
4. Reinicie tudo
5. Consulte README.md

---

**Bom teste! 🚀**

