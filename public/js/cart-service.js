// Cart Service - Gerenciamento do carrinho
class CartService {
  constructor() {
    this.API_BASE_URL = "https://localhost:4242/api"
    this.cart = null
    this.isLoading = false
    this.init()
  }

  async init() {
    await this.loadCart()
    this.updateCartBadge()
  }

  // Carregar carrinho do backend
  async loadCart() {
    try {
      this.isLoading = true
      const response = await fetch(`${this.API_BASE_URL}/Cart`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.hasSuccess) {
          this.cart = result.value
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
    }
  }

  // Adicionar item ao carrinho
  async addItem(productId, quantity = 1, flavor = null, size = null) {
    try {
      this.isLoading = true
      this.showLoadingState()

      const requestData = {
        productId: productId,
        quantity: quantity,
        flavor: flavor,
        size: size,
      }

      const response = await fetch(`${this.API_BASE_URL}/Cart/add`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(requestData),
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    return headers
  }

  // Atualizar badge do carrinho
  updateCartBadge() {
    const badge = document.getElementById("cart-badge")
    if (badge && this.cart) {
      const totalItems = this.cart.totalItems || 0
      if (totalItems > 0) {
        badge.textContent = totalItems
        badge.style.display = "flex"
      } else {
        badge.style.display = "none"
      }
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
                <img src="${item.productImage || "/placeholder.svg?height=60&width=60"}" 
                     alt="${item.productName}" 
                     class="cart-item-image"
                     onerror="this.src='/placeholder.svg?height=60&width=60'">
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

  // Finalizar compra
  async checkout(shippingAddress) {
    try {
      this.isLoading = true

      const response = await fetch(`${this.API_BASE_URL}/Cart/checkout`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ shippingAddress: shippingAddress }),
        credentials: 'include',
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
