// search-bar.js - Lógica da barra de pesquisa principal
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    
    if (!searchInput) {
        console.warn('Elemento de busca não encontrado');
        return;
    }

    // Função para realizar a pesquisa
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            showSearchNotification('Digite algum termo para pesquisar!', 'warning');
            return;
        }

        // Construir URL para a página de produtos com o termo de busca
        const productsUrl = `/products.html?Name=${encodeURIComponent(searchTerm)}`;
        
        // Navegar para a página de produtos
        window.location.href = productsUrl;
    }

    // Event listener para Enter
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    // Event listener para o botão de busca (se existir)
    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', function(event) {
            event.preventDefault();
            performSearch();
        });
    }

    // Função para mostrar notificações de busca
    function showSearchNotification(message, type = 'info') {
        // Remove notificação existente se houver
        const existingNotification = document.querySelector('.search-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `search-notification ${type}`;
        notification.innerHTML = `
            <div class="search-notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Adicionar ao body
        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Função para obter ícone da notificação
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Adicionar estilos para as notificações de busca se não existirem
    if (!document.getElementById('search-notification-styles')) {
        const searchNotificationStyles = document.createElement('style');
        searchNotificationStyles.id = 'search-notification-styles';
        searchNotificationStyles.textContent = `
            .search-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1060;
                animation: slideInFromTop 0.3s ease;
                max-width: 280px;
                font-size: 14px;
            }
            .search-notification.success {
                background-color: #10b981;
                color: white;
            }
            .search-notification.info {
                background-color: #3b82f6;
                color: white;
            }
            .search-notification.error {
                background-color: #ef4444;
                color: white;
            }
            .search-notification.warning {
                background-color: #f59e0b;
                color: white;
            }
            .search-notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .search-notification-content i {
                font-size: 1.1rem;
                flex-shrink: 0;
            }
            .search-notification.fade-out {
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }
            @keyframes slideInFromTop {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(searchNotificationStyles);
    }

    // Função para limpar o campo de busca
    function clearSearch() {
        searchInput.value = '';
        searchInput.focus();
    }

    // Adicionar funcionalidade para limpar busca com Escape
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            clearSearch();
        }
    });

    // Função para sugerir autocompletar (pode ser implementada futuramente)
    function initializeAutocomplete() {
        // Implementação futura para autocomplete
        // Pode fazer requisições para a API para sugestões de produtos
        console.log('Autocomplete pode ser implementado aqui futuramente');
    }

    // Exposer funções globalmente se necessário
    window.SearchBar = {
        performSearch,
        clearSearch,
        showSearchNotification
    };
});

// Função utilitária para extrair parâmetros de busca da URL (para usar em outras páginas)
window.SearchUtils = {
    getSearchParams: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            name: urlParams.get('Name'),
            categoryIds: urlParams.get('CategoryIds'),
            objectiveIds: urlParams.get('ObjectiveIds'),
            accessoryIds: urlParams.get('AccessoryIds'),
            brandIds: urlParams.get('BrandIds'),
            minPrice: urlParams.get('MinPrice'),
            maxPrice: urlParams.get('MaxPrice'),
            page: urlParams.get('Page') || 1
        };
    },
    
    buildSearchUrl: function(searchTerm, additionalParams = {}) {
        const baseUrl = '/products.html';
        const params = new URLSearchParams();
        
        if (searchTerm) {
            params.append('Name', searchTerm);
        }
        
        // Adicionar outros parâmetros se fornecidos
        Object.keys(additionalParams).forEach(key => {
            if (additionalParams[key] !== null && additionalParams[key] !== undefined) {
                params.append(key, additionalParams[key]);
            }
        });
        
        return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    }
};