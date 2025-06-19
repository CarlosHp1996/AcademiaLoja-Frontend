document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE_URL = "https://localhost:4242/api";

    // Capturar o ID do produto da URL
    const urlParams = new URLSearchParams(window.location.search );
    const productId = urlParams.get("id");

    if (!productId) {
        alert("Produto não encontrado!");
        return;
    }

    // Enum de sabores do backend (numérico para string)
    const FLAVOR_ENUM_TO_STRING = {
        1: "Chocolate",
        2: "Morango",
        3: "Baunilha",
        4: "Cookies",
        5: "Limão",
        6: "FrutasVermelhas",
        7: "SemSabor"
    };

    // Enum de categorias do backend
    const CATEGORY_ENUM = {
        1: "WheyProtein",
        2: "BarraDeProteina",
        3: "Creatina",
        4: "Glutamina",
        5: "HiperCalorico",
        6: "PreTreino",
        7: "Proteinas",
        8: "Termogenicos",
        9: "Vitaminas",
        10: "Aminoacidos"
    };

    // Buscar produto real na API
    let produto = null;
    try {
        const response = await fetch(`${API_BASE_URL}/Product/get/${productId}`);
        const data = await response.json();
        if (data && data.hasSuccess && data.value) {
            produto = {
                id: data.value.id,
                name: data.value.name,
                price: data.value.price,
                oldPrice: data.value.oldPrice,
                rating: data.value.rating || 4.5,
                image: data.value.imageUrl || "https://via.placeholder.com/500x500",
                description: data.value.description,
                stockQuantity: data.value.stockQuantity || 0,
                attributes: data.value.attributes || [], // This is an array of attribute objects
                categoryId: data.value.categoryId,
                benefit: data.value.benefit || "Benefício não disponível",
                nutritionalInfo: data.value.nutritionalInfo || "Tabela não disponível",
            };
        } else {
            alert("Produto não encontrado!" );
            return;
        }
    } catch (e) {
        console.error("Erro ao buscar produto:", e);
        alert("Erro ao buscar produto!");
        return;
    }

    // Renderiza produto principal
    function renderProduct(product) {
        document.getElementById("main-product-image").src = product.image;
        document.getElementById("product-title").textContent = product.name;
        document.getElementById("breadcrumb-product-name").textContent = product.name;
        
        // Renderizar preço
        const priceContainer = document.getElementById("product-price");
        if (product.oldPrice && product.oldPrice > product.price) {
            priceContainer.innerHTML = `
                <span class="old-price">De: R$ ${product.oldPrice.toFixed(2)}</span>
                <span class="current-price">Por: R$ ${product.price.toFixed(2)}</span>
            `;
        } else {
            priceContainer.innerHTML = `<span class="current-price">R$ ${product.price.toFixed(2)}</span>`;
        }

        // Status do estoque
        const stockStatus = document.getElementById("stock-status");
        if (product.stockQuantity > 0) {
            stockStatus.innerHTML = `<span class="in-stock">✓ Em estoque (${product.stockQuantity} unidades)</span>`;
        } else {
            stockStatus.innerHTML = `<span class="out-of-stock">✗ Fora de estoque</span>`;
        }

        // Renderizar avaliação
        const ratingContainer = document.getElementById("product-rating");
        ratingContainer.innerHTML = `
            <div class="stars">${renderStars(product.rating)}</div>
            <span class="rating-text">(${product.rating})</span>
        `;

        document.getElementById("product-description").textContent = product.description || "Descrição não disponível.";

        // Renderizar sabores baseado nos atributos do produto
        renderFlavorOptions(product.attributes);
    }

    // Função para renderizar opções de sabor (dropdown)
    function renderFlavorOptions(attributes) { // Changed parameter to attributes array
        const flavorContainer = document.getElementById("flavor-options-container");
        const flavorOptionsDiv = document.getElementById("flavor-options");

        let productFlavorString = null;
        if (attributes && attributes.length > 0 && attributes[0].flavor) {
            productFlavorString = attributes[0].flavor;
        }

        console.log("Product Flavor String from backend:", productFlavorString);

        // Check if the product has a flavor and if it's "SemSabor"
        const isSemSabor = productFlavorString === FLAVOR_ENUM_TO_STRING[7];
        console.log("Is \"SemSabor\"?", isSemSabor);

        if (!productFlavorString || isSemSabor) { // If no flavor or it's "SemSabor"
            flavorContainer.style.display = "none"; // Hide the entire flavor section
            console.log("Flavor dropdown hidden.");
            return;
        }

        // If not "SemSabor", show the container and create the dropdown
        flavorContainer.style.display = "block";
        flavorOptionsDiv.innerHTML = ""; // Clear existing content (buttons)
        console.log("Flavor dropdown shown.");

        const selectElement = document.createElement("select");
        selectElement.classList.add("flavor-options"); // Add a class for styling
        selectElement.id = "flavor-options"; // Give it an ID

        // Add a default "Selecione um sabor" option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione um sabor";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        // Populate dropdown with all flavors except "SemSabor"
        for (const flavorId in FLAVOR_ENUM_TO_STRING) {
            const flavorName = FLAVOR_ENUM_TO_STRING[flavorId];
            if (flavorName !== "SemSabor") {
                const option = document.createElement("option");
                option.value = flavorId; // Use the numeric ID as value
                option.textContent = flavorName.replace(/([A-Z])/g, " $1").trim(); // Format "FrutasVermelhas" to "Frutas Vermelhas"
                if (flavorName === productFlavorString) { // Select the product's actual flavor
                    option.selected = true;
                }
                selectElement.appendChild(option);
            }
        }
        flavorOptionsDiv.appendChild(selectElement);
    }
   
    // Função para renderizar estrelas de avaliação
    function renderStars(rating) {
        let starsHtml = "";
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(rating)) {
                starsHtml += "<i class=\"fas fa-star\"></i>";
            } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                starsHtml += "<i class=\"fas fa-star-half-alt\"></i>";
            } else {
                starsHtml += "<i class=\"fas fa-star text-gray-300\"></i>";
            }
        }
        return starsHtml;
    }

    // Função para alternar botão ativo
    function toggleActive(clickedElement, selector) {
        document.querySelectorAll(selector).forEach(el => el.classList.remove("active"));
        clickedElement.classList.add("active");
    }

    // Função para manipular a quantidade - CORRIGIDA
    function setupQuantityControls() {
        const quantityInput = document.querySelector(".quantity-input");
        const minusBtn = document.querySelector(".quantity-btn.minus");
        const plusBtn = document.querySelector(".quantity-btn.plus");

        minusBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        plusBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let value = parseInt(quantityInput.value) || 1;
            // Verificar se não excede o estoque disponível
            if (produto.stockQuantity > 0 && value < produto.stockQuantity) {
                quantityInput.value = value + 1;
            } else if (produto.stockQuantity === 0) {
                quantityInput.value = value + 1; // Sem limite se não há controle de estoque
            }
        });

        // Validar entrada manual
        quantityInput.addEventListener("input", () => {
            let value = parseInt(quantityInput.value) || 1;
            if (value < 1) {
                quantityInput.value = 1;
            } else if (produto.stockQuantity > 0 && value > produto.stockQuantity) {
                quantityInput.value = produto.stockQuantity;
            }
        });
    }

    // Função para Tabs - ATUALIZADA
    function setupTabs() {
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const tabId = this.getAttribute("data-tab");
                toggleActive(this, ".tab-btn");
                
                // Esconder todos os painéis
                document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
                
                // Mostrar painel selecionado
                const targetPanel = document.getElementById(tabId);
                if (targetPanel) {
                    targetPanel.classList.add("active");
                    
                    // Carregar conteúdo específico para cada aba
                    loadTabContent(tabId);
                }
            });
        });
    }

    // Função para carregar conteúdo das abas
    function loadTabContent(tabId) {
        switch (tabId) {
            case "nutrition":
            // Verifica se existe informação nutricional do produto
            let nutritionContent = '';
            
            if (produto.nutritionalInfo && produto.nutritionalInfo.trim() !== '' && produto.nutritionalInfo !== "Tabela não disponível") {
                // Se nutritionalInfo contém uma URL de imagem
                if (produto.nutritionalInfo.startsWith('http') || produto.nutritionalInfo.includes('.jpg') || produto.nutritionalInfo.includes('.png') || produto.nutritionalInfo.includes('.jpeg') || produto.nutritionalInfo.includes('.webp')) {
                    nutritionContent = `
                        <h4 class="product-content">Informações Nutricionais</h4>
                        <div class="nutrition-image-container">
                            <img src="${produto.nutritionalInfo}" alt="Tabela Nutricional" class="nutrition-image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        </div>
                    `;
                } else {
                    // Se nutritionalInfo contém texto, exibe como texto
                    nutritionContent = `
                        <h4>Informações Nutricionais</h4>
                        <div class="nutrition-text">
                            ${produto.nutritionalInfo}
                        </div>
                    `;
                }
            } else {
                // Fallback para a tabela padrão se não houver informação do backend
                nutritionContent = `
                    <h4>Informações Nutricionais</h4>
                    <table class="nutrition-table">
                        <tr><td>Porção</td><td>30g (1 scoop)</td></tr>
                        <tr><td>Calorias</td><td>120 kcal</td></tr>
                        <tr><td>Proteínas</td><td>25g</td></tr>
                        <tr><td>Carboidratos</td><td>2g</td></tr>
                        <tr><td>Gorduras</td><td>1g</td></tr>
                    </table>
                `;
            }
            
            document.getElementById("product-nutrition").innerHTML = nutritionContent;
            break;
            case "benefits":
                document.getElementById("product-benefits-tab").innerHTML = `
                    <h4>Principais Benefícios</h4>
                    <ul class="benefits-list">
                        <li>Alta concentração de proteínas</li>
                        <li>Rápida absorção</li>
                        <li>Auxilia no ganho de massa muscular</li>
                        <li>Melhora a recuperação pós-treino</li>
                        <li>Rico em aminoácidos essenciais</li>
                    </ul>
                `;
                break;
            case "reviews":
                document.getElementById("product-reviews").innerHTML = `
                    <h4>Avaliações dos Clientes</h4>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">João Silva</span>
                            <div class="review-stars">${renderStars(5)}</div>
                        </div>
                        <p class="review-text">Excelente produto! Sabor muito bom e qualidade excepcional.</p>
                    </div>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">Maria Santos</span>
                            <div class="review-stars">${renderStars(4)}</div>
                        </div>
                        <p class="review-text">Produto de ótima qualidade, recomendo!</p>
                    </div>
                `;
                break;
        }
    }

    // Adicionar ao carrinho
    function setupAddToCart() {
        document.querySelector(".add-to-cart-btn").addEventListener("click", function () {
            if (produto.stockQuantity === 0) {
                alert("Produto fora de estoque!");
                return;
            }

            const quantity = parseInt(document.querySelector(".quantity-input").value);
            const flavorSelect = document.getElementById("flavor-options");
            let flavor = "Sem sabor"; // Default if no dropdown or "SemSabor"
            if (flavorSelect && flavorSelect.value) {
                flavor = FLAVOR_ENUM_TO_STRING[parseInt(flavorSelect.value)]; // Get the string name
            } else if (document.getElementById("flavor-options-container").style.display === "none") {
                // If flavor options container is hidden, it means it's "SemSabor"
                flavor = "Sem sabor";
            } else {
                // If dropdown is visible but no option selected
                alert("Por favor, selecione um sabor!");
                return;
            }

            const size = document.querySelector(".size-select")?.value || "Padrão";

            alert(`Produto adicionado ao carrinho!\nQuantidade: ${quantity}\nSabor: ${flavor}\nTamanho: ${size}`);
        });
    }

    // Wishlist
    // function setupWishlist() {
    //     document.querySelector(".wishlist-btn").addEventListener("click", function () {
    //         const icon = this.querySelector("i");
    //         icon.classList.toggle("far");
    //         icon.classList.toggle("fas");
    //         alert(icon.classList.contains("fas") ? "Produto adicionado aos favoritos!" : "Produto removido dos favoritos!");
    //     });
    // }

    // Cálculo de Frete
    function setupShippingCalculator() {
        const shippingBtn = document.querySelector(".shipping-btn");
        shippingBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const cep = document.querySelector(".shipping-input").value.trim();
            if (cep && cep.length === 8) {
                alert(`Calculando frete para o CEP: ${cep}\nFrete: R$15,90\nPrazo: 3-5 dias úteis`);
            } else {
                alert("Por favor, digite um CEP válido (8 dígitos).");
            }
        });
    }

    // Função para buscar produtos relacionados
    async function fetchRelatedProducts() {
        const categoria = produto.attributes && 
        produto.attributes[0] ? produto.attributes[0].category : null;        

        console.log("Categoria do produto atual:", categoria);
        console.log("ID do produto atual:", produto.id);

        try {
            const queryParams = new URLSearchParams();
            queryParams.append("isActive", "true");
            queryParams.append("pageNumber", "1");
            queryParams.append("pageSize", "8"); // Aumentar para garantir que temos produtos suficientes
            if (categoria) {
                queryParams.append("CategoryIds", categoria);
            }

            const url = `${API_BASE_URL}/Product/get?${queryParams.toString()}`;
            console.log("URL da requisição:", url);

            const response = await fetch(url);
            const data = await response.json();
            
            console.log("Resposta da API:", data);

            if (data && data.hasSuccess && data.value && data.value.products) {
                console.log("Produtos encontrados:", data.value.products.length);
                console.log("Produtos:", data.value.products);
                
                // Filtrar o produto atual da lista e retornar apenas produtos diferentes
                const filteredProducts = data.value.products.filter(p => p.id !== produto.id);
                //const filteredProducts = data.value.products;
                console.log("Produtos após filtro:", filteredProducts.length);
                console.log("Produtos filtrados:", filteredProducts);
                
                return filteredProducts.slice(0, 4);
            }
        } catch (error) {
            console.error("Erro ao buscar produtos relacionados:", error);
        }
        return [];
    }

    // Função para renderizar produtos relacionados
    async function renderRelatedProducts() {
        console.log("Iniciando renderização de produtos relacionados...");
        
        const relatedProducts = await fetchRelatedProducts();
        
        console.log("Produtos relacionados retornados:", relatedProducts);
        console.log("Quantidade de produtos relacionados:", relatedProducts.length);
        
        if (relatedProducts.length === 0) {
            console.log("Nenhum produto relacionado encontrado");
            return;
        }

        // Criar a div de produtos relacionados
        const relatedSection = document.createElement("div");
        relatedSection.className = "related-products-section";
        relatedSection.innerHTML = `
            <h2 class="product-content">Para comprar com esse produto</h2>
            <div class="products-grid" id="products-grid">
                <!-- Produtos serão inseridos aqui -->
            </div>
        `;

        // Inserir após as tabs
        const tabsContainer = document.querySelector(".product-tabs");
        if (tabsContainer) {
            tabsContainer.insertAdjacentElement("afterend", relatedSection);
        } else {
            console.error("Container .product-tabs não encontrado");
            return;
        }

        // Renderizar cada produto relacionado
        const grid = document.getElementById("products-grid");
        console.log("Grid container:", grid);
        
        relatedProducts.forEach((product, index) => {
            console.log(`Renderizando produto ${index + 1}:`, product);
            
            const productCard = document.createElement("div");
            // Fix: Use the correct product variable and check if price exists
            const priceDisplay = product.price && typeof product.price === 'number' 
                ? `R$ ${product.price.toFixed(2)}` 
                : 'Preço não disponível';
            
            productCard.className = "related-product-card";
            productCard.innerHTML = `
                <div class="relative">
                    <img src="${product.imageUrl || "https://via.placeholder.com/200x200"}" alt="${product.name || 'Produto sem nome'}">
                </div>
                <div class="related-product-info">
                    <h3 class="related-product-name">${product.name || 'Produto sem nome'}</h3>
                    <div class="related-product-price">${priceDisplay}</div>
                    <button class="related-product-btn" onclick="window.location.href='product-detail.html?id=${product.id}'">
                        Ver Produto
                    </button>
                </div>
            `;
            
            console.log("Card HTML:", productCard.outerHTML);
            grid.appendChild(productCard);
        });
        
        console.log("Grid final:", grid.innerHTML);
        console.log("Produtos renderizados com sucesso!");
    }

    // Chamar funções principais
    renderProduct(produto);
    setupQuantityControls();
    setupTabs();
    setupAddToCart();
    //setupWishlist();
    setupShippingCalculator();
    renderRelatedProducts(); // Chamar a função para renderizar produtos relacionados
});