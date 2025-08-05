// Configuração da API
const API_BASE_URL = "https://localhost:4242/api"

// Elementos do DOM
const loadingContainer = document.getElementById("loading-container")
const errorState = document.getElementById("error-state")
const errorMessage = document.getElementById("error-message")
const trackingContent = document.getElementById("tracking-content")
const trackingTitle = document.getElementById("tracking-title")
const trackingSubtitle = document.getElementById("tracking-subtitle")
const trackingStatus = document.getElementById("tracking-status")
const trackingProgress = document.getElementById("tracking-progress")
const trackingTimeline = document.getElementById("tracking-timeline")
const deliveryInfo = document.getElementById("delivery-info")
const refreshTrackingBtn = document.getElementById("refreshTracking")
const contactSupportBtn = document.getElementById("contactSupport")
const logoutBtn = document.getElementById("logoutBtn")
const userName = document.getElementById("user-name")
const userEmail = document.getElementById("user-email")

// Obter parâmetros da URL
const urlParams = new URLSearchParams(window.location.search)
const orderId = urlParams.get("order") || urlParams.get("id")

// Variáveis globais
let currentOrder = null
let trackingEvents = []

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
    window.location.href = "/login.html"
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

// Função para carregar informações do usuário
async function loadUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/get/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.hasSuccess && result.value) {
        userName.textContent = result.value.userName || "Usuário"
        userEmail.textContent = result.value.email || ""
      }
    }
  } catch (error) {
    console.error("Erro ao carregar informações do usuário:", error)
  }
}

// Função para carregar detalhes do pedido
async function loadOrderDetails() {
  try {
    const response = await fetch(`${API_BASE_URL}/Order/get/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar detalhes do pedido")
    }

    const result = await response.json()
    if (result.hasSuccess && result.value) {
      currentOrder = result.value.order || result.value
      return currentOrder
    } else {
      throw new Error("Pedido não encontrado")
    }
  } catch (error) {
    console.error("Erro ao carregar pedido:", error)
    throw error
  }
}

// Função para carregar eventos de rastreamento
async function loadTrackingEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/Tracking?orderId=${orderId}&pageSize=50`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar eventos de rastreamento")
    }

    const result = await response.json()
    if (result.hasSuccess && result.value) {
      trackingEvents = result.value.trackings || result.value || []
      return trackingEvents
    } else {
      trackingEvents = []
      return []
    }
  } catch (error) {
    console.error("Erro ao carregar rastreamento:", error)
    trackingEvents = []
    return []
  }
}

// Função principal para carregar detalhes do rastreamento
async function loadTrackingDetails() {
  if (!checkAuthentication()) return

  showLoading()
  hideStates()

  try {
    // Carregar dados do pedido e eventos de rastreamento
    await Promise.all([loadOrderDetails(), loadTrackingEvents()])

    // Renderizar os detalhes
    renderTrackingDetails()
    showTrackingContent()
  } catch (error) {
    console.error("Erro ao carregar rastreamento:", error)
    showError(error.message || "Erro ao carregar informações de rastreamento. Tente novamente.")
  } finally {
    hideLoading()
  }
}

// Função para renderizar os detalhes do rastreamento
function renderTrackingDetails() {
  if (!currentOrder) return

  // Atualizar título e subtítulo
  trackingTitle.textContent = `Rastreamento do Pedido #${currentOrder.orderNumber || currentOrder.id.substring(0, 8)}`

  // Buscar número de rastreamento do último evento
  const latestEvent = trackingEvents.length > 0 ? trackingEvents[0] : null
  const trackingNumber = latestEvent?.trackingNumber || "Não disponível"
  trackingSubtitle.textContent = `Código de Rastreio: ${trackingNumber}`

  // Renderizar status atual
  renderTrackingStatus()

  // Renderizar barra de progresso
  renderProgressBar()

  // Renderizar timeline
  renderTimeline()

  // Renderizar informações de entrega
  renderDeliveryInfo()
}

