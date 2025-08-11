const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da conexão MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "mc",
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Função para criar conexão
function createConnection() {
  return mysql.createConnection(dbConfig);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "Servidor funcionando perfeitamente!",
    timestamp: new Date().toISOString(),
  });
});

// ===== ROTAS PARA CLIENTES =====

// GET - Listar todos os clientes
app.get("/api/clientes", (req, res) => {
  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    const query = "SELECT * FROM clientes ORDER BY nome_cliente";
    conexao.query(query, (err, results) => {
      conexao.end();

      if (err) {
        console.error("Erro na consulta:", err);
        return res.status(500).json({ error: "Erro ao buscar clientes" });
      }

      res.json({
        success: true,
        clientes: results,
        total: results.length,
      });
    });
  });
});

// GET - Buscar cliente por ID
app.get("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    const query = "SELECT * FROM clientes WHERE id = ?";
    conexao.query(query, [id], (err, results) => {
      conexao.end();

      if (err) {
        console.error("Erro na consulta:", err);
        return res.status(500).json({ error: "Erro ao buscar cliente" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      res.json({
        success: true,
        cliente: results[0],
      });
    });
  });
});

// POST - Criar novo cliente
app.post("/api/clientes", (req, res) => {
  console.log("Recebida requisição POST /api/clientes");
  console.log("Dados recebidos:", req.body);

  const {
    nome_cliente,
    email_cliente,
    telefone_cliente,
    endereco_cliente,
    cidade_cliente,
  } = req.body;

  console.log("🔍 Dados extraídos:", {
    nome_cliente,
    email_cliente,
    telefone_cliente,
    endereco_cliente,
    cidade_cliente,
  });

  // Validação dos campos obrigatórios
  if (!nome_cliente || !email_cliente) {
    console.log("Validação falhou: campos obrigatórios faltando");
    return res.status(400).json({
      error: "Nome e email são obrigatórios",
    });
  }

  console.log("✅ Validação passou, tentando conectar ao banco...");

  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão com o banco:", err.message);
      console.error("Detalhes do erro:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    console.log("Conectado ao banco de dados com sucesso!");

    const query =
      "INSERT INTO clientes (nome_cliente, email_cliente, telefone_cliente, endereco_cliente, cidade_cliente, data, hora) VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME())";
    const values = [
      nome_cliente,
      email_cliente,
      telefone_cliente || null,
      endereco_cliente || null,
      cidade_cliente || null,
    ];

    console.log("📊 Query SQL:", query);
    console.log("📊 Valores:", values);

    conexao.query(query, values, (err, result) => {
      conexao.end();
      console.log("🔌 Conexão com banco fechada");

      if (err) {
        console.error("Erro ao inserir no banco:", err.message);
        console.error("Código do erro:", err.code);
        console.error("Detalhes completos:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Email já cadastrado" });
        }
        if (err.code === "ER_NO_SUCH_TABLE") {
          return res
            .status(500)
            .json({ error: "Tabela clientes não existe no banco de dados" });
        }
        return res
          .status(500)
          .json({ error: "Erro ao criar cliente: " + err.message });
      }

      console.log("Cliente inserido com sucesso!");
      console.log("ID do cliente:", result.insertId);
      console.log("Linhas afetadas:", result.affectedRows);

      res.status(201).json({
        success: true,
        message: "Cliente criado com sucesso",
        clienteId: result.insertId,
      });
    });
  });
});

// PUT - Atualizar cliente
app.put("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_cliente,
    email_cliente,
    telefone_cliente,
    endereco_cliente,
    cidade_cliente,
  } = req.body;

  if (!nome_cliente || !email_cliente) {
    return res.status(400).json({
      error: "Nome e email são obrigatórios",
    });
  }

  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    const query =
      "UPDATE clientes SET nome_cliente = ?, email_cliente = ?, telefone_cliente = ?, endereco_cliente = ?, cidade_cliente = ?, data = CURDATE(), hora = CURTIME() WHERE id = ?";
    const values = [
      nome_cliente,
      email_cliente,
      telefone_cliente || null,
      endereco_cliente || null,
      cidade_cliente || null,
      id,
    ];

    conexao.query(query, values, (err, result) => {
      conexao.end();

      if (err) {
        console.error("Erro ao atualizar:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Email já cadastrado para outro cliente" });
        }
        return res.status(500).json({ error: "Erro ao atualizar cliente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      res.json({
        success: true,
        message: "Cliente atualizado com sucesso",
      });
    });
  });
});

// DELETE - Excluir cliente
app.delete("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    const query = "DELETE FROM clientes WHERE id = ?";
    conexao.query(query, [id], (err, result) => {
      conexao.end();

      if (err) {
        console.error("Erro ao excluir:", err);
        return res.status(500).json({ error: "Erro ao excluir cliente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      res.json({
        success: true,
        message: "Cliente excluído com sucesso",
      });
    });
  });
});

// POST - Buscar clientes (com filtros)
app.post("/api/clientes/buscar", (req, res) => {
  const { nome, email, cidade } = req.body;
  const conexao = createConnection();

  conexao.connect((err) => {
    if (err) {
      console.error("Erro na conexão:", err);
      return res
        .status(500)
        .json({ error: "Erro na conexão com o banco de dados" });
    }

    let query = "SELECT * FROM clientes WHERE 1=1";
    let values = [];

    if (nome) {
      query += " AND nome_cliente LIKE ?";
      values.push(`%${nome}%`);
    }

    if (email) {
      query += " AND email_cliente LIKE ?";
      values.push(`%${email}%`);
    }

    if (cidade) {
      query += " AND cidade_cliente LIKE ?";
      values.push(`%${cidade}%`);
    }

    query += " ORDER BY nome_cliente";

    conexao.query(query, values, (err, results) => {
      conexao.end();

      if (err) {
        console.error("Erro na consulta:", err);
        return res.status(500).json({ error: "Erro ao buscar clientes" });
      }

      res.json({
        success: true,
        clientes: results,
        total: results.length,
      });
    });
  });
});

// Rota de contato (mantida do código original)
app.post("/api/contato", (req, res) => {
  const { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({
      error: "Todos os campos são obrigatórios",
    });
  }

  // Aqui você pode salvar a mensagem de contato no banco
  res.json({
    success: true,
    message: "Mensagem enviada com sucesso!",
  });
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);

  // Testar conexão com o banco de dados na inicialização
  const conexaoTeste = createConnection();
  conexaoTeste.connect((err) => {
    if (err) {
      console.error("Erro na conexão com MySQL:", err.message);
      console.error(
        "Verifique se o MySQL está rodando e as credenciais estão corretas"
      );
    } else {
      console.log("Conexão com MySQL estabelecida com sucesso!");
      console.log(`Banco de dados: ${dbConfig.database}`);

      // Verificar se a tabela clientes existe
      conexaoTeste.query('SHOW TABLES LIKE "clientes"', (err, results) => {
        if (err) {
          console.error("Erro ao verificar tabela clientes:", err.message);
        } else if (results.length === 0) {
          console.warn(
            'Tabela "clientes" não encontrada no banco de dados!'
          );
          console.log("Execute o seguinte SQL para criar a tabela:");
          console.log(`
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_cliente VARCHAR(100) NOT NULL,
  email_cliente VARCHAR(150) NOT NULL UNIQUE,
  telefone_cliente VARCHAR(20),
  endereco_cliente VARCHAR(200),
  cidade_cliente VARCHAR(100),
  data DATE,
  hora TIME
);
`);
        } else {
          console.log('Tabela "clientes" encontrada!');
        }
        conexaoTeste.end();
      });
    }
  });
});
