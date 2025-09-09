// Elementos do DOM
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const togglePasswordButtons = document.querySelectorAll(".toggle-password");

// Função para alternar a visibilidade da senha
function togglePasswordVisibility(input) {
  const type = input.getAttribute("type") === "password" ? "text" : "password";
  input.setAttribute("type", type);

  // Atualiza o ícone
  const icon = input.nextElementSibling.querySelector("i");
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
}

// Adiciona evento de clique para os botões de mostrar/ocultar senha
togglePasswordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.previousElementSibling;
    togglePasswordVisibility(input);
  });
});

// Função para validar o formulário de login
function validateLoginForm(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    showError("Por favor, preencha todos os campos");
    return false;
  }

  if (!isValidEmail(email)) {
    showError("Por favor, insira um e-mail válido");
    return false;
  }

  return true;
}

// Função para validar o formulário de registro
function validateRegisterForm(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const terms = formData.get("terms");

  if (!name || !email || !password || !confirmPassword) {
    showError("Por favor, preencha todos os campos");
    return false;
  }

  if (!isValidEmail(email)) {
    showError("Por favor, insira um e-mail válido");
    return false;
  }

  if (password.length < 6) {
    showError("A senha deve ter pelo menos 6 caracteres");
    return false;
  }

  if (password !== confirmPassword) {
    showError("As senhas não coincidem");
    return false;
  }

  if (!terms) {
    showError("Você precisa aceitar os termos de uso");
    return false;
  }

  return true;
}

// Função para validar e-mail
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para mostrar mensagens de erro
function showError(message) {
  // Remove qualquer mensagem de erro existente
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Cria e exibe a nova mensagem de erro
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.color = "#ef4444";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "0.5rem";
  errorDiv.style.textAlign = "center";
  errorDiv.textContent = message;

  const form = document.querySelector(".auth-form");
  form.insertBefore(errorDiv, form.firstChild);

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Função para mostrar mensagens de sucesso
function showSuccess(message) {
  // Remove qualquer mensagem existente
  const existingMessage = document.querySelector(
    ".success-message, .error-message"
  );
  if (existingMessage) {
    existingMessage.remove();
  }

  // Cria e exibe a nova mensagem de sucesso
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.style.color = "#10b981";
  successDiv.style.fontSize = "0.875rem";
  successDiv.style.marginTop = "0.5rem";
  successDiv.style.textAlign = "center";
  successDiv.textContent = message;

  const form = document.querySelector(".auth-form");
  form.insertBefore(successDiv, form.firstChild);

  // Remove a mensagem após 3 segundos
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Função para fazer login
async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);

  if (!validateLoginForm(formData)) {
    return;
  }

  // Adiciona indicador de carregamento
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
  submitButton.disabled = true;

  try {
    const response = await fetch(
      "https://academialoja-production.up.railway.app/api/Auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          remember: formData.get("remember") === "on",
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.hasSuccess) {
      // Armazena o token e dados do usuário no localStorage
      const userData = data.value;
      localStorage.setItem("authToken", userData.token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: userData.id,
          name: userData.name,
          role: extractRoleFromToken(userData.token),
        })
      );

      showSuccess("Login realizado com sucesso! Redirecionando...");

      // Verifica se há uma URL de redirecionamento
      const urlParams = new URLSearchParams(window.location.search);
      // const redirectUrl = urlParams.get('redirect');
      const redirectUrl = "/index.html";

      // Aguarda um momento para mostrar a mensagem de sucesso
      setTimeout(() => {
        if (redirectUrl) {
          window.location.href = decodeURIComponent(redirectUrl);
        } else {
          window.location.href = "/index.html";
        }
      }, 1500);
    } else {
      showError(data.message || "Erro ao fazer login");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    showError("Erro ao conectar com o servidor");
  } finally {
    // Restaura o botão
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Função para extrair a role do token JWT
function extractRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.role ||
      "User"
    ); // Valor padrão
  } catch (error) {
    console.error("Erro ao extrair role do token:", error);
    return "User";
  }
}

// Função para fazer registro
async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(registerForm);

  if (!validateRegisterForm(formData)) {
    return;
  }

  // Adiciona indicador de carregamento
  const submitButton = registerForm.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/Auth/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await response.json();

    if (response.ok && data.hasSuccess) {
      showSuccess("Conta criada com sucesso! Redirecionando para o login...");

      // Aguarda um momento para mostrar a mensagem de sucesso
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2000);
    } else {
      showError(data.message || "Erro ao criar conta");
    }
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    showError("Erro ao conectar com o servidor");
  } finally {
    // Restaura o botão
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Adiciona os event listeners para os formulários
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

// Função para login com Google
// function handleGoogleLogin() {
//     // Implementar a lógica de login com Google aqui
//     console.log('Login com Google');
// }

// Adiciona event listener para o botão de login com Google
// const googleButton = document.querySelector('.social-button.google');
// if (googleButton) {
//     googleButton.addEventListener('click', handleGoogleLogin);
// }
