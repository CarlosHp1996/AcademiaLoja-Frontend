document.addEventListener("DOMContentLoaded", () => {
  // Categories data usando os enums do backend
  const categories = [
    {
      name: "Whey Protein",
      enumKey: "WheyProtein",
      enumValue: 1,
      href:
        window.NavigationEnums?.generateFilterUrl("category", "WheyProtein") ||
        "/public/html/products.html?CategoryIds=1",
      image: "/assets/images/whey.webp",
      icon: "fas fa-dumbbell",
      description: "Proteína de alta qualidade para ganho de massa muscular",
    },
    {
      name: "Pré-Treino",
      enumKey: "PreTreino",
      enumValue: 6,
      href:
        window.NavigationEnums?.generateFilterUrl("category", "PreTreino") ||
        "/public/html/products.html?CategoryIds=6",
      image: "/assets/images/7760b939e99c891f282253d7b9c7e32f-g5cg80n3g3.webp",
      icon: "fas fa-fire",
      description: "Energia e foco para treinos intensos",
    },
    {
      name: "Creatina",
      enumKey: "Creatina",
      enumValue: 3,
      href:
        window.NavigationEnums?.generateFilterUrl("category", "Creatina") || "/public/html/products.html?CategoryIds=3",
      image: "/assets/images/creatine-_300g.webp",
      icon: "fas fa-bolt",
      description: "Aumento de força e potência muscular",
    },
    {
      name: "Glutamina",
      enumKey: "Glutamina",
      enumValue: 4,
      href:
        window.NavigationEnums?.generateFilterUrl("category", "Glutamina") ||
        "/public/html/products.html?CategoryIds=4",
      image: "/assets/images/glutamina-darkness-350g-integralmedica.jpg",
      icon: "fas fa-shield-alt",
      description: "Recuperação muscular e fortalecimento imunológico",
    },
    {
      name: "Vitaminas",
      enumKey: "Vitaminas",
      enumValue: 9,
      href:
        window.NavigationEnums?.generateFilterUrl("category", "Vitaminas") ||
        "/public/html/products.html?CategoryIds=9",
      image: "/assets/images/vitamina-c-1500mg-60-caps-integralmedica.jpg",
      icon: "fas fa-leaf",
      description: "Suporte nutricional e bem-estar geral",
    },
  ]

  // Função para renderizar categorias com design moderno
  function renderCategories() {
    const categoriesGrid = document.querySelector(".categories-grid")
    if (!categoriesGrid) return

    categoriesGrid.innerHTML = "" // Limpar conteúdo existente

    categories.forEach((category, index) => {
      const categoryCard = document.createElement("a")
      categoryCard.href = category.href
      categoryCard.className = "category-card-modern"
      categoryCard.setAttribute("data-category-id", category.enumValue)
      categoryCard.setAttribute("data-category-key", category.enumKey)

      // Adicionar delay para animação escalonada
      categoryCard.style.animationDelay = `${index * 0.1}s`

      categoryCard.innerHTML = `
                <div class="category-gradient-bg"></div>
                <div class="category-icon-container">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-image-container">
                    <img src="${category.image}" alt="${category.name}" class="category-image" loading="lazy">
                    <div class="category-overlay"></div>
                </div>
                <div class="category-content-modern">
                    <h3 class="category-name-modern">${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                    <div class="category-cta">
                        <span class="cta-text">Explorar</span>
                        <i class="fas fa-arrow-right cta-icon"></i>
                    </div>
                </div>
                <div class="category-hover-effect"></div>
            `

      // Adicionar event listeners para tracking e analytics
      categoryCard.addEventListener("click", (e) => {
        // Analytics tracking (opcional)
        const gtag = window.gtag // Declare the variable before using it
        if (typeof gtag !== "undefined") {
          gtag("event", "category_click", {
            category_name: category.name,
            category_id: category.enumValue,
            category_key: category.enumKey,
          })
        }

        // Log para debug
        console.log(`Navegando para categoria: ${category.name} (ID: ${category.enumValue})`)
      })

      // Adicionar hover effects
      categoryCard.addEventListener("mouseenter", function () {
        this.classList.add("category-hover")
      })

      categoryCard.addEventListener("mouseleave", function () {
        this.classList.remove("category-hover")
      })

      categoriesGrid.appendChild(categoryCard)
    })
  }

  // Função para buscar produtos em destaque do backend
  async function fetchFeaturedProducts() {
    const API_BASE_URL = "https://localhost:4242/api"

    try {
      // Configurar headers
      const headers = {
        "Content-Type": "application/json",
      }

      // Adicionar token de autenticação se disponível
      const authToken = localStorage.getItem("authToken")
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      // Parâmetros para buscar 4 produtos aleatórios
      const params = new URLSearchParams({
        Page: "1",
        PageSize: "4",
        IsActive: "true",
        SortBy: "Name",
        SortDirection: "asc",
      })

      const url = `${API_BASE_URL}/Product/get?${params.toString()}`

      console.log("Buscando produtos em destaque:", url)

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.hasSuccess && result.value && result.value.products) {
        console.log("Produtos em destaque encontrados:", result.value.products)
        return result.value.products.slice(0, 4) // Garantir apenas 4 produtos
      } else {
        console.warn("Nenhum produto encontrado:", result)
        return []
      }
    } catch (error) {
      console.error("Erro ao buscar produtos em destaque:", error)
      return []
    }
  }

  // Função para renderizar produtos em destaque
  async function renderFeaturedProducts() {
    const productsGrid = document.querySelector(".products-grid")
    if (!productsGrid) return

    // Mostrar loading
    productsGrid.innerHTML = `
      <div class="col-span-full flex justify-center items-center py-8">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin text-orange-500 text-2xl"></i>
          <span class="ml-2 text-zinc-400">Carregando produtos...</span>
        </div>
      </div>
    `

    try {
      // Buscar produtos do backend
      const products = await fetchFeaturedProducts()

      // Limpar conteúdo
      productsGrid.innerHTML = ""

      if (!products || products.length === 0) {
        productsGrid.innerHTML = `
          <div class="col-span-full text-center py-8">
            <i class="fas fa-box-open text-zinc-500 text-4xl mb-4"></i>
            <p class="text-zinc-400">Nenhum produto encontrado no momento.</p>
          </div>
        `
        return
      }

      // Renderizar cada produto
      products.forEach((product, index) => {
        const brandName = product.attributes?.find((attr) => attr.brand)?.brand || "Marca Desconhecida"
        const imageUrl = product.imageUrl || "/placeholder.svg?height=400&width=400"
        const hasDiscount = product.oldPrice && product.oldPrice > product.price
        const discountPercentage = hasDiscount
          ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
          : 0

        // Determinar badge
        let badge = ""
        if (product.isNew) {
          badge = "NOVO"
        } else if (hasDiscount) {
          badge = "PROMOÇÃO"
        } else if (product.isFeatured) {
          badge = "DESTAQUE"
        }

        // Generate stars HTML (assumindo rating padrão se não vier da API)
        const rating = product.rating || 4 // Rating padrão
        const reviews = product.reviewCount || Math.floor(Math.random() * 200) + 10 // Reviews aleatórios se não vier da API

        let starsHtml = ""
        for (let i = 0; i < 5; i++) {
          if (i < rating) {
            starsHtml += '<i class="fas fa-star star filled"></i>'
          } else {
            starsHtml += '<i class="fas fa-star star empty"></i>'
          }
        }

        const productCard = document.createElement("div")
        productCard.className = "category-card-modern product-card-featured"
        productCard.setAttribute("data-product-id", product.id)

        // Adicionar delay para animação escalonada
        productCard.style.animationDelay = `${index * 0.1}s`

        productCard.innerHTML = `
  <div class="category-gradient-bg"></div>
  <div class="category-icon-container">
    <i class="fas fa-star"></i>
  </div>
  <div class="category-image-container">
    <img src="${imageUrl}" alt="${product.name}" class="category-image" loading="lazy" onerror="this.src='/placeholder.svg?height=400&width=400'">
    <div class="category-overlay"></div>
    ${badge ? `<div class="product-badge-modern">${badge}</div>` : ""}
    ${discountPercentage > 0 ? `<div class="product-discount-modern">-${discountPercentage}%</div>` : ""}
  </div>
  <div class="category-content-modern">
    <h3 class="category-name-modern">${product.name}</h3>
    <p class="category-description">${brandName}</p>
    <div class="product-price-modern">
      ${hasDiscount ? `<span class="product-old-price-modern">R$ ${product.oldPrice.toFixed(2).replace(".", ",")}</span>` : ""}
      <span class="product-current-price-modern">R$ ${product.price.toFixed(2).replace(".", ",")}</span>
    </div>
    <div class="category-cta">
      <span class="cta-text">Comprar</span>
      <i class="fas fa-shopping-cart cta-icon"></i>
    </div>
  </div>
  <div class="category-hover-effect"></div>
`

        // Adicionar evento de clique para ir para detalhes do produto
        productCard.addEventListener("click", (e) => {
          // Verificar se não clicou em um botão específico
          if (!e.target.closest(".quick-view-btn") && !e.target.closest(".add-to-wishlist-btn")) {
            window.location.href = `/public/html/product-detail.html?id=${product.id}`
          }
        })

        // Adicionar evento para o CTA de comprar
        const ctaElement = productCard.querySelector(".category-cta")
        if (ctaElement) {
          ctaElement.addEventListener("click", (e) => {
            e.stopPropagation()

            // Simular adição ao carrinho
            ctaElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Adicionando...</span>'

            setTimeout(() => {
              ctaElement.innerHTML = '<i class="fas fa-check"></i> <span>Adicionado!</span>'
              showNotification("Produto adicionado ao carrinho!", "success")

              setTimeout(() => {
                ctaElement.innerHTML =
                  '<span class="cta-text">Comprar</span><i class="fas fa-shopping-cart cta-icon"></i>'
              }, 2000)
            }, 1000)
          })
        }

        productsGrid.appendChild(productCard)
      })

      console.log(`${products.length} produtos em destaque renderizados com sucesso!`)
    } catch (error) {
      console.error("Erro ao renderizar produtos em destaque:", error)
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p class="text-zinc-400">Erro ao carregar produtos. Tente novamente mais tarde.</p>
          <button onclick="renderFeaturedProducts()" class="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
            Tentar Novamente
          </button>
        </div>
      `
    }
  }

  // Função para buscar produtos da API baseado na categoria
  async function fetchProductsByCategory(categoryId, categoryKey) {
    try {
      const apiUrl = `https://localhost:4242/api/Product/get?CategoryIds=${categoryId}`

      console.log(`Buscando produtos para categoria: ${categoryKey} (ID: ${categoryId})`)
      console.log(`URL da API: ${apiUrl}`)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const products = await response.json()
      console.log(`Produtos encontrados para ${categoryKey}:`, products)

      return products
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${categoryKey}:`, error)
      return []
    }
  }

  // Função para inicializar contadores de produtos por categoria (opcional)
  async function initializeCategoryCounters() {
    const categoryCards = document.querySelectorAll(".category-card-modern")

    for (const card of categoryCards) {
      const categoryId = card.getAttribute("data-category-id")
      const categoryKey = card.getAttribute("data-category-key")

      try {
        const products = await fetchProductsByCategory(categoryId, categoryKey)

        // Adicionar contador de produtos (opcional)
        const counterElement = document.createElement("div")
        counterElement.className = "category-product-counter"
        counterElement.textContent = `${products.length} produtos`

        const contentElement = card.querySelector(".category-content-modern")
        if (contentElement) {
          contentElement.appendChild(counterElement)
        }
      } catch (error) {
        console.error(`Erro ao inicializar contador para categoria ${categoryKey}:`, error)
      }
    }
  }

  // Renderizar categorias e produtos (alterar esta linha)
  renderCategories()
  renderFeaturedProducts() // Esta agora é async e busca do backend

  // Remover a linha de inicialização de contadores se existir
  // initializeCategoryCounters();

  // Mobile menu toggle
  const menuBtn = document.querySelector(".mobile-menu-btn")
  const subheaderNav = document.querySelector(".subheader-nav")
  const menuItems = document.querySelectorAll(".menu-item")

  if (menuBtn && subheaderNav) {
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active")
      subheaderNav.classList.toggle("active")
    })

    // Controle de submenus em dispositivos móveis
    menuItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (window.innerWidth <= 767) {
          const submenu = item.querySelector(".submenu")
          if (submenu) {
            e.preventDefault()
            item.classList.toggle("active")
          }
        }
      })
    })

    // Fechar menu ao clicar fora
    document.addEventListener("click", (e) => {
      if (!subheaderNav.contains(e.target) && !menuBtn.contains(e.target)) {
        menuBtn.classList.remove("active")
        subheaderNav.classList.remove("active")
        menuItems.forEach((item) => item.classList.remove("active"))
      }
    })
  }

  // Event delegation para botões de adicionar ao carrinho
  document.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-cart-btn")) {
      e.preventDefault()
      const button = e.target.closest(".add-to-cart-btn")
      const productId = button.getAttribute("data-product-id")

      // Adicionar animação de feedback
      button.classList.add("btn-loading")
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

      // Simular adição ao carrinho
      setTimeout(() => {
        button.classList.remove("btn-loading")
        button.innerHTML = '<i class="fas fa-check"></i>'
        button.classList.add("btn-success")

        // Mostrar notificação
        showNotification("Produto adicionado ao carrinho!", "success")

        // Resetar botão após 2 segundos
        setTimeout(() => {
          button.classList.remove("btn-success")
          button.innerHTML = '<i class="fas fa-shopping-cart"></i>'
        }, 2000)
      }, 1000)
    }
  })

  // Event delegation para botões de visualização rápida
  document.addEventListener("click", (e) => {
    if (e.target.closest(".quick-view-btn")) {
      e.preventDefault()
      const button = e.target.closest(".quick-view-btn")
      const productId = button.getAttribute("data-product-id")

      console.log(`Visualização rápida do produto ID: ${productId}`)
      // Implementar modal de visualização rápida aqui
      showNotification("Visualização rápida em desenvolvimento", "info")
    }
  })

  // Event delegation para botões de favoritos
  document.addEventListener("click", (e) => {
    if (e.target.closest(".add-to-wishlist-btn")) {
      e.preventDefault()
      const button = e.target.closest(".add-to-wishlist-btn")
      const productId = button.getAttribute("data-product-id")

      button.classList.toggle("wishlist-active")
      const icon = button.querySelector("i")

      if (button.classList.contains("wishlist-active")) {
        icon.className = "fas fa-heart"
        showNotification("Produto adicionado aos favoritos!", "success")
      } else {
        icon.className = "far fa-heart"
        showNotification("Produto removido dos favoritos", "info")
      }
    }
  })

  // Newsletter form submission
  const newsletterForm = document.querySelector(".newsletter-form")
  const newsletterInput = document.querySelector(".newsletter-input")

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = newsletterInput.value.trim()

      if (email && isValidEmail(email)) {
        // Simular envio
        const submitBtn = newsletterForm.querySelector("button")
        const originalText = submitBtn.textContent

        submitBtn.textContent = "Enviando..."
        submitBtn.disabled = true

        setTimeout(() => {
          showNotification("Obrigado por se inscrever!", "success")
          newsletterInput.value = ""
          submitBtn.textContent = originalText
          submitBtn.disabled = false
        }, 1500)
      } else {
        showNotification("Por favor, insira um e-mail válido.", "error")
      }
    })
  }

  // Função para validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Função para mostrar notificações
  function showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `

    // Adicionar ao DOM
    document.body.appendChild(notification)

    // Mostrar notificação
    setTimeout(() => notification.classList.add("notification-show"), 100)

    // Auto-remover após 5 segundos
    const autoRemove = setTimeout(() => {
      removeNotification(notification)
    }, 5000)

    // Botão de fechar
    notification.querySelector(".notification-close").addEventListener("click", () => {
      clearTimeout(autoRemove)
      removeNotification(notification)
    })
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  }

  function removeNotification(notification) {
    notification.classList.add("notification-hide")
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }

  // Ajustar posição do subheader
  function adjustSubheaderPosition() {
    const header = document.querySelector(".header")
    const subheader = document.querySelector(".subheader")

    if (header && subheader) {
      const headerHeight = header.offsetHeight
      subheader.style.top = `${headerHeight}px`
    }
  }

  // Inicializar posição do subheader
  adjustSubheaderPosition()

  // Reajustar em redimensionamento
  window.addEventListener("resize", adjustSubheaderPosition)

  // User dropdown functionality
  const userDropdown = document.querySelector(".user-dropdown")
  const userBtn = document.querySelector(".user-icon-btn")

  if (userDropdown && userBtn) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      userDropdown.classList.toggle("active")
    })

    document.addEventListener("click", () => {
      userDropdown.classList.remove("active")
    })
  }

  // Intersection Observer para animações de entrada
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observar elementos para animação
  document.querySelectorAll(".category-card-modern, .product-card").forEach((el) => {
    observer.observe(el)
  })

  console.log("Script inicializado com sucesso!")
  console.log(
    "Categorias configuradas:",
    categories.map((c) => `${c.name} (ID: ${c.enumValue})`),
  )
})

