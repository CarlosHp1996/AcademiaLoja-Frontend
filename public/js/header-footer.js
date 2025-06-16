// Componente de header e footer padronizado
document.addEventListener('DOMContentLoaded', function() {
    // Insere o header padronizado em todas as páginas
    const headerTemplate = `
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-left">
                <a href="/" class="logo">
                    <img src="/assets/images/logoLoja.png" alt="Logo Power Rock" class="logo-img">
                </a>
                <div class="search-container">
                    <input type="search" placeholder="Encontre o produto ideal para você!" class="search-input">
                </div>
                <button class="mobile-menu-btn" aria-label="Abrir menu">
                    <span class="menu-icon"></span>
                </button>
            </div>
            <div class="header-right">
                <a href="/public/html/account/my-account.html" class="account-link">Minha Conta</a>
                <a href="/public/html/cart.html" class="cart-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-badge">0</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Subheader -->
    <section class="subheader">
        <div class="container">
            <nav class="subheader-nav">
                <ul class="menu-list">
                    <li class="menu-item">
                        <a href="/public/html/products.html?category=proteinas" class="nav-link">Proteínas</a>
                        <ul class="submenu">
                            <li><a href="/public/html/products.html?brand=black-skull&category=proteinas" class="nav-link">Whey Black Skull</a></li>
                            <li><a href="/public/html/products.html?brand=growth&category=proteinas" class="nav-link">Whey Growth</a></li>
                            <li><a href="/public/html/products.html?brand=integral-medica&category=proteinas" class="nav-link">Whey Integral Médica</a></li>
                        </ul>
                    </li>
                    <li class="menu-item">
                        <a href="/public/html/products.html?category=pre-treinos" class="nav-link">Pré-Treino</a>
                        <ul class="submenu">
                            <li><a href="/public/html/products.html?brand=black-skull&category=pre-treinos" class="nav-link">Pré-Treino Black Skull</a></li>
                            <li><a href="/public/html/products.html?brand=growth&category=pre-treinos" class="nav-link">Pré-Treino Growth</a></li>
                        </ul>
                    </li>
                    <li class="menu-item">
                        <a href="/public/html/products.html?category=creatina" class="nav-link">Creatina</a>
                        <ul class="submenu">
                            <li><a href="/public/html/products.html?brand=growth&category=creatina" class="nav-link">Creatina Growth</a></li>
                            <li><a href="/public/html/products.html?brand=max-titanium&category=creatina" class="nav-link">Creatina Max Titanium</a></li>
                        </ul>
                    </li>
                    <li class="menu-item">
                        <a href="/public/html/products.html?category=vitaminas" class="nav-link">Vitaminas</a>
                    </li>
                    <li class="menu-item">
                        <a href="/public/html/accessories.html" class="nav-link">Acessórios</a>
                    </li>
                    <li class="menu-item">
                        <a href="/public/html/brands.html" class="nav-link">Marcas</a>
                        <ul class="submenu">
                            <li><a href="/public/html/products.html?brand=growth" class="nav-link">Growth</a></li>
                            <li><a href="/public/html/products.html?brand=black-skull" class="nav-link">Black Skull</a></li>
                            <li><a href="/public/html/products.html?brand=integral-medica" class="nav-link">Integral Médica</a></li>
                            <li><a href="/public/html/products.html?brand=max-titanium" class="nav-link">Max Titanium</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    </section>
    `;

    // Insere o footer padronizado em todas as páginas
    const footerTemplate = `
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <a href="/" class="logo">
                        <span class="logo-power">Power Rock</span>
                        <span class="logo-supps">Supplements</span>
                    </a>
                    <p class="footer-description">
                        Sua loja especializada em suplementos de alta performance para atletas e entusiastas do fitness.
                    </p>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                <div class="footer-column">
                    <h3 class="footer-title">Categorias</h3>
                    <ul class="footer-links">
                        <li><a href="/public/html/products.html?category=proteinas">Proteínas</a></li>
                        <li><a href="/public/html/products.html?category=pre-treinos">Pré-Treino</a></li>
                        <li><a href="/public/html/products.html?category=creatina">Creatina</a></li>
                        <li><a href="/public/html/products.html?category=vitaminas">Vitaminas</a></li>
                        <li><a href="/public/html/accessories.html">Acessórios</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3 class="footer-title">Informações</h3>
                    <ul class="footer-links">
                        <li><a href="/public/html/about.html">Sobre Nós</a></li>
                        <li><a href="/public/html/shipping.html">Entrega</a></li>
                        <li><a href="/public/html/privacy.html">Política de Privacidade</a></li>
                        <li><a href="/public/html/terms.html">Termos e Condições</a></li>
                        <li><a href="/public/html/contact.html">Contato</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3 class="footer-title">Contato</h3>
                    <ul class="contact-info">
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Av. Paulista, 1000 - São Paulo</span>
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            <span>(11) 99999-9999</span>
                        </li>
                        <li>
                            <i class="fas fa-envelope"></i>
                            <span>contato@powerrocksupplements.com.br</span>
                        </li>
                    </ul>
                    <div class="payment-methods">
                        <h4 class="payment-title">Formas de Pagamento</h4>
                        <div class="payment-icons">
                            <i class="fab fa-cc-visa"></i>
                            <i class="fab fa-cc-mastercard"></i>
                            <i class="fab fa-cc-amex"></i>
                            <i class="fab fa-pix"></i>
                            <i class="fas fa-barcode"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="copyright">
                © 2025 Power Rock Supplements. Todos os direitos reservados.
            </div>
        </div>
    </footer>
    `;

    // Função para aplicar o header e footer em todas as páginas
    function applyHeaderFooter() {
        // Verifica se estamos em uma página de admin
        const isAdminPage = window.location.pathname.includes('/admin/');
        
        // Não aplica o header e subheader padrão em páginas admin
        if (!isAdminPage) {
            // Encontra o elemento header existente ou insere no início do body
            const existingHeader = document.querySelector('header.header');
            if (existingHeader) {
                // Substitui o header existente
                const headerContainer = document.createElement('div');
                headerContainer.innerHTML = headerTemplate;
                existingHeader.parentNode.replaceChild(headerContainer.firstElementChild, existingHeader);
                
                // Procura pelo subheader e o substitui ou insere após o header
                const existingSubheader = document.querySelector('section.subheader');
                const newSubheader = headerContainer.children[1];
                
                if (existingSubheader) {
                    existingSubheader.parentNode.replaceChild(newSubheader, existingSubheader);
                } else {
                    existingHeader.parentNode.insertBefore(newSubheader, existingHeader.nextSibling);
                }
            } else {
                // Insere o header no início do body
                const headerContainer = document.createElement('div');
                headerContainer.innerHTML = headerTemplate;
                document.body.insertBefore(headerContainer.lastElementChild, document.body.firstChild);
                document.body.insertBefore(headerContainer.firstElementChild, document.body.firstChild);
            }
        }
        
        // Aplica o footer em todas as páginas (incluindo admin)
        const existingFooter = document.querySelector('footer.footer');
        if (existingFooter) {
            // Substitui o footer existente
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = footerTemplate;
            existingFooter.parentNode.replaceChild(footerContainer.firstElementChild, existingFooter);
        } else {
            // Insere o footer no final do body
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = footerTemplate;
            document.body.appendChild(footerContainer.firstElementChild);
        }
        
        // Atualiza o carrinho com a quantidade de itens
        updateCartBadge();
        
        // Inicializa os eventos do menu mobile
        initMobileMenu();
    }
    
    // Função para atualizar o badge do carrinho
    function updateCartBadge() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartBadge = document.querySelector('.cart-badge');
        
        if (cartBadge) {
            cartBadge.textContent = cartItems.length;
            cartBadge.style.display = cartItems.length > 0 ? 'flex' : 'none';
        }
    }
    
    // Função para inicializar o menu mobile
    function initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const menuList = document.querySelector('.menu-list');
        
        if (mobileMenuBtn && menuList) {
            mobileMenuBtn.addEventListener('click', function() {
                menuList.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
        
        // Adiciona eventos para os submenus em mobile
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                item.addEventListener('click', function(e) {
                    // Verifica se é mobile (baseado no tamanho da tela)
                    if (window.innerWidth <= 768) {
                        // Previne o clique no link principal se tiver submenu
                        if (e.target === item.querySelector('.nav-link')) {
                            e.preventDefault();
                            submenu.classList.toggle('active');
                        }
                    }
                });
            }
        });
    }
    
    // Aplica o header e footer
    applyHeaderFooter();
    
    // Adiciona evento para atualizar o carrinho quando mudar
    window.addEventListener('storage', function(e) {
        if (e.key === 'cartItems') {
            updateCartBadge();
        }
    });
});
