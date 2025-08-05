document.addEventListener('DOMContentLoaded', () => {
    initializeCustomCombo();
});

function initializeCustomCombo() {
    // Inicializa os filtros
    initializeFilters();
    
    // Inicializa os cards de produtos
    initializeProductCards();
    
    // Inicializa o resumo do combo
    initializeComboSummary();
}

// Gerenciamento de filtros
function initializeFilters() {
    const categoryFilter = document.querySelector('.category-filter');
    const brandFilter = document.querySelector('.brand-filter');
    
    categoryFilter.addEventListener('change', filterProducts);
    brandFilter.addEventListener('change', filterProducts);
}

function filterProducts() {
    const selectedCategory = document.querySelector('.category-filter').value;
    const selectedBrand = document.querySelector('.brand-filter').value;
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const category = card.dataset.category;
        const brand = card.dataset.brand;
        
        const categoryMatch = !selectedCategory || category === selectedCategory;
        const brandMatch = !selectedBrand || brand === selectedBrand;
        
        card.style.display = categoryMatch && brandMatch ? 'block' : 'none';
    });
}

// Gerenciamento de produtos
function initializeProductCards() {
    const addToComboButtons = document.querySelectorAll('.add-to-combo');
    
    addToComboButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            addProductToCombo(productCard);
        });
    });
}

function addProductToCombo(productCard) {
    const productInfo = {
        id: productCard.dataset.id || generateProductId(),
        name: productCard.querySelector('h3').textContent,
        brand: productCard.querySelector('.product-brand').textContent,
        price: parseFloat(productCard.querySelector('.product-price').textContent.replace('R$ ', '').replace(',', '.')),
        image: productCard.querySelector('.product-image img').src
    };
    
    updateComboSummary(productInfo);
}

function generateProductId() {
    return 'prod_' + Math.random().toString(36).substr(2, 9);
}

// Gerenciamento do resumo do combo
function initializeComboSummary() {
    const selectedProducts = [];
    const productCount = document.querySelector('.product-count');
    const discountValue = document.querySelector('.discount-value');
    const originalTotal = document.querySelector('.original-total');
    const discountTotal = document.querySelector('.discount-total');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    window.updateComboSummary = function(productInfo) {
        // Verifica se o produto já está no combo
        const existingProductIndex = selectedProducts.findIndex(p => p.id === productInfo.id);
        
        if (existingProductIndex === -1) {
            selectedProducts.push(productInfo);
            addProductToSummary(productInfo);
        } else {
            showNotification('Este produto já está no seu combo!', 'warning');
        }
        
        updateComboTotals();
    };
    
    function addProductToSummary(product) {
        const selectedProductsContainer = document.querySelector('.selected-products');
        
        const productElement = document.createElement('div');
        productElement.className = 'selected-product';
        productElement.dataset.productId = product.id;
        
        productElement.innerHTML = `
            <div class="selected-product-content">
                <img src="${product.image}" alt="${product.name}">
                <div class="selected-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.brand}</p>
                    <p class="selected-product-price">R$ ${product.price.toFixed(2)}</p>
                </div>
                <button class="remove-product" data-product-id="${product.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        selectedProductsContainer.appendChild(productElement);
        
        // Adiciona evento para remover produto
        const removeButton = productElement.querySelector('.remove-product');
        removeButton.addEventListener('click', () => {
            removeProductFromCombo(product.id);
        });
    }
    
    function removeProductFromCombo(productId) {
        const index = selectedProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            selectedProducts.splice(index, 1);
            
            const productElement = document.querySelector(`.selected-product[data-product-id="${productId}"]`);
            if (productElement) {
                productElement.remove();
            }
            
            updateComboTotals();
        }
    }
    
    function updateComboTotals() {
        const totalProducts = selectedProducts.length;
        productCount.textContent = `${totalProducts} ${totalProducts === 1 ? 'produto' : 'produtos'}`;
        
        const subtotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);
        const discount = calculateDiscount(totalProducts);
        const total = subtotal * (1 - discount / 100);
        
        discountValue.textContent = `${discount}%`;
        originalTotal.textContent = `Total: R$ ${subtotal.toFixed(2)}`;
        discountTotal.textContent = `Com desconto: R$ ${total.toFixed(2)}`;
        
        checkoutBtn.disabled = totalProducts === 0;
    }
    
    function calculateDiscount(productCount) {
        if (productCount >= 5) return 20;
        if (productCount === 4) return 15;
        if (productCount === 3) return 10;
        if (productCount === 2) return 5;
        return 0;
    }
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Adiciona animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove a notificação após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Adiciona estilos para notificações
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 4px;
        color: #fff;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .notification.info {
        background-color: #3498db;
    }
    
    .notification.warning {
        background-color: #f1c40f;
    }
    
    .notification.success {
        background-color: #2ecc71;
    }
    
    .notification.error {
        background-color: #e74c3c;
    }
    
    .selected-product {
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .selected-product-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .selected-product img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .selected-product-info {
        flex: 1;
    }
    
    .selected-product-info h4 {
        margin: 0;
        font-size: 1rem;
    }
    
    .selected-product-info p {
        margin: 0.25rem 0;
        color: #666;
    }
    
    .selected-product-price {
        font-weight: bold;
        color: #2ecc71;
    }
    
    .remove-product {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        padding: 0.5rem;
        transition: transform 0.2s ease;
    }
    
    .remove-product:hover {
        transform: scale(1.1);
    }
`;

document.head.appendChild(style); 