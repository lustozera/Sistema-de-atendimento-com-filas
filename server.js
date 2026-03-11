const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco de dados
const db = new Database();
db.init();

// Rastrear mesas ativas por atendente (previne duplicatas)
const mesasAtivas = new Map(); // { mesa: setor, socketId: id }

// Rotas - Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
});

// Página de retirada de senha
app.get('/usuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
});

// Página do atendente (login necessário)
app.get('/atendente', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atendente.html'));
});

// Painel público
app.get('/painel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

// Painel administrativo
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============ API ENDPOINTS ============

// Gerar nova senha
app.post('/api/gerar-senha', async (req, res) => {
  const { setor, tipo } = req.body;
  
  if (!setor || !tipo) {
    return res.status(400).json({ erro: 'Setor e tipo são obrigatórios' });
  }

  try {
    const senha = await db.gerarSenha(setor, tipo);
    const fila = await db.contarFilaPorSetor(setor);

    res.json({
      senha: senha.numero,
      setor: setor,
      tipo: tipo,
      filaAtual: fila,
      timestamp: new Date()
    });

    // Notificar clientes em tempo real
    io.emit('nova-senha', {
      senha: senha.numero,
      setor: setor,
      tipo: tipo,
      timestamp: new Date()
    });
  } catch (erro) {
    console.error('Erro ao gerar senha:', erro);
    res.status(500).json({ erro: 'Erro ao gerar senha' });
  }
});

// Obter próxima senha para o atendente
app.post('/api/proxima-senha', async (req, res) => {
  const { mesa, setor } = req.body;

  if (!mesa || !setor) {
    return res.status(400).json({ erro: 'Mesa e setor são obrigatórios' });
  }

  try {
    const proxima = await db.obterProximaSenha(setor);

    if (!proxima) {
      return res.json({ fila_vazia: true });
    }

    await db.chamarSenha(proxima.id, mesa);

    res.json({
      id: proxima.id,
      senha: proxima.numero,
      tipo: proxima.tipo,
      mesa: mesa,
      setor: setor,
      timestamp: new Date()
    });

    // Notificar painel público
    io.emit('senha-chamada', {
      senha: proxima.numero,
      mesa: mesa,
      setor: setor,
      timestamp: new Date()
    });
  } catch (erro) {
    console.error('Erro ao obter próxima senha:', erro);
    res.status(500).json({ erro: 'Erro ao chamar próxima senha' });
  }
});

// Chamar senha específica
app.post('/api/chamar-senha-especifica', async (req, res) => {
  const { senhaNumero, mesa, setor } = req.body;

  if (!senhaNumero || !mesa || !setor) {
    return res.status(400).json({ erro: 'Parâmetros inválidos' });
  }

  try {
    const resultado = await db.chamarSenhaEspecifica(senhaNumero, mesa);

    if (!resultado) {
      return res.status(404).json({ erro: 'Senha não encontrada' });
    }

    // Get the password ID for client to store
    const senha = await db.obterSenhaEspecifica(senhaNumero);

    res.json({
      id: senha ? senha.id : null,
      sucesso: true,
      senha: senhaNumero,
      mesa: mesa,
      timestamp: new Date()
    });

    io.emit('senha-chamada', {
      senha: senhaNumero,
      mesa: mesa,
      setor: setor,
      timestamp: new Date()
    });
  } catch (erro) {
    console.error('Erro ao chamar senha específica:', erro);
    res.status(500).json({ erro: 'Erro ao chamar senha' });
  }
});

// Pular senha
app.post('/api/pular-senha', async (req, res) => {
  const { senhaId } = req.body;

  try {
    await db.pularSenha(senhaId);
    res.json({ sucesso: true });
    io.emit('senha-pulada');
  } catch (erro) {
    console.error('Erro ao pular senha:', erro);
    res.status(500).json({ erro: 'Erro ao pular senha' });
  }
});

// Repetir chamada (anunciar novamente)
app.post('/api/repetir-chamada', async (req, res) => {
  try {
    const { senha, mesa, setor } = req.body;
    
    io.emit('repetir-chamada', {
      senha: senha,
      mesa: mesa,
      setor: setor
    });
    
    res.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro ao repetir chamada:', erro);
    res.status(500).json({ erro: 'Erro ao repetir chamada' });
  }
});

// Finalizar atendimento
app.post('/api/finalizar-atendimento', async (req, res) => {
  const { senhaId } = req.body;

  try {
    await db.finalizarAtendimento(senhaId);
    res.json({ sucesso: true });
    io.emit('atendimento-finalizado');
  } catch (erro) {
    console.error('Erro ao finalizar:', erro);
    res.status(500).json({ erro: 'Erro ao finalizar atendimento' });
  }
});

// Obter senhas recentes da fila
app.get('/api/senhas-recentes', async (req, res) => {
  try {
    const senhasRecentes = await db.obterSenhasRecentes(10);
    res.json(senhasRecentes);
  } catch (erro) {
    console.error('Erro ao obter senhas recentes:', erro);
    res.status(500).json({ erro: 'Erro ao obter senhas' });
  }
});

// Obter último painel (senha sendo atendida)
app.get('/api/painel-atual', async (req, res) => {
  try {
    const painel = await db.obterUltimaSenahaChamada();
    res.json(painel || {});
  } catch (erro) {
    console.error('Erro ao obter painel:', erro);
    res.status(500).json({ erro: 'Erro ao obter painel' });
  }
});

// Contar senhas aguardando por setor
app.get('/api/senhas-aguardando/:setor', async (req, res) => {
  const { setor } = req.params;
  
  try {
    const total = await db.contarFilaPorSetor(setor);
    res.json({ aguardando: total });
  } catch (erro) {
    console.error('Erro ao contar senhas:', erro);
    res.status(500).json({ erro: 'Erro ao contar senhas' });
  }
});

// Verificar se mesa está disponível
app.post('/api/verificar-mesa', (req, res) => {
  const { mesa, setor, socketId } = req.body;
  
  // Verificar se mesa já está em uso
  const mesaEmUso = mesasAtivas.has(mesa);
  
  if (mesaEmUso) {
    const mesaRegistrada = mesasAtivas.get(mesa);
    return res.status(409).json({ 
      erro: 'Mesa já está em uso',
      disponivel: false
    });
  }
  
  // Registrar mesa como ativa
  mesasAtivas.set(mesa, { setor, socketId });
  
  res.json({ 
    sucesso: true,
    disponivel: true,
    mensagem: 'Mesa registrada com sucesso'
  });
});

// Liberar mesa
app.post('/api/liberar-mesa', (req, res) => {
  const { mesa } = req.body;
  
  if (mesasAtivas.has(mesa)) {
    mesasAtivas.delete(mesa);
  }
  
  res.json({ sucesso: true });
});

// Resetar senhas do dia + exportar histórico
app.post('/api/resetar-senhas', async (req, res) => {
  const { senha } = req.body;

  if (senha !== 'SUA SENHA') {
    return res.status(401).json({ 
      erro: 'Senha incorreta. Operação não permitida.' 
    });
  }

  try {
    // Obter histórico completo antes de apagar
    const historico = await db.obterHistorico(true);

    // Criar pasta base_dados_atendimento se não existir
    const baseDir = path.join(__dirname, 'base_dados_atendimento');
    const fs = require('fs');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Gerar nome do arquivo com data atual
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const nomeArquivo = `historico_atendimentos_${ano}-${mes}-${dia}.csv`;
    const caminhoArquivo = path.join(baseDir, nomeArquivo);

    // Montar conteúdo CSV simples
    const setorNomes = {
      ouvidoria: 'Ouvidoria',
      financas: 'Finanças',
      veiculos: 'Veículos/Empresas',
      protocolo: 'Protocolar'
    };

    const linhas = [];
    linhas.push([
      'Senha',
      'Setor',
      'Tipo',
      'Mesa',
      'Tempo de Espera (min)',
      'Tempo de Atendimento (min)'
    ].join(';'));

    (historico || []).forEach((item) => {
      linhas.push([
        item.numero,
        setorNomes[item.setor] || item.setor,
        item.tipo === 'preferencial' ? 'Preferencial' : 'Normal',
        item.mesa || '',
        item.tempo_espera != null ? item.tempo_espera : '',
        item.tempo_atendimento != null ? item.tempo_atendimento : ''
      ].join(';'));
    });

    fs.writeFileSync(caminhoArquivo, linhas.join('\r\n'), { encoding: 'utf8' });

    // Resetar dados após exportação
    await db.resetarSenhas();

    res.json({ 
      sucesso: true,
      mensagem: 'Senhas resetadas com sucesso e histórico exportado.'
    });

    // Notificar clientes
    io.emit('senhas-resetadas');
  } catch (erro) {
    console.error('Erro ao resetar senhas:', erro);
    res.status(500).json({ erro: 'Erro ao resetar senhas' });
  }
});

// Obter histórico de atendimentos
app.get('/api/historico', async (req, res) => {
  try {
    const historico = await db.obterHistorico(false);
    res.json(historico);
  } catch (erro) {
    console.error('Erro ao obter histórico:', erro);
    res.status(500).json({ erro: 'Erro ao obter histórico' });
  }
});

// Obter mesas ocupadas
app.get('/api/mesas-ocupadas', (req, res) => {
  try {
    const mesas = [];
    mesasAtivas.forEach((valor, mesa) => {
      mesas.push({
        mesa: mesa,
        setor: valor.setor,
        socketId: valor.socketId
      });
    });
    res.json(mesas);
  } catch (erro) {
    console.error('Erro ao obter mesas ocupadas:', erro);
    res.status(500).json({ erro: 'Erro ao obter mesas' });
  }
});

// Liberar mesa (remover atendente)
app.post('/api/liberar-mesa', (req, res) => {
  const { mesa } = req.body;

  if (!mesa) {
    return res.status(400).json({ erro: 'Mesa é obrigatória' });
  }

  try {
    if (mesasAtivas.has(mesa)) {
      mesasAtivas.delete(mesa);
      res.json({ sucesso: true, mensagem: `Mesa ${mesa} foi liberada` });
      
      // Notificar via socket
      io.emit('mesa-liberada', { mesa: mesa });
    } else {
      res.status(404).json({ erro: 'Mesa não está ocupada' });
    }
  } catch (erro) {
    console.error('Erro ao liberar mesa:', erro);
    res.status(500).json({ erro: 'Erro ao liberar mesa' });
  }
});

// ============ SOCKET.IO ============

io.on('connection', (socket) => {
  console.log('Nova conexão:', socket.id);

  // Enviar último estado ao conectar
  const painel = db.obterUltimaSenahaChamada();
  socket.emit('estado-inicial', { painel: painel || {} });

  socket.on('repetir-senha', (dados) => {
    console.log('Repetindo senha:', dados);
    io.emit('repetir-chamada', dados);
  });

  socket.on('disconnect', () => {
    console.log('Desconexão:', socket.id);
  });
});

// ============ INICIAR SERVIDOR ============

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Painel: http://localhost:${PORT}/painel`);
  console.log(`Atendente: http://localhost:${PORT}/atendente`);
  console.log(`Usuário: http://localhost:${PORT}/usuario`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});

