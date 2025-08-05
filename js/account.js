document.addEventListener('DOMContentLoaded', function() {
    // Navegação entre seções da conta
    const accountLinks = document.querySelectorAll('.account-link[data-section]');
    const accountSections = document.querySelectorAll('.account-section');

    // Função para decodificar o token JWT
  function decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Erro ao decodificar o token:', e);
      return null;
    }
  }

  // Função para verificar se o token está válido
  function isTokenValid(token) {
    if (!token) return false;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  // Verificar autenticação
  const token = localStorage.getItem('authToken');
  if (!isTokenValid(token)) {
    window.location.href = '/login.html';
    return;
  }

  // Função de logout
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');

    try {
      const response = await fetch('https://localhost:44321/api/Auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: authToken }),
      });

      await response.json();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Erro ao chamar API de logout:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/first-page.html';
    }
  });
    
    accountLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remover classe ativa de todos os links e seções
            accountLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            
            accountSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Adicionar classe ativa ao link clicado e à seção correspondente
            this.parentElement.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
    
    // Formulário de edição de conta
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulação de salvamento de dados
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            
            // Atualizar nome do usuário na sidebar
            document.getElementById('userName').textContent = name.split(' ')[0];
            
            // Exibir mensagem de sucesso
            showNotification('Dados atualizados com sucesso!', 'success');
        });
    }
    
    // Formulário de alteração de senha
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validação simples
            if (newPassword !== confirmPassword) {
                showNotification('As senhas não coincidem!', 'error');
                return;
            }
            
            // Simulação de alteração de senha
            showNotification('Senha alterada com sucesso!', 'success');
            
            // Limpar campos
            passwordForm.reset();
        });
    }
    
    // Gerenciamento de endereços
    const addAddressBtn = document.getElementById('addAddressBtn');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    const addressForm = document.getElementById('addressForm');
    
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            addressForm.classList.remove('hidden');
            this.classList.add('hidden');
        });
    }
    
    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', function() {
            addressForm.classList.add('hidden');
            addAddressBtn.classList.remove('hidden');
        });
    }
    
    if (addressForm) {
        addressForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulação de adição de endereço
            const addressName = document.getElementById('addressName').value;
            const street = document.getElementById('street').value;
            const number = document.getElementById('number').value;
            const neighborhood = document.getElementById('neighborhood').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            
            // Criar novo endereço
            const addressesList = document.getElementById('addressesList');
            const emptyState = addressesList.querySelector('.empty-state');
            
            if (emptyState) {
                emptyState.remove();
            }
            
            const addressCard = document.createElement('div');
            addressCard.className = 'address-card';
            addressCard.innerHTML = `
                <h3 class="address-name">${addressName}</h3>
                <p class="address-details">
                    ${street}, ${number}<br>
                    ${neighborhood}<br>
                    ${city} - ${state}
                </p>
                <div class="address-actions">
                    <button type="button" class="edit-address" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="delete-address" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button type="button" class="default-address" title="Definir como padrão">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
            
            addressesList.appendChild(addressCard);
            
            // Atualizar contador de endereços
            document.getElementById('addressesCount').textContent = 
                addressesList.querySelectorAll('.address-card').length;
            
            // Limpar formulário e esconder
            this.reset();
            addressForm.classList.add('hidden');
            addAddressBtn.classList.remove('hidden');
            
            showNotification('Endereço adicionado com sucesso!', 'success');
        });
    }
    
    // Carregar dados simulados do usuário
    loadUserData();
    
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
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
    
    // Função para carregar dados simulados do usuário
    function loadUserData() {
        // Simular dados do usuário
        const userData = {
            name: 'João Silva',
            email: 'joao.silva@exemplo.com',
            phone: '(11) 98765-4321'
        };
        
        // Preencher formulário de edição de conta
        document.getElementById('name').value = userData.name;
        document.getElementById('email').value = userData.email;
        document.getElementById('phone').value = userData.phone;
        
        // Atualizar nome do usuário na sidebar
        document.getElementById('userName').textContent = userData.name.split(' ')[0];
    }
});

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
