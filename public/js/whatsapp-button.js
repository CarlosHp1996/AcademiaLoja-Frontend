document.addEventListener('DOMContentLoaded', function() {
    // Criar o elemento do botão do WhatsApp
    const whatsappButton = document.createElement('a');
    whatsappButton.href = 'https://chat.whatsapp.com/BaPWRXKLHrHA9tys9Ku1Hd';
    whatsappButton.className = 'whatsapp-button';
    whatsappButton.target = '_blank';
    whatsappButton.rel = 'noopener noreferrer';
    whatsappButton.setAttribute('aria-label', 'Grupo de avisos da loja no WhatsApp');
    
    // Adicionar o ícone do WhatsApp
    const icon = document.createElement('i');
    icon.className = 'fab fa-whatsapp';
    whatsappButton.appendChild(icon);
    
    // Adicionar o botão ao corpo do documento
    document.body.appendChild(whatsappButton);
});
