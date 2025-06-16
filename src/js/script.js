document.addEventListener('DOMContentLoaded', function () {
    // Categories data
    const categories = [
        {
            name: 'Proteínas',
            href: '/products/protein',
            image: '/assets/images/whey.webp',
        },
        {
            name: 'Pré-Treino',
            href: '/products/pre-workout',
            image: 'https://via.placeholder.com/300x300',
        },
        {
            name: 'Creatina',
            href: '/products/creatine',
            image: 'https://via.placeholder.com/300x300',
        },
        {
            name: 'Vitaminas',
            href: '/products/vitamins',
            image: 'https://via.placeholder.com/300x300',
        },
        {
            name: 'Acessórios',
            href: '/products/accessories',
            image: 'https://via.placeholder.com/300x300',
        },
    ];

    // Featured products data
    const featuredProducts = [
        {
            id: 1,
            name: 'Whey Protein Isolate Premium 900g',
            price: '149,90',
            oldPrice: '179,90',
            image: 'https://via.placeholder.com/400x400',
            badge: 'MAIS VENDIDO',
            rating: 5,
            reviews: 127,
        },
        {
            id: 2,
            name: 'Creatina Monohidratada 300g',
            price: '89,90',
            oldPrice: '109,90',
            image: 'https://via.placeholder.com/400x400',
            badge: 'PROMOÇÃO',
            rating: 4,
            reviews: 98,
        },
        {
            id: 3,
            name: 'Pré-Treino Explosive Energy 300g',
            price: '119,90',
            oldPrice: null,
            image: 'https://via.placeholder.com/400x400',
            badge: 'NOVO',
            rating: 4,
            reviews: 45,
        },
        {
            id: 4,
            name: 'BCAA 2:1:1 Powder 300g',
            price: '79,90',
            oldPrice: '99,90',
            image: 'https://via.placeholder.com/400x400',
            badge: 'PROMOÇÃO',
            rating: 5,
            reviews: 76,
        },
    ];

    // Render categories
    const categoriesGrid = document.querySelector('.categories-grid');
    categories.forEach((category) => {
        const categoryCard = document.createElement('a');
        categoryCard.href = category.href;
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-overlay"></div>
            <img src="${category.image}" alt="${category.name}" class="category-image">
            <div class="category-content">
                <h3 class="category-name">${category.name}</h3>
                <i class="fas fa-chevron-right category-icon"></i>
            </div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });

    // Render featured products
    const productsGrid = document.querySelector('.products-grid');
    featuredProducts.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Generate stars HTML
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < product.rating) {
                starsHtml += '<i class="fas fa-star star filled"></i>';
            } else {
                starsHtml += '<i class="fas fa-star star empty"></i>';
            }
        }

        productCard.innerHTML = `
            <div class="product-image-container">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-content">
                <div class="product-rating">
                    ${starsHtml}
                    <span class="product-reviews">(${product.reviews})</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price-container">
                    <div class="product-price-info">
                        ${product.oldPrice ? `<span class="product-old-price">R$${product.oldPrice}</span>` : ''}
                        <span class="product-price">R$${product.price}</span>
                    </div>
                    <button class="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const subheaderNav = document.querySelector('.subheader-nav');
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuBtn && subheaderNav) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            subheaderNav.classList.toggle('active');
        });

        // Controle de submenus em dispositivos móveis
        menuItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 767) {
                    const submenu = item.querySelector('.submenu');
                    if (submenu) {
                        e.preventDefault();
                        item.classList.toggle('active');
                    }
                }
            });
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!subheaderNav.contains(e.target) && !menuBtn.contains(e.target)) {
                menuBtn.classList.remove('active');
                subheaderNav.classList.remove('active');
                menuItems.forEach((item) => item.classList.remove('active'));
            }
        });
    }

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach((button) => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Produto adicionado ao carrinho!');
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterInput = document.querySelector('.newsletter-input');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (newsletterInput.value.trim() !== '') {
                alert('Obrigado por se inscrever!');
                newsletterInput.value = '';
            } else {
                alert('Por favor, insira um e-mail válido.');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const header = document.querySelector('.header');
        const subheader = document.querySelector('.subheader');
        const headerHeight = header.offsetHeight; // Pega a altura total do header
        subheader.style.top = `${headerHeight}px`; // Aplica ao subheader
    });

    document.addEventListener('DOMContentLoaded', function() {
    const userDropdown = document.querySelector('.user-dropdown');
    const userBtn = document.querySelector('.user-icon-btn');
    if (userDropdown && userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
    }
});
});