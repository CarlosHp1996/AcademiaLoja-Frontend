// Configuração da API
const API_BASE_URL = "https://localhost:4242/api"

document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const loadingContainer = document.getElementById("loading-container")
  const errorState = document.getElementById("error-state")
  const errorMessage = document.getElementById("error-message")
  const orderDetailsContent = document.getElementById("order-details-content")
  const orderTitle = document.getElementById("order-title")
  const orderSubtitle = document.getElementById("order-subtitle")
  const orderStatusInfo = document.getElementById("order-status-info")
  const deliveryInfo = document.getElementById("delivery-info")
  const productsList = document.getElementById("products-list")
  const orderSummary = document.getElementById("order-summary")
  const paymentInfo = document.getElementById("payment-info")
  const printOrderBtn = document.getElementById("printOrder")
  const logoutBtn = document.getElementById("logoutBtn")
  const userName = document.getElementById("user-name")
  const userEmail = document.getElementById("user-email")

  // Obter ID do pedido da URL
  const urlParams = new URLSearchParams(window.location.search)
  const orderId = urlParams.get("id")

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
      window.location.href = "/html/login.html"
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
    if (!userId) return;
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

  // Função para carregar os detalhes do pedido
  async function loadOrderDetails() {
    if (!checkAuthentication()) return

    showLoading()
    hideStates()

    try {
      const response = await fetch(`${API_BASE_URL}/Order/get/${orderId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken")
          sessionStorage.removeItem("authToken")
          window.location.href = "/html/login.html"
          return
        }
        if (response.status === 404) {
          throw new Error("Pedido não encontrado")
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.hasSuccess && result.value) {
        const order = result.value.order || result.value
        renderOrderDetails(order)
        showOrderDetails()
      } else {
        throw new Error(result.errors?.[0] || "Erro ao carregar detalhes do pedido")
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do pedido:", error)
      showError(error.message || "Erro ao carregar detalhes do pedido. Tente novamente.")
    } finally {
      hideLoading()
    }
  }

  // Função para renderizar os detalhes do pedido
  function renderOrderDetails(order) {
    // Atualizar título e subtítulo
    orderTitle.textContent = `Detalhes do Pedido #${order.orderNumber || order.id.substring(0, 8)}`
    orderSubtitle.textContent = `Realizado em ${formatDate(order.orderDate || order.createdAt)}`

    // Renderizar status do pedido
    renderOrderStatus(order)

    // Renderizar informações de entrega
    renderDeliveryInfo(order)

    // Renderizar lista de produtos
    renderProductsList(order.orderItems || order.items || [])

    // Renderizar resumo do pedido
    renderOrderSummary(order)

    // Renderizar informações de pagamento
    renderPaymentInfo(order)
  }

  // Função para renderizar status do pedido
  function renderOrderStatus(order) {
    const statusClass = getStatusClass(order.status)
    const statusIcon = getStatusIcon(order.status)
    const statusText = getStatusText(order.status)

    orderStatusInfo.innerHTML = `
        <div class="status-card ${statusClass}">
            <div class="status-icon">
                <i class="fas ${statusIcon}"></i>
            </div>
            <div class="status-content">
                <h3>${statusText}</h3>
                <p>Última atualização: ${formatDateTime(order.updatedAt || order.orderDate)}</p>
                ${order.paymentStatus ? `<p class="payment-status">Pagamento: ${getPaymentStatusText(order.paymentStatus)}</p>` : ""}
            </div>
        </div>
    `
  }

    // Função para renderizar informações de entrega
    function renderDeliveryInfo(order) {
      // Verifica se addresses é um array e tem pelo menos um item
      const address = Array.isArray(order.addresses) && order.addresses.length > 0 ? order.addresses[0] : null;

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
                    <p><strong>Nome:</strong> ${order.userName || ""}</p>
                    <p><strong>Rua/Avenida:</strong> ${address.street || ""}</p>
                    <p><strong>Cep:</strong> ${address.cep || ""}</p>
                    <p><strong>Número:</strong> ${address.number || ""}</p>
                    <p><strong>Complemento:</strong> ${address.complement || ""}</p>
                    <p><strong>Bairro:</strong> ${address.neighborhood || ""}</p>
                    <p><strong>Cidade:</strong> ${address.city || ""}</p>
                    <p><strong>Estado:</strong> ${address.state || ""}</p>
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
              <p><strong>Status:</strong> ${getStatusText(order.status)}</p>
              <p><strong>Data do Pedido:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
              ${order.trackingCode ? `<p><strong>Código de Rastreamento:</strong> <span class="tracking-code">${order.trackingCode}</span></p>` : ""}
            </div>
          </div>
        </div>
      `;
    }

  // Função para renderizar lista de produtos
  function renderProductsList(items) {
    if (!items || items.length === 0) {
      productsList.innerHTML = '<div class="no-items">Nenhum produto encontrado neste pedido.</div>'
      return
    }

    productsList.innerHTML = items
      .map(
        (item) => `
        <div class="product-item">
            <div class="product-image">
                <img src="${item.productImageUrl || item.image || "/placeholder.svg?height=80&width=80"}" 
                     alt="${item.productName || item.name || "Produto"}"
                     onerror="this.src='/placeholder.svg?height=80&width=80'">
            </div>
            <div class="product-details">
                <h3>${item.productName || item.name || "Produto"}</h3>
                <p class="product-variant">${item.variant || item.description || ""}</p>
                <div class="product-price">
                    <span class="quantity">${item.quantity || 1}x</span>
                    <span class="price">R$ ${formatPrice(item.unitPrice || item.price || 0)}</span>
                </div>
            </div>
            <div class="product-total">
                <span>R$ ${formatPrice((item.unitPrice || item.price || 0) * (item.quantity || 1))}</span>
            </div>
        </div>
    `,
      )
      .join("")
  }

  // Função para renderizar resumo do pedido
  function renderOrderSummary(order) {
    const totalAmount = order.totalAmount || order.total || 0
    const items = order.orderItems || order.items || []
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice || item.price || 0) * (item.quantity || 1), 0)
    const shipping = 15.9 // Valor fixo para demonstração
    const discount = subtotal + shipping - totalAmount

    orderSummary.innerHTML = `
        <div class="summary-card">
            <div class="summary-row">
                <span>Subtotal dos produtos</span>
                <span>R$ ${formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Frete</span>
                <span>R$ ${formatPrice(shipping)}</span>
            </div>
            ${
              discount > 0
                ? `
                <div class="summary-row discount">
                    <span>Desconto</span>
                    <span>- R$ ${formatPrice(discount)}</span>
                </div>
            `
                : ""
            }
            <div class="summary-row total">
                <span>Total do Pedido</span>
                <span>R$ ${formatPrice(totalAmount)}</span>
            </div>
        </div>
    `
  }

  // Função para renderizar informações de pagamento
  function renderPaymentInfo(order) {
    paymentInfo.innerHTML = `
        <div class="payment-card">
            <div class="info-group">
                <h3>
                    <i class="fas fa-credit-card"></i>
                    Método de Pagamento
                </h3>
                <div class="payment-method">
                    <p>Informações de pagamento não disponíveis</p>
                    <p><small>Entre em contato conosco para mais detalhes</small></p>
                </div>
            </div>
            <div class="info-group">
                <h3>
                    <i class="fas fa-check-circle"></i>
                    Status do Pagamento
                </h3>
                <div class="payment-status-info">
                    <p class="status ${getPaymentStatusClass(order.paymentStatus)}">
                        ${getPaymentStatusText(order.paymentStatus)}
                    </p>
                    <p><strong>Data:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
                </div>
            </div>
        </div>
    `
  }

  // Funções de estado da UI
  function showLoading() {
    if(loadingContainer) loadingContainer.style.display = "flex"
  }

  function hideLoading() {
    if(loadingContainer) loadingContainer.style.display = "none"
  }

  function showError(message) {
    if(errorMessage) errorMessage.textContent = message
    if(errorState) errorState.style.display = "flex"
  }

  function showOrderDetails() {
    if(orderDetailsContent) orderDetailsContent.style.display = "block"
  }

  function hideStates() {
    if(errorState) errorState.style.display = "none"
    if(orderDetailsContent) orderDetailsContent.style.display = "none"
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

  function formatPrice(price) {
    if (typeof price !== "number") {
      price = Number.parseFloat(price) || 0
    }
    return price.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function getStatusClass(status) {
    const statusMap = {
      PENDING: "pending",
      PROCESSING: "processing",
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
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
    }
    return texts[status?.toUpperCase()] || status || "Status desconhecido"
  }

  function getPaymentStatusClass(status) {
    const statusMap = {
      PAID: "paid",
      PENDING: "pending",
      CANCELLED: "cancelled",
      REFUNDED: "refunded",
    }
    return statusMap[status?.toUpperCase()] || "pending"
  }

  function getPaymentStatusText(status) {
    const texts = {
      PAID: "Pago",
      PENDING: "Pendente",
      CANCELLED: "Cancelado",
      REFUNDED: "Reembolsado",
    }
    return texts[status?.toUpperCase()] || status || "Pendente"
  }

  // Event Listeners
  if (printOrderBtn) {
    printOrderBtn.addEventListener("click", () => {
      window.print()
    })
  }

  if (logoutBtn) {
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
        window.location.href = "/html/login.html"
      }
    })
  }

  // Inicialização
  if (!orderId) {
    hideLoading();
    showError("ID do pedido não fornecido na URL.")
    return
  }

  if (checkAuthentication()) {
    loadUserInfo()
    loadOrderDetails()
  }
})