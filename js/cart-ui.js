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

    // Finalizar compra - NOVA IMPLEMENTAÇÃO COM VERIFICAÇÃO DE AUTENTICAÇÃO
    if (btnCheckout) {
      // Remove event listeners existentes para evitar duplicação
      const newBtnCheckout = btnCheckout.cloneNode(true)
      btnCheckout.parentNode.replaceChild(newBtnCheckout, btnCheckout)

      newBtnCheckout.addEventListener("click", () => {
        console.log("Botão Finalizar Compra clicado - cart-ui.js")

        // Verifica se o cartService está disponível
        if (!window.cartService) {
          console.error("CartService não está disponível")
          alert("Erro interno. Tente recarregar a página.")
          return
        }

        // Usa o novo método handleCheckout que verifica autenticação
        window.cartService.handleCheckout()
      })
    }

    // Fechar com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.cartService.closeCartPanel()
      }
    })
  }

  // Aguarda o cartService estar disponível antes de configurar
  function waitForCartService(callback, maxAttempts = 50) {
    let attempts = 0

    function checkCartService() {
      attempts++

      if (window.cartService) {
        console.log("CartService carregado, configurando painel do carrinho")
        callback()
      } else if (attempts < maxAttempts) {
        console.log(`Aguardando CartService... tentativa ${attempts}`)
        setTimeout(checkCartService, 100)
      } else {
        console.error("Timeout: CartService não carregou a tempo")
        // Tenta configurar mesmo assim
        callback()
      }
    }

    checkCartService()
  }

  // Chamar a função de configuração do painel do carrinho
  console.log("Inicializando cart-ui.js")
  waitForCartService(setupCartPanel)
})
