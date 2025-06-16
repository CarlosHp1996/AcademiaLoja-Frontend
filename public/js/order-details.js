// Elementos do DOM
const printOrderBtn = document.getElementById('printOrder');
const logoutBtn = document.getElementById('logoutBtn');
const trackingLink = document.querySelector('.tracking-link');

// Obter ID do pedido da URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

// Função para carregar os detalhes do pedido
async function loadOrderDetails() {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao carregar detalhes do pedido');
        }

        renderOrderDetails(data);
    } catch (error) {
        showError('Erro ao carregar detalhes do pedido. Por favor, tente novamente.');
        console.error('Erro:', error);
    }
}

// Função para renderizar os detalhes do pedido
function renderOrderDetails(order) {
    // Atualizar título e subtítulo
    document.querySelector('.profile-title').textContent = `Detalhes do Pedido #${order.number}`;
    document.querySelector('.profile-subtitle').textContent = `Realizado em ${formatDate(order.date)}`;

    // Atualizar timeline
    updateTimeline(order.timeline);

    // Atualizar informações de entrega
    updateDeliveryInfo(order.delivery);

    // Atualizar lista de produtos
    updateProductsList(order.items);

    // Atualizar resumo do pedido
    updateOrderSummary(order.summary);

    // Atualizar informações de pagamento
    updatePaymentInfo(order.payment);

    // Atualizar link de rastreamento
    if (order.tracking) {
        trackingLink.href = order.tracking.url;
        trackingLink.textContent = order.tracking.code;
    }
}

// Função para atualizar a timeline
function updateTimeline(timeline) {
    const timelineContainer = document.querySelector('.order-timeline');
    timelineContainer.innerHTML = timeline.map(item => `
        <div class="timeline-item ${item.status}">
            <div class="timeline-icon">
                <i class="fas ${getTimelineIcon(item.type)}"></i>
            </div>
            <div class="timeline-content">
                <h3>${item.title}</h3>
                <p>${formatDateTime(item.date)}</p>
            </div>
        </div>
    `).join('');
}

// Função para atualizar informações de entrega
function updateDeliveryInfo(delivery) {
    const deliveryInfo = document.querySelector('.delivery-info');
    deliveryInfo.innerHTML = `
        <div class="info-group">
            <h3>Endereço de Entrega</h3>
            <p>${delivery.name}</p>
            <p>${delivery.street}, ${delivery.number}</p>
            <p>${delivery.neighborhood}</p>
            <p>${delivery.city} - ${delivery.state}</p>
            <p>CEP: ${delivery.zipCode}</p>
        </div>
        <div class="info-group">
            <h3>Transportadora</h3>
            <p>${delivery.carrier}</p>
            <p>Rastreio: <a href="${delivery.tracking.url}" class="tracking-link">${delivery.tracking.code}</a></p>
            <p>Prazo de Entrega: ${delivery.estimatedDelivery}</p>
        </div>
    `;
}

// Função para atualizar lista de produtos
function updateProductsList(items) {
    const productsList = document.querySelector('.products-list');
    productsList.innerHTML = items.map(item => `
        <div class="product-item">
            <div class="product-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="product-details">
                <h3>${item.name}</h3>
                <p class="product-variant">${item.variant}</p>
                <div class="product-price">
                    <span class="quantity">${item.quantity}x</span>
                    <span class="price">R$ ${formatPrice(item.price)}</span>
                </div>
            </div>
            <div class="product-total">
                <span>R$ ${formatPrice(item.total)}</span>
            </div>
        </div>
    `).join('');
}

// Função para atualizar resumo do pedido
function updateOrderSummary(summary) {
    const orderSummary = document.querySelector('.order-summary');
    orderSummary.innerHTML = `
        <div class="summary-row">
            <span>Subtotal</span>
            <span>R$ ${formatPrice(summary.subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Frete</span>
            <span>R$ ${formatPrice(summary.shipping)}</span>
        </div>
        <div class="summary-row">
            <span>Desconto</span>
            <span>- R$ ${formatPrice(summary.discount)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>R$ ${formatPrice(summary.total)}</span>
        </div>
    `;
}

// Função para atualizar informações de pagamento
function updatePaymentInfo(payment) {
    const paymentInfo = document.querySelector('.payment-info');
    paymentInfo.innerHTML = `
        <div class="info-group">
            <h3>Método de Pagamento</h3>
            <p>${payment.method}</p>
            <p>${payment.card} - Final ${payment.lastDigits}</p>
            <p>Parcelado em ${payment.installments}x</p>
        </div>
        <div class="info-group">
            <h3>Status do Pagamento</h3>
            <p class="status ${payment.status.toLowerCase()}">${getPaymentStatusText(payment.status)}</p>
            <p>Data: ${formatDate(payment.date)}</p>
        </div>
    `;
}

// Função para obter ícone da timeline
function getTimelineIcon(type) {
    const icons = {
        'CONFIRMED': 'fa-check-circle',
        'PROCESSING': 'fa-box',
        'SHIPPED': 'fa-truck',
        'DELIVERING': 'fa-map-marker-alt',
        'DELIVERED': 'fa-home'
    };
    return icons[type] || 'fa-question-circle';
}

// Função para obter texto do status de pagamento
function getPaymentStatusText(status) {
    const texts = {
        'PAID': 'Pago',
        'PENDING': 'Pendente',
        'CANCELLED': 'Cancelado',
        'REFUNDED': 'Reembolsado'
    };
    return texts[status] || status;
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para formatar data e hora
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para formatar preço
function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

// Função para mostrar mensagem de erro
function showError(message) {
    // Implementar lógica de exibição de erro (toast, alert, etc.)
    alert(message);
}

// Event Listeners
printOrderBtn.addEventListener('click', () => {
    window.print();
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

// Carregar detalhes do pedido ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    if (orderId) {
        loadOrderDetails();
    } else {
        showError('ID do pedido não fornecido');
        window.location.href = '/public/html/dashboard.html';
    }
}); 