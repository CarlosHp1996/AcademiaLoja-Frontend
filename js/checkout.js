// Checkout Service - Integração completa com Stripe e Backend

class CheckoutService {
  constructor() {
    this.API_BASE_URL = "/api"
    this.stripe = null
    this.cardElement = null
    this.cart = null
    this.currentOrder = null
    this.paymentIntent = null
    this.currentUser = null
    this.currentAddresses = []
    this.editingAddressId = null
    this.selectedAddressId = null

    this.init()
  }

  async init() {
    try {
      // Inicializar Stripe
      this.stripe = Stripe("pk_test_51R7kMyQ3UBH6KXI9pei6vdGfFCpoHgJXddLYT71GH9n0PRaxcHBdq5vmNMOxiZvgR9cxDMfjJ4MMm7DJjO1E9NmG00vIJfQ2KX") // Substitua pela sua chave pública

      // Carregar dados do usuário e do carrinho
      await this.loadUserData()
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

  async loadUserData() {
    if (!window.authService?.getToken()) {
      window.location.href = "/login.html"
      return
    }

    try {
      const userId = window.authService.getUserId()
      const response = await fetch(`${this.API_BASE_URL}/Auth/get/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService.getToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar dados do usuário")
      }

      const result = await response.json()
      if (result.hasSuccess && result.value) {
        this.currentUser = result.value
        this.currentAddresses = result.value.user.addresses || []
        this.renderAddresses()
      } else {
        throw new Error(result.errors?.[0] || "Erro ao carregar dados do usuário")
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
      this.showNotification(error.message, "error")
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
  }

  setupEventListeners() {
    // Botão finalizar compra
    const completeBtn = document.getElementById("complete-purchase")
    if (completeBtn) {
      completeBtn.addEventListener("click", () => this.handleCompletePurchase())
    }

    // Botões do modal de endereço
    document.getElementById("addAddressBtn").addEventListener("click", () => {
      this.openAddressModal()
    })

    document.getElementById("closeAddressModal").addEventListener("click", () => this.closeAddressModal())
    document.getElementById("cancelAddressBtn").addEventListener("click", () => this.closeAddressModal())

    // Fechar modal ao clicar no overlay
    document.getElementById("addressModalOverlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("addressModalOverlay")) {
        this.closeAddressModal()
      }
    })

    // Formulário de endereço
    document.getElementById("addressForm").addEventListener("submit", async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const submitBtn = e.target.querySelector('button[type="submit"]')

      submitBtn.classList.add("loading")
      await this.saveAddress(formData)
      submitBtn.classList.remove("loading")
    })
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
      // Validar seleção de endereço
      if (!this.selectedAddressId) {
        this.showNotification("Por favor, selecione um endereço de entrega.", "error")
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
      const shippingAddress = this.getShippingAddressObject()

      // Verificar se o usuário está autenticado
      if (!window.authService?.getToken()) {
        throw new Error("Você precisa estar logado para finalizar a compra")
      }

      const token = window.authService.getToken()

      // Usar o CartService para converter carrinho em pedido
      const response = await fetch(`${this.API_BASE_URL}/Cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(shippingAddress),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta do servidor:", response.status, response.statusText, errorText);
        
        if (response.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        
        throw new Error(`O servidor respondeu com um erro (${response.status}). Veja o console para detalhes.`);
      }

      const result = await response.json()

      if (!result.hasSuccess) {
        throw new Error(result.errors?.[0] || "Erro ao criar pedido")
      }

      this.currentOrder = { orderId: result.value }
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      throw error
    }
  }

  async processCardPayment() {
    try {
      // 1. Criar payment intent no backend
      const createResponse = await fetch(`${this.API_BASE_URL}/Payment/create/${this.currentOrder.orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService?.getToken()}`,
        },
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok || !createResult.hasSuccess) {
        throw new Error(createResult.errors?.[0] || "Erro ao criar intenção de pagamento");
      }

      this.paymentIntent = createResult.value;

      // 2. Criar PaymentMethod no frontend com Stripe.js
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: this.currentUser.user.userName,
          email: this.currentUser.user.email,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // 3. Confirmar o pagamento no backend
      const confirmResponse = await fetch(`${this.API_BASE_URL}/Payment/confirm`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${window.authService?.getToken()}`,
          },
          body: JSON.stringify({
              paymentIntentId: this.paymentIntent.transactionId,
              paymentMethodId: paymentMethod.id,
          }),
      });

      const confirmResult = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmResult.hasSuccess) {
          throw new Error(confirmResult?.errors?.[0] || "Erro ao confirmar o pagamento.");
      }

      // 4. Verificar o pagamento no backend
      const verifyResponse = await fetch(`${this.API_BASE_URL}/Payment/verify/${this.paymentIntent.paymentId}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${window.authService?.getToken()}`,
          },
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyResult.hasSuccess) {
          throw new Error(verifyResult.errors?.[0] || "Erro ao verificar o pagamento.");
      }

      // 5. Sucesso
      this.showNotification("Pagamento processado com sucesso!", "success");

      if (window.cartService) {
        await window.cartService.clearCart();
      }

      setTimeout(() => {
        window.location.href = `/dashboard.html`;
      }, 2000);

    } catch (error) {
      console.error("Erro no pagamento com cartão:", error);
      this.showNotification(error.message, "error");
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
        window.location.href = `/pix-payment.html?order=${this.currentOrder.orderId}&payment=${this.paymentIntent.paymentId}`
      }, 2000)
    } catch (error) {
      console.error("Erro no pagamento PIX:", error)
      throw error
    }
  }

  getShippingAddressObject() {
    const selectedAddress = this.currentAddresses.find(addr => addr.id === this.selectedAddressId)
    if (!selectedAddress) return null

    return {
      Id: selectedAddress.id,
      Name: this.currentUser.user.userName,
      Cep: selectedAddress.zipCode,
      Street: selectedAddress.street,
      Number: selectedAddress.number,
      Complement: selectedAddress.complement,
      Neighborhood: selectedAddress.neighborhood,
      City: selectedAddress.city,
      State: selectedAddress.state,
    }
  }

  renderAddresses() {
    const addressesContainer = document.getElementById("addresses-container")
    const emptyAddresses = document.getElementById("empty-addresses")

    if (!this.currentAddresses || this.currentAddresses.length === 0) {
      addressesContainer.style.display = "none"
      emptyAddresses.style.display = "flex"
      return
    }

    addressesContainer.style.display = "grid"
    emptyAddresses.style.display = "none"

    addressesContainer.innerHTML = this.currentAddresses
      .map(
        (address) => `
        <div class="address-card ${address.mainAddress ? 'main-address' : ''} ${this.selectedAddressId === address.id ? 'selected' : ''}" data-address-id="${address.id}">
            <div class="address-header">
                <div class="address-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="address-actions">
                    <button class="btn-icon" onclick="checkoutService.editAddress('${address.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="checkoutService.deleteAddress('${address.id}')" title="Excluir">
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
                    <span>CEP: ${this.formatZipCode(address.zipCode)}</span>
                </div>
            </div>
            <button class="btn btn-primary btn-select-address" onclick="checkoutService.selectAddress('${address.id}')">
                ${this.selectedAddressId === address.id ? '<i class="fas fa-check-circle"></i> Endereço Selecionado' : 'Usar este Endereço'}
            </button>
        </div>
    `,
      )
      .join("")
  }

  selectAddress(addressId) {
    this.selectedAddressId = addressId
    this.renderAddresses()
  }

  editAddress(addressId) {
    this.openAddressModal(addressId)
  }

  async deleteAddress(addressId) {
    if (!confirm("Tem certeza que deseja excluir este endereço?")) {
      return
    }

    try {
      const updatedAddresses = this.currentAddresses.filter((addr) => addr.id !== addressId)

      const updateData = {
        id: this.currentUser.user.id,
        addresses: updatedAddresses,
      }

      const response = await fetch(`${this.API_BASE_URL}/Auth/update?id=${this.currentUser.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService.getToken()}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir endereço")
      }

      const result = await response.json()

      if (result.hasSuccess) {
        this.currentAddresses = result.value.user.addresses || []
        this.renderAddresses()
        this.showNotification("Endereço excluído com sucesso!", "success")
      } else {
        throw new Error(result.errors?.[0] || "Erro ao excluir endereço")
      }
    } catch (error) {
      console.error("Erro ao excluir endereço:", error)
      this.showNotification(error.message, "error")
    }
  }

  openAddressModal(addressId = null) {
    this.editingAddressId = addressId
    const addressModalTitle = document.getElementById("addressModalTitle")
    const addressForm = document.getElementById("addressForm")
    const addressIdInput = document.getElementById("addressId")
    const mainAddressCheckbox = document.getElementById("mainAddress")

    if (addressId) {
      const address = this.currentAddresses.find((addr) => addr.id === addressId)
      if (address) {
        addressModalTitle.textContent = "Editar Endereço"
        addressIdInput.value = address.id
        document.getElementById("zipCode").value = this.formatZipCode(address.zipCode)
        document.getElementById("street").value = address.street
        document.getElementById("number").value = address.number
        document.getElementById("complement").value = address.complement || ""
        document.getElementById("neighborhood").value = address.neighborhood
        document.getElementById("city").value = address.city
        document.getElementById("state").value = address.state.toString()
        mainAddressCheckbox.checked = address.mainAddress
      }
    } else {
      addressModalTitle.textContent = "Adicionar Endereço"
      addressForm.reset()
      addressIdInput.value = ""
    }

    document.getElementById("addressModalOverlay").style.display = "flex"
    document.body.style.overflow = "hidden"
  }

  closeAddressModal() {
    document.getElementById("addressModalOverlay").style.display = "none"
    document.body.style.overflow = "auto"
    this.editingAddressId = null
    document.getElementById("addressForm").reset()
  }

  async saveAddress(formData) {
    try {
      const addressData = {
        id: this.editingAddressId || "00000000-0000-0000-0000-000000000000",
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
      if (this.editingAddressId) {
        updatedAddresses = this.currentAddresses.map((addr) => (addr.id === this.editingAddressId ? addressData : addr))
      } else {
        updatedAddresses = [...this.currentAddresses, addressData]
      }

      const updateData = {
        id: this.currentUser.user.id,
        addresses: updatedAddresses,
      }

      const response = await fetch(`${this.API_BASE_URL}/Auth/update?id=${this.currentUser.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.authService.getToken()}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar endereço")
      }

      const result = await response.json()

      if (result.hasSuccess) {
        this.currentAddresses = result.value.user.addresses || []
        this.renderAddresses()
        this.closeAddressModal()
        this.showNotification(this.editingAddressId ? "Endereço atualizado com sucesso!" : "Endereço adicionado com sucesso!", "success")
      } else {
        throw new Error(result.errors?.[0] || "Erro ao salvar endereço")
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error)
      this.showNotification(error.message, "error")
    }
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
          <img src="${item.productImage}" 
               alt="${item.productName}">
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

  // getStateName(stateValue, abbreviation = false) {
  //   const states = {
  //     0: "AC", 1: "AL", 2: "AP", 3: "AM", 4: "BA", 5: "CE", 6: "DF", 7: "ES", 8: "GO", 9: "MA", 10: "MT", 11: "MS", 12: "MG", 13: "PA", 14: "PB", 15: "PR", 16: "PE", 17: "PI", 18: "RJ", 19: "RN", 20: "RS", 21: "RO", 22: "RR", 23: "SC", 24: "SP", 25: "SE", 26: "TO",
  //   }
  //   const fullStates = {
  //       0: "Acre", 1: "Alagoas", 2: "Amapá", 3: "Amazonas", 4: "Bahia", 5: "Ceará", 6: "Distrito Federal", 7: "Espírito Santo", 8: "Goiás", 9: "Maranhão", 10: "Mato Grosso", 11: "Mato Grosso do Sul", 12: "Minas Gerais", 13: "Pará", 14: "Paraíba", 15: "Paraná", 16: "Pernambuco", 17: "Piauí", 18: "Rio de Janeiro", 19: "Rio Grande do Norte", 20: "Rio Grande do Sul", 21: "Rondônia", 22: "Roraima", 23: "Santa Catarina", 24: "São Paulo", 25: "Sergipe", 26: "Tocantins",
  //   }
  //   return abbreviation ? states[stateValue] : fullStates[stateValue] || "N/A"
  // }

  formatZipCode(zipCode) {
    if (!zipCode) return ""
    return zipCode.replace(/(\d{5})(\d{3})/, "$1-$2")
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
      window.checkoutService = new CheckoutService()
    } else {
      setTimeout(waitForServices, 100)
    }
  }

  waitForServices()
})