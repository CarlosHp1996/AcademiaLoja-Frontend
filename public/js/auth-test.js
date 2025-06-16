/**
 * Script para testar as validações de autenticação e autorização
 * Este script deve ser executado no console do navegador para validar a segurança
 */

// Função para testar o token JWT
function testJWTToken() {
    console.log('=== TESTE DE VALIDAÇÃO DO TOKEN JWT ===');
    
    // Token fornecido pelo usuário
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDYXJsb3NBZG1pbiIsImp0aSI6IjVhMjEwZWUzLTBmZWItNGU5ZC05ZGYxLTgwYjIxODQ2NDg2NiIsImlkIjoiMDQyYWFmMTQtNTk0ZS00MDNjLTQ3ZTktMDhkZDk2M2QxNGJlIiwibmFtZSI6IkNhcmxvc0FkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NDc4MzE1ODksImlzcyI6IkRldmVsb3BtZW50IiwiYXVkIjoiRGV2ZWxvcG1lbnQifQ.S2mT5Imut8VrvtzSYAUXSuLKsrl0iTml1ehrNOE0gPY';
    
    // Decodifica o token
    try {
        const tokenParts = testToken.split('.');
        if (tokenParts.length !== 3) {
            console.error('Token inválido: formato incorreto');
            return false;
        }
        
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Payload do token:', payload);
        
        // Verifica a expiração
        const expirationTime = payload.exp * 1000; // Converte para milissegundos
        const currentTime = Date.now();
        const isValid = currentTime < expirationTime;
        
        console.log('Data de expiração:', new Date(expirationTime).toLocaleString());
        console.log('Data atual:', new Date(currentTime).toLocaleString());
        console.log('Token válido?', isValid);
        
        // Extrai a role
        const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
        console.log('Role do usuário:', role);
        
        return {
            isValid,
            role,
            name: payload.name || payload.sub,
            id: payload.id || payload.jti
        };
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return false;
    }
}

// Função para simular login com o token de teste
function simulateLogin() {
    console.log('=== SIMULANDO LOGIN COM TOKEN DE TESTE ===');
    
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDYXJsb3NBZG1pbiIsImp0aSI6IjVhMjEwZWUzLTBmZWItNGU5ZC05ZGYxLTgwYjIxODQ2NDg2NiIsImlkIjoiMDQyYWFmMTQtNTk0ZS00MDNjLTQ3ZTktMDhkZDk2M2QxNGJlIiwibmFtZSI6IkNhcmxvc0FkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NDc4MzE1ODksImlzcyI6IkRldmVsb3BtZW50IiwiYXVkIjoiRGV2ZWxvcG1lbnQifQ.S2mT5Imut8VrvtzSYAUXSuLKsrl0iTml1ehrNOE0gPY';
    const tokenInfo = testJWTToken();
    
    if (tokenInfo && tokenInfo.isValid) {
        // Salva o token no localStorage
        localStorage.setItem('authToken', testToken);
        
        // Salva informações do usuário
        localStorage.setItem('userData', JSON.stringify({
            id: tokenInfo.id,
            name: tokenInfo.name,
            role: tokenInfo.role
        }));
        
        console.log('Login simulado com sucesso!');
        console.log('Recarregue a página para ver as mudanças no dropdown e validações de acesso.');
        
        return true;
    } else {
        console.error('Não foi possível simular o login: token inválido');
        return false;
    }
}

// Função para simular logout
function simulateLogout() {
    console.log('=== SIMULANDO LOGOUT ===');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    console.log('Logout simulado com sucesso!');
    console.log('Recarregue a página para ver as mudanças no dropdown e validações de acesso.');
    
    return true;
}

// Função para testar acesso a páginas restritas
function testPageAccess() {
    console.log('=== TESTE DE ACESSO A PÁGINAS RESTRITAS ===');
    
    // Lista de páginas restritas a usuários (User e Admin)
    const userRestrictedPages = [
        '/public/html/cart.html',
        '/public/html/checkout.html',
        '/public/html/dashboard.html',
        '/public/html/order-details.html',
        '/public/html/profile.html',
        '/public/html/tracking.html',
        '/public/html/account/my-account.html'
    ];
    
    // Lista de páginas restritas a admin
    const adminRestrictedPages = [
        '/public/html/admin/index.html',
        '/public/html/admin/orders.html',
        '/public/html/admin/payments.html',
        '/public/html/admin/products.html',
        '/public/html/admin/tracking.html',
        '/public/html/admin/users.html'
    ];
    
    const token = localStorage.getItem('authToken');
    const isAuthenticated = token && testJWTToken().isValid;
    const userRole = isAuthenticated ? testJWTToken().role : '';
    
    console.log('Status de autenticação:', isAuthenticated ? 'Autenticado' : 'Não autenticado');
    console.log('Role do usuário:', userRole);
    
    console.log('\nAcesso a páginas restritas a usuários:');
    userRestrictedPages.forEach(page => {
        const hasAccess = isAuthenticated;
        console.log(`- ${page}: ${hasAccess ? 'Permitido' : 'Negado'}`);
    });
    
    console.log('\nAcesso a páginas restritas a admin:');
    adminRestrictedPages.forEach(page => {
        const hasAccess = isAuthenticated && userRole === 'Admin';
        console.log(`- ${page}: ${hasAccess ? 'Permitido' : 'Negado'}`);
    });
}

// Executa os testes
console.log('INICIANDO TESTES DE AUTENTICAÇÃO E AUTORIZAÇÃO');
console.log('==============================================');

// Teste inicial do token
testJWTToken();

// Instruções para o usuário
console.log('\nPara simular login com o token de teste, execute: simulateLogin()');
console.log('Para simular logout, execute: simulateLogout()');
console.log('Para testar acesso a páginas restritas, execute: testPageAccess()');
