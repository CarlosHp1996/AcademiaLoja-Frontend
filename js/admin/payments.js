document.addEventListener('DOMContentLoaded', function() {
    // Pagination variables
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 0;
    let totalItems = 0;
    
    // Initial load
    loadPayments(currentPage, pageSize);
    loadOrders();
    
    // Filter button click
    document.getElementById('filterButton').addEventListener('click', function() {
        currentPage = 1;
        loadPayments(currentPage, pageSize);
    });
    
    // Search input enter key
    document.getElementById('paymentSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadPayments(currentPage, pageSize);
        }
    });
    
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadPayments(currentPage, pageSize);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadPayments(currentPage, pageSize);
        }
    });
    
    // Create payment
    document.getElementById('createPaymentBtn').addEventListener('click', async function() {
        const form = document.getElementById('createPaymentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const orderId = document.getElementById('paymentOrderId').value;
        
        try {
            const response = await window.apiCall(`/api/Payment/create/${orderId}`, 'POST');
            
            if (response && response.hasSuccess) {
                window.showNotification('Pagamento criado com sucesso! Redirecionando para checkout...', 'success');
                closeModal('createPaymentModal');
                
                // If there's a checkout URL, redirect to it
                if (response.value && response.value.checkoutUrl) {
                    window.open(response.value.checkoutUrl, '_blank');
                }
                
                loadPayments(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao criar pagamento: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            window.showNotification('Erro ao criar pagamento', 'error');
        }
    });
    
    // Refund payment
    document.getElementById('refundPaymentBtn').addEventListener('click', async function() {
        const form = document.getElementById('refundPaymentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const paymentId = document.getElementById('refundPaymentId').value;
        const amount = document.getElementById('refundAmount').value;
        const reason = document.getElementById('refundReason').value;
        
        const refundData = {
            amount: amount ? parseFloat(amount) : null,
            reason: reason || 'Reembolso administrativo'
        };
        
        try {
            const response = await window.apiCall(`/api/Payment/refund/${paymentId}`, 'POST', refundData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Reembolso processado com sucesso!', 'success');
                closeModal('refundPaymentModal');
                loadPayments(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao processar reembolso: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error processing refund:', error);
            window.showNotification('Erro ao processar reembolso', 'error');
        }
    });
    
    // Detail refund button
    document.getElementById('detailRefundBtn').addEventListener('click', function() {
        const paymentId = document.getElementById('detailPaymentId').textContent;
        const amount = document.getElementById('detailAmount').getAttribute('data-amount');
        
        document.getElementById('refundPaymentId').value = paymentId;
        document.getElementById('refundAmount').value = amount;
        document.getElementById('refundAmount').max = amount;
        
        closeModal('paymentDetailsModal');
        window.showModal('refundPaymentModal');
    });
    
    // Load payments function
    async function loadPayments(page, size) {
        const searchTerm = document.getElementById('paymentSearch').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        // For demo purposes, we'll simulate API call since we don't have a direct endpoint for payments listing
        try {
            // In a real implementation, you would call the appropriate API endpoint
            // For now, we'll use the verify endpoint to get some data
            const response = await window.apiCall(`/api/Payment/verify/all?pageNumber=${page}&pageSize=${size}`);
            
            const tableBody = document.getElementById('paymentsTable');
            if (!tableBody) return;
            
            if (response && response.value && response.value.items) {
                totalItems = response.value.totalItems || 0;
                totalPages = response.value.totalPages || 0;
                
                updatePagination(page, size, totalItems, totalPages);
                
                if (response.value.items.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum pagamento encontrado</td></tr>';
                    return;
                }
                
                let html = '';
                response.value.items.forEach(payment => {
                    let statusClass = '';
                    let statusText = '';
                    
                    switch (payment.status) {
                        case 'Pending':
                            statusClass = 'status-pending';
                            statusText = 'Pendente';
                            break;
                        case 'Paid':
                            statusClass = 'status-completed';
                            statusText = 'Pago';
                            break;
                        case 'Failed':
                            statusClass = 'status-cancelled';
                            statusText = 'Falhou';
                            break;
                        case 'Refunded':
                            statusClass = 'status-refunded';
                            statusText = 'Reembolsado';
                            break;
                        default:
                            statusClass = 'status-pending';
                            statusText = payment.status;
                    }
                    
                    html += `
                        <tr>
                            <td>${payment.id.substring(0, 8)}...</td>
                            <td>${payment.orderId.substring(0, 8)}...</td>
                            <td>${payment.customerName || 'Cliente'}</td>
                            <td>${window.formatCurrency(payment.amount)}</td>
                            <td>${payment.paymentMethod || 'N/A'}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>${window.formatDate(payment.createdAt)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="viewPayment('${payment.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${payment.status === 'Paid' ? `
                                    <button class="btn-action btn-refund" title="Reembolsar" onclick="refundPayment('${payment.id}', ${payment.amount})">
                                        <i class="fas fa-undo"></i>
                                    </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Erro ao carregar pagamentos</td></tr>';
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            const tableBody = document.getElementById('paymentsTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Erro ao carregar pagamentos</td></tr>';
            }
        }
    }
    
    // Load orders for select dropdown
    async function loadOrders() {
        try {
            const response = await window.apiCall('/api/Order/get?pageSize=100&status=Pending');
            
            const orderSelect = document.getElementById('paymentOrderId');
            
            if (response && response.value && response.value.items) {
                let options = '<option value="">Selecione um pedido</option>';
                
                response.value.items.forEach(order => {
                    options += `<option value="${order.id}">${order.id.substring(0, 8)}... - ${order.userName} - ${window.formatCurrency(order.total)}</option>`;
                });
                
                orderSelect.innerHTML = options;
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    // Update pagination UI
    function updatePagination(currentPage, pageSize, totalItems, totalPages) {
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(start + pageSize - 1, totalItems);
        
        document.getElementById('paginationStart').textContent = totalItems > 0 ? start : 0;
        document.getElementById('paginationEnd').textContent = end;
        document.getElementById('paginationTotal').textContent = totalItems;
        
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        
        // Generate page numbers
        const pagesContainer = document.getElementById('paginationPages');
        pagesContainer.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'pagination-page';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                loadPayments(currentPage, pageSize);
            });
            pagesContainer.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagesContainer.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadPayments(currentPage, pageSize);
            });
            pagesContainer.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagesContainer.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'pagination-page';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                loadPayments(currentPage, pageSize);
            });
            pagesContainer.appendChild(lastPageBtn);
        }
    }
});

// View payment details
async function viewPayment(id) {
    try {
        const response = await window.apiCall(`/api/Payment/verify/${id}`);
        
        if (response && response.hasSuccess && response.value) {
            const payment = response.value;
            
            document.getElementById('detailPaymentId').textContent = payment.id;
            document.getElementById('detailOrderId').textContent = payment.orderId;
            document.getElementById('detailCustomer').textContent = payment.customerName || 'N/A';
            
            const amountElement = document.getElementById('detailAmount');
            amountElement.textContent = window.formatCurrency(payment.amount);
            amountElement.setAttribute('data-amount', payment.amount);
            
            document.getElementById('detailMethod').textContent = payment.paymentMethod || 'N/A';
            
            let statusText = '';
            switch (payment.status) {
                case 'Pending':
                    statusText = 'Pendente';
                    break;
                case 'Paid':
                    statusText = 'Pago';
                    break;
                case 'Failed':
                    statusText = 'Falhou';
                    break;
                case 'Refunded':
                    statusText = 'Reembolsado';
                    break;
                default:
                    statusText = payment.status;
            }
            document.getElementById('detailStatus').textContent = statusText;
            
            document.getElementById('detailDate').textContent = window.formatDate(payment.createdAt);
            document.getElementById('detailTransactionId').textContent = payment.transactionId || 'N/A';
            document.getElementById('detailLastFour').textContent = payment.lastFour || 'N/A';
            
            // Show/hide refund button based on payment status
            const refundBtn = document.getElementById('detailRefundBtn');
            refundBtn.style.display = payment.status === 'Paid' ? 'block' : 'none';
            
            window.showModal('paymentDetailsModal');
        } else {
            window.showNotification('Erro ao carregar detalhes do pagamento', 'error');
        }
    } catch (error) {
        console.error('Error fetching payment details:', error);
        window.showNotification('Erro ao carregar detalhes do pagamento', 'error');
    }
}

// Refund payment
function refundPayment(id, amount) {
    document.getElementById('refundPaymentId').value = id;
    document.getElementById('refundAmount').value = amount;
    document.getElementById('refundAmount').max = amount;
    document.getElementById('refundReason').value = '';
    
    window.showModal('refundPaymentModal');
}