// Estilos para produtos em destaque
const productBrandStyle = document.createElement("style")
productBrandStyle.innerHTML = `
  .product-brand {
    font-size: 0.875rem;
    color: #4a5568; /* Fallback color */
    margin-bottom: 0.5rem;
  }
`
document.head.appendChild(productBrandStyle)

const productDiscountStyle = document.createElement("style")
productDiscountStyle.innerHTML = `
  .product-discount {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    background: #e53e3e; /* Fallback color */
    color: #ffffff; /* Fallback color */
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 5;
  }
`
document.head.appendChild(productDiscountStyle)

const loadingSpinnerStyle = document.createElement("style")
loadingSpinnerStyle.innerHTML = `
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }
`
document.head.appendChild(loadingSpinnerStyle)

const productImageOnErrorStyle = document.createElement("style")
productImageOnErrorStyle.innerHTML = `
  .product-image[onerror] {
    background-color: #1a202c; /* Fallback color */
  }
`
document.head.appendChild(productImageOnErrorStyle)

// Melhorar responsividade dos produtos
const responsiveProductsStyle = document.createElement("style")
responsiveProductsStyle.innerHTML = `
  @media (max-width: 640px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .product-name {
      font-size: 0.875rem;
      line-height: 1.2;
    }
    
    .product-price {
      font-size: 1rem;
    }
  }
`
document.head.appendChild(responsiveProductsStyle)

document.getElementById('btn-ver-destaques').addEventListener('click', function(e) {
    e.preventDefault();
    const section = document.getElementById('produtos-destaques');
    if (section) {
        // Encontre o título dentro da seção
        const title = section.querySelector('.section-title');
        // Altura do header fixo (ajuste conforme seu layout)
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        // Posição do título em relação ao topo da página
        const titleTop = title.getBoundingClientRect().top + window.scrollY;
        // Scroll até o título, descontando o header
        window.scrollTo({
            top: titleTop - headerHeight - 50, // 16px de margem extra, ajuste se quiser
            behavior: 'smooth'
        });
    }
});

document.querySelector('.btn-primary-modern').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/public/html/products.html';
});

// // Carousel functionality
// document.addEventListener('DOMContentLoaded', () => {
//     const carouselSlide = document.querySelector('.carousel-slide');
//     const images = document.querySelectorAll('.carousel-slide img');
//     const totalImages = images.length;
//     let currentIndex = 0;

//     setInterval(() => {
//         currentIndex = (currentIndex + 1) % totalImages;
//         const offset = -currentIndex * 100 / totalImages;
//         carouselSlide.style.transform = `translateX(${offset}%)`;
//     }, 3000); // Change image every 3 seconds (3000ms)
// });
