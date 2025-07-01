document.addEventListener("DOMContentLoaded", () => {
  // Configurar eventos do painel do carrinho
  function setupCartPanel() {
    const cartButton = document.getElementById("cart-button")
    const cartClose = document.getElementById("cart-close")
    const cartOverlay = document.getElementById("cart-overlay")
    const continueShoppingBtn = document.getElementById("continue-shopping")
    const btnContinueShopping = document.getElementById("btn-continue-shopping")
    const btnCheckout = document.getElementById("btn-checkout")

    // Abrir carrinho ao clicar no ícone
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        window.cartService.openCartPanel()
      })
    }

    // Fechar carrinho
    if (cartClose) {
      cartClose.addEventListener("click", () => {
        window.cartService.closeCartPanel()
      })
    }

    if (cartOverlay) {
      cartOverlay.addEventListener("click", () => {
        window.cartService.closeCartPanel()
      })
    }

    // Continuar comprando
    if (continueShoppingBtn) {
      continueShoppingBtn.addEventListener("click", () => {
        window.cartService.closeCartPanel()
      })
    }

    if (btnContinueShopping) {
      btnContinueShopping.addEventListener("click", () => {
        window.cartService.closeCartPanel()
      })
    }

    // Finalizar compra
    if (btnCheckout) {
      btnCheckout.addEventListener("click", async () => {
        if (window.cartService.isEmpty()) {
          alert("Carrinho está vazio!")
          return
        }

        // Por enquanto, redirecionar para página de checkout
        // Futuramente você pode implementar um modal de endereço
        const shippingAddress = prompt("Digite seu endereço de entrega:")
        if (shippingAddress) {
          const result = await window.cartService.checkout(shippingAddress)
          if (result.success) {
            alert("Pedido criado com sucesso! Redirecionando...")
            // Redirecionar para página de pedidos ou confirmação
            window.location.href = "/public/html/orders.html"
          }
        } else {
          alert("Endereço é obrigatório para finalizar a compra.")
        }
      })
    }

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.cartService.closeCartPanel()
      }
    })
  }

  // Chamar a função de configuração do painel do carrinho
  setupCartPanel()
});