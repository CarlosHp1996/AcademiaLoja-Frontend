document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll(".sidebar-nav a[data-section]");
    const contentArea = document.getElementById("admin-content-area");
    const adminHeaderTitle = document.querySelector(".admin-header h1");
    const logoutBtn = document.getElementById("admin-logout-btn");

    const API_BASE_URL_ADMIN = "https://localhost:4242/api";

    let currentProduct = null;

    // Utility function to format dates
    function formatDate(dateString) {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
        } catch {
            return "N/A";
        }
    }

    // --- Autenticação e Proteção ---
   function checkAdminAccess() {
        if (!window.authService) {
            console.warn("AuthService not found, retrying...");
            setTimeout(checkAdminAccess, 200);
            return false;
        }
        const isAuthenticated = window.authService.isAuthenticated();
        const userRole = window.authService.getUserRole();
        if (!isAuthenticated || userRole !== "Admin") {
            console.error("Access denied! User is not admin or not logged in.");
            window.location.href = "/public/html/login.html";
            if (window.authNotifications) {
                window.authNotifications.accessDenied("Acesso restrito a administradores.");
            }
            return false;
        }
        console.log("Admin access verified.");
        return true;
    }

    // --- Roteamento e Carregamento de Conteúdo ---
    function loadSection(sectionId) {
        console.log(`Loading section: ${sectionId}`);
        if (!contentArea) {
            console.error("Element #admin-content-area not found in DOM.");
            window.showNotification("Erro: Área de conteúdo não encontrada.", "error");
            return;
        }
        contentArea.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando ${sectionId || "seção"}...</div>`;
        // if (adminHeaderTitle) {
        //     adminHeaderTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        // } else {
        //     console.warn("Element .admin-header h1 not found in DOM.");
        // }

        sidebarLinks.forEach(link => link.classList.remove("active"));
        const activeLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
        if (activeLink) activeLink.classList.add("active");
        else console.warn(`No sidebar link found for section: ${sectionId}`);

        switch (sectionId) {
            case "dashboard":
                loadDashboard();
                break;
            case "products":
                loadProducts();
                break;
            case "users":
                loadUsers();
                break;
            case "orders":
                loadOrders();
                break;
            case "payments":
                loadPayments();
                break;
            case "tracking":
                loadTracking();
                break;
            case "settings":
                loadSettings();
                break;
            default:
                contentArea.innerHTML = "<p>Seção não encontrada.</p>";
                if (adminHeaderTitle) adminHeaderTitle.textContent = "Erro";
                window.showNotification("Seção não encontrada.", "error");
        }
    }

    function handleNavigation(event) {
        event.preventDefault();
        const section = event.currentTarget.getAttribute("data-section");
        if (section) {
            console.log(`Navigating to section: ${section}`);
            window.location.hash = section;
        }
    }

    // --- Funções de Carregamento de Seção ---
    function loadDashboard() {
        console.log("Rendering dashboard...");
        if (!contentArea) {
            console.error("Cannot render dashboard: admin-content-area not found.");
            window.showNotification("Erro: Não foi possível carregar o dashboard.", "error");
            return;
        }
        adminHeaderTitle.textContent = "Dashboard";
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
                        <a href="/public/html/admin.html#products">Ver detalhes</a>
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
                        <a href="/public/html/admin.html#users">Ver detalhes</a>
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
                        <a href="/public/html/admin.html#orders">Ver detalhes</a>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="card-info">
                        <h3>Pagamentos</h3>
                        <p class="card-value" id="paymentCount">Carregando...</p>
                    </div>
                    <div class="card-action">
                        <a href="/public/html/admin.html#payments">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;
        // Fetch dashboard data
        fetchDashboardData();
    }

    async function fetchDashboardData() {
        try {
            const productData = await fetchData(`${API_BASE_URL_ADMIN}/Product/get`);
            const userData = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get`);
            const orderData = await fetchData(`${API_BASE_URL_ADMIN}/Order/get`);
            // Assuming payments endpoint exists; adjust if necessary
            const paymentData = await fetchData(`${API_BASE_URL_ADMIN}/Payment/get`);

            if (productData && productData.hasSuccess && productData.value && productData.value.products) {
                document.getElementById("productCount").textContent = productData.value.products.length || 0;
            } else {
                document.getElementById("productCount").textContent = "Erro";
            }

            if (userData && userData.hasSuccess && userData.value && userData.value.users) {
                document.getElementById("userCount").textContent = userData.value.users.length || 0;
            } else {
                document.getElementById("userCount").textContent = "Erro";
            }

            if (orderData && orderData.hasSuccess && orderData.value && orderData.value.orders) {
                document.getElementById("orderCount").textContent = orderData.value.orders.length || 0;
            } else {
                document.getElementById("orderCount").textContent = "Erro";
            }

            if (paymentData && paymentData.hasSuccess && paymentData.value) {
                document.getElementById("paymentCount").textContent = paymentData.value.length || 0;
            } else {
                document.getElementById("paymentCount").textContent = "Erro";
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            window.showNotification("Erro ao carregar dados do dashboard.", "error");
            document.getElementById("productCount").textContent = "Erro";
            document.getElementById("userCount").textContent = "Erro";
            document.getElementById("orderCount").textContent = "Erro";
            document.getElementById("paymentCount").textContent = "Erro";
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
        `;
        document.getElementById("add-product-btn").addEventListener("click", () => showProductForm());
        await fetchAndDisplayProducts();
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
        `;
        await fetchAndDisplayUsers();
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
        `;
        await fetchAndDisplayOrders();
    }

    async function loadTracking() {
        contentArea.innerHTML = `
            <div class="admin-card">
                <div class="card-header">
                    <h2>Gerenciar Rastreios</h2>
                    <button id="add-tracking-btn" class="btn btn-primary"><i class="fas fa-plus"></i> Adicionar Evento</button>
                </div>
                <div id="tracking-list-container" class="table-responsive">
                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando rastreios...</div>
                </div>
                <div id="tracking-form-container" style="display: none;"></div>
            </div>
        `;
        document.getElementById("add-tracking-btn").addEventListener("click", () => showTrackingForm());
        await fetchAndDisplayTracking();
    }

    function loadPayments() {
        contentArea.innerHTML = `
            <div class="admin-card">
                <h2>Gerenciar Pagamentos</h2>
                <p>Funcionalidade de pagamentos ainda não implementada.</p>
            </div>
        `;
    }

    function loadSettings() {
        contentArea.innerHTML = `
            <div class="admin-card">
                <h2>Configurações</h2>
                <p>Funcionalidade de configurações ainda não implementada.</p>
            </div>
        `;
    }

    // --- Funções Auxiliares Comuns ---
    function getAuthHeaders() {
        const token = window.authService.getToken();
        if (!token) {
            console.error("Token não encontrado!");
            return null;
        }
        return { "Authorization": `Bearer ${token}` };
    }

    function getAuthAndJsonHeaders() {
        const headers = getAuthHeaders();
        if (!headers) return null;
        return { ...headers, "Content-Type": "application/json" };
    }

    async function fetchData(url, options = {}, containerElement) {
        const headers = getAuthHeaders();
        if (!headers) return null;

        try {
            const response = await fetch(url, { headers: { ...headers, ...options.headers }, ...options });
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.errors ? errorJson.errors.join(", ") : `Erro ${response.status}`);
                } catch {
                    throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
                }
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar dados de ${url}:`, error);
            if (containerElement) {
                containerElement.innerHTML = `<p class="error">Erro ao carregar dados: ${error.message}</p>`;
            }
            window.showNotification(`Erro ao carregar dados: ${error.message}`, "error");
            return null;
        }
    }

    // --- CRUD Produtos ---
    async function fetchAndDisplayProducts() {
        const container = document.getElementById("product-list-container");
        const result = await fetchData(`${API_BASE_URL_ADMIN}/Product/get`, {}, container);
        if (result && result.hasSuccess && result.value && result.value.products) {
            renderProductTable(result.value.products);
        } else if (result && result.errors) {
            container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`;
        } else if (!result) {
            // Erro já tratado em fetchData
        } else {
            container.innerHTML = "<p>Nenhum produto encontrado.</p>";
        }
    }

    function renderProductTable(products) {
        const container = document.getElementById("product-list-container");
        let tableHTML = `
            <table class="admin-table">
                <thead><tr><th>Nome</th><th>Preço</th><th>Estoque</th><th>Ativo</th><th>Ações</th></tr></thead>
                <tbody>`;
        products.forEach(p => {
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
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
        // Re-enable event listeners for edit and delete buttons
        container.querySelectorAll(".btn-edit").forEach(btn => {
            btn.removeEventListener("click", handleEditProduct); // Prevent duplicate listeners
            btn.addEventListener("click", handleEditProduct);
        });
        container.querySelectorAll(".btn-delete-btn").forEach(btn => {
            btn.removeEventListener("click", handleDeleteProduct);
            btn.addEventListener("click", handleDeleteProduct);
        });
    }

    function showProductForm(product = null) {
    const formContainer = document.getElementById("product-form-container");
    const listContainer = document.getElementById("product-list-container");
    const addBtn = document.getElementById("add-product-btn");
    const isEditing = product !== null;

    // Store the product for use in handleSaveProduct
    currentProduct = product ? { ...product } : null;

    // Extract attributes if editing
    const attributes = isEditing && product && product.attributes && product.attributes.length > 0 ? product.attributes[0] : {};

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
                <input type="hidden" id="inventoryId" name="InventoryId" value="${isEditing ? (product.inventoryId || "") : ""}">
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
                            <option value="Probiótica" ${attributes.brand === "Probiótica" ? "selected" : ""}>Probiótica</option>
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
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="productImage">Imagem:</label>
                        <input type="file" id="productImage" name="ImageUrl" accept="image/*" class="form-control">
                        ${isEditing && product.imageUrl ? `<div class="current-img-container"><img src="${product.imageUrl}" alt="Imagem atual" width="50" class="current-img"></div>` : ""}
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
    `;
    formContainer.style.display = "block";
    listContainer.style.display = "none";
    addBtn.style.display = "none";

    document.getElementById("product-form").addEventListener("submit", handleSaveProduct);
    document.getElementById("cancel-product-form").addEventListener("click", hideProductForm);
    document.getElementById("cancel-product-form-secondary").addEventListener("click", hideProductForm);
}

    function hideProductForm() {
        document.getElementById("product-form-container").style.display = "none";
        document.getElementById("product-list-container").style.display = "block";
        document.getElementById("add-product-btn").style.display = "block";
        // Clear currentProduct when hiding the form
        currentProduct = null;
    }

   async function handleSaveProduct(event) {
    event.preventDefault();
    const form = event.target;
    const productId = document.getElementById("productId").value;
    const isEditing = !!productId;
    const headers = getAuthHeaders();
    if (!headers) return;

    const formData = new FormData(form);

    // Ensure IsActive is correctly appended as a boolean
    formData.set("IsActive", document.getElementById("productIsActive").checked.toString());

    // Append Attributes[0].Id if editing
    if (isEditing && currentProduct && currentProduct.attributes && currentProduct.attributes.length > 0) {
        formData.append("Attributes[0].Id", currentProduct.attributes[0].id);
    }

    const url = isEditing
        ? `${API_BASE_URL_ADMIN}/Product/update/${productId}`
        : `${API_BASE_URL_ADMIN}/Product/create`;
    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
            throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
        }
        const result = await response.json();

        if (result.hasSuccess) {
            window.showNotification(`${isEditing ? "Produto atualizado" : "Produto adicionado"} com sucesso!`, "success");
            hideProductForm();
            await fetchAndDisplayProducts();
        } else {
            throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar produto.");
        }
    } catch (error) {
        console.error("Erro ao salvar produto:", error);
        window.showNotification(`Erro ao salvar produto: ${error.message}`, "error");
    }
}

    async function handleEditProduct(event) {
        event.preventDefault();
        const productId = event.currentTarget.getAttribute("data-id");
        if (!productId) {
            console.error("Product ID não encontrado no botão de edição.");
            window.showNotification("Erro: ID do produto não encontrado.", "error");
            return;
        }

        const container = document.getElementById("product-form-container");
        container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do produto...</div>`;
        container.style.display = "block";
        document.getElementById("product-list-container").style.display = "none";
        document.getElementById("add-product-btn").style.display = "none";

        const result = await fetchData(`${API_BASE_URL_ADMIN}/Product/get/${productId}`, {}, container);
        if (result && result.hasSuccess && result.value) {
            showProductForm(result.value);
        } else {
            hideProductForm();
            window.showNotification("Erro ao carregar dados do produto.", "error");
        }
    }

    async function handleDeleteProduct(event) {
        const productId = event.currentTarget.getAttribute("data-id");
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL_ADMIN}/Product/delete/${productId}`, {
                method: "DELETE",
                headers: headers
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification("Produto excluído com sucesso!", "success");
                await fetchAndDisplayProducts();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir produto.");
            }
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            window.showNotification(`Erro ao excluir produto: ${error.message}`, "error");
        }
    }

    // --- CRUD Usuários ---
    async function fetchAndDisplayUsers() {
        const container = document.getElementById("user-list-container");
        const result = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get`, {}, container);
        if (result && result.hasSuccess && result.value && result.value.users) {
            renderUserTable(result.value.users);
        } else if (result && result.errors) {
            container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`;
        } else if (!result) {
            // Erro já tratado
        } else {
            container.innerHTML = "<p>Nenhum usuário encontrado.</p>";
        }
    }

    function renderUserTable(users) {
        const container = document.getElementById("user-list-container");
        let tableHTML = `
            <table class="admin-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Role</th><th>Ativo</th><th>Ações</th></tr></thead>
                <tbody>`;
        users.forEach(user => {
            tableHTML += `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td><span class="status ${user.isActive ? "active" : "inactive"}">${user.isActive ? "Sim" : "Não"}</span></td>
                    <td>
                        <button class="btn btn-sm btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
        container.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditUser));
        container.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteUser));
    }

    function showUserForm(user = null) {
        const formContainer = document.getElementById("user-form-container");
        const listContainer = document.getElementById("user-list-container");
        const isEditing = user !== null;

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
                ${!isEditing ? `
                <div class="form-group">
                    <label for="userPassword">Senha:</label>
                    <input type="password" id="userPassword" name="Password" required>
                </div>` : `<!-- Senha não editável aqui -->`}
                <div class="form-actions">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> ${isEditing ? "Salvar Alterações" : "Adicionar Usuário"}</button>
                </div>
            </form>
        `;
        formContainer.style.display = "block";
        listContainer.style.display = "none";

        document.getElementById("user-form").addEventListener("submit", handleSaveUser);
        document.getElementById("cancel-user-form").addEventListener("click", hideUserForm);
    }

    function hideUserForm() {
        document.getElementById("user-form-container").style.display = "none";
        document.getElementById("user-list-container").style.display = "block";
    }

    async function handleSaveUser(event) {
        event.preventDefault();
        const form = event.target;
        const userId = document.getElementById("userId").value;
        const isEditing = !!userId;
        const headers = getAuthAndJsonHeaders();
        if (!headers) return;

        const data = {
            Name: form.userName.value,
            Email: form.userEmail.value,
            Role: form.userRole.value,
            IsActive: form.userIsActive.checked,
        };

        let url;
        let method;

        if (isEditing) {
            method = "PUT";
            url = `${API_BASE_URL_ADMIN}/Auth/update`;
            data.Id = userId;
        } else {
            method = "POST";
            url = `${API_BASE_URL_ADMIN}/Auth/create`;
            data.Password = form.userPassword.value;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification(`${isEditing ? "Usuário atualizado" : "Usuário adicionado"} com sucesso!`, "success");
                hideUserForm();
                await fetchAndDisplayUsers();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar usuário.");
            }
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            window.showNotification(`Erro ao salvar usuário: ${error.message}`, "error");
        }
    }

    async function handleEditUser(event) {
        const userId = event.currentTarget.getAttribute("data-id");
        const container = document.getElementById("user-form-container");
        container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do usuário...</div>`;
        container.style.display = "block";
        document.getElementById("user-list-container").style.display = "none";

        const result = await fetchData(`${API_BASE_URL_ADMIN}/Auth/get/${userId}`, {}, container);
        if (result && result.hasSuccess && result.value) {
            showUserForm(result.value.user);
        } else {
            hideUserForm();
        }
    }

    async function handleDeleteUser(event) {
        const userId = event.currentTarget.getAttribute("data-id");
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL_ADMIN}/Auth/delete/${userId}`, {
                method: "DELETE",
                headers: headers
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification("Usuário excluído com sucesso!", "success");
                await fetchAndDisplayUsers();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir usuário.");
            }
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            window.showNotification(`Erro ao excluir usuário: ${error.message}`, "error");
        }
    }

    // --- CRUD Pedidos ---
    async function fetchAndDisplayOrders() {
        const container = document.getElementById("order-list-container");
        const result = await fetchData(`${API_BASE_URL_ADMIN}/Order/get`, {}, container);
        if (result && result.hasSuccess && result.value && result.value.orders) {
            renderOrderTable(result.value.orders);
        } else if (result && result.errors) {
            container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`;
        } else if (!result) {
            // Erro já tratado
        } else {
            container.innerHTML = "<p>Nenhum pedido encontrado.</p>";
        }
    }

   function renderOrderTable(orders) {
        const container = document.getElementById("order-list-container");
        let tableHTML = `
            <table class="admin-table">
                <thead><tr><th>ID Pedido</th><th>Usuário</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>`;
        orders.forEach(order => {
            const userIdentifier = order.user ? order.user.name : (order.userId || "Desconhecido");
            tableHTML += `
                <tr>
                    <td>${order.id.substring(0, 8)}...</td>
                    <td>${userIdentifier}</td>
                    <td>${formatDate(order.orderDate)}</td>
                    <td>R$ ${order.totalAmount.toFixed(2).replace(".", ",")}</td>
                    <td><span class="status status-${order.status?.toLowerCase()}">${order.status || "N/A"}</span></td>
                    <td>
                        <button class="btn btn-sm btn-view" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-edit" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-delete" data-id="${order.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
        container.querySelectorAll(".btn-view").forEach(btn => btn.addEventListener("click", handleViewOrderDetails));
        container.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditOrder));
        container.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteOrder));
    }

    async function handleViewOrderDetails(event) {
        const orderId = event.currentTarget.getAttribute("data-id");
        const detailsContainer = document.getElementById("order-details-container");
        const listContainer = document.getElementById("order-list-container");

        detailsContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando detalhes do pedido...</div>`;
        detailsContainer.style.display = "block";
        listContainer.style.display = "none";

        const result = await fetchData(`${API_BASE_URL_ADMIN}/Order/get/${orderId}`, {}, detailsContainer);

        if (result && result.hasSuccess && result.value && result.value.order) {
            const order = result.value.order;
            let detailsHTML = `
                <div class="form-header">
                    <h3>Detalhes do Pedido #${order.id.substring(0, 8)}...</h3>
                    <button type="button" id="back-to-orders" class="btn btn-sm btn-secondary"><i class="fas fa-arrow-left"></i> Voltar</button>
                </div>
                <div class="order-details-grid">
                    <div><strong>ID Pedido:</strong> ${order.id}</div>
                    <div><strong>Usuário:</strong> ${order.user ? order.user.name : order.userId}</div>
                    <div><strong>Data:</strong> ${window.formatDate(order.orderDate)}</div>
                    <div><strong>Total:</strong> R$ ${order.totalAmount.toFixed(2).replace(".", ",")}</div>
                    <div><strong>Status:</strong> ${order.status || "N/A"}</div>
                    <div><strong>Endereço:</strong> ${order.shippingAddress || "N/A"}</div>
                </div>
                <h4>Itens do Pedido</h4>
                <table class="admin-table">
                    <thead><tr><th>Produto</th><th>Quantidade</th><th>Preço Unitário</th><th>Subtotal</th></tr></thead>
                    <tbody>`;
            order.orderItems.forEach(item => {
                detailsHTML += `
                    <tr>
                        <td>${item.productName || item.productId}</td>
                        <td>${item.quantity}</td>
                        <td>R$ ${item.unitPrice.toFixed(2).replace(".", ",")}</td>
                        <td>R$ ${(item.quantity * item.unitPrice).toFixed(2).replace(".", ",")}</td>
                    </tr>`;
            });
            detailsHTML += `</tbody></table>`;
            detailsContainer.innerHTML = detailsHTML;
            document.getElementById("back-to-orders").addEventListener("click", () => {
                detailsContainer.style.display = "none";
                listContainer.style.display = "block";
            });
        } else {
            detailsContainer.style.display = "none";
            listContainer.style.display = "block";
        }
    }

    async function handleEditOrder(event) {
        const orderId = event.currentTarget.getAttribute("data-id");
        window.showNotification(`Funcionalidade de editar pedido ${orderId} ainda não implementada.`, "info");
    }

    async function handleDeleteOrder(event) {
        const orderId = event.currentTarget.getAttribute("data-id");
        if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL_ADMIN}/Order/delete/${orderId}`, {
                method: "DELETE",
                headers: headers
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification("Pedido excluído com sucesso!", "success");
                await fetchAndDisplayOrders();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir pedido.");
            }
        } catch (error) {
            console.error("Erro ao excluir pedido:", error);
            window.showNotification(`Erro ao excluir pedido: ${error.message}`, "error");
        }
    }

    // --- CRUD Rastreios ---
    async function fetchAndDisplayTracking() {
        const container = document.getElementById("tracking-list-container");
        const result = await fetchData(`${API_BASE_URL_ADMIN}/Tracking`, {}, container);
        if (result && result.hasSuccess && result.value && Array.isArray(result.value)) {
            renderTrackingTable(result.value);
        } else if (result && result.errors) {
            container.innerHTML = `<p class="error">Erro: ${result.errors.join(", ")}</p>`;
        } else if (!result) {
            // Erro já tratado
        } else {
            container.innerHTML = "<p>Nenhum evento de rastreio encontrado.</p>";
        }
    }

    function renderTrackingTable(trackings) {
        const container = document.getElementById("tracking-list-container");
        let tableHTML = `
            <table class="admin-table">
                <thead><tr><th>ID Pedido</th><th>Status</th><th>Localização</th><th>Data</th><th>Ações</th></tr></thead>
                <tbody>`;
        trackings.forEach(t => {
            tableHTML += `
                <tr>
                    <td>${t.orderId.substring(0, 8)}...</td>
                    <td><span class="status status-${t.status?.toLowerCase()}">${t.status}</span></td>
                    <td>${t.location || "-"}</td>
                    <td>${formatDate(t.eventDate)}</td>
                    <td>
                        <button class="btn btn-sm btn-edit" data-id="${t.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-delete" data-id="${t.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
        container.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditTracking));
        container.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteTracking));
    }

    function showTrackingForm(tracking = null) {
        const formContainer = document.getElementById("tracking-form-container");
        const listContainer = document.getElementById("tracking-list-container");
        const addBtn = document.getElementById("add-tracking-btn");
        const isEditing = tracking !== null;

        formContainer.innerHTML = `
            <div class="form-header">
                <h3>${isEditing ? "Editar Evento de Rastreio" : "Adicionar Evento de Rastreio"}</h3>
                <button type="button" id="cancel-tracking-form" class="btn btn-sm btn-secondary"><i class="fas fa-times"></i></button>
            </div>
            <form id="tracking-form">
                <input type="hidden" id="trackingId" value="${isEditing ? tracking.id : ""}">
                <div class="form-group">
                    <label for="trackingOrderId">ID do Pedido:</label>
                    <input type="text" id="trackingOrderId" name="OrderId" required value="${isEditing ? tracking.orderId : ""}" ${isEditing ? "readonly" : ""}>
                </div>
                <div class="form-group">
                    <label for="trackingStatus">Status:</label>
                    <input type="text" id="trackingStatus" name="Status" required value="${isEditing ? tracking.status : ""}">
                </div>
                <div class="form-group">
                    <label for="trackingLocation">Localização (Opcional):</label>
                    <input type="text" id="trackingLocation" name="Location" value="${isEditing ? (tracking.location || "") : ""}">
                </div>
                <div class="form-group">
                    <label for="trackingNotes">Notas (Opcional):</label>
                    <textarea id="trackingNotes" name="Notes">${isEditing ? (tracking.notes || "") : ""}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> ${isEditing ? "Salvar Alterações" : "Adicionar Evento"}</button>
                </div>
            </form>
        `;
        formContainer.style.display = "block";
        listContainer.style.display = "none";
        addBtn.style.display = "none";

        document.getElementById("tracking-form").addEventListener("submit", handleSaveTracking);
        document.getElementById("cancel-tracking-form").addEventListener("click", hideTrackingForm);
    }

    function hideTrackingForm() {
        document.getElementById("tracking-form-container").style.display = "none";
        document.getElementById("tracking-list-container").style.display = "block";
        document.getElementById("add-tracking-btn").style.display = "block";
    }

    async function handleSaveTracking(event) {
        event.preventDefault();
        const form = event.target;
        const trackingId = document.getElementById("trackingId").value;
        const isEditing = !!trackingId;
        const headers = getAuthAndJsonHeaders();
        if (!headers) return;

        const data = {
            OrderId: form.trackingOrderId.value,
            Status: form.trackingStatus.value,
            Location: form.trackingLocation.value || null,
            Notes: form.trackingNotes.value || null,
        };

        const url = isEditing ? `${API_BASE_URL_ADMIN}/Tracking/${trackingId}` : `${API_BASE_URL_ADMIN}/Tracking`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification(`${isEditing ? "Evento atualizado" : "Evento adicionado"} com sucesso!`, "success");
                hideTrackingForm();
                await fetchAndDisplayTracking();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao salvar evento.");
            }
        } catch (error) {
            console.error("Erro ao salvar evento de rastreio:", error);
            window.showNotification(`Erro ao salvar evento: ${error.message}`, "error");
        }
    }

    async function handleEditTracking(event) {
        const trackingId = event.currentTarget.getAttribute("data-id");
        const container = document.getElementById("tracking-form-container");
        container.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando dados do evento...</div>`;
        container.style.display = "block";
        document.getElementById("tracking-list-container").style.display = "none";
        document.getElementById("add-tracking-btn").style.display = "none";

        const result = await fetchData(`${API_BASE_URL_ADMIN}/Tracking/${trackingId}`, {}, container);
        if (result && result.hasSuccess && result.value) {
            showTrackingForm(result.value);
        } else {
            hideTrackingForm();
        }
    }

    async function handleDeleteTracking(event) {
        const trackingId = event.currentTarget.getAttribute("data-id");
        if (!confirm("Tem certeza que deseja excluir este evento de rastreio?")) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL_ADMIN}/Tracking/${trackingId}`, {
                method: "DELETE",
                headers: headers
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [`Erro ${response.status}`] }));
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }
            const result = await response.json();
            if (result.hasSuccess) {
                window.showNotification("Evento excluído com sucesso!", "success");
                await fetchAndDisplayTracking();
            } else {
                throw new Error(result.errors ? result.errors.join(", ") : "Erro ao excluir evento.");
            }
        } catch (error) {
            console.error("Erro ao excluir evento de rastreio:", error);
            window.showNotification(`Erro ao excluir evento: ${error.message}`, "error");
        }
    }

    // --- Logout ---
    function handleLogout() {
        if (window.authService) {
            window.authService.logout();
        } else {
            console.error("AuthService não encontrado para logout.");
        }
    }

    // --- Inicialização ---
    function initAdminSPA() {
        if (!checkAdminAccess()) return;

        sidebarLinks.forEach(link => link.addEventListener("click", handleNavigation));
        if (logoutBtn) logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });

        const initialSection = window.location.hash.substring(1) || "dashboard";
        console.log(`Initial section: ${initialSection}`);
        loadSection(initialSection);

        window.addEventListener("hashchange", () => {
            const section = window.location.hash.substring(1) || "dashboard";
            console.log(`Hash changed to: ${section}`);
            loadSection(section);
        });

        console.log("Admin SPA initialized.");
    }

    function waitForAuthService(callback, maxAttempts = 50) {
        let attempts = 0;
        function check() {
            attempts++;
            if (window.authService) {
                callback();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 100);
            } else {
                console.error("Timeout: AuthService not loaded in time.");
                if (!window.location.pathname.includes("login.html")) {
                    window.location.href = "/public/html/login.html";
                }
            }
        }
        check();
    }

    waitForAuthService(initAdminSPA);
});