// Função para renderizar status do rastreamento
function renderTrackingStatus() {
  const latestEvent = trackingEvents.length > 0 ? trackingEvents[0] : null
  const status = latestEvent?.status || currentOrder?.status || "UNKNOWN"
  const statusIcon = getStatusIcon(status)
  const statusText = getStatusText(status)
  const statusClass = getStatusClass(status)

  trackingStatus.innerHTML = `
        <div class="status-card ${statusClass}">
            <div class="status-icon">
                <i class="fas ${statusIcon}"></i>
            </div>
            <div class="status-info">
                <h2>${statusText}</h2>
                <p>Última atualização: ${latestEvent ? formatDateTime(latestEvent.eventDate) : formatDateTime(currentOrder.updatedAt || currentOrder.orderDate)}</p>
                ${latestEvent?.location ? `<p class="location">Local: ${latestEvent.location}</p>` : ""}
            </div>
        </div>
    `
}

// Função para renderizar barra de progresso
function renderProgressBar() {
  const status = trackingEvents.length > 0 ? trackingEvents[0]?.status : currentOrder?.status
  const progressPercentage = getProgressPercentage(status)

  trackingProgress.innerHTML = `
        <div class="progress-bar">
            <div class="progress" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-steps">
            <div class="step ${progressPercentage >= 25 ? "completed" : ""}">
                <div class="step-icon">
                    <i class="fas ${progressPercentage >= 25 ? "fa-check" : "fa-clock"}"></i>
                </div>
                <div class="step-label">Pedido Confirmado</div>
            </div>
            <div class="step ${progressPercentage >= 50 ? "completed" : progressPercentage === 50 ? "active" : ""}">
                <div class="step-icon">
                    <i class="fas ${progressPercentage >= 50 ? "fa-check" : "fa-box"}"></i>
                </div>
                <div class="step-label">Em Processamento</div>
            </div>
            <div class="step ${progressPercentage >= 75 ? "completed" : progressPercentage === 75 ? "active" : ""}">
                <div class="step-icon">
                    <i class="fas ${progressPercentage >= 75 ? "fa-check" : "fa-truck"}"></i>
                </div>
                <div class="step-label">Em Transporte</div>
            </div>
            <div class="step ${progressPercentage >= 100 ? "completed" : progressPercentage === 100 ? "active" : ""}">
                <div class="step-icon">
                    <i class="fas ${progressPercentage >= 100 ? "fa-check" : "fa-home"}"></i>
                </div>
                <div class="step-label">Entregue</div>
            </div>
        </div>
    `
}

