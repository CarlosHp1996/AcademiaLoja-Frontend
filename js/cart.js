document.addEventListener('DOMContentLoaded', function() {
    // Cart data
    const cartItems = [
        {
            id: 1,
            name: "Whey Protein Isolate Premium 900g",
            price: "149,90",
            image: "https://lojamaxtitanium.vtexassets.com/arquivos/ids/157689/whey-pro-max-titanium-1kg-baunilha-1.jpg?v=638351517362370000",
            quantity: 1,
            flavor: "Chocolate",
            size: "900g",
        },
        {
            id: 2,
            name: "Creatina Monohidratada 300g",
            price: "89,90",
            image: "https://meumundofit.com.br/wp-content/uploads/creatina-monohidratada-150g-black-skull.jpg",
            quantity: 2,
            flavor: "Sem Sabor",
            size: "300g",
        }
    ];

    // Calculate totals
    function calculateTotals() {
        const subtotal = cartItems.reduce((total, item) => {
            return total + Number.parseFloat(item.price.replace(",", ".")) * item.quantity;
        }, 0);

        const shipping = 19.9;
        const discount = 20.0;
        const total = subtotal + shipping - discount;

        return { subtotal, shipping, discount, total };
    }

    // Update cart count
    function updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Render cart
    function renderCart() {
        const cartContent = document.getElementById('cart-content');
        const totals = calculateTotals();
        
        if (cartItems.length === 0) {
            // Render empty cart
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h2 class="empty-cart-title">Seu carrinho está vazio</h2>
                    <p class="empty-cart-text">Adicione produtos ao seu carrinho para continuar comprando.</p>
                    <a href="/" class="explore-btn">Explorar Produtos</a>
                </div>
            `;
        } else {
            // Render cart with items
            cartContent.innerHTML = `
                <div class="cart-grid">
                    <!-- Cart Items -->
                    <div class="cart-items-section">
                        <div class="cart-items-container">
                            <div class="cart-items-header">
                                <h2 class="cart-items-title">
                                    Itens do Carrinho (${cartItems.reduce((total, item) => total + item.quantity, 0)})
                                </h2>
                                <button class="clear-cart-btn" id="clear-cart">Limpar Carrinho</button>
                            </div>
                            <div class="cart-items-list">                           
${cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" style="object-fit: cover; width: 100%; height: 100%;">
        </div>
        <div class="cart-item-details">
            <div class="cart-item-header">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">R$${item.price}</div>
            </div>
            <div class="cart-item-meta">
                <p>Sabor: ${item.flavor}</p>
                <p>Tamanho: ${item.size}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                    <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
                    <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                    Remover
                </button>
            </div>
        </div>
    </div>
`).join('')}
                            </div>
                        </div>
                        
                        <div class="cart-actions">
                            <a href="/" class="continue-shopping">
                                <i class="fas fa-arrow-left"></i>
                                Continuar Comprando
                            </a>
                            <div class="coupon-form">
                                <input type="text" placeholder="Código de cupom" class="coupon-input">
                                <button class="apply-btn">Aplicar</button>
                            </div>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="order-summary">
                        <h2 class="summary-title">Resumo do Pedido</h2>
                        
                        <div class="summary-items">
                            <div class="summary-item">
                                <span class="summary-label">Subtotal</span>
                                <span class="summary-value">R$${totals.subtotal.toFixed(2).replace(".", ",")}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Frete</span>
                                <span class="summary-value">R$${totals.shipping.toFixed(2).replace(".", ",")}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Desconto</span>
                                <span class="summary-value discount">-R$${totals.discount.toFixed(2).replace(".", ",")}</span>
                            </div>
                            
                            <div class="summary-separator"></div>
                            
                            <div class="summary-total">
                                <span>Total</span>
                                <span class="summary-total-value">R$${totals.total.toFixed(2).replace(".", ",")}</span>
                            </div>
                            <div class="summary-installments">
                                ou 12x de R$${(totals.total / 12).toFixed(2).replace(".", ",")}
                            </div>
                        </div>
                        
                        <button class="checkout-btn">
                            Finalizar Compra
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        
                        <div class="summary-features">
                            <div class="summary-feature">
                                <i class="fas fa-credit-card"></i>
                                <span>Pagamento 100% seguro</span>
                            </div>
                            <div class="summary-feature">
                                <i class="fas fa-truck"></i>
                                <span>Entrega para todo Brasil</span>
                            </div>
                        </div>
                        
                        <div class="payment-methods">
                            <h3 class="payment-title">Formas de Pagamento</h3>
                            <div class="payment-icons">
                                <div class="payment-icon"></div>
                                <div class="payment-icon"></div>
                                <div class="payment-icon"></div>
                                <div class="payment-icon"></div>
                                <div class="payment-icon"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add event listeners after rendering
        addEventListeners();
    }
    
    // Add event listeners
    function addEventListeners() {
        // Quantity decrease buttons
        const decreaseButtons = document.querySelectorAll('.decrease-btn');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const item = cartItems.find(item => item.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                    updateCartCount();
                    renderCart();
                }
            });
        });
        
        // Quantity increase buttons
        const increaseButtons = document.querySelectorAll('.increase-btn');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const item = cartItems.find(item => item.id === id);
                if (item) {
                    item.quantity++;
                    updateCartCount();
                    renderCart();
                }
            });
        });
        
        // Quantity input fields
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const item = cartItems.find(item => item.id === id);
                if (item) {
                    const newQuantity = parseInt(this.value);
                    if (newQuantity > 0) {
                        item.quantity = newQuantity;
                    } else {
                        this.value = item.quantity;
                    }
                    updateCartCount();
                    renderCart();
                }
            });
        });
        
        // Remove item buttons
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const itemIndex = cartItems.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    cartItems.splice(itemIndex, 1);
                    updateCartCount();
                    renderCart();
                }
            });
        });
        
        // Clear cart button
        const clearCartButton = document.getElementById('clear-cart');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                    cartItems.length = 0;
                    updateCartCount();
                    renderCart();
                }
            });
        }
        
        // Apply coupon button
        const applyButton = document.querySelector('.apply-btn');
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const couponInput = document.querySelector('.coupon-input');
                if (couponInput.value.trim() !== '') {
                    alert('Cupom aplicado com sucesso!');
                    couponInput.value = '';
                } else {
                    alert('Por favor, insira um código de cupom válido.');
                }
            });
        }
        
        // Checkout button
        const checkoutButton = document.querySelector('.checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                alert('Redirecionando para o checkout...');
                // Here you would redirect to the checkout page
            });
        }
    }
    
    // Initialize cart
    updateCartCount();
    renderCart();
});