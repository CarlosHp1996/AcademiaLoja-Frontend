document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceFilterBtn = document.getElementById('applyPriceFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const sortBySelect = document.getElementById('sortBy');
    const goalsPagesGrid = document.querySelector('.brands-page-grid');
    
    // Dados dos acessórios (simulação)
    const goalPage = [
        {
            id: 1,
            name: 'Camiseta Fitness Power Rock',
            category: 'camisetas',
            price: 49.90,
            color: 'preto',
            size: ['p', 'm', 'g', 'gg'],
            model: 'manga-curta',
            brand: 'power-rock',
            rating: 4.5,
            ratingCount: 18,
            image: '/assets/images/brands-page/tshirt.jpg'
        },
        {
            id: 2,
            name: 'Coqueteleira Power Rock 600ml',
            category: 'coqueteleiras',
            price: 29.90,
            oldPrice: 39.90,
            color: 'preto',
            size: ['unico'],
            model: 'standard',
            brand: 'power-rock',
            rating: 4.0,
            ratingCount: 12,
            image: '/assets/images/brands-page/shaker.jpg'
        },
        {
            id: 3,
            name: 'Luvas de Treino Power Rock',
            category: 'luvas',
            price: 59.90,
            color: 'preto',
            size: ['p', 'm', 'g'],
            model: 'standard',
            brand: 'power-rock',
            rating: 5.0,
            ratingCount: 24,
            image: '/assets/images/brands-page/gloves.jpg'
        },
        {
            id: 4,
            name: 'Toalha de Treino Power Rock',
            category: 'toalhas',
            price: 39.90,
            color: 'preto',
            size: ['unico'],
            model: 'standard',
            brand: 'power-rock',
            rating: 3.0,
            ratingCount: 8,
            image: '/assets/images/brands-page/towel.jpg'
        }
    ];
    
    // Estado dos filtros
    let filters = {
        categories: [],
        colors: [],
        sizes: [],
        models: [],
        brands: [],
        price: {
            min: null,
            max: null
        }
    };
    
    // Inicializar eventos
    function initEvents() {
        // Eventos para checkboxes de filtro
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const filterType = this.name;
                const filterValue = this.value;
                
                if (this.checked) {
                    // Adicionar ao filtro
                    switch(filterType) {
                        case 'category':
                            filters.categories.push(filterValue);
                            break;
                        case 'color':
                            filters.colors.push(filterValue);
                            break;
                        case 'size':
                            filters.sizes.push(filterValue);
                            break;
                        case 'model':
                            filters.models.push(filterValue);
                            break;
                        case 'brand':
                            filters.brands.push(filterValue);
                            break;
                    }
                } else {
                    // Remover do filtro
                    switch(filterType) {
                        case 'category':
                            filters.categories = filters.categories.filter(item => item !== filterValue);
                            break;
                        case 'color':
                            filters.colors = filters.colors.filter(item => item !== filterValue);
                            break;
                        case 'size':
                            filters.sizes = filters.sizes.filter(item => item !== filterValue);
                            break;
                        case 'model':
                            filters.models = filters.models.filter(item => item !== filterValue);
                            break;
                        case 'brand':
                            filters.brands = filters.brands.filter(item => item !== filterValue);
                            break;
                    }
                }
            });
        });
        
        // Evento para filtro de preço
        applyPriceFilterBtn.addEventListener('click', function() {
            const minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
            const maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
            
            filters.price.min = minPrice;
            filters.price.max = maxPrice;
            
            applyFilters();
        });
        
        // Evento para aplicar todos os filtros
        applyFiltersBtn.addEventListener('click', applyFilters);
        
        // Evento para limpar filtros
        clearFiltersBtn.addEventListener('click', clearFilters);
        
        // Evento para ordenação
        sortBySelect.addEventListener('change', function() {
            applyFilters();
        });
        
        // Eventos para botões de adicionar ao carrinho
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.brands-page-card');
                const productName = card.querySelector('.brands-page-title').textContent;
                
                // Simulação de adição ao carrinho
                showNotification(`${productName} adicionado ao carrinho!`, 'success');
                
                // Atualizar contador do carrinho
                const cartBadge = document.querySelector('.cart-badge');
                if (cartBadge) {
                    const currentCount = parseInt(cartBadge.textContent);
                    cartBadge.textContent = currentCount + 1;
                }
            });
        });
        
        // Eventos para botões de favoritos
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showNotification('Produto adicionado aos favoritos!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showNotification('Produto removido dos favoritos!', 'info');
                }
            });
        });
    }
    
    // Aplicar filtros
    function applyFilters() {
        let filteredGoalsPage = [...goalsPage];
        
        // Filtrar por categorias
        if (filters.categories.length > 0) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                filters.categories.includes(item.category)
            );
        }
        
        // Filtrar por cores
        if (filters.colors.length > 0) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                filters.colors.includes(item.color)
            );
        }
        
        // Filtrar por tamanhos
        if (filters.sizes.length > 0) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                item.size.some(size => filters.sizes.includes(size))
            );
        }
        
        // Filtrar por modelos
        if (filters.models.length > 0) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                filters.models.includes(item.model)
            );
        }
        
        // Filtrar por marcas
        if (filters.brands.length > 0) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                filters.brands.includes(item.brand)
            );
        }
        
        // Filtrar por preço
        if (filters.price.min !== null) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                item.price >= filters.price.min
            );
        }
        
        if (filters.price.max !== null) {
            filteredGoalsPage = filteredGoalsPage.filter(item => 
                item.price <= filters.price.max
            );
        }
        
        // Aplicar ordenação
        const sortBy = sortBySelect.value;
        
        switch(sortBy) {
            case 'price-asc':
                filteredGoalsPage.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredGoalsPage.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredGoalsPage.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredGoalsPage.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Relevância (padrão)
                break;
        }
        
        // Atualizar a exibição
        updateGoalsPageDisplay(filteredGoalsPage);
    }
    
    // Limpar filtros
    function clearFilters() {
        // Resetar estado dos filtros
        filters = {
            categories: [],
            colors: [],
            sizes: [],
            models: [],
            brands: [],
            price: {
                min: null,
                max: null
            }
        };
        
        // Resetar checkboxes
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Resetar inputs de preço
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Resetar ordenação
        sortBySelect.value = 'relevance';
        
        // Atualizar exibição
        updateGoalsPageDisplay(goalsPage);
        
        showNotification('Filtros limpos!', 'info');
    }
    
    // Atualizar exibição dos acessórios
    function updateGoalsPageDisplay(items) {
        // Simulação de atualização da exibição
        // Em um ambiente real, isso reconstruiria os elementos DOM com base nos itens filtrados
        
        if (items.length === 0) {
            showNotification('Nenhum produto encontrado com os filtros selecionados.', 'info');
        } else {
            showNotification(`${items.length} produtos encontrados.`, 'success');
        }
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
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
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
