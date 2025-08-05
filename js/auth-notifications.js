/**
 * Script para notificações de segurança e feedback ao usuário
 */

// Função para mostrar notificações de autenticação
function showAuthNotification(title, message, type = 'info', duration = 5000) {
    // Carrega os estilos de notificação se ainda não estiverem carregados
    if (!document.querySelector('link[href="/css/auth-notifications.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/auth-notifications.css';
        document.head.appendChild(link);
    }
    
    // Remove notificações existentes
    const existingNotification = document.querySelector('.auth-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria a notificação
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    
    // Define o ícone baseado no tipo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Constrói o HTML da notificação
    notification.innerHTML = `
        <div class="auth-notification-icon">${icon}</div>
        <div class="auth-notification-content">
            <h4 class="auth-notification-title">${title}</h4>
            <p class="auth-notification-message">${message}</p>
        </div>
        <button class="auth-notification-close" aria-label="Fechar">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adiciona ao body
    document.body.appendChild(notification);
    
    // Mostra a notificação com animação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Adiciona evento para fechar a notificação
    notification.querySelector('.auth-notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto-remove após o tempo definido
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    // Função para fechar a notificação com animação
    function closeNotification(element) {
        element.classList.add('hide');
        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
    
    return notification;
}

// Função para mostrar notificação de acesso negado
function showAccessDenied(message = 'Você não tem permissão para acessar esta página') {
    return showAuthNotification('Acesso Negado', message, 'error');
}

// Função para mostrar notificação de login necessário
function showLoginRequired(message = 'Faça login para continuar') {
    return showAuthNotification('Login Necessário', message, 'warning');
}

// Função para mostrar notificação de login bem-sucedido
function showLoginSuccess(userName) {
    return showAuthNotification('Login Realizado', `Bem-vindo, ${userName}!`, 'success');
}

// Função para mostrar notificação de logout
function showLogoutSuccess() {
    return showAuthNotification('Logout Realizado', 'Você saiu com sucesso.', 'info');
}

// Exporta as funções para uso global
window.authNotifications = {
    show: showAuthNotification,
    accessDenied: showAccessDenied,
    loginRequired: showLoginRequired,
    loginSuccess: showLoginSuccess,
    logoutSuccess: showLogoutSuccess
};
