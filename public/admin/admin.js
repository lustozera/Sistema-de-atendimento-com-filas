// ============ ADMIN.JS ============

const socket = io();
let historicoAtual = []; // Armazenar histórico para exportação

// ============ INICIALIZAÇÃO ============

function inicializar() {
  carregarHistorico();
  carregarStatsDoHistorico();
  
  // Atualizar a cada 10 segundos
  setInterval(() => {
    carregarHistorico();
    carregarStatsDoHistorico();
  }, 10000);
}

// ============ CARREGAR ESTATÍSTICAS ============

async function carregarEstatisticas() {
  try {
    const response = await fetch('/api/painel-atual');
    const painel = await response.json();
    console.log('Dados painel atual:', painel);
  } catch (erro) {
    console.error('Erro ao carregar estatísticas:', erro);
  }
}

// Função para carregar stats do histórico
async function carregarStatsDoHistorico() {
  try {
    const response = await fetch('/api/historico');
    if (!response.ok) throw new Error('Erro ao buscar histórico');
    const historico = await response.json();
    
    if (historico && historico.length > 0) {
      document.getElementById('total-senhas').textContent = historico.length;
      document.getElementById('total-atendidas').textContent = historico.length;
      
      // Calcular tempo médio
      const tempos = historico
        .filter(h => h.tempo_espera && h.tempo_espera > 0)
        .map(h => h.tempo_espera);
      
      let tempoMedio = 0;
      if (tempos.length > 0) {
        tempoMedio = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
      }
      document.getElementById('tempo-medio').textContent = tempoMedio + 'm';
    } else {
      document.getElementById('total-senhas').textContent = '0';
      document.getElementById('total-atendidas').textContent = '0';
      document.getElementById('tempo-medio').textContent = '0m';
    }
  } catch (erro) {
    console.error('Erro ao carregar stats:', erro);
  }
}

// ============ CARREGAR HISTÓRICO ============

async function carregarHistorico() {
  try {
    const response = await fetch('/api/historico');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const historico = await response.json();
    console.log('Histórico carregado:', historico);

    if (historico && historico.length > 0) {
      atualizarTabelaHistorico(historico);
    } else {
      console.log('Nenhum histórico disponível');
      document.getElementById('total-senhas').textContent = '0';
      document.getElementById('total-atendidas').textContent = '0';
      document.getElementById('tempo-medio').textContent = '0m';
    }
  } catch (erro) {
    console.error('Erro ao carregar histórico:', erro);
    alert('Erro ao carregar histórico de atendimentos. Verifique o console.');
  }
}

// ============ ATUALIZAR TABELA DE HISTÓRICO ============

