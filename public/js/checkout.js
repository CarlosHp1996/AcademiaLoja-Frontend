document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentForms = document.querySelectorAll('.payment-form');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvcInput = document.getElementById('card-cvc');
    const debitCardNumberInput = document.getElementById('debit-card-number');
    const debitCardExpiryInput = document.getElementById('debit-card-expiry');
    const debitCardCvcInput = document.getElementById('debit-card-cvc');
    const copyPixBtn = document.getElementById('copy-pix');
    const completePurchaseBtn = document.getElementById('complete-purchase');
    
    // Inicializar Stripe
    let stripe;
    try {
        stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    } catch (error) {
        console.log('Stripe não inicializado: ', error);
    }
    
    // Inicializar eventos
    function initEvents() {
        // Alternar entre métodos de pagamento
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const method = this.getAttribute('data-method');
                
                // Remover classe ativa de todas as abas e formulários
                paymentTabs.forEach(t => t.classList.remove('active'));
                paymentForms.forEach(f => f.classList.remove('active'));
                
                // Adicionar classe ativa à aba clicada e ao formulário correspondente
                this.classList.add('active');
                document.getElementById(`${method}-form`).classList.add('active');
            });
        });
        
        // Formatar número do cartão
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function() {
                this.value = formatCardNumber(this.value);
            });
        }
        
        if (debitCardNumberInput) {
            debitCardNumberInput.addEventListener('input', function() {
                this.value = formatCardNumber(this.value);
            });
        }
        
        // Formatar data de validade
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', function() {
                this.value = formatCardExpiry(this.value);
            });
        }
        
        if (debitCardExpiryInput) {
            debitCardExpiryInput.addEventListener('input', function() {
                this.value = formatCardExpiry(this.value);
            });
        }
        
        // Limitar CVC a números
        if (cardCvcInput) {
            cardCvcInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
            });
        }
        
        if (debitCardCvcInput) {
            debitCardCvcInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
            });
        }
        
        // Copiar código PIX
        if (copyPixBtn) {
            copyPixBtn.addEventListener('click', function() {
                const pixCode = this.previousElementSibling;
                pixCode.select();
                document.execCommand('copy');
                
                showNotification('Código PIX copiado!', 'success');
            });
        }
        
        // Finalizar compra
        if (completePurchaseBtn) {
            completePurchaseBtn.addEventListener('click', function() {
                // Verificar qual método de pagamento está ativo
                const activeMethod = document.querySelector('.payment-tab.active').getAttribute('data-method');
                
                // Validar campos de acordo com o método
                let isValid = false;
                
                switch(activeMethod) {
                    case 'credit-card':
                        isValid = validateCreditCardForm();
                        break;
                    case 'debit-card':
                        isValid = validateDebitCardForm();
                        break;
                    case 'pix':
                        isValid = true; // PIX não precisa de validação adicional
                        break;
                }
                
                if (isValid) {
                    // Simulação de processamento de pagamento
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
                    
                    setTimeout(() => {
                        // Simulação de sucesso
                        showNotification('Pagamento processado com sucesso! Redirecionando...', 'success');
                        
                        // Redirecionar para página de confirmação após alguns segundos
                        setTimeout(() => {
                            window.location.href = '/public/html/order-confirmation.html';
                        }, 2000);
                    }, 3000);
                }
            });
        }
    }
    
    // Validar formulário de cartão de crédito
    function validateCreditCardForm() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardExpiry = cardExpiryInput.value;
        const cardCvc = cardCvcInput.value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || cardNumber.length < 16) {
            showNotification('Número do cartão inválido', 'error');
            return false;
        }
        
        if (!cardExpiry || !isValidExpiry(cardExpiry)) {
            showNotification('Data de validade inválida', 'error');
            return false;
        }
        
        if (!cardCvc || cardCvc.length < 3) {
            showNotification('CVC inválido', 'error');
            return false;
        }
        
        if (!cardName) {
            showNotification('Nome no cartão é obrigatório', 'error');
            return false;
        }
        
        return true;
    }
    
    // Validar formulário de cartão de débito
    function validateDebitCardForm() {
        const cardNumber = debitCardNumberInput.value.replace(/\s/g, '');
        const cardExpiry = debitCardExpiryInput.value;
        const cardCvc = debitCardCvcInput.value;
        const cardName = document.getElementById('debit-card-name').value;
        
        if (!cardNumber || cardNumber.length < 16) {
            showNotification('Número do cartão inválido', 'error');
            return false;
        }
        
        if (!cardExpiry || !isValidExpiry(cardExpiry)) {
            showNotification('Data de validade inválida', 'error');
            return false;
        }
        
        if (!cardCvc || cardCvc.length < 3) {
            showNotification('CVC inválido', 'error');
            return false;
        }
        
        if (!cardName) {
            showNotification('Nome no cartão é obrigatório', 'error');
            return false;
        }
        
        return true;
    }
    
    // Formatar número do cartão (adicionar espaços a cada 4 dígitos)
    function formatCardNumber(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    }
    
    // Formatar data de validade (MM/AA)
    function formatCardExpiry(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (v.length > 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        } else {
            return v;
        }
    }
    
    // Validar data de validade
    function isValidExpiry(value) {
        const [month, year] = value.split('/');
        
        // Verificar se mês está entre 1 e 12
        if (parseInt(month) < 1 || parseInt(month) > 12) {
            return false;
        }
        
        // Verificar se o ano não está no passado
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (parseInt(year) < currentYear) {
            return false;
        }
        
        if (parseInt(year) === currentYear && parseInt(month) < currentMonth) {
            return false;
        }
        
        return true;
    }
    
    // Função para exibir notificações
    function showNotification(message, type) {
        // Verificar se já existe uma notificação
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notification);
        
        // Remover após alguns segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Adicionar estilos para notificações
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        .notification.success {
            background-color: #10b981;
            color: white;
        }
        
        .notification.info {
            background-color: #3b82f6;
            color: white;
        }
        
        .notification.error {
            background-color: #ef4444;
            color: white;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
        }
        
        .notification-content i {
            margin-right: 10px;
            font-size: 1.2rem;
        }
        
        .notification.fade-out {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    // Inicializar
    initEvents();
});
