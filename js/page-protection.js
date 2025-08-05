/**
 * Script para proteção de páginas baseado em autenticação e roles
 * Deve ser incluído em todas as páginas para garantir segurança
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o serviço de autenticação está disponível
    if (!window.authService) {
        console.error('Serviço de autenticação não encontrado!');
        return;
    }
    
    // Obtém o caminho da página atual
    const currentPath = window.location.pathname;
    
    // Lista de páginas restritas a usuários (User e Admin)
    const userRestrictedPages = [
        '/html/cart.html',
        '/html/checkout.html',
        '/html/dashboard.html',
        '/html/order-details.html',
        '/html/profile.html',
        '/html/tracking.html',
        '/html/account/my-account.html'
    ];
    
    // Lista de páginas restritas a admin
    const adminRestrictedPages = [
        '/html/admin/index.html',
        '/html/admin/orders.html',
        '/html/admin/payments.html',
        '/html/admin/products.html',
        '/html/admin/tracking.html',
        '/html/admin/users.html'
    ];
    
    // Verifica se a página atual está na lista de restritas a usuários
    const isUserRestricted = userRestrictedPages.some(page => 
        currentPath.toLowerCase().includes(page.toLowerCase())
    );
    
    // Verifica se a página atual está na lista de restritas a admin
    const isAdminRestricted = adminRestrictedPages.some(page => 
        currentPath.toLowerCase().includes(page.toLowerCase())
    );
    
    // Aplica a proteção adequada
    if (isAdminRestricted) {
        // Páginas restritas a admin
        if (!window.authService.checkPageAccess('Admin')) {
            console.log('Acesso negado: Área restrita a administradores');
        }
    } else if (isUserRestricted) {
        // Páginas restritas a usuários
        if (!window.authService.checkPageAccess('User')) {
            console.log('Acesso negado: Área restrita a usuários autenticados');
        }
    } else {
        // Páginas públicas - apenas atualiza o dropdown do usuário
        window.authService.updateUserDropdown();
    }
});
