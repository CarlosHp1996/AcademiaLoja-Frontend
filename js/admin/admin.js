document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const adminMain = document.querySelector('.admin-main');

    // Função de notificação global
    function showNotification(message, type = "info") {
        if (window.authNotifications && typeof window.authNotifications.showNotification === 'function') {
            window.authNotifications.showNotification(message, type);
        } else {
            console.warn("Sistema de notificação não encontrado. Usando alert.");
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('show'); // mobile toggle
            adminSidebar.classList.toggle('collapsed'); // desktop toggle
            if (adminMain) {
                adminMain.style.transition = 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                adminMain.style.marginLeft = adminSidebar.classList.contains('collapsed') 
                    ? 'var(--admin-sidebar-collapsed-width)' 
                    : 'var(--admin-sidebar-width)';
            }
        });
    }
    
    // User dropdown
    const userBtn = document.querySelector('.admin-user-btn');
    const dropdownMenu = document.querySelector('.admin-dropdown-menu');
    
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear token from localStorage
            localStorage.removeItem('authToken');
            
            // Redirect to login page
            window.location.href = '/login.html';
        });
    }
    
    // Check authentication
    function checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Redirect to login if no token
            window.location.href = '/login.html';
        }
        
        // You could also verify the token validity with the backend here
    }
    
    // Call checkAuth on admin pages
    if (window.location.pathname.includes('/admin/')) {
        checkAuth();
    }

    // Helper function to format date
    function formatDate(dateString, includeTime = true) {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            if (includeTime) {
                options.hour = '2-digit';
                options.minute = '2-digit';
            }
            return date.toLocaleDateString('pt-BR', options);
        } catch (e) {
            return dateString;
        }
    }
    
    // Helper function to format currency
    window.formatCurrency = function(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    // API base URL
    window.apiBaseUrl = '/api';
    
    // Helper function for API calls
    window.apiCall = async function(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('authToken');
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${window.apiBaseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized - token expired or invalid
                    localStorage.removeItem('authToken');
                    window.location.href = '/login.html';
                    return null;
                }
                
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            showNotification(error.message || 'Erro ao comunicar com o servidor', 'error');
            return null;
        }
    }
    
    // Show notification function
    window.showNotification = function(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.classList.add('hiding');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('hiding');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background-color: var(--admin-color-card);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 450px;
            z-index: 1050;
            animation: slideIn 0.3s ease;
        }
        
        .notification.hiding {
            animation: slideOut 0.3s ease forwards;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification.info i {
            color: #3b82f6;
        }
        
        .notification.success i {
            color: #10b981;
        }
        
        .notification.error i {
            color: #ef4444;
        }
        
        .notification.warning i {
            color: #f59e0b;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--admin-color-text-muted);
            cursor: pointer;
            padding: 0;
            font-size: 1rem;
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
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Modal functionality
    window.showModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            e.target.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    // Prevent propagation from modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Close modal when pressing ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop.show').forEach(modal => {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            });
        }
    });
    
    // Initialize modals
    document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            showModal(target);
        });
    });
    
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-backdrop');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });

    // Mobile sidebar toggle no admin-container
    const mobileToggle = document.getElementById('admin-mobile-toggle');
    if (mobileToggle && adminSidebar) {
    mobileToggle.addEventListener('click', function() {
        adminSidebar.classList.toggle('show');
      });
    }

    // Fechar sidebar ao clicar em qualquer link do menu
    adminSidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        adminSidebar.classList.remove('show');
    });
    });

    // Fechar sidebar ao clicar fora dela
    document.addEventListener('click', function (e) {
    const isClickInside = adminSidebar.contains(e.target) || mobileToggle.contains(e.target);
    if (!isClickInside && adminSidebar.classList.contains('show')) {
        adminSidebar.classList.remove('show');
    }
    });
});