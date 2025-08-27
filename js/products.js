document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]')
  const minPriceInput = document.getElementById("minPrice")
  const maxPriceInput = document.getElementById("maxPrice")
  const applyPriceFilterBtn = document.getElementById("applyPriceFilter")
  const applyFiltersBtn = document.getElementById("applyFilters")
  const clearFiltersBtn = document.getElementById("clearFilters")
  const sortBySelect = document.getElementById("sortBy")
  const productsGrid = document.querySelector(".products-grid")
  const viewButtons = document.querySelectorAll(".view-btn")
  const paginationContainer = document.createElement("div")
  paginationContainer.className = "pagination"
  productsGrid.after(paginationContainer)

  const API_BASE_URL = "/api" // Caminho relativo para o Nginx principal proxyar

  // Estado dos filtros
  let filters = {
    categories: [],
    flavors: [],
    brands: [],
    objectives: [],
    accessories: [],
    price: { min: null, max: null },
    page: 1,
    pageSize: 20,
    name: null, // Novo parâmetro para busca por nome
  }

  // Debounce para evitar muitas requisições
  let debounceTimeout
  function debounceApplyFilters(delay = 300) {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      filters.page = 1 // Resetar para a primeira página
      applyFilters()
    }, delay)
  }

  // Função para obter o token de autenticação
  function getAuthToken() {
    return localStorage.getItem("authToken")
  }

  // Função para ler parâmetros da URL e aplicar filtros iniciais
  function initializeFiltersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)

    // Aplicar filtros baseados nos parâmetros da URL
    const categoryIds = urlParams.get("CategoryIds")
    const objectiveIds = urlParams.get("ObjectiveIds")
    const accessoryIds = urlParams.get("AccessoryIds")
    const brandIds = urlParams.get("BrandIds")
    const searchName = urlParams.get("Name")

    if (searchName) {
      filters.name = searchName
    }

    if (categoryIds) {
      // Pode ser múltiplos IDs separados por vírgula
      const categoryArray = categoryIds.split(",")
      filters.categories = categoryArray
    }

    if (objectiveIds) {
      const objectiveArray = objectiveIds.split(",")
      filters.objectives = objectiveArray
    }

    if (accessoryIds) {
      const accessoryArray = accessoryIds.split(",")
      filters.accessories = accessoryArray
    }

    if (brandIds) {
      const brandArray = brandIds.split(",")
      filters.brands = brandArray
    }

    // Aplicar outros parâmetros se existirem
    const minPrice = urlParams.get("MinPrice")
    const maxPrice = urlParams.get("MaxPrice")
    const page = urlParams.get("Page")

    if (minPrice) {
      filters.price.min = Number.parseFloat(minPrice)
      if (minPriceInput) minPriceInput.value = minPrice
    }

    if (maxPrice) {
      filters.price.max = Number.parseFloat(maxPrice)
      if (maxPriceInput) maxPriceInput.value = maxPrice
    }

    if (page) {
      filters.page = Number.parseInt(page)
    }
  }

  // Atualizar título da página baseado nos parâmetros da URL
  if (window.NavigationEnums && window.NavigationEnums.updatePageTitle) {
    window.NavigationEnums.updatePageTitle()
  }

  // Função para marcar checkboxes baseados nos filtros ativos
  function updateCheckboxesFromFilters() {
    // Aguardar um pouco para garantir que os checkboxes foram criados
    setTimeout(() => {
      // Marcar categorias
      filters.categories.forEach((categoryId) => {
        const checkbox = document.querySelector(`input[name="category"][value="${categoryId}"]`)
        if (checkbox) checkbox.checked = true
      })

      // Marcar objetivos (assumindo que você adicionará este tipo de filtro)
      filters.objectives.forEach((objectiveId) => {
        const checkbox = document.querySelector(`input[name="objective"][value="${objectiveId}"]`)
        if (checkbox) checkbox.checked = true
      })

      // Marcar acessórios
      filters.accessories.forEach((accessoryId) => {
        const checkbox = document.querySelector(`input[name="accessory"][value="${accessoryId}"]`)
        if (checkbox) checkbox.checked = true
      })

      // Marcar marcas
      filters.brands.forEach((brandId) => {
        const checkbox = document.querySelector(`input[name="brand"][value="${brandId}"]`)
        if (checkbox) checkbox.checked = true
      })
    }, 500)
  }

  // Carregar filtros dinamicamente
  async function loadFilters() {
    const headers = {
      "Content-Type": "application/json",
    }
    const authToken = getAuthToken()
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }updateFilterOptions

    try {
      const response = await fetch(`${API_BASE_URL}/Product/get`, { headers })
      if (!response.ok) throw new Error("Erro ao carregar filtros")
      const filtersData = await response.json()
      updateFilterOptions(filtersData)

      // Após carregar os filtros, marcar os checkboxes baseados na URL
      updateCheckboxesFromFilters()
    } catch (error) {
      console.error("Erro ao carregar filtros:", error)
      showNotification("Erro ao carregar opções de filtro.", "error")
    }
  }

  // Atualizar opções de filtro na UI
  function updateFilterOptions(filtersData) {
    const categoriesContainer = document.querySelector('.filter-group[data-filter="categories"] .filter-options')
    const flavorsContainer = document.querySelector('.filter-group[data-filter="sabores"] .filter-options')
    const brandsContainer = document.querySelector('.filter-group[data-filter="marcas"] .filter-options')
    const objectivesContainer = document.querySelector('.filter-group[data-filter="objectives"] .filter-options')
    const accessoriesContainer = document.querySelector('.filter-group[data-filter="accessories"] .filter-options')

    // Atualizar preços mínimo e máximo
    if (filtersData.minPrice !== undefined && filtersData.maxPrice !== undefined) {
      if (minPriceInput) minPriceInput.placeholder = `R$ ${filtersData.minPrice.toFixed(2).replace(".", ",")}`
      if (maxPriceInput) maxPriceInput.placeholder = `R$ ${filtersData.maxPrice.toFixed(2).replace(".", ",")}`
    }

    // Atualizar categorias
    if (filtersData.availableCategories && categoriesContainer) {
      categoriesContainer.innerHTML = filtersData.availableCategories
        .map(
          (category) => `
                <label class="checkbox-container">
                    <input type="checkbox" name="category" value="${category.value}">
                    <span class="checkmark"></span>
                    ${category.value} (${category.productCount})
                </label>
            `,
        )
        .join("")
    }

    // Atualizar sabores
    if (filtersData.availableFlavors && flavorsContainer) {
      flavorsContainer.innerHTML = filtersData.availableFlavors
        .map(
          (flavor) => `
                <label class="checkbox-container">
                    <input type="checkbox" name="flavor" value="${flavor.value}">
                    <span class="checkmark"></span>
                    ${flavor.value} (${flavor.productCount})
                </label>
            `,
        )
        .join("")
    }

    // Atualizar marcas
    if (filtersData.availableBrands && brandsContainer) {
      brandsContainer.innerHTML = filtersData.availableBrands
        .map(
          (brand) => `
                <label class="checkbox-container">
                    <input type="checkbox" name="brand" value="${brand.value}">
                    <span class="checkmark"></span>
                    ${brand.value} (${brand.productCount})
                </label>
            `,
        )
        .join("")
    }

    // Atualizar objetivos (se disponível)
    if (filtersData.availableObjectives && objectivesContainer) {
      objectivesContainer.innerHTML = filtersData.availableObjectives
        .map(
          (objective) => `
                <label class="checkbox-container">
                    <input type="checkbox" name="objective" value="${objective.value}">
                    <span class="checkmark"></span>
                    ${objective.value} (${objective.productCount})
                </label>
            `,
        )
        .join("")
    }

    // Atualizar acessórios (se disponível)
    if (filtersData.availableAccessories && accessoriesContainer) {
      accessoriesContainer.innerHTML = filtersData.availableAccessories
        .map(
          (accessory) => `
                <label class="checkbox-container">
                    <input type="checkbox" name="accessory" value="${accessory.value}">
                    <span class="checkmark"></span>
                    ${accessory.value} (${accessory.productCount})
                </label>
            `,
        )
        .join("")
    }

    // Reanexar eventos aos novos checkboxes
    reattachFilterEvents()
  }

  // Função para abrir modal de filtros no mobile (move para body para evitar stacking issues)
  let overlay = null;
  let filtersSidebarOriginalParent = null;
  let filtersSidebarOriginalNextSibling = null;
  let sortOptionsOriginalParent = null;
  let sortOptionsOriginalNextSibling = null;

  function openMobileFilters() {
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (!filtersSidebar) {
      console.error('Elemento .filters-sidebar não encontrado');
      return;
    }

    filtersSidebarOriginalParent = filtersSidebar.parentNode;
    filtersSidebarOriginalNextSibling = filtersSidebar.nextSibling;
    document.body.appendChild(filtersSidebar);
    filtersSidebar.classList.add('mobile-active');
    filtersSidebar.style.zIndex = '1001'; // Forçar z-index
    filtersSidebar.style.position = 'fixed'; // Garantir posicionamento

    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '1000';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);
    console.log('Overlay criado:', overlay); // Depuração
    overlay.addEventListener('click', closeMobileFilters);
  }

  function closeMobileFilters() {
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (filtersSidebar && filtersSidebar.classList.contains('mobile-active')) {
      filtersSidebar.classList.remove('mobile-active');
      filtersSidebar.style.zIndex = '';
      filtersSidebar.style.position = '';
      filtersSidebarOriginalParent.insertBefore(filtersSidebar, filtersSidebarOriginalNextSibling);
    }

    if (overlay) {
      overlay.removeEventListener('click', closeMobileFilters);
      overlay.remove();
      overlay = null;
    }
  }

  // Função similar para ordenação
  function openMobileSort() {
    const sortOptions = document.querySelector('.sort-options');
    if (!sortOptions) {
      console.error('Elemento .sort-options não encontrado');
      return;
    }

    sortOptionsOriginalParent = sortOptions.parentNode;
    sortOptionsOriginalNextSibling = sortOptions.nextSibling;
    document.body.appendChild(sortOptions);
    sortOptions.classList.add('mobile-active');
    sortOptions.style.zIndex = '1001';
    sortOptions.style.position = 'fixed';

    overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '1000';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'block';
    document.body.appendChild(overlay);
    console.log('Overlay criado:', overlay); // Depuração
    overlay.addEventListener('click', closeMobileSort);
  }

  function closeMobileSort() {
    const sortOptions = document.querySelector('.sort-options');
    if (sortOptions && sortOptions.classList.contains('mobile-active')) {
      sortOptions.classList.remove('mobile-active');
      sortOptions.style.zIndex = '';
      sortOptions.style.position = '';
      sortOptionsOriginalParent.insertBefore(sortOptions, sortOptionsOriginalNextSibling);
    }

    if (overlay) {
      overlay.removeEventListener('click', closeMobileSort);
      overlay.remove();
      overlay = null;
    }
  }

  // Reanexar eventos aos checkboxes com aplicação em tempo real e fechamento automático no mobile
  function reattachFilterEvents() {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const filterType = this.name;
        const filterValue = this.value;

        if (this.checked) {
          switch (filterType) {
            case "category":
              if (!filters.categories.includes(filterValue)) {
                filters.categories.push(filterValue);
              }
              break;
            case "flavor":
              if (!filters.flavors.includes(filterValue)) {
                filters.flavors.push(filterValue);
              }
              break;
            case "brand":
              if (!filters.brands.includes(filterValue)) {
                filters.brands.push(filterValue);
              }
              break;
            case "objective":
              if (!filters.objectives.includes(filterValue)) {
                filters.objectives.push(filterValue);
              }
              break;
            case "accessory":
              if (!filters.accessories.includes(filterValue)) {
                filters.accessories.push(filterValue);
              }
              break;
          }
        } else {
          switch (filterType) {
            case "category":
              filters.categories = filters.categories.filter((item) => item !== filterValue);
              break;
            case "flavor":
              filters.flavors = filters.flavors.filter((item) => item !== filterValue);
              break;
            case "brand":
              filters.brands = filters.brands.filter((item) => item !== filterValue);
              break;
            case "objective":
              filters.objectives = filters.objectives.filter((item) => item !== filterValue);
              break;
            case "accessory":
              filters.accessories = filters.accessories.filter((item) => item !== filterValue);
              break;
          }
        }

        if (document.querySelector('.filters-sidebar.mobile-active')) {
          closeMobileFilters();
        }

        debounceApplyFilters();
      });
    });
  }

  // Inicializar eventos (incluindo mobile buttons e outros)
  function initEvents() {
    const mobileFilterBtn = document.querySelector('.btn-mobile-filter');
    if (mobileFilterBtn) {
      mobileFilterBtn.addEventListener('click', openMobileFilters);
    }

    const mobileSortBtn = document.querySelector('.btn-mobile-sort');
    if (mobileSortBtn) {
      mobileSortBtn.addEventListener('click', openMobileSort);
    }

    const closePanelBtns = document.querySelectorAll('.btn-close-panel');
    closePanelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (document.querySelector('.filters-sidebar.mobile-active')) {
          closeMobileFilters();
        } else if (document.querySelector('.sort-options.mobile-active')) {
          closeMobileSort();
        }
      });
    });

    if (sortBySelect) {
      sortBySelect.addEventListener('change', () => {
        if (document.querySelector('.sort-options.mobile-active')) {
          closeMobileSort();
        }
        filters.page = 1;
        applyFilters();
      });
    }

    if (minPriceInput && maxPriceInput) {
      minPriceInput.addEventListener('blur', () => {
        filters.price.min = Number.parseFloat(minPriceInput.value) || null;
        if (document.querySelector('.filters-sidebar.mobile-active')) {
          closeMobileFilters();
        }
        debounceApplyFilters();
      });
      maxPriceInput.addEventListener('blur', () => {
        filters.price.max = Number.parseFloat(maxPriceInput.value) || null;
        if (document.querySelector('.filters-sidebar.mobile-active')) {
          closeMobileFilters();
        }
        debounceApplyFilters();
      });
    }

    if (applyPriceFilterBtn) {
      applyPriceFilterBtn.addEventListener('click', () => {
        filters.price.min = Number.parseFloat(minPriceInput.value) || null;
        filters.price.max = Number.parseFloat(maxPriceInput.value) || null;
        filters.page = 1;
        applyFilters();
      });
    }

    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }
  }

  // Reanexar eventos aos checkboxes com aplicação em tempo real
  // function reattachFilterEvents() {
  //   document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
  //     checkbox.addEventListener("change", function () {
  //       const filterType = this.name
  //       const filterValue = this.value

  //       if (this.checked) {
  //         switch (filterType) {
  //           case "category":
  //             if (!filters.categories.includes(filterValue)) {
  //               filters.categories.push(filterValue)
  //             }
  //             break
  //           case "flavor":
  //             if (!filters.flavors.includes(filterValue)) {
  //               filters.flavors.push(filterValue)
  //             }
  //             break
  //           case "brand":
  //             if (!filters.brands.includes(filterValue)) {
  //               filters.brands.push(filterValue)
  //             }
  //             break
  //           case "objective":
  //             if (!filters.objectives.includes(filterValue)) {
  //               filters.objectives.push(filterValue)
  //             }
  //             break
  //           case "accessory":
  //             if (!filters.accessories.includes(filterValue)) {
  //               filters.accessories.push(filterValue)
  //             }
  //             break
  //         }
  //       } else {
  //         switch (filterType) {
  //           case "category":
  //             filters.categories = filters.categories.filter((item) => item !== filterValue)
  //             break
  //           case "flavor":
  //             filters.flavors = filters.flavors.filter((item) => item !== filterValue)
  //             break
  //           case "brand":
  //             filters.brands = filters.brands.filter((item) => item !== filterValue)
  //             break
  //           case "objective":
  //             filters.objectives = filters.objectives.filter((item) => item !== filterValue)
  //             break
  //           case "accessory":
  //             filters.accessories = filters.accessories.filter((item) => item !== filterValue)
  //             break
  //         }
  //       }

  //       // Aplicar filtros em tempo real
  //       debounceApplyFilters()
  //     })
  //   })
  // }

  // Inicializar eventos
  // function initEvents() {
  //   const mobileFilterBtn = document.getElementById("mobile-filter-btn")
  //   const mobileSortBtn = document.getElementById("mobile-sort-btn")
  //   const filtersSidebar = document.querySelector(".filters-sidebar")
  //   const sortOptions = document.querySelector(".sort-options")
  //   let overlay = null

  //   const closeFilterBtn = document.getElementById("close-filter-btn")
  //   const closeSortBtn = document.getElementById("close-sort-btn")

  //   if (closeFilterBtn) {
  //     closeFilterBtn.addEventListener("click", closeMobilePanels)
  //   }

  //   if (closeSortBtn) {
  //     closeSortBtn.addEventListener("click", closeMobilePanels)
  //   }

  //   function createOverlay() {
  //     if (document.querySelector(".overlay")) return
  //     overlay = document.createElement("div")
  //     overlay.className = "overlay"
  //     overlay.style.zIndex = "1000"
  //     overlay.style.position = "fixed"
  //     overlay.style.top = "0"
  //     overlay.style.left = "0"
  //     overlay.style.width = "100%"
  //     overlay.style.height = "100%"
  //     overlay.style.background = "rgba(0, 0, 0, 0.7)"
  //     overlay.style.pointerEvents = "auto"
  //     document.body.appendChild(overlay)
  //     overlay.addEventListener("click", closeMobilePanels)
  //   }

  //   function showOverlay() {
  //     if (!overlay) createOverlay()
  //     overlay.classList.remove("closing")
  //     // Forçando reflow para garantir que a animação funcione
  //     overlay.offsetHeight
  //   }

  //   function hideOverlay() {
  //     if (overlay) {
  //       overlay.classList.add("closing")
  //       setTimeout(() => {
  //         // Removendo overlay do DOM após animação
  //         if (overlay && overlay.parentNode) {
  //           overlay.parentNode.removeChild(overlay)
  //           overlay = null
  //         }
  //       }, 300)
  //     }
  //   }

  //   function closeMobilePanels() {
  //     if (filtersSidebar && filtersSidebar.classList.contains("mobile-active")) {
  //       filtersSidebar.classList.add("mobile-closing")
  //       setTimeout(() => {
  //         filtersSidebar.classList.remove("mobile-active", "mobile-closing")
  //         filtersSidebar.style.zIndex = ""
  //       }, 300)
  //     }

  //     if (sortOptions && sortOptions.classList.contains("mobile-active")) {
  //       sortOptions.classList.add("mobile-closing")
  //       setTimeout(() => {
  //         sortOptions.classList.remove("mobile-active", "mobile-closing")
  //         sortOptions.style.zIndex = ""
  //       }, 300)
  //     }

  //     hideOverlay()
  //   }

  //   // Evento para inputs de preço - aplicar em tempo real com debounce
  //   if (minPriceInput) {
  //     minPriceInput.addEventListener("input", function () {
  //       const minPrice = this.value ? Number.parseFloat(this.value.replace(",", ".")) : null
  //       filters.price.min = minPrice
  //       debounceApplyFilters(500) // Delay maior para inputs de preço
  //     })
  //   }

  //   if (maxPriceInput) {
  //     maxPriceInput.addEventListener("input", function () {
  //       const maxPrice = this.value ? Number.parseFloat(this.value.replace(",", ".")) : null
  //       filters.price.max = maxPrice
  //       debounceApplyFilters(500) // Delay maior para inputs de preço
  //     })
  //   }

  //   // Manter o botão de aplicar preço para quem preferir clicar
  //   if (applyPriceFilterBtn) {
  //     applyPriceFilterBtn.addEventListener("click", () => {
  //       const minPrice = minPriceInput.value ? Number.parseFloat(minPriceInput.value.replace(",", ".")) : null
  //       const maxPrice = maxPriceInput.value ? Number.parseFloat(maxPriceInput.value.replace(",", ".")) : null
  //       filters.price.min = minPrice
  //       filters.price.max = maxPrice
  //       filters.page = 1
  //       applyFilters()
  //     })
  //   }

  //   // Manter o botão aplicar filtros (agora pode ser usado para refresh manual)
  //   if (applyFiltersBtn) {
  //     applyFiltersBtn.addEventListener("click", () => {
  //       filters.page = 1
  //       applyFilters()
  //     })
  //   }

  //   // Eventos para botões de visualização
  //   viewButtons.forEach((button) => {
  //     button.addEventListener("click", function () {
  //       const view = this.getAttribute("data-view")
  //       viewButtons.forEach((btn) => btn.classList.remove("active"))
  //       this.classList.add("active")
  //       if (view === "grid") {
  //         productsGrid.classList.remove("list-view")
  //         productsGrid.classList.add("grid-view")
  //       } else {
  //         productsGrid.classList.remove("grid-view")
  //         productsGrid.classList.add("list-view")
  //       }
  //     })
  //   })

  //   if (mobileFilterBtn) {
  //     mobileFilterBtn.addEventListener("click", () => {
  //       // Fechar painel de ordenação se estiver aberto
  //       if (sortOptions && sortOptions.classList.contains("mobile-active")) {
  //         closeMobilePanels()
  //         setTimeout(() => {
  //           showOverlay()
  //           if (filtersSidebar) {
  //             filtersSidebar.style.zIndex = "1001"
  //             filtersSidebar.classList.add("mobile-active")
  //           }
  //         }, 300)
  //       } else {
  //         showOverlay()
  //         if (filtersSidebar) {
  //           filtersSidebar.style.zIndex = "1001"
  //           filtersSidebar.classList.add("mobile-active")
  //         }
  //       }
  //     })
  //   }

  //   if (mobileSortBtn) {
  //     mobileSortBtn.addEventListener("click", () => {
  //       // Fechar painel de filtros se estiver aberto
  //       if (filtersSidebar && filtersSidebar.classList.contains("mobile-active")) {
  //         closeMobilePanels()
  //         setTimeout(() => {
  //           showOverlay()
  //           if (sortOptions) {
  //             sortOptions.style.zIndex = "1001"
  //             sortOptions.classList.add("mobile-active")
  //           }
  //         }, 300)
  //       } else {
  //         showOverlay()
  //         if (sortOptions) {
  //           sortOptions.style.zIndex = "1001"
  //           sortOptions.classList.add("mobile-active")
  //         }
  //       }
  //     })
  //   }

  //   document.addEventListener("keydown", (event) => {
  //     if (event.key === "Escape") {
  //       closeMobilePanels()
  //     }
  //   })
  // }

  // Aplicar filtros e buscar produtos da API
  async function applyFilters() {
    const authToken = getAuthToken()
    const headers = {
      "Content-Type": "application/json",
    }
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    // Construir query string
    const params = new URLSearchParams()
    params.append("Page", filters.page)
    params.append("PageSize", filters.pageSize)

    if (filters.name) {
      params.append("Name", filters.name)
    }

    if (filters.categories.length > 0) {
      filters.categories.forEach((cat) => params.append("CategoryIds", cat))
    }
    if (filters.flavors.length > 0) {
      filters.flavors.forEach((fla) => params.append("Flavors", fla))
    }
    if (filters.brands.length > 0) {
      filters.brands.forEach((brand) => params.append("BrandIds", brand))
    }
    if (filters.objectives.length > 0) {
      filters.objectives.forEach((obj) => params.append("ObjectiveIds", obj))
    }
    if (filters.accessories.length > 0) {
      filters.accessories.forEach((acc) => params.append("AccessoryIds", acc))
    }
    if (filters.price.min !== null) {
      params.append("MinPrice", filters.price.min)
    }
    if (filters.price.max !== null) {
      params.append("MaxPrice", filters.price.max)
    }
    params.append("IsActive", "true")

    // Mapear ordenação
    const sortBy = sortBySelect ? sortBySelect.value : "relevance"
    let sortByParam = "Name"
    let sortDirection = "asc"

    switch (sortBy) {
      case "price-asc":
        sortByParam = "Price"
        sortDirection = "asc"
        break
      case "price-desc":
        sortByParam = "Price"
        sortDirection = "desc"
        break
      case "name-asc":
        sortByParam = "Name"
        sortDirection = "asc"
        break
      case "name-desc":
        sortByParam = "Name"
        sortDirection = "desc"
        break
      case "relevance":
        sortByParam = "Name"
        sortDirection = "asc"
        break
    }
    params.append("SortBy", sortByParam)
    params.append("SortDirection", sortDirection)

    const url = `${API_BASE_URL}/Product/get?${params.toString()}`

    try {
      showLoading()
      const response = await fetch(url, { headers })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors ? errorData.errors.join(", ") : `Erro ${response.status}`)
      }

      const result = await response.json()

      if (result.hasSuccess && result.value && result.value.products) {
        updateProductsDisplay(result.value.products)
        updatePagination(result.value.pagination)
      } else {
        showNotification(result.errors ? result.errors.join(", ") : "Nenhum produto encontrado.", "info")
        updateProductsDisplay([])
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      showNotification(`Erro ao buscar produtos: ${error.message}`, "error")
      updateProductsDisplay([])
    } finally {
      hideLoading()
    }
  }

  // Limpar filtros
  function clearFilters() {
    filters = {
      categories: [],
      flavors: [],
      brands: [],
      objectives: [],
      accessories: [],
      price: { min: null, max: null },
      page: 1,
      pageSize: 20,
      name: "",
    }

    // Desmarcar todos os checkboxes
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false
    })

    if (minPriceInput) minPriceInput.value = ""
    if (maxPriceInput) maxPriceInput.value = ""
    if (sortBySelect) sortBySelect.value = "relevance"

    // Limpar URL
    const url = new URL(window.location)
    url.search = ""
    window.history.replaceState({}, document.title, url.pathname)

    // Aplicar filtros limpos
    applyFilters()
    showNotification("Filtros limpos!", "info")
  }

  // Atualizar exibição dos produtos
  function updateProductsDisplay(items) {
    productsGrid.innerHTML = ""

    if (!items || items.length === 0) {
      productsGrid.innerHTML =
        '<p class="col-span-full text-center text-gray-500">Nenhum produto encontrado com os filtros selecionados.</p>'
      return
    }

    items.forEach((product) => {
      const brandName = product.attributes.find((attr) => attr.brand)?.brand || "Marca Desconhecida"
      const productCard = document.createElement("div")
      productCard.className =
        "product-card bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
      productCard.innerHTML = `
                <div class="relative">
                    <a href="/product-detail.html?id=${product.id}">
      <img src="${product.imageUrl || "/assets/images/placeholder.png"}" alt="${product.name}" class="w-full h-48 object-cover" style="cursor:pointer; background:#fff;">
    </a>
                    ${product.isNew ? '<span class="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">NOVO</span>' : ""}
                    ${product.discountPercentage ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">-${product.discountPercentage}%</span>` : ""}
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="product-title text-lg font-semibold mb-1 truncate">${product.name}</h3>
                    <p class="text-sm text-white-500">${brandName}</p>                    
                    <div class="flex justify-between items-center">
                        <span class="product-price text-xl font-bold text-orange-500">R$ ${product.price.toFixed(2).replace(".", ",")}</span>
                        ${product.oldPrice ? `<span class="text-sm text-gray-400 line-through">R$ ${product.oldPrice.toFixed(2).replace(".", ",")}</span>` : ""}
                    </div>
                    <a href="/product-detail.html?id=${product.id}" class="add-to-cart mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors duration-300" data-product-id="${product.id}">
                        COMPRAR
                    </a>
                </div>
            `
      productsGrid.appendChild(productCard)
    })

    attachCardEvents()
  }

  // Atualizar paginação
  function updatePagination(pagination) {
    if (!pagination) {
      paginationContainer.innerHTML = ""
      return
    }

    const { currentPage, pageSize, totalItems, totalPages } = pagination
    paginationContainer.innerHTML = `
            <div class="pagination-pages">
                ${Array.from({ length: totalPages }, (_, i) => i + 1)
                  .map(
                    (page) => `
                    <button class="pagination-page ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>
                `,
                  )
                  .join("")}
            </div>
            <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} data-action="prev">«</button>
            <button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} data-action="next">»</button>
        `

    // Anexar eventos aos botões de paginação
    document.querySelectorAll(".pagination-page").forEach((button) => {
      button.addEventListener("click", () => {
        filters.page = Number.parseInt(button.getAttribute("data-page"))
        applyFilters()
      })
    })
    document.querySelectorAll(".pagination-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.getAttribute("data-action")
        if (action === "prev" && filters.page > 1) {
          filters.page--
        } else if (action === "next" && filters.page < totalPages) {
          filters.page++
        }
        applyFilters()
      })
    })
  }

  // Anexar eventos aos botões dentro dos cards
  function attachCardEvents() {
    // document.querySelectorAll('.add-to-cart').forEach(button => {
    //     button.removeEventListener('click', handleAddToCart);
    //     button.addEventListener('click', handleAddToCart);
    // });
    document.querySelectorAll(".wishlist-btn").forEach((button) => {
      button.removeEventListener("click", handleWishlistToggle)
      button.addEventListener("click", handleWishlistToggle)
    })
    document.querySelectorAll(".quickview-btn").forEach((button) => {
      button.removeEventListener("click", handleQuickView)
      button.addEventListener("click", handleQuickView)
    })
  }

  // Manipulador para adicionar ao carrinho
  async function handleAddToCart(event) {
    const productId = event.target.getAttribute("data-product-id")
    const authToken = getAuthToken()
    if (!authToken) {
      showNotification("Você precisa estar logado para adicionar itens ao carrinho.", "error")
      return
    }

    console.log(`Adicionar produto ${productId} ao carrinho`)
    showNotification(`Produto ${productId} adicionado ao carrinho!`, "success")
  }

  // Manipulador para wishlist
  function handleWishlistToggle(event) {
    const button = event.currentTarget
    const icon = button.querySelector("i")
    const productId = button.getAttribute("data-product-id")
    if (icon.classList.contains("far")) {
      icon.classList.replace("far", "fas")
      showNotification("Produto adicionado aos favoritos!", "success")
    } else {
      icon.classList.replace("fas", "far")
      showNotification("Produto removido dos favoritos!", "info")
    }
  }

  // Manipulador para quickview
  function handleQuickView(event) {
    const productId = event.currentTarget.getAttribute("data-product-id")
    showNotification(`Visualização rápida: Produto ${productId}`, "info")
  }

  // Funções auxiliares
  function showLoading() {
    console.log("Carregando...")
    const loadingIndicator = document.getElementById("loadingIndicator")
    if (loadingIndicator) loadingIndicator.style.display = "block"
  }

  function hideLoading() {
    console.log("Carregamento concluído.")
    const loadingIndicator = document.getElementById("loadingIndicator")
    if (loadingIndicator) loadingIndicator.style.display = "none"
  }

  // function showNotification(message, type) {
  //   const existingNotification = document.querySelector(".notification")
  //   if (existingNotification) existingNotification.remove()

  //   const notification = document.createElement("div")
  //   notification.className = `notification ${type}`
  //   notification.innerHTML = `<div class="notification-content"><i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i><span>${message}</span></div>`
  //   document.body.appendChild(notification)

  //   setTimeout(() => {
  //     notification.classList.add("fade-out")
  //     setTimeout(() => notification.remove(), 300)
  //   }, 3000)
  // }

  // Adicionar estilos para notificações
  if (!document.getElementById("notification-styles")) {
    const notificationStyles = document.createElement("style")
    notificationStyles.id = "notification-styles"
    notificationStyles.textContent = `
            .notification { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1050; animation: slideIn 0.3s ease; max-width: 300px; }
            .notification.success { background-color: #10b981; color: white; }
            .notification.info { background-color: #3b82f6; color: white; }
            .notification.error { background-color: #ef4444; color: white; }
            .notification-content { display: flex; align-items: center; }
            .notification-content i { margin-right: 10px; font-size: 1.2rem; }
            .notification.fade-out { opacity: 0; transition: opacity 0.3s ease; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `
    document.head.appendChild(notificationStyles)
  }

  // Função de inicialização principal
  function initialize() {
    // 1. Ler parâmetros da URL primeiro
    initializeFiltersFromUrl()

    // 2. Inicializar eventos
    initEvents()

    // 3. Carregar filtros e aplicar (isso vai marcar os checkboxes e buscar produtos)
    loadFilters().then(() => {
      // 4. Aplicar filtros após carregar (para buscar produtos com os filtros da URL)
      applyFilters()
    })
  }

  // Inicializar tudo
  initialize()
})
