// Configuração da API
const API_BASE_URL = "https://localhost:4242/api"

// Elementos do DOM
const loadingContainer = document.getElementById("loading-container")
const errorState = document.getElementById("error-state")
const errorMessage = document.getElementById("error-message")
const profileMainContent = document.getElementById("profile-main-content")
const messageContainer = document.getElementById("message-container")
const userName = document.getElementById("user-name")
const userEmail = document.getElementById("user-email")
const addressesContainer = document.getElementById("addresses-container")
const emptyAddresses = document.getElementById("empty-addresses")
const addressModal = document.getElementById("addressModal")
const addressModalOverlay = document.getElementById("addressModalOverlay")
const addressModalTitle = document.getElementById("addressModalTitle")
const logoutBtn = document.getElementById("logoutBtn")

// Variáveis globais
let currentUser = null
let currentAddresses = []
let editingAddressId = null

// Função para obter token de autenticação
function getAuthToken() {
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
}

// Função para obter headers de autenticação
function getAuthHeaders() {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Função para verificar se o usuário está autenticado
function checkAuthentication() {
  const token = getAuthToken()
  if (!token) {
    window.location.href = "/public/html/login.html"
    return false
  }
  return true
}

// Função para extrair dados do JWT
function parseJwt(token) {
  if (!token) return null
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

// Obter ID do usuário do token
const tokenStr = getAuthToken()
const payload = parseJwt(tokenStr)
const userId = payload ? payload.id : null

// Função para carregar perfil do usuário
async function loadUserProfile() {
  if (!checkAuthentication()) return

  showLoading()
  hideStates()

  try {
    const response = await fetch(`${API_BASE_URL}/Auth/get/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken")
        sessionStorage.removeItem("authToken")
        window.location.href = "/public/html/login.html"
        return
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.hasSuccess && result.value) {
      currentUser = result.value
      currentAddresses = result.value.user.addresses || []

      populateUserInfo()
      populatePersonalForm()
      renderAddresses()
      showProfileContent()
    } else {
      throw new Error(result.errors?.[0] || "Erro ao carregar perfil")
    }
  } catch (error) {
    console.error("Erro ao carregar perfil:", error)
    showError(error.message || "Erro ao carregar perfil. Tente novamente.")
  } finally {
    hideLoading()
  }
}

// Função para popular informações do usuário na sidebar
function populateUserInfo() {
  userName.textContent = currentUser.user.userName || "Usuário"
  userEmail.textContent = currentUser.user.email || ""
}

// Função para popular formulário de informações pessoais
function populatePersonalForm() {
  document.getElementById("name").value = currentUser.user.userName || ""
  document.getElementById("cpf").value = currentUser.user.cpf || ""
  document.getElementById("email").value = currentUser.user.email || ""
  document.getElementById("phone").value = currentUser.user.phoneNumber || ""
  document.getElementById("gender").value = currentUser.user.gender || ""
}

// Função para renderizar endereços
function renderAddresses() {
  if (!currentAddresses || currentAddresses.length === 0) {
    addressesContainer.style.display = "none"
    emptyAddresses.style.display = "flex"
    return
  }

  addressesContainer.style.display = "grid"
  emptyAddresses.style.display = "none"

  addressesContainer.innerHTML = currentAddresses
    .map(
      (address) => `
        <div class="address-card ${address.mainAddress ? 'main-address' : ''}" data-address-id="${address.id}">
            <div class="address-header">
                <div class="address-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                ${address.mainAddress ? '<span class="main-address-tag" style="margin-left:30%;">Principal</span>' : ''}
                <div class="address-actions">
                    <button class="btn-icon" onclick="editAddress('${address.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteAddress('${address.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="address-content">
                <div class="address-main">
                    <strong>${address.street}, ${address.number}</strong>
                    ${address.complement ? `<span class="complement">${address.complement}</span>` : ""}
                </div>
                <div class="address-details">
                    <span>${address.neighborhood}</span>
                    <span>${address.city} - ${address.state}</span>
                    <span>CEP: ${formatZipCode(address.zipCode)}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Função para obter nome do estado
// function getStateName(stateValue) {
//   const states = {
//     0: "AC",
//     1: "AL",
//     2: "AP",
//     3: "AM",
//     4: "BA",
//     5: "CE",
//     6: "DF",
//     7: "ES",
//     8: "GO",
//     9: "MA",
//     10: "MT",
//     11: "MS",
//     12: "MG",
//     13: "PA",
//     14: "PB",
//     15: "PR",
//     16: "PE",
//     17: "PI",
//     18: "RJ",
//     19: "RN",
//     20: "RS",
//     21: "RO",
//     22: "RR",
//     23: "SC",
//     24: "SP",
//     25: "SE",
//     26: "TO",
//   }
//   return states[stateValue] || "N/A"
// }

// Função para formatar CEP
function formatZipCode(zipCode) {
  if (!zipCode) return ""
  return zipCode.replace(/(\d{5})(\d{3})/, "$1-$2")
}

// Função para atualizar informações pessoais
async function updatePersonalInfo(formData) {
  try {
    const updateData = {
      id: userId,
      name: formData.get("name"),
      cpf: formData.get("cpf"),
      email: formData.get("email"),
      phoneNumber: formData.get("phone"),
      gender: formData.get("gender") ? Number.parseInt(formData.get("gender")) : null,
      addresses: currentAddresses.map((addr) => ({
        id: addr.id,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        neighborhood: addr.neighborhood,
        number: addr.number,
        complement: addr.complement,
      })),
    }

    const response = await fetch(`${API_BASE_URL}/Auth/update?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar informações pessoais")
    }

    const result = await response.json()

    if (result.hasSuccess) {
      showMessage("Informações pessoais atualizadas com sucesso!", "success")
      currentUser = result.value.user
      populateUserInfo()
    } else {
      throw new Error(result.errors?.[0] || "Erro ao atualizar informações")
    }
  } catch (error) {
    console.error("Erro ao atualizar informações:", error)
    showMessage(error.message || "Erro ao atualizar informações pessoais", "error")
  }
}

// Função para alterar senha
async function changePassword(formData) {
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmNewPassword")

  if (newPassword !== confirmPassword) {
    showMessage("As senhas não coincidem", "error")
    return
  }

  try {
    const updateData = {
      id: userId,
      password: newPassword,
      addresses: currentAddresses.map((addr) => ({
        id: addr.id,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        neighborhood: addr.neighborhood,
        number: addr.number,
        complement: addr.complement,
      })),
    }

    const response = await fetch(`${API_BASE_URL}/Auth/update?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error("Erro ao alterar senha")
    }

    const result = await response.json()

    if (result.hasSuccess) {
      showMessage("Senha alterada com sucesso!", "success")
      document.getElementById("passwordForm").reset()
    } else {
      throw new Error(result.errors?.[0] || "Erro ao alterar senha")
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    showMessage(error.message || "Erro ao alterar senha", "error")
  }
}

// Função para salvar endereço
async function saveAddress(formData) {
  try {
    const addressData = {
      id: editingAddressId || "00000000-0000-0000-0000-000000000000",
      completName: formData.get("completName"),
      street: formData.get("street"),
      city: formData.get("city"),
      state: Number.parseInt(formData.get("state")),
      zipCode: formData.get("zipCode").replace(/\D/g, ""),
      neighborhood: formData.get("neighborhood"),
      number: formData.get("number"),
      complement: formData.get("complement") || "",
      mainAddress: formData.get("mainAddress") === "on",
    }

    let updatedAddresses
    if (editingAddressId) {
      // Editar endereço existente
      updatedAddresses = currentAddresses.map((addr) => (addr.id === editingAddressId ? addressData : addr))
    } else {
      // Adicionar novo endereço
      updatedAddresses = [...currentAddresses, addressData]
    }

    const updateData = {
      id: userId,
      addresses: updatedAddresses,
    }

    const response = await fetch(`${API_BASE_URL}/Auth/update?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error("Erro ao salvar endereço")
    }

    const result = await response.json()

    if (result.hasSuccess) {
      currentAddresses = result.value.user.addresses || []
      renderAddresses()
      closeAddressModal()
      showMessage(editingAddressId ? "Endereço atualizado com sucesso!" : "Endereço adicionado com sucesso!", "success")
    } else {
      throw new Error(result.errors?.[0] || "Erro ao salvar endereço")
    }
  } catch (error) {
    console.error("Erro ao salvar endereço:", error)
    showMessage(error.message || "Erro ao salvar endereço", "error")
  }
}

// Função para excluir endereço
async function deleteAddress(addressId) {
  if (!confirm("Tem certeza que deseja excluir este endereço?")) {
    return
  }

  try {
    const updatedAddresses = currentAddresses.filter((addr) => addr.id !== addressId)

    const updateData = {
      id: userId,
      addresses: updatedAddresses,
    }

    const response = await fetch(`${API_BASE_URL}/Auth/update?id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error("Erro ao excluir endereço")
    }

    const result = await response.json()

    if (result.hasSuccess) {
      currentAddresses = result.value.user.addresses || []
      renderAddresses()
      showMessage("Endereço excluído com sucesso!", "success")
    } else {
      throw new Error(result.errors?.[0] || "Erro ao excluir endereço")
    }
  } catch (error) {
    console.error("Erro ao excluir endereço:", error)
    showMessage(error.message || "Erro ao excluir endereço", "error")
  }
}

// Função para abrir modal de endereço
function openAddressModal(addressId = null) {
  editingAddressId = addressId
  const stateEnumToIndex = {
  "AC": "0", "AL": "1", "AP": "2", "AM": "3", "BA": "4", "CE": "5", "DF": "6", "ES": "7", "GO": "8",
  "MA": "9", "MT": "10", "MS": "11", "MG": "12", "PA": "13", "PB": "14", "PR": "15", "PE": "16",
  "PI": "17", "RJ": "18", "RN": "19", "RS": "20", "RO": "21", "RR": "22", "SC": "23", "SP": "24",
  "SE": "25", "TO": "26"
  }

  if (addressId) {
    // Editar endereço existente
    const address = currentAddresses.find((addr) => addr.id === addressId)
    if (address) {
      addressModalTitle.textContent = "Editar Endereço"
      document.getElementById("addressId").value = address.id || ""
      document.getElementById("completName").value = address.completName || ""
      document.getElementById("zipCode").value = formatZipCode(address.zipCode)
      document.getElementById("street").value = address.street
      document.getElementById("number").value = address.number
      document.getElementById("complement").value = address.complement || ""
      document.getElementById("neighborhood").value = address.neighborhood
      document.getElementById("city").value = address.city
      document.getElementById("mainAddress").checked = address.mainAddress

      const stateSelect = document.getElementById("state");
      let stateValue = "";

      if (address.state !== undefined && address.state !== null) {
        // Se vier como string Enum ("PR", "SP", etc.)
        if (typeof address.state === "string" && stateEnumToIndex[address.state]) {
          stateValue = stateEnumToIndex[address.state];
        }
        // Se vier como número (índice)
        else if (!isNaN(address.state)) {
          stateValue = address.state.toString();
        }
      }

      stateSelect.value = stateValue;
    }
  } else {
    // Adicionar novo endereço
    addressModalTitle.textContent = "Adicionar Endereço"
    document.getElementById("addressForm").reset()
    document.getElementById("addressId").value = ""
  }

  addressModalOverlay.style.display = "flex"
  document.body.style.overflow = "hidden"
}

// Função para fechar modal de endereço
function closeAddressModal() {
  addressModalOverlay.style.display = "none"
  document.body.style.overflow = "auto"
  editingAddressId = null
  document.getElementById("addressForm").reset()
}

// Função para editar endereço
function editAddress(addressId) {
  openAddressModal(addressId)
}

// Funções de estado da UI
function showLoading() {
  loadingContainer.style.display = "flex"
}

function hideLoading() {
  loadingContainer.style.display = "none"
}

function showError(message) {
  errorMessage.textContent = message
  errorState.style.display = "flex"
}

function showProfileContent() {
  profileMainContent.style.display = "block"
}

function hideStates() {
  errorState.style.display = "none"
  profileMainContent.style.display = "none"
}

function showMessage(message, type) {
  messageContainer.innerHTML = `
    <div class="message ${type}">
      <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}"></i>
      ${message}
    </div>
  `

  setTimeout(() => {
    messageContainer.innerHTML = ""
  }, 5000)
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuthentication()) {
    loadUserProfile()
  }

  // Formulário de informações pessoais
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const submitBtn = e.target.querySelector('button[type="submit"]')

    submitBtn.classList.add("loading")
    await updatePersonalInfo(formData)
    submitBtn.classList.remove("loading")
  })

  // Formulário de senha
  document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const submitBtn = e.target.querySelector('button[type="submit"]')

    submitBtn.classList.add("loading")
    await changePassword(formData)
    submitBtn.classList.remove("loading")
  })

  // Formulário de endereço
  document.getElementById("addressForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const submitBtn = e.target.querySelector('button[type="submit"]')

    submitBtn.classList.add("loading")
    await saveAddress(formData)
    submitBtn.classList.remove("loading")
  })

  // Botões do modal de endereço
  document.getElementById("addAddressBtn").addEventListener("click", () => {
    openAddressModal()
  })

  document.getElementById("closeAddressModal").addEventListener("click", closeAddressModal)
  document.getElementById("cancelAddressBtn").addEventListener("click", closeAddressModal)

  // Fechar modal ao clicar no overlay
  addressModalOverlay.addEventListener("click", (e) => {
    if (e.target === addressModalOverlay) {
      closeAddressModal()
    }
  })

  // Toggle de senha
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const passwordInput = button.previousElementSibling
      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        button.innerHTML = '<i class="fas fa-eye-slash"></i>'
      } else {
        passwordInput.type = "password"
        button.innerHTML = '<i class="fas fa-eye"></i>'
      }
    })
  })

  // Logout
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API_BASE_URL}/Auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      })
    } catch (error) {
      console.error("Erro ao fazer logout no servidor:", error)
    } finally {
      localStorage.removeItem("authToken")
      sessionStorage.removeItem("authToken")
      window.location.href = "/public/html/login.html"
    }
  })

  // Máscara para CEP
  document.getElementById("zipCode").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d{0,3})/, "$1-$2")
    }
    e.target.value = value
  })

  // Máscara para CPF
  document.getElementById("cpf").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    e.target.value = value
  })

  // Máscara para telefone
  document.getElementById("phone").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    e.target.value = value
  })
})
