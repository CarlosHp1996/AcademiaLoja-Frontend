// Função para inicializar a página de combos
document.addEventListener('DOMContentLoaded', function() {
    initializeCombosPage();
});

function initializeCombosPage() {
    // Inicializar cards de combos
    initializeComboCards();
    
    // Adicionar eventos de clique nos botões de adicionar ao carrinho
    initializeAddToCartButtons();
    
    // Adicionar eventos de hover nos cards de benefícios
    initializeBenefitCards();
}

// Função para inicializar os cards de combos
function initializeComboCards() {
    const comboCards = document.querySelectorAll('.combo-card');
    
    comboCards.forEach(card => {
        // Adicionar efeito de hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });

        // Adicionar evento de clique para ver detalhes do combo
        const viewDetailsBtn = card.querySelector('.btn-primary');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const comboName = card.querySelector('h3').textContent;
                showComboDetails(comboName);
            });
        }
    });
}

// Função para mostrar detalhes do combo
function showComboDetails(comboName) {
    // Implementar lógica para mostrar modal com detalhes do combo
    console.log('Mostrando detalhes do combo:', comboName);
    
    // Exemplo de implementação do modal
    const modal = document.createElement('div');
    modal.className = 'combo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${comboName}</h2>
            <div class="modal-products">
                <!-- Produtos do combo serão carregados aqui -->
            </div>
            <button class="btn btn-primary">Adicionar ao Carrinho</button>
            <button class="btn btn-outline close-modal">Fechar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar o modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
}

// Função para inicializar os botões de adicionar ao carrinho
function initializeAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.combo-card .btn-primary');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const comboCard = this.closest('.combo-card');
            const comboName = comboCard.querySelector('h3').textContent;
            const comboPrice = comboCard.querySelector('.discount-price').textContent;
            
            // Adicionar ao carrinho
            addToCart({
                name: comboName,
                price: comboPrice,
                quantity: 1,
                type: 'combo'
            });

            // Mostrar feedback visual
            showAddToCartFeedback(button);
        });
    });
}

// Função para adicionar combo ao carrinho
function addToCart(combo) {
    // Implementar lógica do carrinho
    console.log('Combo adicionado ao carrinho:', combo);
    
    // Atualizar contador do carrinho
    updateCartCounter();
}

// Função para mostrar feedback visual ao adicionar ao carrinho
function showAddToCartFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Adicionado!';
    button.style.backgroundColor = '#43a047';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '#4CAF50';
    }, 2000);
}

// Função para atualizar contador do carrinho
function updateCartCounter() {
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        const currentCount = parseInt(cartCounter.textContent) || 0;
        cartCounter.textContent = currentCount + 1;
        
        // Adicionar animação
        cartCounter.classList.add('bounce');
        setTimeout(() => {
            cartCounter.classList.remove('bounce');
        }, 300);
    }
}

// Função para inicializar os cards de benefícios
function initializeBenefitCards() {
    const benefitCards = document.querySelectorAll('.benefit-card');
    
    benefitCards.forEach(card => {
        // Adicionar efeito de hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        // Adicionar animação ao ícone
        const icon = card.querySelector('.benefit-icon i');
        if (icon) {
            card.addEventListener('mouseenter', function() {
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            });

            card.addEventListener('mouseleave', function() {
                icon.style.transform = 'scale(1)';
            });
        }
    });
}

// Função para filtrar combos por nome
function filterCombos(searchTerm) {
    const comboCards = document.querySelectorAll('.combo-card');
    const searchTermLower = searchTerm.toLowerCase();

    comboCards.forEach(card => {
        const comboName = card.querySelector('h3').textContent.toLowerCase();
        const productItems = card.querySelectorAll('.product-item span');
        let found = false;

        // Verificar nome do combo
        if (comboName.includes(searchTermLower)) {
            found = true;
        }

        // Verificar produtos do combo
        productItems.forEach(item => {
            if (item.textContent.toLowerCase().includes(searchTermLower)) {
                found = true;
            }
        });

        card.style.display = found ? 'block' : 'none';
    });
}

// Adicionar evento de pesquisa
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        filterCombos(e.target.value);
    });
}

// Adicionar estilos para o modal
const style = document.createElement('style');
style.textContent = `
    .combo-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: #fff;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
    }

    .modal-content h2 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1.5rem;
    }

    .modal-products {
        margin-bottom: 1.5rem;
    }

    .close-modal {
        margin-left: 1rem;
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    .bounce {
        animation: bounce 0.3s ease;
    }
`;
document.head.appendChild(style); 