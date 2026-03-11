// ============ PAINEL.JS ============

const socket = io();

let ultimaSenha = null;
let historico = [];

// ============ INICIALIZAÇÃO ============

function inicializar() {
  carregarDadosPainel();
  
  // Atualizar painel a cada 5 segundos
  setInterval(carregarDadosPainel, 5000);
  
  // Iniciar slideshow de informações a cada 8 segundos
  iniciarSlideshow();
}

// ============ CARREGAR DADOS DO PAINEL ============

async function carregarDadosPainel() {
  try {
    // Obter painel atual (última senha chamada)
    const responsePainel = await fetch('/api/painel-atual');
    const painel = await responsePainel.json();

    if (painel && painel.numero) {
      atualizarDisplay(painel);
    }

    // Obter histórico
    const responseHistorico = await fetch('/api/senhas-recentes');
    const senhasRecentes = await responseHistorico.json();

    if (senhasRecentes && senhasRecentes.length > 0) {
      atualizarHistorico(senhasRecentes);
    }
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
  }
}

// ============ ATUALIZAR DISPLAY ============

function atualizarDisplay(painel) {
  if (!painel || !painel.numero) {
    document.getElementById('numero-gigante').textContent = '--';
    document.getElementById('numero-mesa').textContent = '--';
    return;
  }

  // Se mudou de senha, apenas atualiza visualmente aqui.
  // O som é controlado pelos eventos de socket (chamar/repetir senha).

  document.getElementById('numero-gigante').textContent = painel.numero;
  document.getElementById('numero-mesa').textContent = painel.mesa || '--';
  
  ultimaSenha = painel;
}

// ============ ATUALIZAR HISTÓRICO ============

function atualizarHistorico(senhas) {
  const lista = document.getElementById('historico-painel');
  
  if (!senhas || senhas.length === 0) {
    lista.innerHTML = '<div class="item-historico vazio"><span>Aguardando primeira senha...</span></div>';
    return;
  }

  // Mostrar apenas as 3 últimas senhas
  const senhasLimitadas = senhas.slice(0, 3);

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos',
    'protocolo': 'Protocolo'
  };

  lista.innerHTML = senhasLimitadas.map((senha, index) => {
    const isNew = index === 0;

    return `
      <div class="item-historico ${isNew ? 'new' : ''}">
        <span class="historico-senha">${senha.numero}</span>
        <span class="historico-mesa">MESA ${senha.mesa || '--'}</span>
        <span class="historico-setor">${setorNomes[senha.setor] || senha.setor}</span>
      </div>
    `;
  }).join('');
}

// ============ SLIDESHOW DE INFORMAÇÕES ============

let slideshowIndex = 0;

function iniciarSlideshow() {
  const infoBoxes = document.querySelectorAll('.info-box');
  
  if (infoBoxes.length === 0) return;
  
  // Mostrar primeira caixa
  mostrarSlideshowAtual();
  
  // Rotacionar a cada 8 segundos
  setInterval(() => {
    slideshowIndex = (slideshowIndex + 1) % infoBoxes.length;
    mostrarSlideshowAtual();
  }, 8000);
}

function mostrarSlideshowAtual() {
  const infoBoxes = document.querySelectorAll('.info-box');
  
  infoBoxes.forEach((box, index) => {
    if (index === slideshowIndex) {
      box.style.display = 'block';
      box.style.animation = 'fadeIn 0.5s ease-in';
    } else {
      box.style.display = 'none';
    }
  });
}

// ============ SONS ============

function tocarSomAnuncio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Sequência de notas para criar um "ding"
  const notas = [400, 600, 800];
  
  notas.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }, index * 100);
  });
}

// ============ SOCKET.IO ============

socket.on('estado-inicial', (dados) => {
  console.log('Conectado ao painel');
  if (dados.painel) {
    atualizarDisplay(dados.painel);
  }
});

socket.on('senha-chamada', (dados) => {
  console.log('Nova senha chamada:', dados);
  // Som apenas quando o atendente clica em "chamar senha"
  tocarSomPainelBeep();
  setTimeout(() => {
    falarSenhaEMesa(dados.senha, dados.mesa);
  }, 1800);
  atualizarDisplay({
    numero: dados.senha,
    mesa: dados.mesa,
    setor: dados.setor
  });
  
  // Recarregar histórico
  carregarDadosPainel();
});

socket.on('repetir-chamada', (dados) => {
  console.log('Repetindo chamada:', dados);
  tocarSomPainelBeep();
  // O display permanece o mesmo, apenas toca o som novamente e repete o anúncio
  setTimeout(() => {
    falarSenhaEMesa(dados.senha, dados.mesa);
  }, 1800);
});

// Som baseado em arquivo MP3 para o painel
function tocarSomPainelBeep() {
  try {
    const audio = new Audio('/audio/freesound_community-cityrail_beep-92280.mp3');
    audio.play().catch((erro) => {
      console.warn('Não foi possível reproduzir o som no painel:', erro);
    });
  } catch (erro) {
    console.warn('Erro ao tentar tocar som no painel:', erro);
  }
}

// Falar número da senha e mesa usando síntese de voz do navegador
function falarSenhaEMesa(senha, mesa) {
  try {
    if (!('speechSynthesis' in window)) return;

    const partes = senha.match(/[a-zA-Z]+|[0-9]+/g);
    
    let textoProcessado = "";

    if (partes) {
      partes.forEach(parte => {
        if (isNaN(parte)) {
          textoProcessado += parte.split('').join(' ') + " ";
        } else {
          textoProcessado += parte + " "; 
        }
      });
    } else {
      textoProcessado = senha;
    }

    const textoMesa = mesa ? `mesa ${mesa}` : 'mesa não informada';
    
    const mensagem = `Senha, ${textoProcessado}. ${textoMesa}.`;
    
    const utterance = new SpeechSynthesisUtterance(mensagem);
    
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85; 
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    
  } catch (erro) {
    console.warn('Erro na síntese de voz:', erro);
  }
}

socket.on('senhas-resetadas', () => {
  console.log('Senhas resetadas');
  ultimaSenha = null;
  document.getElementById('numero-gigante').textContent = '--';
  document.getElementById('numero-mesa').textContent = '--';
  
  const lista = document.getElementById('historico-painel');
  lista.innerHTML = '<div class="item-historico vazio"><span>Aguardando primeira senha...</span></div>';
});

// ============ INICIAR ============

window.addEventListener('DOMContentLoaded', inicializar);
