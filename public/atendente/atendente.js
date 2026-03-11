// ============ ATENDENTE.JS ============

const socket = io();

let setorAtendente = '';
let mesaAtendente = '';
let senhaAtualId = null;
let senhaAtual = null;
let historico = [];
let tempoInicioAtendimento = null;
let intervaloTempoAtendimento = null;

// Elementos do DOM
const loginAtendente = document.getElementById('login-atendente');
const painelAtendente = document.getElementById('painel-atendente');
const setorSelect = document.getElementById('setor-atendente');

// ============ MONITORAR SELEÇÃO DE SETOR ============

setorSelect.addEventListener('change', async function() {
  const setor = this.value;
  
  if (!setor) {
    document.getElementById('senhas-aguardando').textContent = '0';
    return;
  }
  
  // Carregar número de senhas aguardando
  try {
    const response = await fetch(`/api/senhas-aguardando/${setor}`);
    const dados = await response.json();
    document.getElementById('senhas-aguardando').textContent = dados.aguardando || '0';
  } catch (erro) {
    console.error('Erro ao contar senhas:', erro);
  }
});

// ============ LOGIN ============

async function fazerLogin(event) {
  event.preventDefault();
  
  setorAtendente = document.getElementById('setor-atendente').value;
  mesaAtendente = document.getElementById('mesa-atendente').value;

  if (!setorAtendente || !mesaAtendente) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  // Atualizar UI (sem bloqueio por mesa ocupada)
  loginAtendente.classList.add('hidden');
  painelAtendente.classList.remove('hidden');

  // Atualizar informações
  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Cadastro de Veículos/Empresas',
    'protocolo': 'Protocolar Documentos'
  };

  document.getElementById('info-setor').textContent = setorNomes[setorAtendente];
  document.getElementById('info-mesa').textContent = mesaAtendente;
  document.getElementById('info-status').textContent = '00:00';

  // Socket - notificar que atendente está pronto
  socket.emit('atendente-pronto', {
    setor: setorAtendente,
    mesa: mesaAtendente
  });

  console.log(`Atendente em ${setorNomes[setorAtendente]} - Mesa ${mesaAtendente}`);
}

// ============ ATUALIZAR CONTADOR ============

async function atualizarContadorSenhas() {
  try {
    const response = await fetch(`/api/senhas-aguardando/${setorAtendente}`);
    const dados = await response.json();
    document.getElementById('contador-senhas').textContent = dados.aguardando || '0';
  } catch (erro) {
    console.error('Erro ao atualizar contador:', erro);
  }
}

// Atualizar a cada 2 segundos
setInterval(() => {
  if (setorAtendente) {
    atualizarContadorSenhas();
  }
}, 2000);

// ============ CHAMAR PRÓXIMA SENHA ============

async function chamarProxima() {
  try {
    // Finalize previous password if exists
    if (senhaAtualId) {
      await fetch('/api/finalizar-atendimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaId: senhaAtualId
        })
      });
    }

    const response = await fetch('/api/proxima-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        setor: setorAtendente,
        mesa: mesaAtendente
      })
    });

    const dados = await response.json();

    if (dados.fila_vazia) {
      alert('Fila vazia! Não há senhas para atender.');
      document.getElementById('display-senha-atual').innerHTML = '<span>--</span>';
      document.getElementById('tipo-atual').textContent = '-';
      document.getElementById('mesa-atual').textContent = '-';
      pararTempoAtendimento(true);
      return;
    }

    // Armazenar ID da senha (para finalizacao posterior)
    senhaAtualId = dados.id;
    
    // Armazenar dados da senha
    senhaAtual = dados.senha;

    // Iniciar contagem de tempo de atendimento
    iniciarTempoAtendimento();

    // Atualizar display
    atualizarDisplay(dados.senha, dados.tipo, mesaAtendente);
    
  // Habilitar botão repetir
    const btnRepetir = document.getElementById('btn-repetir');
    btnRepetir.disabled = false;
    btnRepetir.style.opacity = '1';
    btnRepetir.style.cursor = 'pointer';

    // Adicionar ao histórico
    adicionarAoHistorico(dados.senha, setorAtendente, mesaAtendente);
    
    // Atualizar contador
    atualizarContadorSenhas();

  } catch (erro) {
    console.error('Erro ao chamar próxima senha:', erro);
    alert('Erro ao chamar próxima senha');
  }
}

// ============ CHAMAR SENHA ESPECÍFICA ============

async function chamarEspecifica() {
  const senhaInput = document.getElementById('input-senha-especifica');
  const senha = senhaInput.value.trim().toUpperCase();

  if (!senha) {
    alert('Digite o número da senha');
    return;
  }

  try {
    // Finalize previous password if exists
    if (senhaAtualId) {
      await fetch('/api/finalizar-atendimento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaId: senhaAtualId
        })
      });
    }

    const response = await fetch('/api/chamar-senha-especifica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senhaNumero: senha,
        mesa: mesaAtendente,
        setor: setorAtendente
      })
    });

    const dados = await response.json();

    if (dados.erro) {
      alert(dados.erro);
      return;
    }

    // Store new ID for next finalization
    senhaAtualId = dados.id;

    // Armazenar dados da senha
    senhaAtual = senha;

    // Iniciar contagem de tempo de atendimento
    iniciarTempoAtendimento();

    // Atualizar display
    atualizarDisplay(senha, 'específica', mesaAtendente);
    
    // Habilitar botão repetir
    const btnRepetir = document.getElementById('btn-repetir');
    btnRepetir.disabled = false;
    btnRepetir.style.opacity = '1';
    btnRepetir.style.cursor = 'pointer';

    // Limpar input
    senhaInput.value = '';

    // Adicionar ao histórico
    adicionarAoHistorico(senha, setorAtendente, mesaAtendente);

  } catch (erro) {
    console.error('Erro:', erro);
    alert('Erro ao chamar senha');
  }
}

