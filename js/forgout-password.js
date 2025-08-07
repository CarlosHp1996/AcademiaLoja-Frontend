// Configuração da API
const API_BASE_URL = "/api"

document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordLink = document.querySelector(".forgot-password")
  const loginForm = document.getElementById("loginForm")

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      openForgotPasswordModal()
    })
  }

  function openForgotPasswordModal() {
    const modalHTML = `
            <div class="modal-overlay active" id="forgotPasswordModal">
                <div class="modal-content">
                    <button class="modal-close" id="closeModal">&times;</button>
                    <h2 class="auth-title">Esqueceu a Senha?</h2>
                    <p class="auth-subtitle">Digite seu e-mail para receber o link de redefinição.</p>
                    <form id="forgotPasswordForm" class="auth-form">
                        <div class="form-group">
                            <label for="email">E-mail</label>
                            <input type="email" id="email" name="email" required placeholder="Seu e-mail">
                        </div>
                        <button type="submit" class="auth-button">Enviar Link</button>
                    </form>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modalHTML)

    const modal = document.getElementById("forgotPasswordModal")
    const closeModal = document.getElementById("closeModal")
    const forgotPasswordForm = document.getElementById("forgotPasswordForm")

    closeModal.addEventListener("click", () => modal.remove())
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const email = forgotPasswordForm.email.value
      try {
        const response = await fetch(`${API_BASE_URL}/Auth/forgout-password?email=${email}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(email),
        })

        if (response.ok) {
          alert("E-mail de redefinição de senha enviado com sucesso!")
          modal.remove()
        } else {
          alert("Erro ao enviar e-mail de redefinição de senha.")
        }
      } catch (error) {
        console.error("Erro:", error)
        alert("Ocorreu um erro. Tente novamente mais tarde.")
      }
    })
  }

  // MODIFICAÇÃO: Lógica para a página de redefinição de senha
  const resetPasswordForm = document.getElementById("resetPasswordForm")
  if (resetPasswordForm) {
    // Funcionalidade de mostrar/ocultar senha
    const togglePasswordButtons = document.querySelectorAll(".toggle-password")
    togglePasswordButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling
        const icon = button.querySelector("i")
        if (passwordInput.type === "password") {
          passwordInput.type = "text"
          icon.classList.remove("fa-eye")
          icon.classList.add("fa-eye-slash")
        } else {
          passwordInput.type = "password"
          icon.classList.remove("fa-eye-slash")
          icon.classList.add("fa-eye")
        }
      })
    })

    // MODIFICAÇÃO: Extrair email da URL e validar
    const urlParams = new URLSearchParams(window.location.search)
    const userEmail = urlParams.get("email")

    if (!userEmail) {
      alert("Link de redefinição inválido. O email não foi encontrado na URL.")
      window.location.href = "login.html"
      return
    }

    // Mostrar o email na interface (opcional)
    const emailDisplay = document.createElement("p")
    emailDisplay.style.cssText = "color: #666; font-size: 14px; margin-bottom: 20px; text-align: center;"
    emailDisplay.textContent = `Redefinindo senha para: ${userEmail}`
    resetPasswordForm.insertBefore(emailDisplay, resetPasswordForm.firstChild)

    resetPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const password = resetPasswordForm.password.value
      const confirmPassword = resetPasswordForm.confirmPassword.value

      if (password !== confirmPassword) {
        alert("As senhas não coincidem.")
        return
      }

      // Validação básica de senha
      if (password.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.")
        return
      }

      const requestBody = {
        email: userEmail, // Usar o email da URL
        password: password,
        isPasswordRecovery: true, // Indicar que é recuperação de senha
      }

      try {
        // MODIFICAÇÃO: Chamar a API sem ID (será null)
        const response = await fetch(`${API_BASE_URL}/Auth/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          alert("Senha redefinida com sucesso! Você será redirecionado para a página de login.")
          window.location.href = "login.html"
        } else {
          const errorData = await response.json()
          alert(`Erro ao redefinir a senha: ${errorData.message || "Tente novamente."}`)
        }
      } catch (error) {
        console.error("Erro ao redefinir a senha:", error)
        alert("Ocorreu um erro de conexão. Tente novamente mais tarde.")
      }
    })
  }
})
