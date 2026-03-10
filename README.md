# Sistema Web de Gerenciamento de Filas para Atendimento

Sistema completo e moderno para gerenciar filas de atendimento com múltiplas interfaces: usuário, atendente e painel público.

## 🎯 Características

- ✅ **Interface do Usuário**: Retirada de senha com seleção de setor e tipo de atendimento
- ✅ **Painel do Atendente**: Chamada de próxima senha, senha específica, pular e finalizar
- ✅ **Painel Público**: Exibição em TV/monitor com histórico de senhas chamadas
- ✅ **Painel Administrativo**: Reset de senhas, estatísticas e personalização
- ✅ **Responsivo**: Funciona em desktop, tablet e mobile
- ✅ **Atualização em Tempo Real**: Socket.IO para sincronização instantânea
- ✅ **Autossons**: Som de confirmação ao chamar senhas
- ✅ **Impressão de Senha**: Opção para imprimir comprovante

## 🚀 Instalação

### Requisitos
- Node.js (versão 14+)
- npm ou yarn

### Passos

1. **Clonar ou extrair o repositório**
```bash
cd fila_atendimento
```

2. **Instalar dependências**
```bash
npm install
```

3. **Iniciar o servidor**
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

4. **Acessar as interfaces**
- 👤 **Usuário**: http://localhost:3000/usuario
- 👨‍💼 **Atendente**: http://localhost:3000/atendente
- 📺 **Painel Público**: http://localhost:3000/painel
- ⚙️ **Admin**: http://localhost:3000/admin

## 📋 Guia de Uso

### Interface do Usuário (`/usuario`)

1. Clique no botão do tipo de atendimento desejado:
   - Ouvidoria
   - Finanças
   - Cadastro de Veículos/Empresas
   - Protocolar Documentos

2. Escolha o tipo de atendimento:
   - **Normal**: Fila comum
   - **Preferencial**: Prioridade para idosos, gestantes e PCD

3. Uma senha será gerada automaticamente
4. Você pode imprimir a senha ou retirar uma nova

### Interface do Atendente (`/atendente`)

1. Selecione seu setor e número de mesa
2. Clique em "Acessar Painel"
3. Use os botões para:
   - **Chamar Próxima**: Atende a próxima senha (preferencial primeiro)
   - **Chamar Específica**: Digita o número da senha
   - **Pular Senha**: Retorna para fila
   - **Finalizar Atendimento**: Marca como concluído

### Painel Público (`/painel`)

- Exibe em grande destaque a senha sendo atendida e a mesa
- Mostra histórico das últimas 10 senhas chamadas
- Espaço para avisos e informações institucionais
- Atualiza em tempo real

### Painel Administrativo (`/admin`)

1. **Resetar Senhas**: Digite `AGR.Senhas` como senha
2. **Estatísticas**: Visualiza total de atendimentos e tempo médio
3. **Histórico**: Tabela com todos os atendimentos do dia
4. **Personalização**: Altere cor primária e logotipo

---

## 🔒 Segurança

A senha administrativa padrão é: **`AGR.Senhas`**

⚠️ **Altere esta senha em produção!**

Para mudar a senha, edite o arquivo `server.js` na linha de validação do reset.

---

## 📊 Estrutura do Projeto

```
fila_atendimento/
├── package.json              # Dependências
├── server.js                 # Servidor principal
├── database.js              # Gerenciador de banco de dados
├── public/                  # Arquivos estáticos
│   ├── usuario.html         # Interface do usuário
│   ├── usuario.css/js
│   ├── atendente.html       # Interface do atendente
│   ├── atendente.css/js
│   ├── painel.html          # Painel público
│   ├── painel.css/js
│   ├── admin.html           # Painel administrativo
│   ├── admin.css/js
│   └── styles.css           # Estilos globais
└── data/                    # Banco de dados SQLite (criado automaticamente)
```

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite3
- **Comunicação Real-Time**: Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Responsividade**: Mobile-first design

---

## ⚙️ Configuração de Setores

Os setores disponíveis são:

| Código | Nome | Prefixo Senha |
|--------|------|---------------|
| ouvidoria | Ouvidoria | A |
| financas | Finanças | B |
| veiculos | Cadastro de Veículos/Empresas | C |
| protocolo | Protocolar Documentos | D |

Para adicionar novos setores, edite:
1. `usuario.html` - Adicione novo botão
2. `database.js` - Adicione novo contador
3. `server.js` - Adicione nova rota/lógica se necessário

---

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Desktop**: Layout completo com todos os elementos
- **Tablet**: Adaptado para telas médias
- **Mobile**: Interface otimizada para toque

---

## 🔊 Sons

O sistema emite sons em:
- **Usuário**: Confirmação ao gerar senha
- **Atendente**: Sinal ao chamar nova senha
- **Painel**: Notificação ao exibir nova senha

Todos os sons são gerados via Web Audio API.

---

## 🎨 Personalização

### Cores

Altere a variável CSS `--cor-primaria` no arquivo `styles.css` ou através do painel admin.

### Logotipo

Adicione a URL do logotipo no painel administrativo. A imagem será exibida no header.

---

## 🐛 Troubleshooting

### Porta já está em uso
```bash
# Usar outra porta
PORT=3001 npm start
```

### Banco de dados corrompido
```bash
# Deletar banco e começar do zero
# (Remova a pasta 'data')
```

### Socket.IO não está conectando
- Verifique se o servidor está rodando
- Limpe o cache do navegador
- Confira se não há firewall bloqueando

---

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente.

---

## 👨‍💼 Suporte

Para dúvidas ou problemas, verifique:
1. Se todas as dependências foram instaladas
2. Se a porta 3000 está disponível
3. Se o Node.js está atualizado




