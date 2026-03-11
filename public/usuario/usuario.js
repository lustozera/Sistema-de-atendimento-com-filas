// ============ USUARIO.JS ============

const socket = io();
let setorSelecionado = '';
let tipoSelecionado = '';

// Elementos do DOM
const etapaSelecaoSetor = document.getElementById('selecao-setor');
const etapaSelecaoTipo = document.getElementById('selecao-tipo');
const etapaSenhaGerada = document.getElementById('senha-gerada');

// ============ EVENTOS - SELEÇÃO DE SETOR ============

document.querySelectorAll('.btn-setor').forEach(btn => {
  btn.addEventListener('click', async function() {
    setorSelecionado = this.dataset.setor;
    mostrarEtapa('selecao-tipo');
  });
});

// ============ EVENTOS - SELEÇÃO DE TIPO ============

document.querySelectorAll('.btn-tipo').forEach(btn => {
  btn.addEventListener('click', async function() {
    tipoSelecionado = this.dataset.tipo;
    await gerarSenha();
  });
});

// ============ GERAR SENHA ============

async function gerarSenha() {
  try {
    const response = await fetch('/api/gerar-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        setor: setorSelecionado,
        tipo: tipoSelecionado
      })
    });

    const dados = await response.json();

    if (dados.erro) {
      mostraAlerta(dados.erro);
      return;
    }

    // Exibir senha gerada
    exibirSenhaGerada(dados);
  } catch (erro) {
    console.error('Erro ao gerar senha:', erro);
    mostraAlerta('Erro ao gerar senha. Tente novamente.');
  }
}

// ============ EXIBIR SENHA ============

function exibirSenhaGerada(dados) {
  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Cadastro de Veículos/Empresas',
    'protocolo': 'Protocolar Documentos'
  };

  const tipoNome = dados.tipo === 'preferencial' ? 'Preferencial' : 'Normal';

  document.getElementById('display-senha').textContent = dados.senha;
  document.getElementById('display-setor').textContent = setorNomes[dados.setor];
  document.getElementById('display-tipo').textContent = tipoNome;
  document.getElementById('display-posicao').textContent = dados.filaAtual;

  // Animação de entrada
  mostrarEtapa('senha-gerada');

  // Armazenar dados na sessão para imprimir
  sessionStorage.setItem('ultimaSenha', JSON.stringify({
    numero: dados.senha,
    setor: setorNomes[dados.setor],
    tipo: tipoNome,
    data: new Date().toLocaleString('pt-BR')
  }));

  // Voltar para tela inicial após 5 segundos
  setTimeout(() => {
    novarSenha();
  }, 5000);
}

// ============ NAVEGAÇÃO ============

function mostrarEtapa(etapaId) {
  // Esconder todas as etapas
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('step-active');
  });

  // Mostrar etapa selecionada
  document.getElementById(etapaId).classList.add('step-active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ Loading Impressão ============

function mostrarLoadingImpressao() {
  const loading = document.getElementById("loading-impressao");
  if (loading) {
    loading.classList.remove("hidden");
  }
}

// ============ Loading Impressão ============

function mostrarLoadingImpressao() {
  const loading = document.getElementById("loading-impressao");
  if (loading) {
    loading.classList.remove("hidden");
  }
}

function esconderLoadingImpressao() {
  const loading = document.getElementById("loading-impressao");
  if (loading) {
    loading.classList.add("hidden");
  }
}

// ============ IMPRIMIR SENHA ============

function imprimirSenha() {
  const dados = JSON.parse(sessionStorage.getItem('ultimaSenha'));

  if (!dados) {
    mostraAlerta('Nenhuma senha para imprimir');
    return;
  }

  // IMPORTANTE:
  // abre a janela imediatamente no clique para não ser bloqueada
  const janela = window.open('', '_blank');

  if (!janela) {
    mostraAlerta("Permita popups para imprimir.");
    return;
  }

  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Senha</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: #fff;
          width: 58mm;
          margin: 0 auto;
          padding: 0;
        }

        .ticket {
          width: 58mm;
          padding: 4mm 3mm;
          text-align: center;
          color: #000;
        }

        .logo {
          width: 95px;
          height: 95px;
          margin: 0 auto 8px;
          display: block;
        }

        .titulo {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .numero {
          font-size: 54px;
          font-weight: bold;
          line-height: 1;
          margin: 8px 0 12px;
          letter-spacing: 2px;
        }

        .linha {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }

        .info {
          font-size: 12px;
          margin-top: 6px;
          text-align: center;
        }

        .info p {
          margin: 4px 0;
          word-break: break-word;
        }

        .label {
          font-weight: bold;
        }

        .aviso {
          margin-top: 8px;
          font-size: 11px;
          font-weight: bold;
        }

        @page {
          size: 58mm auto;
          margin: 0;
        }

        @media print {
          html, body {
            width: 58mm;
            background: #fff;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .ticket {
            width: 58mm;
            padding: 4mm 3mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <img src="/images/logo_senha.png" alt="Logo" class="logo">
        <div class="titulo">Senha de Atendimento</div>
        <div class="linha"></div>
        <div class="numero">${dados.numero}</div>
        <div class="linha"></div>
        <div class="info">
          <p><span class="label">Setor:</span> ${dados.setor}</p>
          <p><span class="label">Tipo:</span> ${dados.tipo}</p>
          <p><span class="label">Gerada:</span> ${dados.data}</p>
        </div>
        <div class="aviso">AGUARDE SER CHAMADO</div>
      </div>

      <script>
        let finalizado = false;

        function finalizarImpressao() {
          if (finalizado) return;
          finalizado = true;

          if (window.opener) {
            const loading = window.opener.document.getElementById("loading-impressao");
            if (loading) {
              loading.classList.remove("hidden");
            }

            setTimeout(() => {
              window.opener.location.href = "/usuario";
              window.close();
            }, 1200);
          } else {
            window.close();
          }
        }

        window.onload = function() {
          window.focus();
          window.print();
        };

        // Quando terminar/cancelar a impressão
        window.onafterprint = finalizarImpressao;

        // Fallback para navegadores que não disparam bem o afterprint
        window.addEventListener("focus", function() {
          setTimeout(finalizarImpressao, 300);
        });
      <\/script>
    </body>
    </html>
  `);

  janela.document.close();
}
// ============ NOVA SENHA ============

function novarSenha() {
  setorSelecionado = '';
  tipoSelecionado = '';
  mostrarEtapa('selecao-setor');
}

function voltarParaSetor() {
  tipoSelecionado = '';
  mostrarEtapa('selecao-setor');
}

// ============ SONS ============

function tocarSomSucesso() {
  // Usar Web Audio API para gerar um tom simples
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// ============ ALERTA ============

function mostraAlerta(mensagem) {
  alert(mensagem);
}

// ============ SOCKET.IO ============

socket.on('estado-inicial', (dados) => {
  console.log('Conectado ao servidor');
});

socket.on('nova-senha', (dados) => {
  console.log('Nova senha gerada:', dados);
});

socket.on('repetir-chamada', (dados) => {
  console.log('Repetindo chamada:', dados);
  // Não toca som no /usuario; som apenas no /painel
});