// Função para renderizar timeline
function renderTimeline() {
  if (trackingEvents.length === 0) {
    trackingTimeline.innerHTML = `
            <div class="no-tracking-events">
                <i class="fas fa-info-circle"></i>
                <p>Nenhum evento de rastreamento disponível ainda.</p>
                <p><small>Os eventos de rastreamento aparecerão aqui conforme o pedido for processado.</small></p>
            </div>
        `
    return
  }

  trackingTimeline.innerHTML = trackingEvents
    .map(
      (event) => `
        <div class="timeline-item">
            <div class="timeline-date">
                <span class="date">${formatDate(event.eventDate)}</span>
                <span class="time">${formatTime(event.eventDate)}</span>
            </div>
            <div class="timeline-content">
                <h3>${event.description || getStatusText(event.status)}</h3>
                <p class="status-badge ${getStatusClass(event.status)}">${getStatusText(event.status)}</p>
                ${event.location ? `<p class="location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

// Função para renderizar informações de entrega
function renderDeliveryInfo() {
  // Parse shippingAddress se for string JSON
  let address = null;
  if (currentOrder.shippingAddress) {
    try {
      address = typeof currentOrder.shippingAddress === "string"
        ? JSON.parse(currentOrder.shippingAddress)
        : currentOrder.shippingAddress;
    } catch (e) {
      address = null;
    }
  }

  deliveryInfo.innerHTML = `
        <div class="delivery-card">
            <div class="info-group">
                <h3>
                    <i class="fas fa-map-marker-alt"></i>
                    Endereço de Entrega
                </h3>
                <div class="address-info">
                    ${
                      address
                        ? `
                        <p><strong>Nome:</strong> ${address.Name || ""}</p>
                        <p><strong>Rua/Avenida:</strong> ${address.Street || ""}</p>
                        <p><strong>Cep:</strong> ${address.Cep || ""}</p>
                        <p><strong>Número:</strong> ${address.Number || ""}</p>
                        <p><strong>Complemento:</strong> ${address.Complement || ""}</p>
                        <p><strong>Bairro:</strong> ${address.Neighborhood || ""}</p>
                        <p><strong>Cidade:</strong> ${address.City || ""}</p>
                        <p><strong>Estado:</strong> ${address.State || ""}</p>
                        `
                        : "<p>Endereço não informado</p>"
                    }
                </div>
            </div>
            <div class="info-group">
                <h3>
                    <i class="fas fa-truck"></i>
                    Informações de Envio
                </h3>
                <div class="shipping-info">
                    <p><strong>Status:</strong> ${getStatusText(currentOrder.status)}</p>
                    <p><strong>Data do Pedido:</strong> ${formatDate(currentOrder.orderDate || currentOrder.createdAt)}</p>
                    ${trackingEvents.length > 0 && trackingEvents[0].trackingNumber ? `<p><strong>Código de Rastreamento:</strong> <span class="tracking-code">${trackingEvents[0].trackingNumber}</span></p>` : ""}
                    <p><strong>Transportadora:</strong> Correios</p>
                </div>
            </div>
        </div>
    `;
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

function showTrackingContent() {
  trackingContent.style.display = "block"
}

function hideStates() {
  errorState.style.display = "none"
  trackingContent.style.display = "none"
}

// Funções utilitárias
function formatDate(dateString) {
  if (!dateString) return "Data não disponível"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return "Data inválida"
  }
}

function formatTime(dateString) {
  if (!dateString) return "Hora não disponível"

  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Hora inválida"
  }
}

function formatDateTime(dateString) {
  if (!dateString) return "Data não disponível"

  try {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Data inválida"
  }
}

function getStatusClass(status) {
  const statusMap = {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    CONFIRMED: "confirmed",
    IN_TRANSIT: "shipped",
    OUT_FOR_DELIVERY: "shipped",
  }
  return statusMap[status?.toUpperCase()] || "pending"
}

function getStatusIcon(status) {
  const icons = {
    PENDING: "fa-clock",
    PROCESSING: "fa-box",
    SHIPPED: "fa-truck",
    DELIVERED: "fa-check-circle",
    CANCELLED: "fa-times-circle",
    CONFIRMED: "fa-check-circle",
    IN_TRANSIT: "fa-truck",
    OUT_FOR_DELIVERY: "fa-truck",
  }
  return icons[status?.toUpperCase()] || "fa-question-circle"
}

function getStatusText(status) {
  const texts = {
    PENDING: "Pendente de Pagamento",
    PROCESSING: "Em Processamento",
    SHIPPED: "Em Transporte",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
    CONFIRMED: "Confirmado",
    IN_TRANSIT: "Em Trânsito",
    OUT_FOR_DELIVERY: "Saiu para Entrega",
  }
  return texts[status?.toUpperCase()] || status || "Status desconhecido"
}

function getProgressPercentage(status) {
  const progressMap = {
    PENDING: 0,
    CONFIRMED: 25,
    PROCESSING: 50,
    SHIPPED: 75,
    IN_TRANSIT: 75,
    OUT_FOR_DELIVERY: 90,
    DELIVERED: 100,
    CANCELLED: 0,
  }
  return progressMap[status?.toUpperCase()] || 0
}

// Event Listeners
refreshTrackingBtn.addEventListener("click", () => {
  loadTrackingDetails()
})

contactSupportBtn.addEventListener("click", () => {
  window.location.href = `/support.html?order=${orderId}`
})

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
    window.location.href = "/login.html"
  }
})

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  if (!orderId) {
    showError("ID do pedido não fornecido")
    return
  }

  if (checkAuthentication()) {
    loadUserInfo()
    loadTrackingDetails()
  }
})
