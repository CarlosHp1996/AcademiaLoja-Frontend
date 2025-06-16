// Elementos do DOM
const orderSearch = document.getElementById('orderSearch');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const applyFiltersBtn = document.getElementById('applyFilters');
const ordersContainer = document.querySelector('.orders-container');
const paginationPages = document.querySelectorAll('.pagination-page');
const prevPageBtn = document.querySelector('.pagination-btn:first-child');
const nextPageBtn = document.querySelector('.pagination-btn:last-child');
const logoutBtn = document.getElementById('logoutBtn');

// Estado da aplicação
let currentPage = 1;
let currentFilters = {
    search: '',
    status: 'all',
    date: 'all'
};

// Função para carregar os pedidos
async function loadOrders(page = 1, filters = currentFilters) {
    try {
        // Simulação de chamada à API
        const response = await fetch(`/api/orders?page=${page}&search=${filters.search}&status=${filters.status}&date=${filters.date}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao carregar pedidos');
        }

        renderOrders(data.orders);
        updatePagination(data.totalPages, page);
    } catch (error) {
        showError('Erro ao carregar pedidos. Por favor, tente novamente.');
        console.error('Erro:', error);
    }
}

// Função para renderizar os pedidos
function renderOrders(orders) {
    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3 class="order-number">Pedido #${order.number}</h3>
                    <span class="order-date">${formatDate(order.date)}</span>
                </div>
                <div class="order-status ${order.status.toLowerCase()}">
                    <i class="fas ${getStatusIcon(order.status)}"></i>
                    ${getStatusText(order.status)}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-details">
                            <h4 class="item-name">${item.name}</h4>
                            <p class="item-variant">${item.variant}</p>
                            <p class="item-quantity">Quantidade: ${item.quantity}</p>
                        </div>
                        <div class="item-price">
                            <span class="price">R$ ${formatPrice(item.price)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <span>Total:</span>
                    <strong>R$ ${formatPrice(order.total)}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline" onclick="viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                        Ver Detalhes
                    </button>
                    ${getActionButton(order)}
                </div>
            </div>
        </div>
    `).join('');
}

// Função para atualizar a paginação
function updatePagination(totalPages, currentPage) {
    // Atualizar estado dos botões de navegação
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Atualizar páginas
    paginationPages.forEach((pageBtn, index) => {
        const pageNumber = index + 1;
        pageBtn.classList.toggle('active', pageNumber === currentPage);
        pageBtn.textContent = pageNumber;
    });
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para formatar preço
function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

// Função para obter ícone do status
function getStatusIcon(status) {
    const icons = {
        'PENDING': 'fa-clock',
        'PROCESSING': 'fa-box',
        'SHIPPED': 'fa-truck',
        'DELIVERED': 'fa-check-circle',
        'CANCELLED': 'fa-times-circle'
    };
    return icons[status] || 'fa-question-circle';
}

// Função para obter texto do status
function getStatusText(status) {
    const texts = {
        'PENDING': 'Pendente de Pagamento',
        'PROCESSING': 'Em Processamento',
        'SHIPPED': 'Em Transporte',
        'DELIVERED': 'Entregue',
        'CANCELLED': 'Cancelado'
    };
    return texts[status] || status;
}

// Função para obter botão de ação baseado no status
function getActionButton(order) {
    const actions = {
        'PENDING': `
            <button class="btn btn-primary" onclick="finishPayment('${order.id}')">
                <i class="fas fa-credit-card"></i>
                Finalizar Pagamento
            </button>
        `,
        'PROCESSING': `
            <button class="btn btn-primary" onclick="trackOrder('${order.id}')">
                <i class="fas fa-box"></i>
                Acompanhar
            </button>
        `,
        'SHIPPED': `
            <button class="btn btn-primary" onclick="trackOrder('${order.id}')">
                <i class="fas fa-truck"></i>
                Rastrear Pedido
            </button>
        `,
        'DELIVERED': `
            <button class="btn btn-primary" onclick="buyAgain('${order.id}')">
                <i class="fas fa-shopping-cart"></i>
                Comprar Novamente
            </button>
        `,
        'CANCELLED': `
            <button class="btn btn-primary" onclick="contactSupport('${order.id}')">
                <i class="fas fa-headset"></i>
                Falar com Atendente
            </button>
        `
    };
    return actions[order.status] || '';
}

// Função para mostrar mensagem de erro
function showError(message) {
    // Implementar lógica de exibição de erro (toast, alert, etc.)
    alert(message);
}

// Event Listeners
orderSearch.addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
});

statusFilter.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
});

dateFilter.addEventListener('change', (e) => {
    currentFilters.date = e.target.value;
});

applyFiltersBtn.addEventListener('click', () => {
    currentPage = 1;
    loadOrders(currentPage, currentFilters);
});

paginationPages.forEach((pageBtn, index) => {
    pageBtn.addEventListener('click', () => {
        currentPage = index + 1;
        loadOrders(currentPage, currentFilters);
    });
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadOrders(currentPage, currentFilters);
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    loadOrders(currentPage, currentFilters);
});

logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/public/html/login.html';
        } else {
            throw new Error('Erro ao fazer logout');
        }
    } catch (error) {
        showError('Erro ao fazer logout. Por favor, tente novamente.');
        console.error('Erro:', error);
    }
});

// Funções de ação dos pedidos
async function viewOrderDetails(orderId) {
    window.location.href = `/public/html/order-details.html?id=${orderId}`;
}

async function finishPayment(orderId) {
    window.location.href = `/public/html/payment.html?order=${orderId}`;
}

async function trackOrder(orderId) {
    window.location.href = `/public/html/tracking.html?order=${orderId}`;
}

async function buyAgain(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/buy-again`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/public/html/cart.html';
        } else {
            throw new Error('Erro ao adicionar produtos ao carrinho');
        }
    } catch (error) {
        showError('Erro ao adicionar produtos ao carrinho. Por favor, tente novamente.');
        console.error('Erro:', error);
    }
}

async function contactSupport(orderId) {
    window.location.href = `/public/html/support.html?order=${orderId}`;
}

// Carregar pedidos ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
}); 