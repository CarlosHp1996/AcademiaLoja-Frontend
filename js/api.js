// Arquivo de integração com o backend
document.addEventListener('DOMContentLoaded', function() {
    // Configuração global para requisições API
    window.apiBaseUrl = 'http://localhost:4242';
    
    // Token de autenticação (será preenchido após login)
    window.authToken = localStorage.getItem('authToken') || '';
    
    // Função para fazer chamadas à API
    window.apiCall = async function(endpoint, method = 'GET', data = null) {
        try {
            const url = window.apiBaseUrl + endpoint;
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Adiciona o token de autenticação se disponível
            if (window.authToken) {
                headers['Authorization'] = `Bearer ${window.authToken}`;
            }
            
            const options = {
                method: method,
                headers: headers,
                credentials: 'include'
            };
            
            // Adiciona corpo da requisição para métodos que o suportam
            if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            const result = await response.json();
            
            // Verifica se o token expirou
            if (response.status === 401) {
                // Token expirado ou inválido
                localStorage.removeItem('authToken');
                window.authToken = '';
                
                // Redireciona para login se não estiver na página de login
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = '/login.html';
                }
            }
            
            return result;
        } catch (error) {
            console.error('API call error:', error);
            return {
                hasSuccess: false,
                errors: [error.message || 'Erro na comunicação com o servidor']
            };
        }
    };
    
    // Função para login
    window.login = async function(email, password) {
        const response = await window.apiCall('/api/Auth/login', 'POST', {
            email: email,
            password: password
        });
        
        if (response && response.hasSuccess && response.value && response.value.token) {
            // Salva o token de autenticação
            window.authToken = response.value.token;
            localStorage.setItem('authToken', response.value.token);
            
            // Salva informações do usuário
            localStorage.setItem('userData', JSON.stringify({
                id: response.value.id,
                name: response.value.name,
                email: response.value.email,
                role: response.value.role
            }));
            
            return true;
        }
        
        return false;
    };
    
    // Função para logout
    window.logout = async function() {
        try {
            await window.apiCall('/api/Auth/logout', 'POST');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Limpa dados de autenticação independente da resposta
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.authToken = '';
            
            // Redireciona para a página inicial
            window.location.href = '/';
        }
    };
    
    // Função para verificar se o usuário está autenticado
    window.isAuthenticated = function() {
        return !!window.authToken;
    };
    
    // Função para verificar se o usuário é admin
    window.isAdmin = function() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.role === 'Admin';
    };
    
    // Função para mostrar notificações
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adiciona ao container de notificações ou cria um novo
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);
        
        // Adiciona evento para fechar notificação
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
                
                // Remove o container se não houver mais notificações
                if (notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                }
            }, 300);
        });
        
        // Auto-remove após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                        
                        // Remove o container se não houver mais notificações
                        if (notificationContainer.children.length === 0) {
                            notificationContainer.remove();
                        }
                    }
                }, 300);
            }
        }, 5000);
        
        // Função auxiliar para obter ícone baseado no tipo
        function getIconForType(type) {
            switch (type) {
                case 'success': return 'fa-check-circle';
                case 'error': return 'fa-exclamation-circle';
                case 'warning': return 'fa-exclamation-triangle';
                default: return 'fa-info-circle';
            }
        }
    };
    
    // Função para mostrar modal
    window.showModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('modal-active');
            }, 10);
            
            // Previne scroll do body
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Função para fechar modal
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('modal-active');
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Restaura scroll do body
                document.body.style.overflow = '';
            }, 300);
        }
    };
    
    // Função para formatar data
    window.formatDate = function(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Função para formatar moeda
    window.formatCurrency = function(value) {
        if (value === undefined || value === null) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Inicialização de elementos comuns
    initCommonElements();
    
    // Verifica se precisa proteger a página atual
    checkPageProtection();
    
    // Inicializa elementos comuns (header, footer, etc)
    function initCommonElements() {
        // Inicializa botões de logout
        document.querySelectorAll('#logout-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.logout();
            });
        });
        
        // Inicializa toggles de sidebar admin
        document.querySelectorAll('#sidebarToggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const sidebar = document.getElementById('adminSidebar');
                if (sidebar) {
                    sidebar.classList.toggle('collapsed');
                }
            });
        });
        
        // Inicializa modais
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.modal-backdrop');
                if (modal && modal.id) {
                    window.closeModal(modal.id);
                }
            });
        });
        
        // Fecha modal ao clicar fora
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    window.closeModal(this.id);
                }
            });
        });
        
        // Atualiza elementos de usuário logado
        updateUserElements();
    }
    
    // Atualiza elementos baseados no usuário logado
    function updateUserElements() {
        const isLoggedIn = window.isAuthenticated();
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Atualiza links de conta
        document.querySelectorAll('.account-link').forEach(link => {
            if (isLoggedIn) {
                link.href = '/account/my-account.html';
                link.textContent = `Olá, ${userData.name || 'Usuário'}`;
            } else {
                link.href = '/login.html';
                link.textContent = 'Entrar';
            }
        });
        
        // Mostra/esconde elementos baseados em autenticação
        document.querySelectorAll('[data-auth-required]').forEach(el => {
            el.style.display = isLoggedIn ? '' : 'none';
        });
        
        document.querySelectorAll('[data-auth-guest]').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : '';
        });
        
        // Mostra/esconde elementos baseados em papel de admin
        document.querySelectorAll('[data-admin-required]').forEach(el => {
            el.style.display = window.isAdmin() ? '' : 'none';
        });
    }
    
    // Verifica se a página atual precisa de proteção
    function checkPageProtection() {
        // Verifica páginas que requerem autenticação
        if (document.body.hasAttribute('data-auth-required')) {
            if (!window.isAuthenticated()) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
                return;
            }
        }
        
        // Verifica páginas que requerem admin
        if (document.body.hasAttribute('data-admin-required')) {
            if (!window.isAdmin()) {
                window.location.href = '/';
                return;
            }
        }
    }
});