function atualizarTabelaHistorico(historico) {
  // Armazenar para exportação
  historicoAtual = historico;
  
  const tbody = document.getElementById('historico-tbody');
  
  if (historico.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--cor-texto-secundario);">
          Nenhum atendimento registrado
        </td>
      </tr>
    `;
    return;
  }

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos/Empresas',
    'protocolo': 'Protocolar'
  };

  tbody.innerHTML = historico.map(item => `
    <tr>
      <td><strong>${item.numero}</strong></td>
      <td>${setorNomes[item.setor] || item.setor}</td>
      <td>${item.tipo === 'preferencial' ? '⭐ Preferencial' : 'Normal'}</td>
      <td>${item.mesa || '-'}</td>
      <td>${item.tempo_espera != null ? item.tempo_espera + ' min' : '-'}</td>
      <td>${item.tempo_atendimento != null ? item.tempo_atendimento + ' min' : '-'}</td>
    </tr>
  `).join('');

  // Atualizar estatísticas
  atualizarEstatisticas(historico);
}

// ============ ATUALIZAR ESTATÍSTICAS ============

function atualizarEstatisticas(historico) {
  const totalAtendidas = historico.length;
  document.getElementById('total-atendidas').textContent = totalAtendidas;

  // Calcular tempo médio
  const tempos = historico
    .filter(h => h.tempo_espera && h.tempo_espera > 0)
    .map(h => h.tempo_espera);

  let tempoMedio = 0;
  if (tempos.length > 0) {
    tempoMedio = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
  }

  document.getElementById('tempo-medio').textContent = tempoMedio + 'm';
  document.getElementById('total-senhas').textContent = totalAtendidas;
}

// ============ EXPORTAÇÃO ============

function exportarCSV() {
  if (!historicoAtual || historicoAtual.length === 0) {
    alert('Nenhum atendimento para exportar.');
    return;
  }

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos/Empresas',
    'protocolo': 'Protocolar'
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

  historicoAtual.forEach(item => {
    linhas.push([
      item.numero,
      setorNomes[item.setor] || item.setor,
      item.tipo === 'preferencial' ? 'Preferencial' : 'Normal',
      item.mesa || '',
      item.tempo_espera != null ? item.tempo_espera : '',
      item.tempo_atendimento != null ? item.tempo_atendimento : ''
    ].join(';'));
  });

  const csvContent = linhas.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'historico_atendimentos.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportarXLS() {
  if (!historicoAtual || historicoAtual.length === 0) {
    alert('Nenhum atendimento para exportar.');
    return;
  }

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos/Empresas',
    'protocolo': 'Protocolar'
  };

  let html = '<table><thead><tr>' +
    '<th>Senha</th>' +
    '<th>Setor</th>' +
    '<th>Tipo</th>' +
    '<th>Mesa</th>' +
    '<th>Tempo de Espera (min)</th>' +
    '<th>Tempo de Atendimento (min)</th>' +
    '</tr></thead><tbody>';

  historicoAtual.forEach(item => {
    html += '<tr>' +
      `<td>${item.numero}</td>` +
      `<td>${setorNomes[item.setor] || item.setor}</td>` +
      `<td>${item.tipo === 'preferencial' ? 'Preferencial' : 'Normal'}</td>` +
      `<td>${item.mesa || ''}</td>` +
      `<td>${item.tempo_espera != null ? item.tempo_espera : ''}</td>` +
      `<td>${item.tempo_atendimento != null ? item.tempo_atendimento : ''}</td>` +
      '</tr>';
  });

  html += '</tbody></table>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'historico_atendimentos.xls';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============ CARREGAR MESAS OCUPADAS ============

async function carregarMesasOcupadas() {
  try {
    const response = await fetch('/api/mesas-ocupadas');
    if (!response.ok) throw new Error('Erro ao buscar mesas');
    
    const mesas = await response.json();
    atualizarTabelaMesas(mesas);
  } catch (erro) {
    console.error('Erro ao carregar mesas ocupadas:', erro);
  }
}

// ============ ATUALIZAR TABELA DE MESAS ============

function atualizarTabelaMesas(mesas) {
  const tbody = document.getElementById('mesas-tbody');
  
  if (!mesas || mesas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--cor-texto-secundario);">
          Nenhuma mesa ocupada no momento
        </td>
      </tr>
    `;
    return;
  }

  const setorNomes = {
    'ouvidoria': 'Ouvidoria',
    'financas': 'Finanças',
    'veiculos': 'Veículos/Empresas',
    'protocolo': 'Protocolar'
  };

  tbody.innerHTML = mesas.map(item => `
    <tr>
      <td><strong>${item.mesa}</strong></td>
      <td>${setorNomes[item.setor] || item.setor}</td>
      <td>
        <button class="btn btn-pequeno btn-perigo" onclick="liberarMesa('${item.mesa}')">
          🚪 Liberar
        </button>
      </td>
    </tr>
  `).join('');
}

// ============ LIBERAR MESA ============

async function liberarMesa(mesa) {
  if (!confirm(`Tem certeza que deseja liberar a mesa ${mesa}?`)) {
    return;
  }

  try {
    const response = await fetch('/api/liberar-mesa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mesa })
    });

    const dados = await response.json();

    if (dados.erro) {
      alert('❌ ' + dados.erro);
      return;
    }

    alert('✅ ' + dados.mensagem);
    carregarMesasOcupadas();
  } catch (erro) {
    console.error('Erro ao liberar mesa:', erro);
    alert('Erro ao liberar mesa');
  }
}

