document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a[data-section]")
  const contentArea = document.getElementById("admin-content-area")
  const adminHeaderTitle = document.querySelector(".admin-header h1")
  const logoutBtn = document.getElementById("admin-logout-btn")

  const API_BASE_URL_ADMIN = "/api"
  //const API_BASE_URL_ADMIN = "https://localhost:4242/api"

  let currentProduct = null
  let currentOrders = [] // Store orders for tracking management

  // Utility function to format dates
  function formatDate(dateString) {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } catch {
      return "N/A"
    }
  }

  // --- Autenticação e Proteção ---
  function checkAdminAccess() {
    if (!window.authService) {
      console.warn("AuthService not found, retrying...")
      setTimeout(checkAdminAccess, 200)
      return false
    }
    const isAuthenticated = window.authService.isAuthenticated()
    const userRole = window.authService.getUserRole()
    if (!isAuthenticated || userRole !== "Admin") {
      console.error("Access denied! User is not admin or not logged in.")
      window.location.href = "/login.html"
      if (window.authNotifications) {
        window.authNotifications.accessDenied("Acesso restrito a administradores.")
      }
      return false
    }
    console.log("Admin access verified.")
    return true
  }

  // --- Roteamento e Carregamento de Conteúdo ---
  function loadSection(sectionId) {
    console.log(`Loading section: ${sectionId}`)
    if (!contentArea) {
      console.error("Element #admin-content-area not found in DOM.")
      window.showNotification("Erro: Área de conteúdo não encontrada.", "error")
      return
    }
    contentArea.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando ${sectionId || "seção"}...</div>`
    // if (adminHeaderTitle) {
    //     adminHeaderTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    // } else {
    //     console.warn("Element .admin-header h1 not found in DOM.");
    // }

    sidebarLinks.forEach((link) => link.classList.remove("active"))
    const activeLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`)
    if (activeLink) activeLink.classList.add("active")
    else console.warn(`No sidebar link found for section: ${sectionId}`)

    switch (sectionId) {
      case "dashboard":
        loadDashboard()
        break
      case "products":
        loadProducts()
        break
      case "users":
        loadUsers()
        break
      case "orders":
        loadOrders()
        break
      case "payments":
        loadPayments()
        break
      case "tracking":
        loadTracking()
        break
      default:
        contentArea.innerHTML = "<p>Seção não encontrada.</p>"
        if (adminHeaderTitle) adminHeaderTitle.textContent = "Erro"
        window.showNotification("Seção não encontrada.", "error")
    }
  }

  function handleNavigation(event) {
    event.preventDefault()
    const section = event.currentTarget.getAttribute("data-section")
    if (section) {
      console.log(`Navigating to section: ${section}`)
      window.location.hash = section
    }
  }

  // --- Funções de Carregamento de Seção ---
  function loadDashboard() {
    console.log("Rendering dashboard...")
    if (!contentArea) {
      console.error("Cannot render dashboard: admin-content-area not found.")
      window.showNotification("Erro: Não foi possível carregar o dashboard.", "error")
      return
    }
    adminHeaderTitle.textContent = "Dashboard"
    contentArea.innerHTML = `
            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="card-info">
                        <h3>Produtos</h3>
                        <p class="card-value" id="productCount">Carregando...</p>
                    </div>
                    <div class="card-action">
                        <a href="/admin.html#products">Ver detalhes</a>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-info">
                        <h3>Usuários</h3>
                        <p class="card-value" id="userCount">Carregando...</p>
                    </div>
                    <div class="card-action">
                        <a href="/admin.html#users">Ver detalhes</a>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="card-info">
                        <h3>Pedidos</h3>
                        <p class="card-value" id="orderCount">Carregando...</p>
                    </div>
                    <div class="card-action">
                        <a href="/admin.html#orders">Ver detalhes</a>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="card-info">
                        <h3>Rastreios</h3>
                        <p class="card-value" id="trackingCount">Carregando...</p>
                    </div>
                    <div class="card-action">
                        <a href="/admin.html#tracking">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `
    // Fetch dashboard data
    fetchDashboardData()
  }

  async function fetchDashboardData() {
    try {
      const productData = await fetchData(`${API_BASE_URL_ADMIN}/Product/get`)
      const userData = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get`)
      const orderData = await fetchData(`${API_BASE_URL_ADMIN}/Order/get`)
      const trackingData = await fetchData(`${API_BASE_URL_ADMIN}/Tracking`)

      if (productData && productData.hasSuccess && productData.value && productData.value.products) {
        document.getElementById("productCount").textContent = productData.count || 0
      } else {
        document.getElementById("productCount").textContent = "Erro"
      }

      if (userData && userData.hasSuccess && userData.value && userData.value.users) {
        document.getElementById("userCount").textContent = userData.count || 0
      } else {
        document.getElementById("userCount").textContent = "Erro"
      }

      if (orderData && orderData.hasSuccess && orderData.value && orderData.value.orders) {
        document.getElementById("orderCount").textContent = orderData.count || 0
      } else {
        document.getElementById("orderCount").textContent = "Erro"
      }

      if (trackingData && trackingData.hasSuccess && trackingData.value) {
        document.getElementById("trackingCount").textContent = trackingData.count || 0
      } else {
        document.getElementById("trackingCount").textContent = "Erro"
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      window.showNotification("Erro ao carregar dados do dashboard.", "error")
      document.getElementById("productCount").textContent = "Erro"
      document.getElementById("userCount").textContent = "Erro"
      document.getElementById("orderCount").textContent = "Erro"
      document.getElementById("trackingCount").textContent = "Erro"
    }
  }

  async function loadProducts() {
    contentArea.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2>Gerenciar Produtos</h2>
                    <button id="add-product-btn" class="btn btn-primary"><i class="fas fa-plus"></i> Adicionar Produto</button>
                </div>
                <div id="product-list-container" class="table-responsive">
                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando produtos...</div>
                </div>
                <div id="product-form-container" style="display: none;"></div>
            </div>
        `
    document.getElementById("add-product-btn").addEventListener("click", () => showProductForm())
    await fetchAndDisplayProducts()
  }

  async function loadUsers() {
    contentArea.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2>Gerenciar Usuários</h2>
                </div>
                <div id="user-list-container" class="table-responsive">
                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando usuários...</div>
                </div>
                <div id="user-form-container" style="display: none;"></div>
            </div>
        `
    await fetchAndDisplayUsers()
  }

  async function loadOrders() {
    contentArea.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2>Gerenciar Pedidos</h2>
                </div>
                <div id="order-list-container" class="table-responsive">
                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando pedidos...</div>
                </div>
                <div id="order-details-container" style="display: none;"></div>
            </div>
        `
    await fetchAndDisplayOrders()
  }

  async function loadTracking() {
    adminHeaderTitle.textContent = "Rastreamentos"
    contentArea.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2>Gerenciar Rastreamentos</h2>
                    <div class="header-actions">
                        <button id="view-orders-btn" class="btn btn-primary">
                            <i class="fas fa-list"></i> Ver Pedidos
                        </button>
                        <button id="view-trackings-btn" class="btn btn-secondary">
                            <i class="fas fa-truck"></i> Ver Rastreamentos
                        </button>
                    </div>
                </div>
                
                <!-- Orders Section -->
                <div id="orders-section" class="tracking-section">
                    <div class="section-header">
                        <h3><i class="fas fa-shopping-cart"></i> Pedidos Disponíveis</h3>
                    </div>
                    <div id="orders-for-tracking-container" class="table-responsive">
                        <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando pedidos...</div>
                    </div>
                </div>

                <!-- Trackings Section -->
                <div id="trackings-section" class="tracking-section" style="display: none;">
                    <div class="section-header">
                        <h3><i class="fas fa-truck"></i> Rastreamentos Ativos</h3>
                    </div>
                    <div id="tracking-list-container" class="table-responsive">
                        <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando rastreamentos...</div>
                    </div>
                </div>

                <!-- Form Container -->
                <div id="tracking-form-container" style="display: none;"></div>
            </div>
        `

    // Event listeners for section switching
    document.getElementById("view-orders-btn").addEventListener("click", () => {
      document.getElementById("orders-section").style.display = "block"
      document.getElementById("trackings-section").style.display = "none"
      document.getElementById("view-orders-btn").classList.add("btn-primary")
      document.getElementById("view-orders-btn").classList.remove("btn-secondary")
      document.getElementById("view-trackings-btn").classList.add("btn-secondary")
      document.getElementById("view-trackings-btn").classList.remove("btn-primary")
    })

    document.getElementById("view-trackings-btn").addEventListener("click", () => {
      document.getElementById("orders-section").style.display = "none"
      document.getElementById("trackings-section").style.display = "block"
      document.getElementById("view-trackings-btn").classList.add("btn-primary")
      document.getElementById("view-trackings-btn").classList.remove("btn-secondary")
      document.getElementById("view-orders-btn").classList.add("btn-secondary")
      document.getElementById("view-orders-btn").classList.remove("btn-primary")
      fetchAndDisplayTracking()
    })

    await fetchAndDisplayOrdersForTracking()
  }

  function loadPayments() {
    contentArea.innerHTML = `
            <div class="admin-card">
                <h2>Gerenciar Pagamentos</h2>
                <p>Funcionalidade de pagamentos ainda não implementada.</p>
            </div>
        `
  }

  // --- Funções Auxiliares Comuns ---
  function getAuthHeaders() {
    const token = window.authService.getToken()
    if (!token) {
      console.error("Token não encontrado!")
      return null
    }
    return { Authorization: `Bearer ${token}` }
  }

  function getAuthAndJsonHeaders() {
    const headers = getAuthHeaders()
    if (!headers) return null
    return { ...headers, "Content-Type": "application/json" }
  }

  async function fetchData(url, options = {}, containerElement) {
    const headers = getAuthHeaders()
    if (!headers) return null

    try {
      const response = await fetch(url, { headers: { ...headers, ...options.headers }, ...options })
      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.errors ? errorJson.errors.join(", ") : `Erro ${response.status}`)
        } catch {
          throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
        }
      }
      return await response.json()
    } catch (error) {
      console.error(`Erro ao buscar dados de ${url}:`, error)
      if (containerElement) {
        containerElement.innerHTML = `<p class="error">Erro ao carregar dados: ${error.message}</p>`
      }
      window.showNotification(`Erro ao carregar dados: ${error.message}`, "error")
      return null
    }
  }

  // --- CRUD Produtos ---
  async function fetchAndDisplayProducts() {
    const container = document.getElementById("product-list-container")
    // Buscar todos os produtos sem paginação
    const result = await fetchData(`${API_BASE_URL_ADMIN}/Product/get?PageSize=1000&Page=1`, {}, container)
    if (result && result.hasSuccess && result.value && result.value.products) {
      renderProductTable(result.value.products)
    } else if (result && result.errors) {
      container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`
    } else if (!result) {
      // Erro já tratado em fetchData
    } else {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>"
    }
  }

  function renderProductTable(products) {
    const container = document.getElementById("product-list-container")
    const itemsPerPage = 10
    let currentPage = 1
    
    function renderPage(page) {
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = products.slice(startIndex, endIndex)
      
      let tableHTML = `
        <div class="table-container">
          <div class="table-header">
            <h4>Total de produtos: ${products.length}</h4>
          </div>
          <table class="admin-table">
            <thead><tr><th>Nome</th><th>Preço</th><th>Estoque</th><th>Ativo</th><th>Ações</th></tr></thead>
            <tbody>`
      
      if (paginatedProducts.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="5" class="text-center">Nenhum produto encontrado nesta página.</td>
          </tr>`
      } else {
        paginatedProducts.forEach((p) => {
          tableHTML += `
            <tr>
              <td>${p.name}</td>
              <td>R$ ${p.price.toFixed(2).replace(".", ",")}</td>
              <td>${p.stockQuantity}</td>
              <td><span class="status ${p.isActive ? "active" : "inactive"}">${p.isActive ? "Sim" : "Não"}</span></td>
              <td>
                <button class="btn btn-sm btn-edit" data-id="${p.id}"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn btn-sm btn-delete-btn" data-id="${p.id}"><i class="fas fa-trash"></i> Excluir</button>
              </td>
            </tr>`
        })
      }
      
      tableHTML += `</tbody></table></div>`
      
      // Adicionar controles de paginação
      const totalPages = Math.ceil(products.length / itemsPerPage)
      if (totalPages > 1) {
        tableHTML += generatePaginationControls(page, totalPages, startIndex, endIndex, products.length)
      }
      
      container.innerHTML = tableHTML
      
      // Event listeners para paginação
      addPaginationEventListeners(container, (newPage) => {
        currentPage = newPage
        renderPage(currentPage)
      })
      
      // Re-enable event listeners for edit and delete buttons
      container.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.removeEventListener("click", handleEditProduct)
        btn.addEventListener("click", handleEditProduct)
      })
      container.querySelectorAll(".btn-delete-btn").forEach((btn) => {
        btn.removeEventListener("click", handleDeleteProduct)
        btn.addEventListener("click", handleDeleteProduct)
      })
    }
    
    renderPage(currentPage)
  }

  function showProductForm(product = null) {
    const formContainer = document.getElementById("product-form-container")
    const listContainer = document.getElementById("product-list-container")
    const addBtn = document.getElementById("add-product-btn")
    const isEditing = product !== null

    // Store the product for use in handleSaveProduct
    currentProduct = product ? { ...product } : null

    // Extract attributes if editing
    const attributes =
      isEditing && product && product.attributes && product.attributes.length > 0 ? product.attributes[0] : {}

    formContainer.innerHTML = `
        <div class="admin-form">
            <div class="form-header">
                <h3>${isEditing ? "Editar Produto" : "Adicionar Novo Produto"}</h3>
                <button type="button" id="cancel-product-form" class="btn btn-sm btn-secondary">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
            <form id="product-form" enctype="multipart/form-data">
                <input type="hidden" id="productId" value="${isEditing ? product.id : ""}">
                <input type="hidden" id="inventoryId" name="InventoryId" value="${isEditing ? product.inventoryId || "" : ""}">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="productName">Nome:</label>
                        <input type="text" id="productName" name="Name" required value="${isEditing ? product.name : ""}" class="form-control">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="productPrice">Preço (R$):</label>
                        <input type="number" id="productPrice" name="Price" step="0.01" required value="${isEditing ? product.price : ""}" class="form-control">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="productStock">Estoque:</label>
                        <input type="number" id="productStock" name="StockQuantity" required value="${isEditing ? product.stockQuantity : ""}" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label for="productDescription">Descrição:</label>
                    <textarea id="productDescription" name="Description" required class="form-control">${isEditing ? product.description : ""}</textarea>
                </div>
                <div class="form-group">
                    <label for="productBenefit">Benefícios:</label>
                    <textarea id="productBenefit" name="Benefit" required class="form-control">${isEditing ? product.benefit : ""}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-4">
                        <label for="productFlavor">Sabor:</label>
                        <select id="productFlavor" name="Attributes[0].Flavor" class="form-control" required>
                            <option value="">Selecione</option>
                            <option value="Chocolate" ${attributes.flavor === "Chocolate" ? "selected" : ""}>Chocolate</option>
                            <option value="Baunilha" ${attributes.flavor === "Baunilha" ? "selected" : ""}>Baunilha</option>
                            <option value="Morango" ${attributes.flavor === "Morango" ? "selected" : ""}>Morango</option>
                            <option value="SemSabor" ${attributes.flavor === "SemSabor" ? "selected" : ""}>Sem Sabor</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label for="productBrand">Marca:</label>
                        <select id="productBrand" name="Attributes[0].Brand" class="form-control" required>
                            <option value="">Selecione</option>
                            <option value="MaxTitanium" ${attributes.brand === "MaxTitanium" ? "selected" : ""}>Max Titanium</option>
                            <option value="Growth" ${attributes.brand === "Growth" ? "selected" : ""}>Growth</option>
                            <option value="IntegralMedica" ${attributes.brand === "IntegralMedica" ? "selected" : ""}>Integral Medica</option>
                            <option value="Probiotica" ${attributes.brand === "Probiotica" ? "selected" : ""}>Probiótica</option>
                            <option value="BlackSkull" ${attributes.brand === "BlackSkull" ? "selected" : ""}>Black Skull</option>
                            <option value="Ftw" ${attributes.brand === "Ftw" ? "selected" : ""}>Ftw</option>
                        </select>
                    </div>
                    <div class="form-group col-md-4">
                        <label for="productAccessory">Acessório:</label>
                        <select id="productAccessory" name="Attributes[0].Accessory" class="form-control" required>
                            <option value="">Selecione</option>
                            <option value="Camisetas" ${attributes.accessory === "Camisetas" ? "selected" : ""}>Camisetas</option>
                            <option value="Coqueteleira" ${attributes.accessory === "Garrafas" ? "selected" : ""}>Garrafas</option>
                            <option value="Squeeze" ${attributes.accessory === "Shakeiras" ? "selected" : ""}>Shakeiras</option>
                            <option value="Nenhum" ${attributes.accessory === "Nenhum" ? "selected" : ""}>Nenhum</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="productCategory">Categoria:</label>
                        <select id="productCategory" name="Attributes[0].Category" class="form-control" required>
                            <option value="">Selecione</option>
                            <option value="WheyProtein" ${attributes.category === "WheyProtein" ? "selected" : ""}>Whey Protein</option>
                            <option value="Hipercalorico" ${attributes.category === "Hipercalorico" ? "selected" : ""}>Hipercalórico</option>
                            <option value="Creatina" ${attributes.category === "Creatina" ? "selected" : ""}>Creatina</option>
                            <option value="Vitaminas" ${attributes.category === "Vitaminas" ? "selected" : ""}>Vitaminas</option>
                            <option value="PreTreino" ${attributes.category === "PreTreino" ? "selected" : ""}>Pré Treino</option>
                            <option value="Glutamina" ${attributes.category === "Glutamina" ? "selected" : ""}>Glutamina</option>
                        </select>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="productObjective">Objetivo:</label>
                        <select id="productObjective" name="Attributes[0].Objective" class="form-control" required>
                            <option value="">Selecione</option>
                            <option value="Emagrecimento" ${attributes.objective === "Emagrecimento" ? "selected" : ""}>Emagrecimento</option>
                            <option value="AumentoDeMassaMuscular" ${attributes.objective === "AumentoDeMassaMuscular" ? "selected" : ""}>Ganho de Massa</option>
                            <option value="Hipertrofia" ${attributes.objective === "Hipertrofia" ? "selected" : ""}>Energia</option>
                            <option value="Ganho de Peso" ${attributes.objective === "GanhoDePeso" ? "selected" : ""}>Ganho de Peso</option>
                            <option value="MelhoraDeImunidade" ${attributes.objective === "MelhoraDeImunidade" ? "selected" : ""}>Melhora De Imunidade</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="productImage">Imagem:</label>
                        <input type="file" id="productImage" name="ImageUrl" accept="image/*" class="form-control">
                        ${isEditing && product.imageUrl ? `<div class="current-img-container"><img src="${product.imageUrl}" alt="Imagem atual" width="50" class="current-img"></div>` : ""}
                    </div>
                    <div class="form-group col-md-4">
                        <label for="nutritionalInfo">Informação Nutricional:</label>
                        <input type="file" id="nutritionalInfo" name="NutritionalInfo" accept="image/*" class="form-control">
                        ${isEditing && product.nutritionalInfo ? `<div class="current-img-container"><img src="${product?.nutritionalInfo}" alt="Tabela Nutricional" width="50" class="current-img"></div>` : ""}
                    </div>
                    <div class="form-group col-md-6 form-check-group">
                        <div class="form-check">
                            <input type="checkbox" id="productIsActive" name="IsActive" class="form-check-input" ${isEditing ? (product.isActive ? "checked" : "") : "checked"}>
                            <label for="productIsActive" class="form-check-label">Produto Ativo</label>
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> ${isEditing ? "Salvar Alterações" : "Adicionar Produto"}
                    </button>
                    <button type="button" id="cancel-product-form-secondary" class="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `
    formContainer.style.display = "block"
    listContainer.style.display = "none"
    addBtn.style.display = "none"

    document.getElementById("product-form").addEventListener("submit", handleSaveProduct)
    document.getElementById("cancel-product-form").addEventListener("click", hideProductForm)
    document.getElementById("cancel-product-form-secondary").addEventListener("click", hideProductForm)
  }

  function hideProductForm() {
    document.getElementById("product-form-container").style.display = "none"
    document.getElementById("product-list-container").style.display = "block"
    document.getElementById("add-product-btn").style.display = "block"
    // Clear currentProduct when hiding the form
    currentProduct = null
  }

  async function handleSaveProduct(event) {
    event.preventDefault()
    const form = event.target
    const productId = document.getElementById("productId").value
    const isEditing = !!productId
    const headers = getAuthHeaders()
    if (!headers) return

    const formData = new FormData(form)

    // Ensure IsActive is correctly appended as a boolean
    formData.set("IsActive", document.getElementById("productIsActive").checked.toString())

    // Append Attributes[0].Id if editing
    if (isEditing && currentProduct && currentProduct.attributes && currentProduct.attributes.length > 0) {
      formData.append("Attributes[0].Id", currentProduct.attributes[0].id)
    }

    const url = isEditing ? `${API_BASE_URL_ADMIN}/Product/update/${productId}` : `${API_BASE_URL_ADMIN}/Product/create`
    const method = isEditing ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }
      const result = await response.json()

      if (result.hasSuccess) {
        window.showNotification(`${isEditing ? "Produto atualizado" : "Produto adicionado"} com sucesso!`, "success")
        hideProductForm()
        await fetchAndDisplayProducts()
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar produto.")
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      window.showNotification(`Erro ao salvar produto: ${error.message}`, "error")
    }
  }

  async function handleEditProduct(event) {
    event.preventDefault()
    const productId = event.currentTarget.getAttribute("data-id")
    if (!productId) {
      console.error("Product ID não encontrado no botão de edição.")
      window.showNotification("Erro: ID do produto não encontrado.", "error")
      return
    }

    const container = document.getElementById("product-form-container")
    container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do produto...</div>`
    container.style.display = "block"
    document.getElementById("product-list-container").style.display = "none"
    document.getElementById("add-product-btn").style.display = "none"

    const result = await fetchData(`${API_BASE_URL_ADMIN}/Product/get/${productId}`, {}, container)
    if (result && result.hasSuccess && result.value) {
      showProductForm(result.value)
    } else {
      hideProductForm()
      window.showNotification("Erro ao carregar dados do produto.", "error")
    }
  }

  async function handleDeleteProduct(event) {
    const productId = event.currentTarget.getAttribute("data-id")
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    const headers = getAuthHeaders()
    if (!headers) return

    try {
      const response = await fetch(`${API_BASE_URL_ADMIN}/Product/delete/${productId}`, {
        method: "DELETE",
        headers: headers,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }
      const result = await response.json()
      if (result.hasSuccess) {
        window.showNotification("Produto excluído com sucesso!", "success")
        await fetchAndDisplayProducts()
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir produto.")
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      window.showNotification(`Erro ao excluir produto: ${error.message}`, "error")
    }
  }

  // --- CRUD Usuários ---
  async function fetchAndDisplayUsers() {
    const container = document.getElementById("user-list-container")
    // Buscar todos os usuários sem paginação
    const result = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get?PageSize=1000&Page=1`, {}, container)
    if (result && result.hasSuccess && result.value && result.value.users) {
      renderUserTable(result.value.users)
    } else if (result && result.errors) {
      container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`
    } else if (!result) {
      // Erro já tratado
    } else {
      container.innerHTML = "<p>Nenhum usuário encontrado.</p>"
    }
  }

  function renderUserTable(users) {
    const container = document.getElementById("user-list-container")
    const itemsPerPage = 10
    let currentPage = 1
    
    function renderPage(page) {
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedUsers = users.slice(startIndex, endIndex)
      
      let tableHTML = `
        <div class="table-container">
          <div class="table-header">
            <h4>Total de usuários: ${users.length}</h4>
          </div>
          <table class="admin-table">
            <thead><tr><th>Nome</th><th>Email</th></tr></thead>
            <tbody>`
      
      if (paginatedUsers.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="2" class="text-center">Nenhum usuário encontrado nesta página.</td>
          </tr>`
      } else {
        paginatedUsers.forEach((user) => {
          tableHTML += `
            <tr>
              <td>${user.userName}</td>
              <td>${user.email}</td>                  
            </tr>`
        })
      }
      
      tableHTML += `</tbody></table></div>`
      
      // Adicionar controles de paginação
      const totalPages = Math.ceil(users.length / itemsPerPage)
      if (totalPages > 1) {
        tableHTML += generatePaginationControls(page, totalPages, startIndex, endIndex, users.length)
      }
      
      container.innerHTML = tableHTML
      
      // Event listeners para paginação
      addPaginationEventListeners(container, (newPage) => {
        currentPage = newPage
        renderPage(currentPage)
      })
      
      container.querySelectorAll(".btn-edit").forEach((btn) => btn.addEventListener("click", handleEditUser))
      container.querySelectorAll(".btn-delete").forEach((btn) => btn.addEventListener("click", handleDeleteUser))
    }
    
    renderPage(currentPage)
  }

  function showUserForm(user = null) {
    const formContainer = document.getElementById("user-form-container")
    const listContainer = document.getElementById("user-list-container")
    const isEditing = user !== null

    formContainer.innerHTML = `
            <div class="form-header">
                <h3>${isEditing ? "Editar Usuário" : "Adicionar Novo Usuário"}</h3>
                <button type="button" id="cancel-user-form" class="btn btn-sm btn-secondary"><i class="fas fa-times"></i></button>
            </div>
            <form id="user-form">
                <input type="hidden" id="userId" value="${isEditing ? user.id : ""}">
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="userName">Nome:</label>
                        <input type="text" id="userName" name="Name" required value="${isEditing ? user.name : ""}">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="userEmail">Email:</label>
                        <input type="email" id="userEmail" name="Email" required value="${isEditing ? user.email : ""}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="userRole">Role:</label>
                        <select id="userRole" name="Role" required>
                            <option value="User" ${isEditing && user.role === "User" ? "selected" : ""}>User</option>
                            <option value="Admin" ${isEditing && user.role === "Admin" ? "selected" : ""}>Admin</option>
                        </select>
                    </div>
                    <div class="form-group col-md-6 form-check-group">
                        <input type="checkbox" id="userIsActive" name="IsActive" ${isEditing ? (user.isActive ? "checked" : "") : "checked"}>
                        <label for="userIsActive">Usuário Ativo</label>
                    </div>
                </div>
                ${
                  !isEditing
                    ? `
                <div class="form-group">
                    <label for="userPassword">Senha:</label>
                    <input type="password" id="userPassword" name="Password" required>
                </div>`
                    : `<!-- Senha não editável aqui -->`
                }
                <div class="form-actions">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> ${isEditing ? "Salvar Alterações" : "Adicionar Usuário"}</button>
                </div>
            </form>
        `
    formContainer.style.display = "block"
    listContainer.style.display = "none"

    document.getElementById("user-form").addEventListener("submit", handleSaveUser)
    document.getElementById("cancel-user-form").addEventListener("click", hideUserForm)
  }

  function hideUserForm() {
    document.getElementById("user-form-container").style.display = "none"
    document.getElementById("user-list-container").style.display = "block"
  }

  async function handleSaveUser(event) {
    event.preventDefault()
    const form = event.target
    const userId = document.getElementById("userId").value
    const isEditing = !!userId
    const headers = getAuthAndJsonHeaders()
    if (!headers) return

    const data = {
      Name: form.userName.value,
      Email: form.userEmail.value,
      Role: form.userRole.value,
      IsActive: form.userIsActive.checked,
    }

    let url
    let method

    if (isEditing) {
      method = "PUT"
      url = `${API_BASE_URL_ADMIN}/Auth/update`
      data.Id = userId
    } else {
      method = "POST"
      url = `${API_BASE_URL_ADMIN}/Auth/create`
      data.Password = form.userPassword.value
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }
      const result = await response.json()
      if (result.hasSuccess) {
        window.showNotification(`${isEditing ? "Usuário atualizado" : "Usuário adicionado"} com sucesso!`, "success")
        hideUserForm()
        await fetchAndDisplayUsers()
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar usuário.")
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      window.showNotification(`Erro ao salvar usuário: ${error.message}`, "error")
    }
  }

  async function handleEditUser(event) {
    const userId = event.currentTarget.getAttribute("data-id")
    const container = document.getElementById("user-form-container")
    container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do usuário...</div>`
    container.style.display = "block"
    document.getElementById("user-list-container").style.display = "none"

    const result = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get/${userId}`, {}, container)
    if (result && result.hasSuccess && result.value) {
      showUserForm(result.value.user)
    } else {
      hideUserForm()
    }
  }

  async function handleDeleteUser(event) {
    const userId = event.currentTarget.getAttribute("data-id")
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    const headers = getAuthHeaders()
    if (!headers) return

    try {
      const response = await fetch(`${API_BASE_URL_ADMIN}/Auth/delete/${userId}`, {
        method: "DELETE",
        headers: headers,
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }
      const result = await response.json()
      if (result.hasSuccess) {
        window.showNotification("Usuário excluído com sucesso!", "success")
        await fetchAndDisplayUsers()
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir usuário.")
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      window.showNotification(`Erro ao excluir usuário: ${error.message}`, "error")
    }
  }

  // --- CRUD Pedidos ---
  async function fetchAndDisplayOrders() {
    const container = document.getElementById("order-list-container")
    
    // Definir um PageSize alto para buscar todos os registros
    const result = await fetchData(`${API_BASE_URL_ADMIN}/Order/get?PageSize=1000&Page=1`, {}, container)
    
    if (result && result.hasSuccess && result.value && result.value.orders) {
      renderOrderTable(result.value.orders)
    } else if (result && result.errors) {
      container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`
    } else if (!result) {
      // Erro já tratado
    } else {
      container.innerHTML = "<p>Nenhum pedido encontrado.</p>"
    }
  }

  function renderOrderTable(orders) {
    const container = document.getElementById("order-list-container")
    const itemsPerPage = 10
    let currentPage = 1
    
    function renderPage(page) {
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedOrders = orders.slice(startIndex, endIndex)
      
      let tableHTML = `
        <div class="table-container">
          <div class="table-header">
            <h4>Total de pedidos: ${orders.length}</h4>
          </div>
          <table class="admin-table">
            <thead><tr><th>Nº Pedido</th><th>Usuário</th><th>Data</th><th>Total</th><th>Status</th><th>Pagamento</th><th>Ativo</th></tr></thead>
            <tbody>`
      
      if (paginatedOrders.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="6" class="text-center">Nenhum pedido encontrado nesta página.</td>
          </tr>`
      } else {
        paginatedOrders.forEach((order) => {
          const userIdentifier = order.user ? order.userName : order.userName || "Desconhecido"
          tableHTML += `
            <tr data-order-id="${order.id}">
              <td>${order.orderNumber}</td>
              <td>${userIdentifier}</td>
              <td>${formatDate(order.orderDate)}</td>
              <td>R$ ${order.totalAmount.toFixed(2).replace(".", ",")}</td>
              <td><span class="status status-${order.status?.toLowerCase()}">${order.status || "N/A"}</span></td>
              <td><span class="status status-${order.paymentMethod?.toLowerCase()}">${order.paymentMethod || "N/A"}</span></td>
              <td>
                <button class="btn btn-sm btn-toggle-active ${order.isActive ? "btn-success" : "btn-secondary"}" data-id="${order.id}" data-is-active="${order.isActive}">
                  <i class="fas ${order.isActive ? "fa-check" : "fa-times"}"></i>
                </button>
              </td>
            </tr>`
        })
      }
      
      tableHTML += `</tbody></table></div>`
      
      // Adicionar controles de paginação
      const totalPages = Math.ceil(orders.length / itemsPerPage)
      if (totalPages > 1) {
        tableHTML += `
          <div class="pagination-container">
            <div class="pagination-info">
              <span>Página ${page} de ${totalPages}</span>
              <span class="ml-3">Mostrando ${startIndex + 1}-${Math.min(endIndex, orders.length)} de ${orders.length} pedidos</span>
            </div>
            <div class="pagination-controls">`
        
        // Botão Primeira Página
        if (page > 1) {
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="1" title="Primeira página">
            <i class="fas fa-angle-double-left"></i>
          </button>`
        }
        
        // Botão Anterior
        if (page > 1) {
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${page - 1}" title="Página anterior">
            <i class="fas fa-angle-left"></i>
          </button>`
        }
        
        // Botões de página (máximo 7 botões visíveis)
        let startPage = Math.max(1, page - 3)
        let endPage = Math.min(totalPages, startPage + 6)
        
        if (endPage - startPage < 6) {
          startPage = Math.max(1, endPage - 6)
        }
        
        if (startPage > 1) {
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="1">1</button>`
          if (startPage > 2) {
            tableHTML += `<span class="pagination-ellipsis">...</span>`
          }
        }
        
        for (let i = startPage; i <= endPage; i++) {
          if (i === page) {
            tableHTML += `<button class="btn btn-sm btn-primary pagination-btn active" data-page="${i}">${i}</button>`
          } else {
            tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${i}">${i}</button>`
          }
        }
        
        if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
            tableHTML += `<span class="pagination-ellipsis">...</span>`
          }
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${totalPages}">${totalPages}</button>`
        }
        
        // Botão Próximo
        if (page < totalPages) {
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${page + 1}" title="Próxima página">
            <i class="fas fa-angle-right"></i>
          </button>`
        }
        
        // Botão Última Página
        if (page < totalPages) {
          tableHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${totalPages}" title="Última página">
            <i class="fas fa-angle-double-right"></i>
          </button>`
        }
        
        tableHTML += `</div></div>`
      }
      
      container.innerHTML = tableHTML
      
      // Event listeners para os botões de paginação
      container.querySelectorAll(".pagination-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const newPage = parseInt(e.currentTarget.getAttribute("data-page"))
          if (newPage !== currentPage) {
            currentPage = newPage
            renderPage(currentPage)
            // Scroll para o topo da tabela
            container.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      })
      
      // Event listeners para os botões de ação
      container.querySelectorAll(".btn-toggle-active").forEach((btn) => {
        btn.addEventListener("click", handleOrderIsActiveChange)
      })
    }
    
    // Renderizar primeira página
    renderPage(currentPage)
  }

  async function handleOrderIsActiveChange(event) {
    const button = event.currentTarget
    const orderId = button.dataset.id
    const currentIsActive = button.dataset.isActive === "true"
    const newIsActive = !currentIsActive
    const headers = getAuthAndJsonHeaders()

    if (!headers) {
      window.showNotification("Erro de autenticação. Faça login novamente.", "error")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL_ADMIN}/Order/update/${orderId}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ IsActive: newIsActive }),
      })

      if (response.ok) {
        window.showNotification(`Pedido ${newIsActive ? "ativado" : "desativado"} com sucesso!`, "success")
        // Update button state
        button.dataset.isActive = newIsActive
        button.classList.toggle("btn-success", newIsActive)
        button.classList.toggle("btn-secondary", !newIsActive)
        button.innerHTML = `<i class="fas ${newIsActive ? "fa-check" : "fa-times"}"></i>`
      } else {
        const errorResult = await response.json().catch(() => null)
        const errorMessage =
          errorResult && errorResult.errors
            ? errorResult.errors.join(", ")
            : `Falha na requisição: ${response.statusText}`
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Erro ao atualizar o status do pedido:", error)
      window.showNotification(`Erro: ${error.message}`, "error")
    }
  }

  // --- Orders for Tracking Management ---
  async function fetchAndDisplayOrdersForTracking() {
    const container = document.getElementById("orders-for-tracking-container")
    // Buscar todos os pedidos sem paginação
    const result = await fetchData(`${API_BASE_URL_ADMIN}/Order/get?PageSize=1000&Page=1`, {}, container)
    if (result && result.hasSuccess && result.value && result.value.orders) {
      currentOrders = result.value.orders
      renderOrdersForTrackingTable(result.value.orders)
    } else if (result && result.errors) {
      container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`
    } else if (!result) {
      // Erro já tratado
    } else {
      container.innerHTML = "<p>Nenhum pedido encontrado.</p>"
    }
  }

  function renderOrdersForTrackingTable(orders) {
    const container = document.getElementById("orders-for-tracking-container")
    const itemsPerPage = 10
    let currentPage = 1
    
    function renderPage(page) {
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedOrders = orders.slice(startIndex, endIndex)
      
      let tableHTML = `
        <div class="table-container">
          <div class="table-header">
            <h4>Total de pedidos: ${orders.length}</h4>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>`

      if (paginatedOrders.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="6" class="text-center">Nenhum pedido encontrado nesta página.</td>
          </tr>`
      } else {
        paginatedOrders.forEach((order) => {
          const userIdentifier = order.user ? order.user.userName : order.userName || "Desconhecido"
          tableHTML += `
            <tr>
              <td>
                <span class="order-number">#${order.orderNumber}</span>
                <small class="order-id text-muted d-block">${order.id.substring(0, 8)}...</small>
              </td>
              <td>${userIdentifier}</td>
              <td>${formatDate(order.orderDate)}</td>
              <td>R$ ${order.totalAmount.toFixed(2).replace(".", ",")}</td>
              <td><span class="status status-${order.status?.toLowerCase()}">${order.status || "N/A"}</span></td>
              <td>
                <button class="btn btn-sm btn-primary btn-create-tracking" data-order-id="${order.id}" data-order-number="${order.orderNumber}">
                  <i class="fas fa-plus"></i> Criar Rastreamento
                </button>
                <button class="btn btn-sm btn-info btn-view-tracking" data-order-id="${order.id}">
                  <i class="fas fa-eye"></i> Ver Rastreamentos
                </button>
              </td>
            </tr>`
        })
      }
      
      tableHTML += `</tbody></table></div>`

      // Adicionar controles de paginação
      const totalPages = Math.ceil(orders.length / itemsPerPage)
      if (totalPages > 1) {
        tableHTML += generatePaginationControls(page, totalPages, startIndex, endIndex, orders.length)
      }
      
      container.innerHTML = tableHTML

      // Event listeners para paginação
      addPaginationEventListeners(container, (newPage) => {
        currentPage = newPage
        renderPage(currentPage)
      })

      // Add event listeners
      container.querySelectorAll(".btn-create-tracking").forEach((btn) => {
        btn.addEventListener("click", handleCreateTrackingForOrder)
      })
      container.querySelectorAll(".btn-view-tracking").forEach((btn) => {
        btn.addEventListener("click", handleViewTrackingForOrder)
      })
    }
    
    renderPage(currentPage)
  }

  async function handleCreateTrackingForOrder(event) {
    const orderId = event.currentTarget.getAttribute("data-order-id")
    const orderNumber = event.currentTarget.getAttribute("data-order-number")
    showTrackingForm(null, orderId, orderNumber)
  }

  async function handleViewTrackingForOrder(event) {
    const orderId = event.currentTarget.getAttribute("data-order-id")

    // Switch to trackings section and filter by order
    document.getElementById("orders-section").style.display = "none"
    document.getElementById("trackings-section").style.display = "block"
    document.getElementById("view-trackings-btn").classList.add("btn-primary")
    document.getElementById("view-trackings-btn").classList.remove("btn-secondary")
    document.getElementById("view-orders-btn").classList.add("btn-secondary")
    document.getElementById("view-orders-btn").classList.remove("btn-primary")

    await fetchAndDisplayTracking(orderId)
  }

  // --- CRUD Rastreios ---
  async function fetchAndDisplayTracking(filterOrderId = null) {
    const container = document.getElementById("tracking-list-container")
    let url = `${API_BASE_URL_ADMIN}/Tracking?PageSize=1000&Page=1`
    if (filterOrderId) {
      url += `&orderId=${filterOrderId}`
    }

    const result = await fetchData(url, {}, container)
    if (result && result.hasSuccess && result.value && Array.isArray(result.value)) {
      renderTrackingTable(result.value, filterOrderId)
    } else if (result && result.errors) {
      container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`
    } else if (!result) {
      // Erro já tratado
    } else {
      container.innerHTML = "<p>Nenhum evento de rastreio encontrado.</p>"
    }
  }

  function renderTrackingTable(trackings, filterOrderId = null) {
    const container = document.getElementById("tracking-list-container")
    const itemsPerPage = 10
    let currentPage = 1

    const headerHTML = `
      <div class="tracking-header">
        ${filterOrderId ? `
          <div class="filter-info">
            <i class="fas fa-filter"></i> 
            Mostrando rastreamentos para o pedido: <strong>${filterOrderId.substring(0, 8)}...</strong>
            <button class="btn btn-sm btn-secondary ml-2" onclick="fetchAndDisplayTracking()">
              <i class="fas fa-times"></i> Limpar Filtro
            </button>
          </div>
        ` : ""}
      </div>
    `

    function renderPage(page) {
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedTrackings = trackings.slice(startIndex, endIndex)
      
      let tableHTML = `
        <div class="table-container">
          <div class="table-header">
            <h4>Total de rastreamentos: ${trackings.length}</h4>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Código Rastreamento</th>
                <th>Status</th>
                <th>Localização</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>`

      if (paginatedTrackings.length === 0) {
        tableHTML += `
          <tr>
            <td colspan="6" class="text-center">
              <div class="empty-state">
                <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                <p>Nenhum rastreamento encontrado</p>
                ${filterOrderId ? `
                  <button class="btn btn-primary btn-create-tracking" data-order-id="${filterOrderId}">
                    <i class="fas fa-plus"></i> Criar Primeiro Rastreamento
                  </button>
                ` : ""}
              </div>
            </td>
          </tr>
        `
      } else {
        paginatedTrackings.forEach((t) => {
          const orderInfo = currentOrders.find((o) => o.id === t.orderId)
          const orderDisplay = orderInfo ? `#${orderInfo.orderNumber}` : t.orderId.substring(0, 8) + "..."

          tableHTML += `
            <tr>
              <td>
                <span class="order-number">${orderDisplay}</span>
                <small class="order-id text-muted d-block">${t.orderId.substring(0, 8)}...</small>
              </td>
              <td>
                <span class="tracking-number">${t.trackingNumber || "N/A"}</span>
              </td>
              <td><span class="status status-${t.status?.toLowerCase()}">${t.status}</span></td>
              <td>${t.location || "-"}</td>
              <td>${formatDate(t.eventDate)}</td>
              <td>
                <button class="btn btn-sm btn-edit btn-edit-tracking" data-id="${t.id}">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-delete btn-delete-tracking" data-id="${t.id}">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>`
        })
      }

      tableHTML += `</tbody></table></div>`

      // Adicionar controles de paginação
      const totalPages = Math.ceil(trackings.length / itemsPerPage)
      if (totalPages > 1) {
        tableHTML += generatePaginationControls(page, totalPages, startIndex, endIndex, trackings.length)
      }
      
      const fullHTML = headerHTML + tableHTML
      container.innerHTML = fullHTML

      // Event listeners para paginação
      addPaginationEventListeners(container, (newPage) => {
        currentPage = newPage
        renderPage(currentPage)
      })

      // Add event listeners
      container.querySelectorAll(".btn-edit-tracking").forEach((btn) => {
        btn.addEventListener("click", handleEditTracking)
      })
      container.querySelectorAll(".btn-delete-tracking").forEach((btn) => {
        btn.addEventListener("click", handleDeleteTracking)
      })
      container.querySelectorAll(".btn-create-tracking").forEach((btn) => {
        btn.addEventListener("click", handleCreateTrackingForOrder)
      })
    }
    
    renderPage(currentPage)
  }

  function showTrackingForm(tracking = null, orderId = null, orderNumber = null) {
    const formContainer = document.getElementById("tracking-form-container")
    const ordersSection = document.getElementById("orders-section")
    const trackingsSection = document.getElementById("trackings-section")
    const isEditing = tracking !== null

    // Get order info for display
    let orderInfo = ""
    if (orderId) {
      const order = currentOrders.find((o) => o.id === orderId)
      orderInfo = order
        ? `Pedido #${order.orderNumber} (${order.id.substring(0, 8)}...)`
        : `Pedido ${orderId.substring(0, 8)}...`
    } else if (isEditing && tracking.orderId) {
      const order = currentOrders.find((o) => o.id === tracking.orderId)
      orderInfo = order
        ? `Pedido #${order.orderNumber} (${order.id.substring(0, 8)}...)`
        : `Pedido ${tracking.orderId.substring(0, 8)}...`
    }

    formContainer.innerHTML = `
            <div class="admin-form">
                <div class="form-header">
                    <h3>
                        <i class="fas fa-truck"></i>
                        ${isEditing ? "Editar Rastreamento" : "Criar Novo Rastreamento"}
                    </h3>
                    <button type="button" id="cancel-tracking-form" class="btn btn-sm btn-secondary">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
                
                ${
                  orderInfo
                    ? `
                    <div class="order-info-banner">
                        <i class="fas fa-info-circle"></i>
                        <span>${orderInfo}</span>
                    </div>
                `
                    : ""
                }

                <form id="tracking-form">
                    <input type="hidden" id="trackingId" value="${isEditing ? tracking.id : ""}">
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="trackingOrderId">ID do Pedido:</label>
                            <input type="text" id="trackingOrderId" name="OrderId" required 
                                   value="${isEditing ? tracking.orderId : orderId || ""}" 
                                   ${isEditing || orderId ? "readonly" : ""} 
                                   class="form-control">
                            <small class="form-text text-muted">
                                ${orderId ? "Pedido selecionado automaticamente" : "Cole o ID completo do pedido"}
                            </small>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="trackingNumber">Código de Rastreamento:</label>
                            <input type="text" id="trackingNumber" name="TrackingNumber" required 
                                   value="${isEditing ? tracking.trackingNumber || "" : ""}" 
                                   class="form-control" placeholder="Ex: BR123456789BR">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="trackingStatus">Status:</label>
                            <select id="trackingStatus" name="Status" required class="form-control">
                                <option value="">Selecione o status</option>
                                <option value="Pedido Criado" ${isEditing && tracking.status === "Pedido Criado" ? "selected" : ""}>Pedido Criado</option>
                                <option value="Preparando" ${isEditing && tracking.status === "Preparando" ? "selected" : ""}>Preparando</option>
                                <option value="Enviado" ${isEditing && tracking.status === "Enviado" ? "selected" : ""}>Enviado</option>
                                <option value="Em Trânsito" ${isEditing && tracking.status === "Em Trânsito" ? "selected" : ""}>Em Trânsito</option>
                                <option value="Saiu para Entrega" ${isEditing && tracking.status === "Saiu para Entrega" ? "selected" : ""}>Saiu para Entrega</option>
                                <option value="Entregue" ${isEditing && tracking.status === "Entregue" ? "selected" : ""}>Entregue</option>
                                <option value="Tentativa de Entrega" ${isEditing && tracking.status === "Tentativa de Entrega" ? "selected" : ""}>Tentativa de Entrega</option>
                                <option value="Devolvido" ${isEditing && tracking.status === "Devolvido" ? "selected" : ""}>Devolvido</option>
                            </select>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="trackingLocation">Localização:</label>
                            <input type="text" id="trackingLocation" name="Location" 
                                   value="${isEditing ? tracking.location || "" : ""}" 
                                   class="form-control" placeholder="Ex: São Paulo - SP">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="trackingEventDate">Data:</label>
                            <input type="datetime-local" id="trackingEventDate" name="EventDate" required 
                                   value="${isEditing && tracking.eventDate ? new Date(tracking.eventDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}" 
                                   class="form-control">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="trackingDescription">Descrição:</label>
                        <textarea id="trackingDescription" name="Description" rows="3" 
                                  class="form-control" placeholder="Descreva detalhes sobre este evento de rastreamento...">${isEditing ? tracking.description || "" : ""}</textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> ${isEditing ? "Salvar Alterações" : "Criar Rastreamento"}
                        </button>
                        <button type="button" id="cancel-tracking-form-secondary" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `

    formContainer.style.display = "block"
    ordersSection.style.display = "none"
    trackingsSection.style.display = "none"

    document.getElementById("tracking-form").addEventListener("submit", handleSaveTracking)
    document.getElementById("cancel-tracking-form").addEventListener("click", hideTrackingForm)
    document.getElementById("cancel-tracking-form-secondary").addEventListener("click", hideTrackingForm)
  }

  function hideTrackingForm() {
    document.getElementById("tracking-form-container").style.display = "none"
    document.getElementById("orders-section").style.display = "block"
    document.getElementById("trackings-section").style.display = "none"

    // Reset button states
    document.getElementById("view-orders-btn").classList.add("btn-primary")
    document.getElementById("view-orders-btn").classList.remove("btn-secondary")
    document.getElementById("view-trackings-btn").classList.add("btn-secondary")
    document.getElementById("view-trackings-btn").classList.remove("btn-primary")
  }

  async function handleSaveTracking(event) {
    event.preventDefault()
    const form = event.target
    const trackingId = document.getElementById("trackingId").value
    const isEditing = !!trackingId
    const headers = getAuthAndJsonHeaders()
    if (!headers) return

    const data = {
      OrderId: form.trackingOrderId.value,
      TrackingNumber: form.trackingNumber.value,
      Status: form.trackingStatus.value,
      Location: form.trackingLocation.value || null,
      Description: form.trackingDescription.value || null,
      EventDate: new Date(form.trackingEventDate.value).toISOString(),
    }

    const url = isEditing ? `${API_BASE_URL_ADMIN}/Tracking/${trackingId}` : `${API_BASE_URL_ADMIN}/Tracking`
    const method = isEditing ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }

      const result = await response.json()
      if (result.hasSuccess) {
        window.showNotification(
          `${isEditing ? "Rastreamento atualizado" : "Rastreamento criado"} com sucesso!`,
          "success",
        )
        hideTrackingForm()
        await fetchAndDisplayOrdersForTracking() // Refresh orders list
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar rastreamento.")
      }
    } catch (error) {
      console.error("Erro ao salvar rastreamento:", error)
      window.showNotification(`Erro ao salvar rastreamento: ${error.message}`, "error")
    }
  }

  async function handleEditTracking(event) {
    const trackingId = event.currentTarget.getAttribute("data-id")
    const container = document.getElementById("tracking-form-container")

    container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do rastreamento...</div>`
    container.style.display = "block"
    document.getElementById("orders-section").style.display = "none"
    document.getElementById("trackings-section").style.display = "none"

    const result = await fetchData(`${API_BASE_URL_ADMIN}/Tracking/${trackingId}`, {}, container)
    if (result && result.hasSuccess && result.value) {
      showTrackingForm(result.value)
    } else {
      hideTrackingForm()
      window.showNotification("Erro ao carregar dados do rastreamento.", "error")
    }
  }

  async function handleDeleteTracking(event) {
    const trackingId = event.currentTarget.getAttribute("data-id")
    if (!confirm("Tem certeza que deseja excluir este evento de rastreamento?")) return

    const headers = getAuthHeaders()
    if (!headers) return

    try {
      const response = await fetch(`${API_BASE_URL_ADMIN}/Tracking/${trackingId}`, {
        method: "DELETE",
        headers: headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }))
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }

      const result = await response.json()
      if (result.hasSuccess) {
        window.showNotification("Rastreamento excluído com sucesso!", "success")
        await fetchAndDisplayTracking()
      } else {
        throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir rastreamento.")
      }
    } catch (error) {
      console.error("Erro ao excluir rastreamento:", error)
      window.showNotification(`Erro ao excluir rastreamento: ${error.message}`, "error")
    }
  }

  // --- Logout ---
  function handleLogout() {
    if (window.authService) {
      window.authService.logout()
    } else {
      console.error("AuthService não encontrado para logout.")
    }
  }

  // --- Funções Auxiliares para Paginação ---
  function generatePaginationControls(currentPage, totalPages, startIndex, endIndex, totalItems) {
    let paginationHTML = `
      <div class="pagination-container">
        <div class="pagination-info">
          <span>Página ${currentPage} de ${totalPages}</span>
          <span class="ml-3">Mostrando ${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${totalItems} registros</span>
        </div>
        <div class="pagination-controls">`
    
    // Botão Primeira Página
    if (currentPage > 1) {
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="1" title="Primeira página">
        <i class="fas fa-angle-double-left"></i>
      </button>`
    }
    
    // Botão Anterior
    if (currentPage > 1) {
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${currentPage - 1}" title="Página anterior">
        <i class="fas fa-angle-left"></i>
      </button>`
    }
    
    // Botões de página (máximo 7 botões visíveis)
    let startPage = Math.max(1, currentPage - 3)
    let endPage = Math.min(totalPages, startPage + 6)
    
    if (endPage - startPage < 6) {
      startPage = Math.max(1, endPage - 6)
    }
    
    if (startPage > 1) {
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="1">1</button>`
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        paginationHTML += `<button class="btn btn-sm btn-primary pagination-btn active" data-page="${i}">${i}</button>`
      } else {
        paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${i}">${i}</button>`
      }
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`
      }
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${totalPages}">${totalPages}</button>`
    }
    
    // Botão Próximo
    if (currentPage < totalPages) {
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${currentPage + 1}" title="Próxima página">
        <i class="fas fa-angle-right"></i>
      </button>`
    }
    
    // Botão Última Página
    if (currentPage < totalPages) {
      paginationHTML += `<button class="btn btn-sm btn-outline-secondary pagination-btn" data-page="${totalPages}" title="Última página">
        <i class="fas fa-angle-double-right"></i>
      </button>`
    }
    
    paginationHTML += `</div></div>`
    
    return paginationHTML
  }

  function addPaginationEventListeners(container, onPageChange) {
    container.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const newPage = parseInt(e.currentTarget.getAttribute("data-page"))
        onPageChange(newPage)
        // Scroll para o topo da tabela
        container.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  // --- Inicialização ---
  function initAdminSPA() {
    if (!checkAdminAccess()) return

    sidebarLinks.forEach((link) => link.addEventListener("click", handleNavigation))
    if (logoutBtn)
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        handleLogout()
      })

    const initialSection = window.location.hash.substring(1) || "dashboard"
    console.log(`Initial section: ${initialSection}`)
    loadSection(initialSection)

    window.addEventListener("hashchange", () => {
      const section = window.location.hash.substring(1) || "dashboard"
      console.log(`Hash changed to: ${section}`)
      loadSection(section)
    })

    console.log("Admin SPA initialized.")
  }

  function waitForAuthService(callback, maxAttempts = 50) {
    let attempts = 0
    function check() {
      attempts++
      if (window.authService) {
        callback()
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100)
      } else {
        console.error("Timeout: AuthService not loaded in time.")
        if (!window.location.pathname.includes("login.html")) {
          window.location.href = "/login.html"
        }
      }
    }
    check()
  }

  waitForAuthService(initAdminSPA)
})