// ============ REPETIR SENHA ============

function repetirSenha() {
  if (!senhaAtual) {
    alert('Nenhuma senha ativa para repetir');
    return;
  }

  socket.emit('repetir-senha', {
    senha: senhaAtual,
    mesa: mesaAtendente,
    setor: setorAtendente
  });
}

// ============ PULAR SENHA ============

function pularSenha() {
  if (!senhaAtualId) {
    alert('Nenhuma senha selecionada');
    return;
  }

  if (confirm('Tem certeza que deseja pular esta senha?')) {
    fetch('/api/pular-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senhaId: senhaAtualId
      })
    }).then(() => {
      alert('Senha pulada');
    });
  }
}

// ============ FINALIZAR ATENDIMENTO ============

function finalizarAtendimento() {
  if (!senhaAtualId) {
    alert('Nenhuma senha selecionada');
    return;
  }

  if (confirm('Finalize o atendimento desta senha?')) {
    fetch('/api/finalizar-atendimento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senhaId: senhaAtualId
      })
    }).then(() => {
      alert('Atendimento finalizado');
      document.getElementById('display-senha-atual').innerHTML = '<span>--</span>';
      document.getElementById('tipo-atual').textContent = '-';
      document.getElementById('mesa-atual').textContent = '-';
      pararTempoAtendimento(true);
    });
  }
}

// ============ ATUALIZAR DISPLAY ============

function atualizarDisplay(senha, tipo, mesa) {
  document.getElementById('display-senha-atual').innerHTML = `<span>${senha}</span>`;
  document.getElementById('tipo-atual').textContent = tipo === 'preferencial' ? 'Preferencial' : 'Normal';
  document.getElementById('mesa-atual').textContent = mesa;
}

// ============ HISTÓRICO ============

function adicionarAoHistorico(senha, setor, mesa) {
  const item = {
    numero: senha,
    setor: setor,
    mesa: mesa,
    timestamp: new Date()
  };

  historico.unshift(item);

  // Manter apenas os últimos 10 itens
  if (historico.length > 10) {
    historico.pop();
  }

  atualizarView();
}

function atualizarView() {
  const lista = document.getElementById('historico-lista');
  
  if (historico.length === 0) {
    lista.innerHTML = '<p class="texto-vazio">Nenhuma senha chamada ainda</p>';
    return;
  }

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos',
    'protocolo': 'Protocolo'
  };

  lista.innerHTML = historico.map((item, index) => `
    <div class="historico-item ${index === 0 ? 'new' : ''}">
      <div class="historico-item-numero">${item.numero}</div>
      <div class="historico-item-setor">${setorNomes[item.setor] || item.setor}</div>
      <div class="historico-item-mesa">Mesa ${item.mesa}</div>
    </div>
  `).join('');
}

// ============ SAIR ============

async function sair() {
  if (confirm('Deseja sair do painel?')) {
    // Liberar mesa
    try {
      await fetch('/api/liberar-mesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mesa: mesaAtendente })
      });
    } catch (erro) {
      console.error('Erro ao liberar mesa:', erro);
    }

    setorAtendente = '';
    mesaAtendente = '';
    historico = [];
    tempoInicioAtendimento = null;
    if (intervaloTempoAtendimento) {
      clearInterval(intervaloTempoAtendimento);
      intervaloTempoAtendimento = null;
    }
    
    painelAtendente.classList.add('hidden');
    loginAtendente.classList.remove('hidden');
    
    document.getElementById('form-login').reset();
    document.getElementById('senhas-aguardando').textContent = '0';
    document.getElementById('info-status').textContent = '00:00';
  }
}

// ============ SONS ============

function tocarSomChamada() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Duas notas
  const notas = [800, 1200];
  
  notas.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, index * 200);
  });
}

// ============ SOCKET.IO ============

socket.on('estado-inicial', (dados) => {
  console.log('Conectado ao servidor');
});

socket.on('senha-chamada', (dados) => {
  console.log('Senha chamada:', dados);
});

socket.on('senhas-resetadas', () => {
  alert('Senhas foram resetadas!');
  historico = [];
  atualizarView();
  document.getElementById('display-senha-atual').innerHTML = '<span>--</span>';
  document.getElementById('tipo-atual').textContent = '-';
  document.getElementById('mesa-atual').textContent = '-';
  pararTempoAtendimento(true);
});

// ============ TEMPO DE ATENDIMENTO ============

function formatarTempo(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60)
    .toString()
    .padStart(2, '0');
  const segundos = (segundosTotais % 60).toString().padStart(2, '0');
  return `${minutos}:${segundos}`;
}

function iniciarTempoAtendimento() {
  tempoInicioAtendimento = Date.now();

  if (intervaloTempoAtendimento) {
    clearInterval(intervaloTempoAtendimento);
  }

  atualizarTempoAtendimento();

  intervaloTempoAtendimento = setInterval(atualizarTempoAtendimento, 1000);
}

function atualizarTempoAtendimento() {
  if (!tempoInicioAtendimento) return;

  const agora = Date.now();
  const segundosTotais = Math.floor((agora - tempoInicioAtendimento) / 1000);
  document.getElementById('info-status').textContent = formatarTempo(segundosTotais);
}

function pararTempoAtendimento(resetDisplay) {
  if (intervaloTempoAtendimento) {
    clearInterval(intervaloTempoAtendimento);
    intervaloTempoAtendimento = null;
  }
  tempoInicioAtendimento = null;

  if (resetDisplay) {
    document.getElementById('info-status').textContent = '00:00';
  }
}
