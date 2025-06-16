// Elementos do DOM
const notifyDeliveryBtn = document.getElementById('notifyDelivery');
const contactSupportBtn = document.getElementById('contactSupport');
const logoutBtn = document.getElementById('logoutBtn');

// Obter o ID do pedido da URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

// Função para carregar os detalhes do rastreamento
async function loadTrackingDetails() {
    try {
        // Aqui você faria uma chamada para sua API
        // const response = await fetch(`/api/orders/${orderId}/tracking`);
        // const trackingData = await response.json();

        // Por enquanto, vamos usar dados mockados
        const trackingData = {
            orderId: '12345',
            trackingCode: 'BR123456789BR',
            status: 'shipping',
            estimatedDelivery: '2023-05-17',
            currentLocation: 'São Paulo - SP',
            steps: [
                {
                    status: 'confirmed',
                    date: '2023-05-15',
                    time: '14:30',
                    description: 'Objeto postado após o horário limite da unidade',
                    location: 'São Paulo - SP'
                },
                {
                    status: 'processing',
                    date: '2023-05-15',
                    time: '16:45',
                    description: 'Objeto em trânsito - por unidade de logística integrada',
                    location: 'São Paulo - SP'
                },
                {
                    status: 'shipping',
                    date: '2023-05-16',
                    time: '07:30',
                    description: 'Objeto recebido na unidade de distribuição',
                    location: 'São Paulo - SP'
                },
                {
                    status: 'shipping',
                    date: '2023-05-16',
                    time: '09:15',
                    description: 'Objeto saiu para entrega ao destinatário',
                    location: 'São Paulo - SP'
                }
            ],
            deliveryInfo: {
                recipient: 'Carlos Henrique',
                address: 'Rua das Flores, 123',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567'
            },
            shippingInfo: {
                carrier: 'Correios',
                service: 'PAC',
                estimatedDays: '3-5'
            }
        };

        renderTrackingDetails(trackingData);
    } catch (error) {
        showError('Erro ao carregar informações de rastreamento');
        console.error('Erro:', error);
    }
}

// Função para renderizar os detalhes do rastreamento
function renderTrackingDetails(data) {
    // Atualizar título e código de rastreio
    document.querySelector('.profile-title').textContent = `Rastreamento do Pedido #${data.orderId}`;
    document.querySelector('.profile-subtitle').textContent = `Código de Rastreio: ${data.trackingCode}`;

    // Atualizar status atual
    updateTrackingStatus(data);

    // Atualizar barra de progresso
    updateProgressBar(data);

    // Atualizar timeline
    updateTimeline(data.steps);

    // Atualizar informações de entrega
    updateDeliveryInfo(data.deliveryInfo, data.shippingInfo);
}

// Função para atualizar o status do rastreamento
function updateTrackingStatus(data) {
    const statusIcon = document.querySelector('.status-icon i');
    const statusTitle = document.querySelector('.status-info h2');
    const statusDate = document.querySelector('.status-info p');

    // Definir ícone e texto baseado no status
    switch (data.status) {
        case 'confirmed':
            statusIcon.className = 'fas fa-check-circle';
            statusTitle.textContent = 'Pedido Confirmado';
            break;
        case 'processing':
            statusIcon.className = 'fas fa-box';
            statusTitle.textContent = 'Em Processamento';
            break;
        case 'shipping':
            statusIcon.className = 'fas fa-truck';
            statusTitle.textContent = 'Em Transporte';
            break;
        case 'delivered':
            statusIcon.className = 'fas fa-home';
            statusTitle.textContent = 'Entregue';
            break;
        default:
            statusIcon.className = 'fas fa-question-circle';
            statusTitle.textContent = 'Status Desconhecido';
    }

    statusDate.textContent = `Previsão de Entrega: ${formatDate(data.estimatedDelivery)}`;
}

// Função para atualizar a barra de progresso
function updateProgressBar(data) {
    const progress = document.querySelector('.progress');
    const steps = document.querySelectorAll('.step');

    // Calcular progresso baseado no status
    let progressPercentage = 0;
    switch (data.status) {
        case 'confirmed':
            progressPercentage = 25;
            break;
        case 'processing':
            progressPercentage = 50;
            break;
        case 'shipping':
            progressPercentage = 75;
            break;
        case 'delivered':
            progressPercentage = 100;
            break;
    }

    progress.style.width = `${progressPercentage}%`;

    // Atualizar estados dos passos
    steps.forEach((step, index) => {
        step.classList.remove('completed', 'active');
        if (index < progressPercentage / 25) {
            step.classList.add('completed');
        } else if (index === progressPercentage / 25) {
            step.classList.add('active');
        }
    });
}

// Função para atualizar a timeline
function updateTimeline(steps) {
    const timeline = document.querySelector('.tracking-timeline');
    timeline.innerHTML = '';

    steps.forEach(step => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-date">
                <span class="date">${formatDate(step.date)}</span>
                <span class="time">${step.time}</span>
            </div>
            <div class="timeline-content">
                <h3>${step.description}</h3>
                <p class="location">${step.location}</p>
            </div>
        `;
        timeline.appendChild(timelineItem);
    });
}

// Função para atualizar informações de entrega
function updateDeliveryInfo(deliveryInfo, shippingInfo) {
    const deliveryInfoElement = document.querySelector('.delivery-info');
    deliveryInfoElement.innerHTML = `
        <div class="info-group">
            <h3>Endereço de Entrega</h3>
            <p>${deliveryInfo.recipient}</p>
            <p>${deliveryInfo.address}</p>
            <p>Bairro: ${deliveryInfo.neighborhood}</p>
            <p>${deliveryInfo.city} - ${deliveryInfo.state}</p>
            <p>CEP: ${deliveryInfo.zipCode}</p>
        </div>
        <div class="info-group">
            <h3>Transportadora</h3>
            <p>${shippingInfo.carrier}</p>
            <p>Serviço: ${shippingInfo.service}</p>
            <p>Prazo de Entrega: ${shippingInfo.estimatedDays} dias úteis</p>
        </div>
    `;
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para mostrar mensagens de erro
function showError(message) {
    // Implementar lógica de exibição de erro
    console.error(message);
}

// Event Listeners
notifyDeliveryBtn.addEventListener('click', () => {
    // Implementar lógica de notificação
    alert('Você será notificado quando o pedido chegar!');
});

contactSupportBtn.addEventListener('click', () => {
    // Implementar lógica de contato com suporte
    window.location.href = '/public/html/support.html';
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Implementar lógica de logout
    window.location.href = '/public/html/login.html';
});

// Carregar detalhes do rastreamento quando a página carregar
document.addEventListener('DOMContentLoaded', loadTrackingDetails); 