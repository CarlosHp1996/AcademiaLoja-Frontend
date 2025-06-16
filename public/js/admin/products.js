document.addEventListener('DOMContentLoaded', function() {
    // Pagination variables
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 0;
    let totalItems = 0;
    
    // Initial load
    loadProducts(currentPage, pageSize);
    
    // Filter button click
    document.getElementById('filterButton').addEventListener('click', function() {
        currentPage = 1;
        loadProducts(currentPage, pageSize);
    });
    
    // Search input enter key
    document.getElementById('productSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1;
            loadProducts(currentPage, pageSize);
        }
    });
    
    // Pagination controls
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadProducts(currentPage, pageSize);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts(currentPage, pageSize);
        }
    });
    
    // Save new product
    document.getElementById('saveProductBtn').addEventListener('click', async function() {
        const form = document.getElementById('addProductForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stockQuantity: parseInt(formData.get('stockQuantity')),
            category: formData.get('category'),
            brand: formData.get('brand'),
            imageUrl: formData.get('imageUrl'),
            isActive: formData.get('isActive') === 'on',
            attributes: []
        };
        
        // Add optional attributes if they exist
        if (formData.get('flavor')) {
            productData.attributes.push({
                key: 'Sabor',
                value: formData.get('flavor')
            });
        }
        
        if (formData.get('weight')) {
            productData.attributes.push({
                key: 'Peso',
                value: formData.get('weight') + 'g'
            });
        }
        
        if (formData.get('size')) {
            productData.attributes.push({
                key: 'Tamanho',
                value: formData.get('size')
            });
        }
        
        try {
            const response = await window.apiCall('/api/Product/create', 'POST', productData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Produto adicionado com sucesso!', 'success');
                closeModal('addProductModal');
                form.reset();
                loadProducts(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao adicionar produto: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            window.showNotification('Erro ao adicionar produto', 'error');
        }
    });
    
    // Update product
    document.getElementById('updateProductBtn').addEventListener('click', async function() {
        const form = document.getElementById('editProductForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const productId = formData.get('id');
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stockQuantity: parseInt(formData.get('stockQuantity')),
            category: formData.get('category'),
            brand: formData.get('brand'),
            imageUrl: formData.get('imageUrl'),
            isActive: formData.get('isActive') === 'on',
            attributes: []
        };
        
        // Add optional attributes if they exist
        if (formData.get('flavor')) {
            productData.attributes.push({
                key: 'Sabor',
                value: formData.get('flavor')
            });
        }
        
        if (formData.get('weight')) {
            productData.attributes.push({
                key: 'Peso',
                value: formData.get('weight') + 'g'
            });
        }
        
        if (formData.get('size')) {
            productData.attributes.push({
                key: 'Tamanho',
                value: formData.get('size')
            });
        }
        
        try {
            const response = await window.apiCall(`/api/Product/update/${productId}`, 'PUT', productData);
            
            if (response && response.hasSuccess) {
                window.showNotification('Produto atualizado com sucesso!', 'success');
                closeModal('editProductModal');
                loadProducts(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao atualizar produto: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            window.showNotification('Erro ao atualizar produto', 'error');
        }
    });
    
    // Delete product
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
        const productId = document.getElementById('deleteProductId').value;
        
        try {
            const response = await window.apiCall(`/api/Product/delete/${productId}`, 'DELETE');
            
            if (response && response.hasSuccess) {
                window.showNotification('Produto excluído com sucesso!', 'success');
                closeModal('deleteProductModal');
                loadProducts(currentPage, pageSize);
            } else {
                window.showNotification('Erro ao excluir produto: ' + (response?.errors?.join(', ') || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            window.showNotification('Erro ao excluir produto', 'error');
        }
    });
    
    // Load products function
    async function loadProducts(page, size) {
        const searchTerm = document.getElementById('productSearch').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let endpoint = `/api/Product/get?pageNumber=${page}&pageSize=${size}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (categoryFilter) {
            endpoint += `&category=${encodeURIComponent(categoryFilter)}`;
        }
        
        try {
            const response = await window.apiCall(endpoint);
            
            const tableBody = document.getElementById('productsTable');
            if (!tableBody) return;
            
            if (response && response.value && response.value.items) {
                totalItems = response.value.totalItems || 0;
                totalPages = response.value.totalPages || 0;
                
                updatePagination(page, size, totalItems, totalPages);
                
                if (response.value.items.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum produto encontrado</td></tr>';
                    return;
                }
                
                let html = '';
                response.value.items.forEach(product => {
                    const statusClass = product.isActive ? 'status-completed' : 'status-cancelled';
                    const statusText = product.isActive ? 'Ativo' : 'Inativo';
                    
                    html += `
                        <tr>
                            <td>${product.id.substring(0, 8)}...</td>
                            <td>
                                <a href="/public/html/product-detail.html?id=${product.id}">
                                    <img src="${product.imageUrl || '/assets/images/placeholder.jpg'}" alt="${product.name}" width="50" height="50" style="object-fit: cover; border-radius: 4px; cursor:pointer;">
                                </a>
                            </td>
                            <td>${product.name}</td>
                            <td>${product.category || 'Sem categoria'}</td>
                            <td>${window.formatCurrency(product.price)}</td>
                            <td>${product.stockQuantity || 0}</td>
                            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-action btn-view" title="Ver detalhes" onclick="viewProduct('${product.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-edit" title="Editar" onclick="editProduct('${product.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-action btn-delete" title="Excluir" onclick="deleteProduct('${product.id}', '${product.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                tableBody.innerHTML = html;
            } else {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Erro ao carregar produtos</td></tr>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            const tableBody = document.getElementById('productsTable');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Erro ao carregar produtos</td></tr>';
            }
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
                loadProducts(currentPage, pageSize);
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
                loadProducts(currentPage, pageSize);
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
                loadProducts(currentPage, pageSize);
            });
            pagesContainer.appendChild(lastPageBtn);
        }
    }
});

// View product details
function viewProduct(id) {
    window.location.href = `/public/html/admin/products-detail.html?id=${id}`;
}

// Edit product
async function editProduct(id) {
    try {
        const response = await window.apiCall(`/api/Product/get/${id}`);
        
        if (response && response.hasSuccess && response.value) {
            const product = response.value;
            
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductCategory').value = product.category || '';
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductStock').value = product.stockQuantity || 0;
            document.getElementById('editProductDescription').value = product.description || '';
            document.getElementById('editProductBrand').value = product.brand || '';
            document.getElementById('editProductImage').value = product.imageUrl || '';
            document.getElementById('editProductActive').checked = product.isActive;
            
            // Handle attributes
            if (product.attributes && Array.isArray(product.attributes)) {
                const flavorAttr = product.attributes.find(attr => attr.key === 'Sabor');
                if (flavorAttr) {
                    document.getElementById('editProductFlavor').value = flavorAttr.value;
                }
                
                const weightAttr = product.attributes.find(attr => attr.key === 'Peso');
                if (weightAttr) {
                    const weightValue = weightAttr.value.replace('g', '');
                    document.getElementById('editProductWeight').value = weightValue;
                }
                
                const sizeAttr = product.attributes.find(attr => attr.key === 'Tamanho');
                if (sizeAttr) {
                    document.getElementById('editProductSize').value = sizeAttr.value;
                }
            }
            
            window.showModal('editProductModal');
        } else {
            window.showNotification('Erro ao carregar dados do produto', 'error');
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        window.showNotification('Erro ao carregar dados do produto', 'error');
    }
}

// Delete product
function deleteProduct(id, name) {
    document.getElementById('deleteProductId').value = id;
    document.getElementById('deleteProductName').textContent = name;
    window.showModal('deleteProductModal');
}
