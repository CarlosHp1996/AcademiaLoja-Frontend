// Checkout Service - Integração completa com Stripe e Backend

class CheckoutService {
  constructor() {
    this.API_BASE_URL = "https://localhost:4242/api"
    this.stripe = null
    this.cardElement = null
    this.cart = null
    this.currentOrder = null
    this.paymentIntent = null

    this.init()
  }

  async init() {
    try {
      // Inicializar Stripe
      this.stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx") // Substitua pela sua chave pública

      // Carregar dados do carrinho
      await this.loadCartData()

      // Configurar interface
      this.setupUI()
      this.setupEventListeners()

      // Configurar Stripe Elements
      this.setupStripeElements()
    } catch (error) {
      console.error("Erro ao inicializar checkout:", error)
      this.showNotification("Erro ao carregar página de checkout", "error")
    }
  }

  async loadCartData() {
    try {
      this.showLoading(true)

      // Carregar carrinho do CartService
      if (window.cartService) {
        await window.cartService.loadCart()
        this.cart = window.cartService.getCart()
      }

      if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
        this.showEmptyCart()
        return
      }

      // Renderizar dados do carrinho
      this.renderOrderSummary()
      this.showCheckout()
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
      this.showNotification("Erro ao carregar dados do carrinho", "error")
    } finally {
      this.showLoading(false)
    }
  }

  setupUI() {
    // Configurar abas de pagamento
    const paymentTabs = document.querySelectorAll(".payment-tab")
    const paymentForms = document.querySelectorAll(".payment-form")

    paymentTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const method = tab.dataset.method

        // Remover classe ativa
        paymentTabs.forEach((t) => t.classList.remove("active"))
        paymentForms.forEach((f) => f.classList.remove("active"))

        // Adicionar classe ativa
        tab.classList.add("active")
        document.getElementById(`${method}-payment`).classList.add("active")
      })
    })

    // Configurar CEP
    const cepInput = document.getElementById("shipping-cep")
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        e.target.value = this.formatCEP(e.target.value)
      })

      cepInput.addEventListener("blur", () => {
        this.searchCEP(cepInput.value)
      })
    }
  }

  setupEventListeners() {
    // Botão finalizar compra
    const completeBtn = document.getElementById("complete-purchase")
    if (completeBtn) {
      completeBtn.addEventListener("click", () => this.handleCompletePurchase())
    }
  }

  setupStripeElements() {
    if (!this.stripe) return

    const elements = this.stripe.elements({
      appearance: {
        theme: "night",
        variables: {
          colorPrimary: "#ff6600",
          colorBackground: "#111111",
          colorText: "#ffffff",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "8px",
        },
      },
    })

    // Criar elemento do cartão
    this.cardElement = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#ffffff",
          "::placeholder": {
            color: "#666666",
          },
        },
      },
    })

    // Montar elemento
    const cardElementContainer = document.getElementById("card-element")
    if (cardElementContainer) {
      this.cardElement.mount("#card-element")

      // Escutar mudanças
      this.cardElement.on("change", (event) => {
        const displayError = document.getElementById("card-errors")
        if (event.error) {
          displayError.textContent = event.error.message
        } else {
          displayError.textContent = ""
        }
      })
    }
  }

  async handleCompletePurchase() {
    try {
      // Validar formulário
      if (!this.validateForm()) {
        return
      }

      // Desabilitar botão
      const completeBtn = document.getElementById("complete-purchase")
      completeBtn.disabled = true
      completeBtn.classList.add("btn-loading")

      // Criar pedido usando o CartService
      await this.createOrderFromCart()

      // Processar pagamento
      const activePaymentMethod = document.querySelector(".payment-tab.active").dataset.method

      if (activePaymentMethod === "card") {
        await this.processCardPayment()
      } else if (activePaymentMethod === "pix") {
        await this.processPixPayment()
      }
    } catch (error) {
      console.error("Erro ao finalizar compra:", error)
      this.showNotification("Erro ao processar pagamento. Tente novamente.", "error")
    } finally {
      // Reabilitar botão
      const completeBtn = document.getElementById("complete-purchase")
      completeBtn.disabled = false
      completeBtn.classList.remove("btn-loading")
    }
  }

  async createOrderFromCart() {
    try {
      const shippingAddress = this.getShippingAddressString()

      // Usar o CartService para converter carrinho em pedido
      const response = await fetch(`${this.API_BASE_URL}/Cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService?.getToken()}`,
        },
        body: JSON.stringify({ shippingAddress: shippingAddress }),
        credentials: "include",
      })

      const result = await response.json()

      if (!response.ok || !result.hasSuccess) {
        throw new Error(result.errors?.[0] || "Erro ao criar pedido")
      }

      this.currentOrder = { orderId: result.value }
      console.log("Pedido criado:", this.currentOrder)
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      throw error
    }
  }

  async processCardPayment() {
    try {
      // Criar payment intent
      const response = await fetch(`${this.API_BASE_URL}/Payment/create/${this.currentOrder.orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService?.getToken()}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.hasSuccess) {
        throw new Error(result.errors?.[0] || "Erro ao criar intenção de pagamento")
      }

      this.paymentIntent = result.value
      console.log("Payment Intent criado:", this.paymentIntent)

      // Confirmar pagamento com Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.paymentIntent.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: document.getElementById("shipping-name").value,
            email: window.authService?.getUserData()?.email,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === "succeeded") {
        this.showNotification("Pagamento processado com sucesso!", "success")

        // Limpar carrinho
        if (window.cartService) {
          await window.cartService.clearCart()
        }

        // Redirecionar para confirmação
        setTimeout(() => {
          window.location.href = `/public/html/order-confirmation.html?order=${this.currentOrder.orderId}`
        }, 2000)
      }
    } catch (error) {
      console.error("Erro no pagamento com cartão:", error)
      throw error
    }
  }

  async processPixPayment() {
    try {
      // Para PIX, apenas criar o payment intent
      const response = await fetch(`${this.API_BASE_URL}/Payment/create/${this.currentOrder.orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService?.getToken()}`,
        },
      })

      const result = await response.json()

      if (!response.ok || !result.hasSuccess) {
        throw new Error(result.errors?.[0] || "Erro ao criar pagamento PIX")
      }

      this.paymentIntent = result.value

      this.showNotification("Pedido criado! Redirecionando para pagamento PIX...", "success")

      // Redirecionar para página de PIX
      setTimeout(() => {
        window.location.href = `/public/html/pix-payment.html?order=${this.currentOrder.orderId}&payment=${this.paymentIntent.paymentId}`
      }, 2000)
    } catch (error) {
      console.error("Erro no pagamento PIX:", error)
      throw error
    }
  }

  validateForm() {
    const requiredFields = [
      "shipping-name",
      "shipping-cep",
      "shipping-street",
      "shipping-number",
      "shipping-neighborhood",
      "shipping-city",
      "shipping-state",
    ]

    let isValid = true

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId)
      if (field && !field.value.trim()) {
        field.style.borderColor = "#ef4444"
        isValid = false
      } else if (field) {
        field.style.borderColor = "#333"
      }
    })

    if (!isValid) {
      this.showNotification("Por favor, preencha todos os campos obrigatórios", "error")
    }

    return isValid
  }

  getShippingAddressString() {
    const address = {
      name: document.getElementById("shipping-name").value,
      cep: document.getElementById("shipping-cep").value,
      street: document.getElementById("shipping-street").value,
      number: document.getElementById("shipping-number").value,
      complement: document.getElementById("shipping-complement").value,
      neighborhood: document.getElementById("shipping-neighborhood").value,
      city: document.getElementById("shipping-city").value,
      state: document.getElementById("shipping-state").value,
    }

    // Formatar endereço como string
    let addressString = `${address.name}, ${address.street}, ${address.number}`
    if (address.complement) {
      addressString += `, ${address.complement}`
    }
    addressString += `, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.cep}`

    return addressString
  }

  renderOrderSummary() {
    const summaryItems = document.getElementById("summary-items")
    const subtotalAmount = document.getElementById("subtotal-amount")
    const totalAmount = document.getElementById("total-amount")

    if (!summaryItems || !this.cart) return

    // Renderizar itens
    summaryItems.innerHTML = ""

    this.cart.items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "summary-item"
      itemElement.innerHTML = `
        <div class="item-image">
          <img src="${item.productImage || "/placeholder.svg?height=60&width=60"}" 
               alt="${item.productName}"
               onerror="this.src='/placeholder.svg?height=60&width=60'">
        </div>
        <div class="item-details">
          <div class="item-name">${item.productName}</div>
          ${item.flavor && item.flavor !== "Sem sabor" ? `<div class="item-variant">Sabor: ${item.flavor}</div>` : ""}
          <div class="item-price">
            <span class="item-quantity">${item.quantity}x</span>
            <span class="item-amount">R$ ${item.totalPrice.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      `
      summaryItems.appendChild(itemElement)
    })

    // Atualizar totais
    if (subtotalAmount) {
      subtotalAmount.textContent = `R$ ${this.cart.totalAmount.toFixed(2).replace(".", ",")}`
    }

    if (totalAmount) {
      totalAmount.textContent = `R$ ${this.cart.totalAmount.toFixed(2).replace(".", ",")}`
    }
  }

  async searchCEP(cep) {
    const cleanCEP = cep.replace(/\D/g, "")

    if (cleanCEP.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (!data.erro) {
        document.getElementById("shipping-street").value = data.logradouro || ""
        document.getElementById("shipping-neighborhood").value = data.bairro || ""
        document.getElementById("shipping-city").value = data.localidade || ""
        document.getElementById("shipping-state").value = data.uf || ""
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  formatCEP(value) {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 5) {
      return cleanValue
    }
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`
  }

  showLoading(show) {
    const loading = document.getElementById("checkout-loading")
    const container = document.getElementById("checkout-container")

    if (show) {
      loading.style.display = "flex"
      container.style.display = "none"
    } else {
      loading.style.display = "none"
      container.style.display = "block"
    }
  }

  showCheckout() {
    document.getElementById("checkout-container").style.display = "block"
    document.getElementById("empty-cart").style.display = "none"
  }

  showEmptyCart() {
    document.getElementById("checkout-container").style.display = "none"
    document.getElementById("empty-cart").style.display = "flex"
  }

  showNotification(message, type = "info") {
    // Remover notificação existente
    const existing = document.querySelector(".checkout-notification")
    if (existing) {
      existing.remove()
    }

    // Criar nova notificação
    const notification = document.createElement("div")
    notification.className = `checkout-notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Remover após 5 segundos
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Aguardar serviços estarem disponíveis
  function waitForServices() {
    if (window.authService && window.cartService) {
      new CheckoutService()
    } else {
      setTimeout(waitForServices, 100)
    }
  }

  waitForServices()
})
