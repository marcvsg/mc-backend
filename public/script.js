// Navegação entre seções
function showSection(sectionId) {
  // Esconder todas as seções
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Mostrar a seção selecionada
  document.getElementById(sectionId).classList.add("active");

  // Atualizar navegação ativa
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Adicionar classe ativa ao link correspondente
  const activeLink = document.querySelector(`[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Carregar dados específicos da seção
  if (sectionId === "usuarios") {
    loadUsers();
  }
}

// Verificar status do servidor
async function checkStatus() {
  const statusDisplay = document.getElementById("status-display");
  statusDisplay.classList.add("hidden");

  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    if (response.ok) {
      statusDisplay.innerHTML = `
                <div class="status-display success">
                    <h3><i class="fas fa-check-circle"></i> Servidor Online</h3>
                    <p>${data.message}</p>
                    <small>Última verificação: ${new Date(
                      data.timestamp
                    ).toLocaleString("pt-BR")}</small>
                </div>
            `;
    } else {
      throw new Error("Erro na resposta do servidor");
    }
  } catch (error) {
    statusDisplay.innerHTML = `
            <div class="status-display error">
                <h3><i class="fas fa-exclamation-triangle"></i> Erro de Conexão</h3>
                <p>Não foi possível conectar ao servidor</p>
                <small>Erro: ${error.message}</small>
            </div>
        `;
  }

  statusDisplay.classList.remove("hidden");
}

// Carregar lista de usuários
async function loadUsers() {
  const usersContainer = document.getElementById("users-container");
  usersContainer.innerHTML =
    '<div class="loading">Carregando usuários...</div>';

  try {
    const response = await fetch("/api/usuarios");
    const users = await response.json();

    if (response.ok && users.length > 0) {
      const usersHTML = users
        .map(
          (user) => `
                <div class="user-card">
                    <div class="user-info">
                        <h3>${user.nome}</h3>
                        <p><strong>Cargo:</strong> ${user.cargo}</p>
                    </div>
                    <div class="user-email">
                        <i class="fas fa-envelope"></i>
                        ${user.email}
                    </div>
                </div>
            `
        )
        .join("");

      usersContainer.innerHTML = usersHTML;
    } else {
      usersContainer.innerHTML =
        '<div class="loading">Nenhum usuário encontrado</div>';
    }
  } catch (error) {
    usersContainer.innerHTML = `
            <div class="loading" style="color: #ef4444;">
                Erro ao carregar usuários: ${error.message}
            </div>
        `;
  }
}

// Enviar formulário de contato
async function submitContactForm(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const contactResult = document.getElementById("contact-result");

  // Esconder resultado anterior
  contactResult.classList.add("hidden");

  // Validar campos
  const nome = formData.get("nome").trim();
  const email = formData.get("email").trim();
  const mensagem = formData.get("mensagem").trim();

  if (!nome || !email || !mensagem) {
    showContactResult("Por favor, preencha todos os campos", "error");
    return;
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showContactResult("Por favor, insira um email válido", "error");
    return;
  }

  try {
    const response = await fetch("/api/contato", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
        mensagem,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showContactResult(data.message, "success");
      form.reset(); // Limpar formulário
    } else {
      showContactResult(data.error || "Erro ao enviar mensagem", "error");
    }
  } catch (error) {
    showContactResult("Erro de conexão. Tente novamente.", "error");
  }
}

// Mostrar resultado do contato
function showContactResult(message, type) {
  const contactResult = document.getElementById("contact-result");
  contactResult.innerHTML = message;
  contactResult.className = `contact-result ${type}`;
  contactResult.classList.remove("hidden");

  // Auto-hide após 5 segundos
  setTimeout(() => {
    contactResult.classList.add("hidden");
  }, 5000);
}

// Função para cadastrar cliente
async function cadastrarCliente(event) {
  event.preventDefault();

  const form = document.getElementById("clienteForm");
  const formData = new FormData(form);

  // Capturar os dados do formulário
  const clienteData = {
    nome_cliente: formData.get("nome_cliente"),
    email_cliente: formData.get("email_cliente"),
    telefone_cliente: formData.get("telefone_cliente"),
    endereco_cliente: formData.get("endereco_cliente"),
    cidade_cliente: formData.get("cidade_cliente"),
  };

  // Validar campos obrigatórios
  if (!clienteData.nome_cliente || !clienteData.email_cliente) {
    showToast("Nome e email são obrigatórios!", "error");
    return;
  }

  try {
    // Mostrar loading
    const btnCadastrar = document.getElementById("btn-cadastrar");
    const originalText = btnCadastrar.textContent;
    btnCadastrar.textContent = "Cadastrando...";
    btnCadastrar.disabled = true;

    // Enviar dados para o backend
    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clienteData),
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Cliente cadastrado com sucesso!", "success");
      form.reset(); // Limpar o formulário

      // Resetar o campo telefone para o valor padrão
      const telefoneInput = document.getElementById("telefone_cliente");
      if (telefoneInput) {
        telefoneInput.value = "21 9";
      }
    } else {
      showToast(result.error || "Erro ao cadastrar cliente", "error");
    }
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    showToast(
      "Erro de conexão. Verifique se o servidor está rodando.",
      "error"
    );
  } finally {
    // Restaurar botão
    const btnCadastrar = document.getElementById("btn-cadastrar");
    btnCadastrar.textContent = originalText;
    btnCadastrar.disabled = false;
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Event listener para o formulário de cadastro de cliente
  const clienteForm = document.getElementById("clienteForm");
  if (clienteForm) {
    clienteForm.addEventListener("submit", cadastrarCliente);
  }

  // Formatação do campo de telefone
  const telefoneInput = document.getElementById("telefone_cliente");
  if (telefoneInput) {
    telefoneInput.addEventListener("input", function () {
      formatarTelefone(this);
    });

    telefoneInput.addEventListener("focus", function () {
      // Se o campo estiver vazio ou só com "21 9", posiciona o cursor no final
      if (this.value === "21 9" || this.value === "") {
        this.setSelectionRange(4, 4);
      }
    });
  }

  // Navegação por links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  // Formulário de contato
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", submitContactForm);
  }

  // Carregar usuários automaticamente se estiver na seção
  if (
    document.getElementById("usuarios") &&
    document.getElementById("usuarios").classList.contains("active")
  ) {
    loadUsers();
  }

  // Adicionar efeitos de hover nos cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Animações de entrada
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observar elementos para animação
  document
    .querySelectorAll(".feature-card, .user-card, .contact-form")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
});

// Função para formatar telefone
function formatarTelefone(input) {
  let valor = input.value.replace(/\D/g, ""); // Remove tudo que não é dígito

  // Garante que sempre começa com "21 9"
  if (!valor.startsWith("219")) {
    valor = "219" + valor.replace(/^219/, "");
  }

  // Formata o número
  if (valor.length >= 3) {
    valor = valor.replace(/^(\d{2})(\d{1})(\d{0,4})(\d{0,4})/, "$1 $2 $3$4");
  }

  // Adiciona hífen se necessário
  if (valor.length >= 8) {
    valor = valor.replace(/^(\d{2}\s\d{1}\s\d{4})(\d{0,4})/, "$1-$2");
  }

  input.value = valor;
}

// Função para mostrar notificação toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fas fa-${
          type === "success"
            ? "check-circle"
            : type === "error"
            ? "exclamation-circle"
            : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

  // Adicionar estilos inline para o toast
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "error"
            ? "#ef4444"
            : "#667eea"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

  document.body.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Função para formatar data e hora
function formatarDataHora(dataString, horaString) {
  if (!dataString || !horaString) return "N/A";

  const data = new Date(dataString + " " + horaString);
  if (isNaN(data.getTime())) return "Data inválida";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Função para carregar e exibir clientes
async function carregarClientes() {
  const listaClientes = document.getElementById("lista-clientes");

  if (!listaClientes) return;

  listaClientes.innerHTML = '<div class="loading">Carregando clientes...</div>';

  try {
    const response = await fetch("/api/clientes");
    const data = await response.json();

    if (response.ok && data.success) {
      if (data.clientes && data.clientes.length > 0) {
        const clientesHTML = data.clientes
          .map(
            (cliente) => `
                  <div class="cliente-item">
                      <div class="cliente-header">
                          <h3 class="cliente-nome">${cliente.nome_cliente}</h3>
                          <span class="cliente-id">#${cliente.id}</span>
                      </div>
                      <div class="cliente-info">
                          <p><strong>Email:</strong> ${
                            cliente.email_cliente
                          }</p>
                          <p><strong>Telefone:</strong> ${
                            cliente.telefone_cliente || "Não informado"
                          }</p>
                          <p><strong>Endereço:</strong> ${
                            cliente.endereco_cliente || "Não informado"
                          }</p>
                          <p><strong>Cidade:</strong> ${
                            cliente.cidade_cliente || "Não informada"
                          }</p>
                      </div>
                      <div class="cliente-datas">
                          <p><strong>Cadastrado em:</strong> ${formatarDataHora(
                            cliente.data,
                            cliente.hora
                          )}</p>
                      </div>
                  </div>
              `
          )
          .join("");

        listaClientes.innerHTML = clientesHTML;
      } else {
        listaClientes.innerHTML =
          '<div class="empty">Nenhum cliente cadastrado ainda</div>';
      }
    } else {
      listaClientes.innerHTML = `<div class="error">Erro ao carregar clientes: ${
        data.error || "Erro desconhecido"
      }</div>`;
    }
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    listaClientes.innerHTML =
      '<div class="error">Erro de conexão. Verifique se o servidor está rodando.</div>';
  }
}

// Função para abrir modal
function abrirModal() {
  const modal = document.getElementById("modal-clientes");
  modal.style.display = "block";
  carregarClientes();
}

// Função para fechar modal
function fecharModal() {
  const modal = document.getElementById("modal-clientes");
  modal.style.display = "none";
}

// Event Listeners para o modal
document.addEventListener("DOMContentLoaded", function () {
  // Botão para abrir modal
  const btnVerClientes = document.getElementById("btn-ver-clientes");
  if (btnVerClientes) {
    btnVerClientes.addEventListener("click", abrirModal);
  }

  // Botão para fechar modal
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", fecharModal);
  }

  // Fechar modal clicando fora dele
  const modal = document.getElementById("modal-clientes");
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        fecharModal();
      }
    });
  }

  // Fechar modal com ESC
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      fecharModal();
    }
  });
});
