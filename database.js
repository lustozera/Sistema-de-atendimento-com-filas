const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'fila.db');
    this.db = null;
  }

  init() {
    // Criar pasta data se não existir
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
      } else {
        console.log('Banco de dados conectado');
        // O serialize garante que os comandos de criação rodem em ordem
        this.db.serialize(() => {
          this.criarTabelas();
        });
      }
    });
  }

  criarTabelas() {
    // 1. Tabela de configurações (Necessária para os contadores)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT UNIQUE NOT NULL,
        valor TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela configuracoes:', err);
      } else {
        // Inicializar contadores somente após a tabela ser confirmada
        const prefixos = ['CN', 'CP', 'ON', 'OP', 'FN', 'FP', 'DN', 'DP'];
        prefixos.forEach((prefixo) => {
          this.db.run(`
            INSERT OR IGNORE INTO configuracoes (chave, valor) 
            VALUES ('contador_${prefixo}', '0')
          `);
        });
      }
    });

    // 2. Tabela de senhas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS senhas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT UNIQUE NOT NULL,
        setor TEXT NOT NULL,
        tipo TEXT NOT NULL,
        status TEXT DEFAULT 'aguardando',
        mesa TEXT,
        data_geracao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_chamada DATETIME,
        data_finalizacao DATETIME
      )
    `);

    // 3. Tabela de histórico
    this.db.run(`
      CREATE TABLE IF NOT EXISTS historico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senha_id INTEGER,
        numero TEXT,
        setor TEXT,
        tipo TEXT,
        mesa TEXT,
        tempo_espera INTEGER,
        FOREIGN KEY(senha_id) REFERENCES senhas(id)
      )
    `);

    console.log('Tabelas enviadas para criação/verificação');
  }

  gerarSenha(setor, tipo) {
    const setorAbrev = {
      'ouvidoria': 'O',
      'financas': 'F',
      'veiculos': 'C',
      'protocolo': 'D'
    };

    const tipoAbrev = tipo === 'preferencial' ? 'P' : 'N';
    const setorPrefix = setorAbrev[setor] || 'X';
    const prefixo = `${setorPrefix}${tipoAbrev}`;
    const chaveContador = `contador_${prefixo}`;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.get(
          'SELECT valor FROM configuracoes WHERE chave = ?',
          [chaveContador],
          (err, row) => {
            if (err) return reject(err);

            let contador;
            if (row && row.valor !== undefined && row.valor !== null) {
              contador = parseInt(row.valor, 10) + 1;
            } else {
              contador = 1;
              this.db.run(
                'INSERT OR IGNORE INTO configuracoes (chave, valor) VALUES (?, ?)',
                [chaveContador, '0']
              );
            }

            contador = contador % 1000;
            const numero = `${prefixo}${String(contador).padStart(3, '0')}`;

            this.db.run(
              'UPDATE configuracoes SET valor = ? WHERE chave = ?',
              [contador.toString(), chaveContador]
            );

            this.db.run(
              `INSERT INTO senhas (numero, setor, tipo, status) 
               VALUES (?, ?, ?, 'aguardando')`,
              [numero, setor, tipo],
              function(err) {
                if (err) return reject(err);
                resolve({
                  id: this.lastID,
                  numero: numero,
                  setor: setor,
                  tipo: tipo
                });
              }
            );
          }
        );
      });
    });
  }

  contarFilaPorSetor(setor) {
    return new Promise((resolve) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM senhas WHERE setor = ? AND status = "aguardando"',
        [setor],
        (err, row) => {
          resolve(row ? row.count : 0);
        }
      );
    });
  }

  obterProximaSenha(setor) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT * FROM senhas 
         WHERE setor = ? AND status = 'aguardando'
         ORDER BY tipo DESC, data_geracao ASC
         LIMIT 1`,
        [setor],
        (err, row) => {
          resolve(row || null);
        }
      );
    });
  }

  chamarSenha(senhaId, mesa) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE senhas 
         SET status = 'chamada', mesa = ?, data_chamada = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [mesa, senhaId],
        () => resolve(true)
      );
    });
  }

  chamarSenhaEspecifica(senhaNumero, mesa) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE senhas 
         SET status = 'chamada', mesa = ?, data_chamada = CURRENT_TIMESTAMP
         WHERE numero = ?`,
        [mesa, senhaNumero],
        function(err) {
          resolve(this.changes > 0);
        }
      );
    });
  }

  obterSenhaEspecifica(senhaNumero) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT id, numero FROM senhas WHERE numero = ? LIMIT 1`,
        [senhaNumero],
        (err, row) => {
          resolve(row || null);
        }
      );
    });
  }

  pularSenha(senhaId) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE senhas SET status = 'pulada' WHERE id = ?`,
        [senhaId],
        () => resolve(true)
      );
    });
  }

  finalizarAtendimento(senhaId) {
    return new Promise((resolve) => {
      this.db.run(
        `UPDATE senhas 
         SET status = 'finalizado', data_finalizacao = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [senhaId],
        () => resolve(true)
      );
    });
  }

  obterSenhasRecentes(limite = 10) {
    return new Promise((resolve) => {
      this.db.all(
        `SELECT numero, setor, mesa FROM senhas 
         WHERE status IN ('chamada', 'finalizado')
         ORDER BY data_chamada DESC
         LIMIT ?`,
        [limite],
        (err, rows) => {
          resolve(rows || []);
        }
      );
    });
  }

  obterUltimaSenahaChamada() {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT numero, setor, mesa FROM senhas 
         WHERE status = 'chamada'
         ORDER BY data_chamada DESC
         LIMIT 1`,
        (err, row) => {
          resolve(row || null);
        }
      );
    });
  }

  resetarSenhas() {
    return new Promise((resolve) => {
      this.db.run('DELETE FROM senhas', () => {
        this.db.run('UPDATE configuracoes SET valor = "0" WHERE chave LIKE "contador_%"', () => {
          resolve(true);
        });
      });
    });
  }

  obterHistorico(completo = false) {
    return new Promise((resolve) => {
      const limite = completo ? '' : 'LIMIT 50';
      this.db.all(
        `SELECT 
           numero,
           setor,
           tipo,
           mesa,
           CAST((julianday(data_chamada) - julianday(data_geracao)) * 24 * 60 AS INTEGER) as tempo_espera,
           CAST((julianday(data_finalizacao) - julianday(data_chamada)) * 24 * 60 AS INTEGER) as tempo_atendimento
         FROM senhas
         WHERE status = 'finalizado'
         ORDER BY data_finalizacao DESC
         ${limite}`,
        (err, rows) => {
          resolve(rows || []);
        }
      );
    });
  }
}

module.exports = Database;
