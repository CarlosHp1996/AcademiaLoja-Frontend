/**
 * Serviço centralizado de autenticação e autorização
 * Implementa validação de token JWT, verificação de roles e controle de acesso
 */

// Classe AuthService para gerenciar autenticação e autorização
class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken') || '';
        this.userData = JSON.parse(localStorage.getItem('userData') || '{}');
        this.apiBaseUrl = 'https://localhost:4242';
    }

    /**
     * Atualiza os dados internos do serviço
     */
    refreshData() {
        this.token = localStorage.getItem('authToken') || '';
        this.userData = JSON.parse(localStorage.getItem('userData') || '{}');
    }

    /**
     * Verifica se o token JWT é válido
     * @returns {boolean} - Verdadeiro se o token for válido
     */
    isTokenValid() {
        this.refreshData(); // Atualiza os dados antes de verificar
        
        if (!this.token) return false;
        
        try {
            // Decodifica o token JWT (sem verificação de assinatura, apenas estrutura)
            const tokenParts = this.token.split('.');
            if (tokenParts.length !== 3) return false;
            
            // Decodifica a parte de payload do token
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Verifica se o token expirou
            const expirationTime = payload.exp * 1000; // Converte para milissegundos
            const currentTime = Date.now();
            
            if (currentTime >= expirationTime) {
                // Token expirado, limpa o storage
                this.clearAuthData();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Limpa os dados de autenticação do localStorage
     */
    clearAuthData() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.token = '';
        this.userData = {};
    }

    /**
     * Obtém a role do usuário a partir do token
     * @returns {string} - Role do usuário (Admin, User ou '')
     */
    getUserRole() {
        if (!this.isTokenValid()) return '';
        
        try {
            // Se temos userData armazenado, usamos a role de lá
            if (this.userData && this.userData.role) {
                return this.userData.role;
            }
            
            // Caso contrário, extraímos do token
            const tokenParts = this.token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // A role pode estar em diferentes claims dependendo do formato do token
            return payload.role || 
                   payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   'User'; // Valor padrão
        } catch (error) {
            console.error('Erro ao obter role do usuário:', error);
            return '';
        }
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - Verdadeiro se o usuário estiver autenticado
     */
    isAuthenticated() {
        return this.isTokenValid();
    }

    /**
     * Verifica se o usuário é admin
     * @returns {boolean} - Verdadeiro se o usuário for admin
     */
    isAdmin() {
        return this.isAuthenticated() && this.getUserRole() === 'Admin';
    }

    /**
     * Verifica se o usuário é um usuário comum
     * @returns {boolean} - Verdadeiro se o usuário for um usuário comum
     */
    isUser() {
        const role = this.getUserRole();
        return this.isAuthenticated() && (role === 'User' || role === 'Admin');
    }

    /**
     * Obtém o nome do usuário
     * @returns {string} - Nome do usuário ou string vazia
     */
    getUserName() {
        if (!this.isAuthenticated()) return '';
        
        return this.userData.name || '';
    }

    /**
     * Obtém o ID do usuário
     * @returns {string} - ID do usuário ou string vazia
     */
    getUserId() {
        if (!this.isAuthenticated()) return '';
        
        return this.userData.id || '';
    }

    /**
     * Realiza logout do usuário
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Tenta fazer logout no servidor
            if (this.token) {
                await fetch(`${this.apiBaseUrl}/api/Auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Limpa dados locais independente da resposta do servidor
            this.clearAuthData();
            
            // Mostra notificação de logout se disponível
            if (window.authNotifications) {
                window.authNotifications.logoutSuccess();
            }
            
            // Redireciona para a página inicial
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }
    }

    /**
     * Atualiza o dropdown do usuário com base no status de autenticação
     */
    updateUserDropdown() {
        const dropdownContainer = document.querySelector('.user-dropdown');
        if (!dropdownContainer) return;
        
        const dropdownMenu = dropdownContainer.querySelector('.dropdown-menu');
        if (!dropdownMenu) return;
        
        // Limpa o conteúdo atual
        dropdownMenu.innerHTML = '';
        
        if (this.isAuthenticated()) {
            // Usuário autenticado
            const userName = this.getUserName() || 'Usuário';
            const userRole = this.getUserRole();
            
            // Adiciona o nome do usuário
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-name">Olá, ${userName}</span>               
            `;
            dropdownMenu.appendChild(userInfo);
            
            // Adiciona separador
            // const separator1 = document.createElement('div');
            // separator1.className = 'dropdown-separator';
            // dropdownMenu.appendChild(separator1);
            
            // Adiciona link para perfil
            const profileLink = document.createElement('a');
            profileLink.href = '/profile.html';
            profileLink.className = 'dropdown-item';
            profileLink.innerHTML = '<i class="fas fa-user"></i> Meu Perfil';
            dropdownMenu.appendChild(profileLink);
            
            // Adiciona link para pedidos
            const ordersLink = document.createElement('a');
            ordersLink.href = '/dashboard.html';
            ordersLink.className = 'dropdown-item';
            ordersLink.innerHTML = '<i class="fas fa-shopping-bag"></i> Meus Pedidos';
            dropdownMenu.appendChild(ordersLink);
            
            // Adiciona link para dashboard se for admin
            if (this.isAdmin()) {
                const adminLink = document.createElement('a');
                adminLink.href = '/admin.html';
                adminLink.className = 'dropdown-item admin-item';
                adminLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard Admin';
                dropdownMenu.appendChild(adminLink);
            }
            
            // Adiciona separador
            const separator2 = document.createElement('div');
            separator2.className = 'dropdown-separator';
            dropdownMenu.appendChild(separator2);
            
            // Adiciona botão de logout
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'dropdown-item logout-btn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
            dropdownMenu.appendChild(logoutBtn);
            
        } else {
            // Usuário não autenticado
            const registerLink = document.createElement('a');
            registerLink.href = '/register.html';
            registerLink.className = 'dropdown-item';
            registerLink.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
            dropdownMenu.appendChild(registerLink);

            const loginLink = document.createElement('a');
            loginLink.href = '/login.html';
            loginLink.className = 'dropdown-item';
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Fazer Login';
            dropdownMenu.appendChild(loginLink);
        }
        
        // Atualiza o ícone do usuário
        const userIconBtn = dropdownContainer.querySelector('.user-icon-btn');
        if (userIconBtn) {
            // Adiciona ou remove classe para estilização diferente quando autenticado
            if (this.isAuthenticated()) {
                userIconBtn.classList.add('authenticated');
                userIconBtn.title = `Logado como ${this.getUserName()}`;
            } else {
                userIconBtn.classList.remove('authenticated');
                userIconBtn.title = 'Fazer login';
            }
        }
    }

    /**
     * Verifica se o usuário tem permissão para acessar uma determinada rota
     * @param {string} route - Rota a ser verificada
     * @returns {boolean} - Verdadeiro se o usuário tiver permissão
     */
    hasPermission(route) {
        const userRole = this.getUserRole();
        
        // Rotas que requerem autenticação (qualquer usuário logado)
        const userRoutes = [
            '/cart.html',
            '/checkout.html',
            '/profile.html',
            '/orders.html',
            '/tracking.html'
        ];
        
        // Rotas que requerem privilégios de admin
        const adminRoutes = [
            '/admin/index.html',
            '/admin/orders.html',
            '/admin/payments.html',
            '/admin/products.html',
            '/admin/tracking.html',
            '/admin/users.html'
        ];
        
        // Verifica se é uma rota de admin
        if (adminRoutes.some(adminRoute => route.includes(adminRoute))) {
            return this.isAuthenticated() && userRole === 'Admin';
        }
        
        // Verifica se é uma rota de usuário
        if (userRoutes.some(userRoute => route.includes(userRoute))) {
            return this.isAuthenticated();
        }
        
        // Rotas públicas
        return true;
    }

    /** Retorna o token JWT atual
     * @returns {string}
     */
    getToken() {
        this.refreshData();
        return this.token || '';
    }
}

// Cria e exporta a instância do serviço de autenticação
const authService = new AuthService();

// Exporta o serviço para uso global
window.authService = authService;