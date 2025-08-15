// Cart Service - Gerenciamento do carrinho com migração de sessão
class CartService {
  constructor() {
    this.API_BASE_URL = "/api";
    this.cart = null;
    this.isLoading = false;
    // Apenas carrega o sessionId do localStorage, não cria um novo.
    // A fonte da verdade será a resposta do backend.
    this.sessionId = localStorage.getItem("sessionId");
    this.init();
  }

  async init() {
    await this.loadCart();
    this.updateCartBadge();

    // Verificar se precisa migrar carrinho após login
    await this.checkAndMigrateCart();

    // Debug
    this.debugCartState();
  }

  async checkAndMigrateCart() {
    // Verificar se o usuário acabou de fazer login
    const needsMigration = localStorage.getItem("needsCartMigration")

    if (needsMigration === "true" && this.isUserAuthenticated()) {
      console.log("Migrando carrinho de sessão para usuário logado...")
      await this.migrateSessionCart()
      localStorage.removeItem("needsCartMigration")
    }
  }

  async migrateSessionCart() {
    try {
      // Extrai o GUID do sessionId (formato: "session_GUID")
      const sessionIdGuid = this.sessionId ? this.sessionId.replace("session_", "") : null;
      if (!sessionIdGuid) {
        console.error("Não foi possível extrair o GUID da sessão para migração.");
        return;
      }

      const response = await fetch(`${this.API_BASE_URL}/Cart/migrate`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ sessionId: sessionIdGuid }),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = result.value
        this.updateCartBadge()
        this.showSuccessMessage("Carrinho migrado com sucesso!")
        console.log("Carrinho migrado:", this.cart)
      } else {
        console.error("Erro ao migrar carrinho:", result.errors)
      }
    } catch (error) {
      console.error("Erro ao migrar carrinho:", error)
    }
  }

  // Carregar carrinho do backend
  async loadCart() {
    try {
      this.isLoading = true
      console.log("Carregando carrinho...")

      const response = await fetch(`${this.API_BASE_URL}/Cart`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      })

      if (response.headers.has("X-Session-Id")) {
        const newSessionId = response.headers.get("X-Session-Id");
        if (newSessionId !== this.sessionId) {
          this.sessionId = newSessionId;
          localStorage.setItem("sessionId", this.sessionId);
          console.log("Novo sessionId do backend salvo:", this.sessionId);
        }
      }

      if (response.ok) {
        const result = await response.json()
        console.log("Resposta da API:", result)

        if (result.hasSuccess && result.value) {
          this.cart = result.value;

          // Sincroniza o sessionId com o backend
          if (result.value.userId && result.value.userId.startsWith("session_")) {
            if (this.sessionId !== result.value.userId) {
              this.sessionId = result.value.userId;
              localStorage.setItem("sessionId", this.sessionId);
              console.log("Session ID sincronizado com o backend:", this.sessionId);
            }
          }

          console.log("Carrinho carregado:", this.cart);
          console.log("Total de itens:", this.cart.totalItems);
        } else {
          console.error("Erro ao carregar carrinho:", result.errors)
          this.cart = { items: [], totalAmount: 0, totalItems: 0 }
        }
      } else {
        console.error("Erro na requisição:", response.status)
        this.cart = { items: [], totalAmount: 0, totalItems: 0 }
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
      this.cart = { items: [], totalAmount: 0, totalItems: 0 }
    } finally {
      this.isLoading = false
      console.log("Atualizando badge com:", this.cart)
    }
  }

  // Adicionar item ao carrinho
  async addItem(productId, quantity = 1, flavor = null, size = null, sessionId = this.sessionId) {
    try {
      this.isLoading = true
      this.showLoadingState()

      const requestData = {
        productId: productId,
        quantity: quantity,
        flavor: flavor,
        size: size,
        sessionId: sessionId,
      }

      const response = await fetch(`${this.API_BASE_URL}/Cart/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(requestData),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = result.value
        this.updateCartBadge()
        this.showSuccessMessage("Produto adicionado ao carrinho!")
        return { success: true, cart: this.cart }
      } else {
        const errorMessage = result.errors?.[0] || "Erro ao adicionar produto ao carrinho"
        this.showErrorMessage(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
      this.showErrorMessage("Erro de conexão. Tente novamente.")
      return { success: false, error: error.message }
    } finally {
      this.isLoading = false
      this.hideLoadingState()
    }
  }

  // Atualizar quantidade de item
  async updateItemQuantity(productId, quantity) {
    try {
      this.isLoading = true

      const response = await fetch(`${this.API_BASE_URL}/Cart/update/${productId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ quantity: quantity }),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = result.value
        this.updateCartBadge()
        this.updateCartPanel()
        return { success: true, cart: this.cart }
      } else {
        const errorMessage = result.errors?.[0] || "Erro ao atualizar quantidade"
        this.showErrorMessage(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
      this.showErrorMessage("Erro de conexão. Tente novamente.")
      return { success: false, error: error.message }
    } finally {
      this.isLoading = false
    }
  }

  // Remover item do carrinho
  async removeItem(productId) {
    try {
      this.isLoading = true

      const response = await fetch(`${this.API_BASE_URL}/Cart/remove/${productId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = result.value
        this.updateCartBadge()
        this.updateCartPanel()
        this.showSuccessMessage("Item removido do carrinho")
        return { success: true, cart: this.cart }
      } else {
        const errorMessage = result.errors?.[0] || "Erro ao remover item"
        this.showErrorMessage(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro ao remover item:", error)
      this.showErrorMessage("Erro de conexão. Tente novamente.")
      return { success: false, error: error.message }
    } finally {
      this.isLoading = false
    }
  }

  // Limpar carrinho
  async clearCart() {
    try {
      this.isLoading = true

      const response = await fetch(`${this.API_BASE_URL}/Cart/clear`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = { items: [], totalAmount: 0, totalItems: 0 }
        this.updateCartBadge()
        this.updateCartPanel()
        this.showSuccessMessage("Carrinho limpo")
        return { success: true }
      } else {
        const errorMessage = result.errors?.[0] || "Erro ao limpar carrinho"
        this.showErrorMessage(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error)
      this.showErrorMessage("Erro de conexão. Tente novamente.")
      return { success: false, error: error.message }
    } finally {
      this.isLoading = false
    }
  }

  // Obter headers para requisições
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    // Adicionar token de autenticação se disponível
    const authToken = localStorage.getItem("authToken");
    if (authToken && this.isUserAuthenticated()) {
      headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      // O backend gerencia a sessão via cookie, não precisamos enviar o ID.
    }

    return headers
  }

  // Verificar se usuário está autenticado com Bearer token
  isUserAuthenticated() {
    // Verifica se o authService está disponível
    if (window.authService && typeof window.authService.isAuthenticated === "function") {
      const isAuth = window.authService.isAuthenticated()
      console.log("AuthService check:", isAuth)
      return isAuth
    }

    // Fallback: verifica diretamente o token no localStorage
    const authToken = localStorage.getItem("authToken")
    console.log("Auth token from localStorage:", authToken ? "Present" : "Not found")

    if (!authToken) return false

    try {
      // Verifica se o token é válido (não expirado)
      const tokenParts = authToken.split(".")
      if (tokenParts.length !== 3) {
        console.log("Invalid token format")
        return false
      }

      const payload = JSON.parse(atob(tokenParts[1]))
      const expirationTime = payload.exp * 1000
      const currentTime = Date.now()

      const isValid = currentTime < expirationTime
      console.log("Token validation:", { expirationTime, currentTime, isValid })

      return isValid
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      return false
    }
  }

  // Verificar autenticação e redirecionar para checkout
  handleCheckout() {
    // Verifica se o carrinho está vazio
    if (this.isEmpty()) {
      this.showErrorMessage("Carrinho está vazio!")
      return
    }

    // Verifica se o usuário está autenticado com Bearer token
    if (this.isUserAuthenticated()) {
      // Usuário autenticado - redireciona para checkout
      console.log("Usuário autenticado, redirecionando para checkout...")
      this.showSuccessMessage("Redirecionando para finalização da compra...")

      // Fecha o painel do carrinho
      this.closeCartPanel()

      // Redireciona para a página de checkout após um breve delay
      setTimeout(() => {
        window.location.href = "/checkout.html"
      }, 1000)
    } else {
      // Usuário não autenticado - marcar para migração e redirecionar para registro
      console.log("Usuário não autenticado, redirecionando para registro...")

      // Marcar que precisa migrar carrinho após login
      localStorage.setItem("needsCartMigration", "true")

      // Mostra notificação informando que precisa fazer login
      if (window.authNotifications) {
        window.authNotifications.loginRequired("Faça login ou crie uma conta para finalizar sua compra")
      } else {
        this.showErrorMessage("Faça login ou crie uma conta para finalizar sua compra")
      }

      // Fecha o painel do carrinho
      this.closeCartPanel()

      // Salva a URL atual para redirecionamento após login
      const currentUrl = window.location.href
      localStorage.setItem("redirectAfterLogin", currentUrl)

      // Redireciona para a página de login após um breve delay
      setTimeout(() => {
        window.location.href = "/login.html"
      }, 1500)
    }
  }

  // Atualizar badge do carrinho
  updateCartBadge() {
    console.log("Atualizando badge do carrinho...")
    console.log("Cart atual:", this.cart)

    const badge = document.getElementById("cart-badge")
    console.log("Badge element:", badge)

    if (badge && this.cart) {
      // Verificar diferentes possibilidades de estrutura
      let totalItems = 0

      if (this.cart.totalItems !== undefined) {
        totalItems = this.cart.totalItems
      } else if (this.cart.TotalItems !== undefined) {
        totalItems = this.cart.TotalItems
      } else if (this.cart.items && Array.isArray(this.cart.items)) {
        totalItems = this.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      }

      console.log("Total de itens calculado:", totalItems)

      if (totalItems > 0) {
        badge.textContent = totalItems
        badge.style.display = "flex"
        console.log("Badge mostrado com:", totalItems)
      } else {
        badge.style.display = "none"
        console.log("Badge ocultado")
      }
    } else {
      console.log("Badge element ou cart não encontrado")
    }
  }

  // Abrir painel do carrinho
  openCartPanel() {
    this.updateCartPanel()
    const overlay = document.getElementById("cart-overlay")
    const panel = document.getElementById("cart-panel")

    if (overlay && panel) {
      overlay.classList.add("active")
      panel.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  // Fechar painel do carrinho
  closeCartPanel() {
    const overlay = document.getElementById("cart-overlay")
    const panel = document.getElementById("cart-panel")

    if (overlay && panel) {
      overlay.classList.remove("active")
      panel.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Atualizar conteúdo do painel
  updateCartPanel() {
    const cartItems = document.getElementById("cart-items")
    const cartEmpty = document.getElementById("cart-empty")
    const cartFooter = document.getElementById("cart-footer")
    const totalAmount = document.getElementById("total-amount")

    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      // Carrinho vazio
      if (cartItems) cartItems.style.display = "none"
      if (cartEmpty) cartEmpty.style.display = "flex"
      if (cartFooter) cartFooter.style.display = "none"
      return
    }

    // Carrinho com itens
    if (cartItems) cartItems.style.display = "block"
    if (cartEmpty) cartEmpty.style.display = "none"
    if (cartFooter) cartFooter.style.display = "block"

    // Atualizar total
    if (totalAmount) {
      totalAmount.textContent = `R$ ${this.cart.totalAmount.toFixed(2).replace(".", ",")}`
    }

    // Renderizar itens
    if (cartItems) {
      cartItems.innerHTML = ""
      this.cart.items.forEach((item) => {
        const itemElement = this.createCartItemElement(item)
        cartItems.appendChild(itemElement)
      })
    }
  }

  // Criar elemento de item do carrinho
  createCartItemElement(item) {
    const itemDiv = document.createElement("div")
    itemDiv.className = "cart-item"
    itemDiv.setAttribute("data-product-id", item.productId)

    const variantText = []
    if (item.flavor && item.flavor !== "Sem sabor") variantText.push(`Sabor: ${item.flavor}`)
    if (item.size && item.size !== "Padrão") variantText.push(`Tamanho: ${item.size}`)

    itemDiv.innerHTML = `
            <div class="cart-item-content">
                <img src="${item.productImage}" 
                     alt="${item.productName}" 
                     class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.productName}</div>
                    ${variantText.length > 0 ? `<div class="cart-item-variant">${variantText.join(" • ")}</div>` : ""}
                    <div class="cart-item-price">R$ ${item.totalPrice.toFixed(2).replace(".", ",")}</div>
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-action="decrease" data-product-id="${item.productId}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus" data-action="increase" data-product-id="${item.productId}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" data-action="remove" data-product-id="${item.productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `

    // Adicionar event listeners
    this.attachItemEventListeners(itemDiv, item)

    return itemDiv
  }

  // Adicionar event listeners aos itens
  attachItemEventListeners(itemElement, item) {
    const decreaseBtn = itemElement.querySelector('[data-action="decrease"]')
    const increaseBtn = itemElement.querySelector('[data-action="increase"]')
    const removeBtn = itemElement.querySelector('[data-action="remove"]')

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", async () => {
        if (item.quantity > 1) {
          await this.updateItemQuantity(item.productId, item.quantity - 1)
        } else {
          await this.removeItem(item.productId)
        }
      })
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", async () => {
        await this.updateItemQuantity(item.productId, item.quantity + 1)
      })
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", async () => {
        if (confirm("Deseja remover este item do carrinho?")) {
          await this.removeItem(item.productId)
        }
      })
    }
  }

  // Estados de loading
  showLoadingState() {
    const addToCartBtn = document.getElementById("add-to-cart-btn")
    if (addToCartBtn) {
      addToCartBtn.disabled = true
      addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...'
    }
  }

  hideLoadingState() {
    const addToCartBtn = document.getElementById("add-to-cart-btn")
    if (addToCartBtn) {
      addToCartBtn.disabled = false
      addToCartBtn.innerHTML = '<span class="btn-text">COMPRAR</span><i class="fas fa-shopping-cart btn-icon"></i>'
    }
  }

  // Mensagens de feedback
  showSuccessMessage(message) {
    this.showNotification(message, "success")
  }

  showErrorMessage(message) {
    this.showNotification(message, "error")
  }

  showNotification(message, type = "info") {
    // Criar notificação toast
    const notification = document.createElement("div")
    notification.className = `cart-notification cart-notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `

    // Adicionar estilos se não existirem
    if (!document.getElementById("cart-notification-styles")) {
      const styles = document.createElement("style")
      styles.id = "cart-notification-styles"
      styles.innerHTML = `
                .cart-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #111827;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    z-index: 10000;
                    min-width: 300px;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }
                .cart-notification.show {
                    transform: translateX(0);
                }
                .cart-notification-success {
                    border-color: #10b981;
                }
                .cart-notification-error {
                    border-color: #ef4444;
                }
                .cart-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex: 1;
                }
                .cart-notification-success .notification-content i {
                    color: #10b981;
                }
                .cart-notification-error .notification-content i {
                    color: #ef4444;
                }
                .cart-notification .notification-content span {
                    color: #fff;
                    font-size: 0.9rem;
                }
                .cart-notification .notification-close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0.25rem;
                }
                .cart-notification .notification-close:hover {
                    color: #fff;
                }
            `
      document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    // Mostrar notificação
    setTimeout(() => notification.classList.add("show"), 100)

    // Auto-remover
    const autoRemove = setTimeout(() => {
      this.removeNotification(notification)
    }, 4000)

    // Botão fechar
    notification.querySelector(".notification-close").addEventListener("click", () => {
      clearTimeout(autoRemove)
      this.removeNotification(notification)
    })
  }

  getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  }

  removeNotification(notification) {
    notification.classList.remove("show")
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }

  // Finalizar compra (método legado mantido para compatibilidade)
  async checkout(shippingAddress) {
    try {
      this.isLoading = true

      const response = await fetch(`${this.API_BASE_URL}/Cart/checkout`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ shippingAddress: shippingAddress }),
        credentials: "include",
      })

      const result = await response.json()

      if (response.ok && result.hasSuccess) {
        this.cart = { items: [], totalAmount: 0, totalItems: 0 }
        this.updateCartBadge()
        this.closeCartPanel()
        this.showSuccessMessage("Pedido criado com sucesso!")
        return { success: true, order: result.value }
      } else {
        const errorMessage = result.errors?.[0] || "Erro ao finalizar compra"
        this.showErrorMessage(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro ao finalizar compra:", error)
      this.showErrorMessage("Erro de conexão. Tente novamente.")
      return { success: false, error: error.message }
    } finally {
      this.isLoading = false
    }
  }

  // Método de debug para verificar estado do carrinho
  debugCartState() {
    console.log("=== DEBUG CART STATE ===")
    console.log("Session ID:", this.sessionId)
    console.log("Is Authenticated:", this.isUserAuthenticated())
    console.log("Auth Token:", localStorage.getItem("authToken") ? "Present" : "Not found")
    console.log("Cart:", this.cart)
    console.log("Headers:", this.getHeaders())
    console.log("========================")
  }

  // Obter carrinho atual
  getCart() {
    return this.cart
  }

  // Verificar se carrinho está vazio
  isEmpty() {
    return !this.cart || !this.cart.items || this.cart.items.length === 0
  }

  // Obter total de itens
  getTotalItems() {
    return this.cart ? this.cart.totalItems : 0
  }

  // Obter valor total
  getTotalAmount() {
    return this.cart ? this.cart.totalAmount : 0
  }
}

// Instância global do serviço de carrinho
window.cartService = new CartService()
