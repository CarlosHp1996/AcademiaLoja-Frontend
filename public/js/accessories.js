document.addEventListener("DOMContentLoaded", function() {
    // Elementos do DOM
    const filterCheckboxes = document.querySelectorAll(".filter-options input[type=\"checkbox\"]");
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
    const applyPriceFilterBtn = document.getElementById("applyPriceFilter");
    const applyFiltersBtn = document.getElementById("applyFilters");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const sortBySelect = document.getElementById("sortBy");
    const accessoriesGrid = document.querySelector(".accessories-grid");

    const API_BASE_URL = "https://localhost:4242/api"; // Ajuste se necessário

    // Mapeamento de categorias de acessórios para IDs do EnumAccessory
    const accessoryCategoryMap = {
        "camisetas": 1,
        "garrafas": 2,
        "shakeiras": 3,
        "luvas": 4,
        "cintos": 5,
        "faixas": 6,
        "meias": 7,
        "mochilas": 8,
        "bones": 9
        // Adicione outros mapeamentos conforme necessário
    };

    // Estado dos filtros
    let filters = {
        accessoryIds: [], // Usaremos IDs do EnumAccessory
        colors: [],
        sizes: [],
        models: [],
        brands: [],
        price: {
            min: null,
            max: null
        }
    };

    // Função para obter o token de autenticação
    function getAuthToken() {
        return localStorage.getItem("authToken");
    }

    // Inicializar eventos
    function initEvents() {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function() {
                const filterType = this.name;
                const filterValue = this.value;

                if (this.checked) {
                    switch(filterType) {
                        case "category":
                            const accessoryId = accessoryCategoryMap[filterValue];
                            if (accessoryId) filters.accessoryIds.push(accessoryId);
                            break;
                        case "color": filters.colors.push(filterValue); break;
                        case "size": filters.sizes.push(filterValue); break;
                        case "model": filters.models.push(filterValue); break;
                        case "brand": filters.brands.push(filterValue); break; // Assumindo que value é o ID/nome da marca
                    }
                } else {
                    switch(filterType) {
                        case "category":
                            const accessoryId = accessoryCategoryMap[filterValue];
                            if (accessoryId) filters.accessoryIds = filters.accessoryIds.filter(id => id !== accessoryId);
                            break;
                        case "color": filters.colors = filters.colors.filter(item => item !== filterValue); break;
                        case "size": filters.sizes = filters.sizes.filter(item => item !== filterValue); break;
                        case "model": filters.models = filters.models.filter(item => item !== filterValue); break;
                        case "brand": filters.brands = filters.brands.filter(item => item !== filterValue); break;
                    }
                }
            });
        });

        applyPriceFilterBtn.addEventListener("click", function() {
            filters.price.min = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
            filters.price.max = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
            applyFilters();
        });

        applyFiltersBtn.addEventListener("click", applyFilters);
        clearFiltersBtn.addEventListener("click", clearFilters);
        sortBySelect.addEventListener("change", applyFilters);

        // Carregar acessórios iniciais
        applyFilters();
    }

    // Aplicar filtros e buscar acessórios da API
    async function applyFilters() {
        const authToken = getAuthToken();
        const headers = { "Content-Type": "application/json" };
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const params = new URLSearchParams();
        params.append("PageNumber", 1);
        params.append("PageSize", 20);

        // Adicionar filtros aos parâmetros da URL
        // Usaremos a rota de produtos, filtrando por AccessoryIds
        if (filters.accessoryIds.length > 0) {
            filters.accessoryIds.forEach(id => params.append("AccessoryIds", id));
        }
        // Adicionar outros filtros se a API suportar (ex: colors, sizes, models, brands)
        // Atualmente, GetProductsRequestFilter não parece ter filtros específicos para cor, tamanho, modelo de acessório.
        // Vamos focar no filtro por AccessoryIds e preço por enquanto.
        if (filters.brands.length > 0) {
             filters.brands.forEach(brand => params.append("BrandIds", brand)); // Assumindo que BrandIds funciona para acessórios também
        }
        if (filters.price.min !== null) {
            params.append("MinPrice", filters.price.min);
        }
        if (filters.price.max !== null) {
            params.append("MaxPrice", filters.price.max);
        }

        // Ordenação
        const sortBy = sortBySelect.value;
        let orderBy = "Name";
        let orderDirection = "asc";
        switch(sortBy) {
            case "price-asc": orderBy = "Price"; orderDirection = "asc"; break;
            case "price-desc": orderBy = "Price"; orderDirection = "desc"; break;
            case "name-asc": orderBy = "Name"; orderDirection = "asc"; break;
            case "name-desc": orderBy = "Name"; orderDirection = "desc"; break;
        }
        params.append("OrderBy", orderBy);
        params.append("OrderDirection", orderDirection);

        // Usar a rota de produtos, pois não há controller específico para acessórios
        const url = `${API_BASE_URL}/Product/get?${params.toString()}`;

        try {
            showLoading();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`);
            }

            const result = await response.json();

            // Assumindo que a resposta de /Product/get contém uma lista de produtos/acessórios
            if (result.hasSuccess && result.value && result.value.products) {
                // Filtrar novamente no frontend se a API não suportar todos os filtros (cor, tamanho, modelo)
                let accessoriesData = result.value.products;
                accessoriesData = filterAccessoriesFrontend(accessoriesData, filters);
                updateAccessoriesDisplay(accessoriesData);
            } else {
                showNotification(result.errors ? result.errors.join(", ") : "Nenhum acessório encontrado.", "info");
                updateAccessoriesDisplay([]);
            }
        } catch (error) {
            console.error("Erro ao buscar acessórios:", error);
            showNotification(`Erro ao buscar acessórios: ${error.message}`, "error");
            updateAccessoriesDisplay([]);
        } finally {
            hideLoading();
        }
    }

    // Função para filtrar acessórios no frontend (caso a API não suporte todos os filtros)
    function filterAccessoriesFrontend(accessories, currentFilters) {
        return accessories.filter(item => {
            // Filtrar por cor (exemplo, assumindo que 'item' tem uma propriedade 'color')
            if (currentFilters.colors.length > 0 && !currentFilters.colors.includes(item.color?.toLowerCase())) {
                return false;
            }
            // Filtrar por tamanho (exemplo, assumindo que 'item' tem uma propriedade 'availableSizes' como array)
            if (currentFilters.sizes.length > 0 && !item.availableSizes?.some(size => currentFilters.sizes.includes(size.toLowerCase()))) {
                return false;
            }
            // Filtrar por modelo (exemplo, assumindo que 'item' tem uma propriedade 'model')
            if (currentFilters.models.length > 0 && !currentFilters.models.includes(item.model?.toLowerCase())) {
                return false;
            }
            return true;
        });
    }

    // Limpar filtros
    function clearFilters() {
        filters = {
            accessoryIds: [], colors: [], sizes: [], models: [], brands: [],
            price: { min: null, max: null }
        };
        filterCheckboxes.forEach(checkbox => { checkbox.checked = false; });
        minPriceInput.value = "";
        maxPriceInput.value = "";
        sortBySelect.value = "relevance";
        applyFilters();
        showNotification("Filtros limpos!", "info");
    }

    // Atualizar exibição dos acessórios
    function updateAccessoriesDisplay(items) {
        accessoriesGrid.innerHTML = ""; // Limpar grid

        if (!items || items.length === 0) {
            accessoriesGrid.innerHTML = 
            '<p class="col-span-full text-center text-gray-500">Nenhum acessório encontrado com os filtros selecionados.</p>';
            return;
        }

        items.forEach(accessory => {
            // Mapear ID do EnumAccessory de volta para nome da categoria (se necessário para exibição)
            const categoryName = Object.keys(accessoryCategoryMap).find(key => accessoryCategoryMap[key] === accessory.accessoryType) || "Acessório"; // Supondo que 'accessory.accessoryType' contenha o ID do enum

            const accessoryCard = document.createElement("div");
            accessoryCard.className = "accessory-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105";
            accessoryCard.innerHTML = `
                <div class="accessory-image relative">
                    <img src="${accessory.imageUrl || "/assets/images/placeholder.png"}" alt="${accessory.name}" class="w-full h-48 object-cover">
                    <div class="product-actions absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="action-btn wishlist-btn bg-white p-1 rounded-full shadow text-gray-600 hover:text-red-500" data-product-id="${accessory.id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <!-- <button class="action-btn quickview-btn bg-white p-1 rounded-full shadow text-gray-600 hover:text-blue-500" data-product-id="${accessory.id}">
                            <i class="fas fa-eye"></i>
                        </button> -->
                    </div>
                    ${accessory.discountPercentage ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">-${accessory.discountPercentage}%</span>` : ""}
                </div>
                <div class="accessory-info p-4">
                    <div class="accessory-category text-xs text-gray-500 mb-1">${accessory.categoryName || categoryName}</div> <!-- Usar categoryName se vier da API -->
                    <h3 class="accessory-title text-md font-semibold mb-2 truncate">${accessory.name}</h3>
                    <div class="flex items-center mb-2">
                        <!-- Adicionar estrelas de avaliação -->
                        <span class="text-xs text-gray-500 ml-1">(${accessory.ratingCount || 0} avaliações)</span>
                    </div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="accessory-price text-lg font-bold text-orange-500">R$ ${accessory.price.toFixed(2).replace(".", ",")}</span>
                        ${accessory.oldPrice ? `<span class="text-sm text-gray-400 line-through">R$ ${accessory.oldPrice.toFixed(2).replace(".", ",")}</span>` : ""}
                    </div>
                    <button class="add-to-cart w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors duration-300" data-product-id="${accessory.id}">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
            accessoriesGrid.appendChild(accessoryCard);
        });

        attachCardEvents();
    }

    // Anexar eventos aos botões dos cards
    function attachCardEvents() {
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.removeEventListener("click", handleAddToCart);
            button.addEventListener("click", handleAddToCart);
        });
        document.querySelectorAll(".wishlist-btn").forEach(button => {
            button.removeEventListener("click", handleWishlistToggle);
            button.addEventListener("click", handleWishlistToggle);
        });
        // Adicionar listeners para quickview se implementado
    }

    // Funções de manipulação de eventos (handleAddToCart, handleWishlistToggle, etc.) - Reutilizar de products.js ou adaptar
    async function handleAddToCart(event) {
        const productId = event.target.getAttribute("data-product-id");
        console.log(`Adicionar acessório ${productId} ao carrinho`);
        // Implementar lógica real de adicionar ao carrinho via API (será feito na etapa do header)
        showNotification(`Acessório ${productId} adicionado ao carrinho!`, "success");
    }

    function handleWishlistToggle(event) {
        const button = event.currentTarget;
        const icon = button.querySelector("i");
        const productId = button.getAttribute("data-product-id");
        console.log(`Toggle wishlist para acessório ${productId}`);
        if (icon.classList.contains("far")) {
            icon.classList.replace("far", "fas");
            showNotification("Acessório adicionado aos favoritos!", "success");
        } else {
            icon.classList.replace("fas", "far");
            showNotification("Acessório removido dos favoritos!", "info");
        }
        // Adicionar lógica API para wishlist
    }

    // Funções auxiliares (showLoading, hideLoading, showNotification) - Reutilizar de products.js
    function showLoading() {
        console.log("Carregando...");
        const indicator = document.getElementById("loadingIndicator") || document.createElement("div");
        if (!document.getElementById("loadingIndicator")) {
            indicator.id = "loadingIndicator";
            indicator.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.5); color:white; padding:10px; border-radius:5px; z-index:1051;";
            indicator.textContent = "Carregando...";
            document.body.appendChild(indicator);
        }
        indicator.style.display = "block";
    }

    function hideLoading() {
        console.log("Carregamento concluído.");
        const indicator = document.getElementById("loadingIndicator");
        if (indicator) indicator.style.display = "none";
    }

    function showNotification(message, type) {
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) existingNotification.remove();
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `<div class="notification-content"><i class="fas ${type === "success" ? "fa-check-circle" : (type === "error" ? "fa-exclamation-circle" : "fa-info-circle")}"></i><span>${message}</span></div>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Adicionar estilos para notificações (se ainda não existirem globalmente)
    if (!document.getElementById("notification-styles")) {
        const notificationStyles = document.createElement("style");
        notificationStyles.id = "notification-styles";
        notificationStyles.textContent = `
            .notification { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1050; animation: slideIn 0.3s ease; max-width: 300px; }
            .notification.success { background-color: #10b981; color: white; }
            .notification.info { background-color: #3b82f6; color: white; }
            .notification.error { background-color: #ef4444; color: white; }
            .notification-content { display: flex; align-items: center; }
            .notification-content i { margin-right: 10px; font-size: 1.2rem; }
            .notification.fade-out { opacity: 0; transition: opacity 0.3s ease; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(notificationStyles);
    }

    // Inicializar
    initEvents();
});