// ============ RESETAR SENHAS ============

async function solicitarReset() {
  const senhaInput = document.getElementById('senha-admin');
  const senha = senhaInput.value.trim();

  if (!senha) {
    alert('Digite a senha de administrador');
    return;
  }

  if (!confirm('Tem certeza? Esta ação é irreversível e apagará todas as senhas do dia.')) {
    return;
  }

  try {
    const response = await fetch('/api/resetar-senhas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ senha })
    });

    const dados = await response.json();

    if (dados.erro) {
      alert('❌ ' + dados.erro);
      senhaInput.value = '';
      return;
    }

    alert('✅ ' + dados.mensagem);
    senhaInput.value = '';

    // Resetar UI
    document.getElementById('total-senhas').textContent = '0';
    document.getElementById('total-atendidas').textContent = '0';
    document.getElementById('tempo-medio').textContent = '0m';
    
    const tbody = document.getElementById('historico-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--cor-texto-secundario);">
          Nenhum atendimento registrado
        </td>
      </tr>
    `;

  } catch (erro) {
    console.error('Erro ao resetar senhas:', erro);
    alert('Erro ao resetar senhas');
  }
}

// ============ PERSONALIZAÇÃO ============

function aplicarCor() {
  const cor = document.getElementById('cor-primaria').value;
  
  // Atualizar variável CSS
  document.documentElement.style.setProperty('--cor-primaria', cor);
  
  // Derivar cores relacionadas (simples)
  const corEscura = ajustarTomCor(cor, -20);
  const corClara = ajustarTomCor(cor, 50);
  
  document.documentElement.style.setProperty('--cor-primaria-escura', corEscura);
  document.documentElement.style.setProperty('--cor-primaria-clara', corClara);
  
  // Salvar em localStorage
  localStorage.setItem('cor-primaria', cor);
  
  alert('✅ Cor aplicada com sucesso!');
}

// ============ AJUSTAR TOM DE COR ============

function ajustarTomCor(cor, porcentagem) {
  // Converter hex para RGB
  const r = parseInt(cor.substr(1, 2), 16);
  const g = parseInt(cor.substr(3, 2), 16);
  const b = parseInt(cor.substr(5, 2), 16);

  // Ajustar tom
  const ajusteR = Math.min(255, Math.max(0, r + (255 - r) * (porcentagem / 100)));
  const ajusteG = Math.min(255, Math.max(0, g + (255 - g) * (porcentagem / 100)));
  const ajusteB = Math.min(255, Math.max(0, b + (255 - b) * (porcentagem / 100)));

  // Converter de volta para hex
  return '#' + 
    Math.round(ajusteR).toString(16).padStart(2, '0') +
    Math.round(ajusteG).toString(16).padStart(2, '0') +
    Math.round(ajusteB).toString(16).padStart(2, '0');
}

// ============ CARREGAR CONFIGURAÇÕES SALVAS ============

function carregarConfigurações() {
  // Carregar cor personalizada
  const corSalva = localStorage.getItem('cor-primaria');
  if (corSalva) {
    document.getElementById('cor-primaria').value = corSalva;
    const corEscura = ajustarTomCor(corSalva, -20);
    const corClara = ajustarTomCor(corSalva, 50);
    document.documentElement.style.setProperty('--cor-primaria', corSalva);
    document.documentElement.style.setProperty('--cor-primaria-escura', corEscura);
    document.documentElement.style.setProperty('--cor-primaria-clara', corClara);
  }

  // (Logotipo removido)
}

// ============ SOCKET.IO ============

socket.on('estado-inicial', (dados) => {
  console.log('Conectado ao painel administrativo');
});

socket.on('senhas-resetadas', () => {
  console.log('Sistema foi resetado');
  inicializar();
});

socket.on('mesa-liberada', (dados) => {
  console.log('Mesa liberada:', dados);
  carregarMesasOcupadas();
});

// ============ INICIAR ============

window.addEventListener('DOMContentLoaded', () => {
  carregarConfigurações();
  inicializar();
});
