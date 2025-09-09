// Enums espelhando o backend
const EnumCategory = {
  WheyProtein: 1,
  BarraDeProteina: 2,
  Creatina: 3,
  Glutamina: 4,
  HiperCalorico: 5,
  PreTreino: 6,
  Proteinas: 7,
  Termogenicos: 8,
  Vitaminas: 9,
  Aminoacidos: 10,
};

const EnumObjective = {
  Emagrecimento: 1,
  Hipertrofia: 2,
  Definicao: 3,
  AumentoDeMassaMuscular: 4,
  GanhoDePeso: 5,
  AumentoDeForca: 6,
  MelhoraDeDesempenho: 7,
  MelhoraDeSaude: 8,
  MelhoraDeRecuperacao: 9,
  MelhoraDeImunidade: 10,
  SaudeEBemEstar: 11,
};

const EnumAccessory = {
  Camisetas: 1,
  Garrafas: 2,
  Shakeiras: 3,
  Luvas: 4,
  Cintos: 5,
  Faixas: 6,
  Meias: 7,
  Mochilas: 8,
  Bonés: 9,
  Nenhum: 10,
};

const EnumBrand = {
  MaxTitanium: 1,
  Probiotica: 2,
  Growth: 3,
  Atlhetica: 4,
  IntegralMedica: 5,
  BlackSkull: 6,
  Ftw: 7,
};

// Mapeamento de nomes amigáveis para exibição
const CategoryDisplayNames = {
  WheyProtein: "Whey Protein",
  BarraDeProteina: "Barra de Proteína",
  Creatina: "Creatina",
  Glutamina: "Glutamina",
  HiperCalorico: "Hipercalórico",
  PreTreino: "Pré Treino",
  Proteinas: "Proteínas",
  Termogenicos: "Termogênicos",
  Vitaminas: "Vitaminas",
  Aminoacidos: "Aminoácidos",
};

const ObjectiveDisplayNames = {
  Emagrecimento: "Emagrecimento",
  Hipertrofia: "Hipertrofia",
  Definicao: "Definição",
  AumentoDeMassaMuscular: "Massa Muscular",
  GanhoDePeso: "Ganho de Peso",
  AumentoDeForca: "Aumento de Força",
  MelhoraDeDesempenho: "Energia",
  MelhoraDeSaude: "Melhora da Saúde",
  MelhoraDeRecuperacao: "Recuperação",
  MelhoraDeImunidade: "Imunidade",
  SaudeEBemEstar: "Bem Estar",
};

const AccessoryDisplayNames = {
  Camisetas: "Camisetas",
  Garrafas: "Garrafas",
  Shakeiras: "Shakeiras",
  Luvas: "Luvas",
  Cintos: "Cintos",
  Faixas: "Faixas",
  Meias: "Meias",
  Mochilas: "Mochilas",
  Bonés: "Bonés",
};

const BrandDisplayNames = {
  MaxTitanium: "Max Titanium",
  Probiotica: "Probiótica",
  Growth: "Growth",
  Atlhetica: "Atlhetica",
  IntegralMedica: "Integral Médica",
  BlackSkull: "Black Skull",
  Ftw: "Ftw",
};

// Função para gerar URLs de filtro
function generateFilterUrl(filterType, enumKey) {
  const baseUrl = "/products.html";

  switch (filterType) {
    case "category":
      return `${baseUrl}?CategoryIds=${enumKey}`;
    case "objective":
      return `${baseUrl}?ObjectiveIds=${enumKey}`;
    case "accessory":
      return `${baseUrl}?AccessoryIds=${enumKey}`;
    case "brand":
      return `${baseUrl}?BrandIds=${enumKey}`;
    default:
      return baseUrl;
  }
}

// Função para criar itens de submenu
function createSubmenuItem(displayName, url) {
  return `<li><a href="${url}" class="nav-link">${displayName}</a></li>`;
}

// Função para popular os submenus
function populateSubmenus() {
  // Popular submenu de Produtos (Categorias)
  const productSubmenu = document.querySelector(
    ".menu-item:nth-child(1) .submenu"
  );
  if (productSubmenu) {
    let categoryItems = "";
    Object.keys(EnumCategory).forEach((categoryKey) => {
      const displayName = CategoryDisplayNames[categoryKey];
      const url = generateFilterUrl("category", categoryKey);
      categoryItems += createSubmenuItem(displayName, url);
    });
    productSubmenu.innerHTML = categoryItems;
  }

  // Popular submenu de Objetivos
  const objectiveSubmenu = document.querySelector(
    ".menu-item:nth-child(2) .submenu"
  );
  if (objectiveSubmenu) {
    let objectiveItems = "";
    Object.keys(EnumObjective).forEach((objectiveKey) => {
      const displayName = ObjectiveDisplayNames[objectiveKey];
      const url = generateFilterUrl("objective", objectiveKey);
      objectiveItems += createSubmenuItem(displayName, url);
    });
    objectiveSubmenu.innerHTML = objectiveItems;
  }

  // Popular submenu de Acessórios
  const accessorySubmenu = document.querySelector(
    ".menu-item:nth-child(3) .submenu"
  );
  if (accessorySubmenu) {
    let accessoryItems = "";
    Object.keys(EnumAccessory).forEach((accessoryKey) => {
      // Pular o item "Nenhum"
      if (accessoryKey === "Nenhum") return;

      const displayName = AccessoryDisplayNames[accessoryKey];
      const url = generateFilterUrl("accessory", accessoryKey);
      accessoryItems += createSubmenuItem(displayName, url);
    });
    accessorySubmenu.innerHTML = accessoryItems;
  }

  // Popular submenu de Marcas
  const brandSubmenu = document.querySelector(
    ".menu-item:nth-child(4) .submenu"
  );
  if (brandSubmenu) {
    let brandItems = "";
    Object.keys(EnumBrand).forEach((brandKey) => {
      const displayName = BrandDisplayNames[brandKey];
      const url = generateFilterUrl("brand", brandKey);
      brandItems += createSubmenuItem(displayName, url);
    });
    brandSubmenu.innerHTML = brandItems;
  }
}

// Função para inicializar a navegação
function initializeNavigation() {
  // Aguardar o DOM estar carregado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", populateSubmenus);
  } else {
    populateSubmenus();
  }
}

// Função para obter parâmetros da URL (útil para a página de produtos)
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    CategoryIds: urlParams.get("CategoryIds"),
    ObjectiveIds: urlParams.get("ObjectiveIds"),
    AccessoryIds: urlParams.get("AccessoryIds"),
    BrandIds: urlParams.get("BrandIds"),
    title: urlParams.get("title"), // Adicionado para capturar o título personalizado
  };
}

// Função para construir URL da API com filtros
function buildApiUrl(
  baseUrl = "https://academialoja-production.up.railway.app/api/Product/get"
) {
  const params = getUrlParams();
  const queryParams = [];

  if (params.CategoryIds) {
    queryParams.push(`CategoryIds=${params.CategoryIds}`);
  }
  if (params.ObjectiveIds) {
    queryParams.push(`ObjectiveIds=${params.ObjectiveIds}`);
  }
  if (params.AccessoryIds) {
    queryParams.push(`AccessoryIds=${params.AccessoryIds}`);
  }
  if (params.BrandIds) {
    queryParams.push(`BrandIds=${params.BrandIds}`);
  }

  return queryParams.length > 0
    ? `${baseUrl}?${queryParams.join("&")}`
    : baseUrl;
}

// Função para atualizar título da página com base nos filtros
function updatePageTitle() {
  const params = getUrlParams();
  const titleElement = document.querySelector(".page-title");

  if (!titleElement) return;

  // Se há um título personalizado na URL, usá-lo
  if (params.title) {
    titleElement.textContent = decodeURIComponent(params.title);
    return;
  }

  // Caso contrário, gerar título baseado nos filtros
  let title = "Todos os Produtos";

  if (params.CategoryIds) {
    const categoryKey = Object.keys(EnumCategory).find(
      (key) => EnumCategory[key] == params.CategoryIds
    );
    if (categoryKey) {
      title = CategoryDisplayNames[categoryKey];
    }
  } else if (params.ObjectiveIds) {
    const objectiveKey = Object.keys(EnumObjective).find(
      (key) => EnumObjective[key] == params.ObjectiveIds
    );
    if (objectiveKey) {
      title = ObjectiveDisplayNames[objectiveKey];
    }
  } else if (params.AccessoryIds) {
    const accessoryKey = Object.keys(EnumAccessory).find(
      (key) => EnumAccessory[key] == params.AccessoryIds
    );
    if (accessoryKey) {
      title = AccessoryDisplayNames[accessoryKey];
    }
  } else if (params.BrandIds) {
    const brandKey = Object.keys(EnumBrand).find(
      (key) => EnumBrand[key] == params.BrandIds
    );
    if (brandKey) {
      title = BrandDisplayNames[brandKey];
    }
  }

  titleElement.textContent = title;
}

// Exportar para uso global
window.NavigationEnums = {
  EnumCategory,
  EnumObjective,
  EnumAccessory,
  EnumBrand,
  CategoryDisplayNames,
  ObjectiveDisplayNames,
  AccessoryDisplayNames,
  BrandDisplayNames,
  generateFilterUrl,
  getUrlParams,
  buildApiUrl,
  updatePageTitle, // Nova função exportada
  initializeNavigation,
};

// Inicializar automaticamente
initializeNavigation();

document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".subheader .menu-item");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const subheaderNav = document.querySelector(".subheader-nav");

  // Toggle the main mobile navigation
  if (mobileMenuBtn && subheaderNav) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Impede que o evento de clique se propague para o documento
      mobileMenuBtn.classList.toggle("active");
      subheaderNav.classList.toggle("active");
    });
  }

  menuItems.forEach((item) => {
    const link = item.querySelector("a.nav-link");
    const submenu = item.querySelector(".submenu");

    if (link && submenu) {
      link.addEventListener("click", function (event) {
        // Aplica a lógica apenas na visualização móvel (corresponde ao breakpoint do CSS)
        if (window.innerWidth <= 767) {
          // Se o submenu não estiver aberto, abra-o e impeça a navegação.
          if (!item.classList.contains("active")) {
            event.preventDefault();

            // Fecha outros itens de menu abertos antes de abrir o novo
            menuItems.forEach((otherItem) => {
              if (otherItem !== item) {
                otherItem.classList.remove("active");
              }
            });

            // Abre o item atual
            item.classList.add("active");
          }
          // Se o submenu já estiver aberto, o clique navegará naturalmente.
        }
      });
    }
  });

  // Fecha o menu móvel ao clicar fora dele
  document.addEventListener("click", function (event) {
    if (subheaderNav && subheaderNav.classList.contains("active")) {
      const isClickInsideMenu = subheaderNav.contains(event.target);
      const isClickOnMenuButton = mobileMenuBtn.contains(event.target);

      if (!isClickInsideMenu && !isClickOnMenuButton) {
        subheaderNav.classList.remove("active");
        mobileMenuBtn.classList.remove("active");
        menuItems.forEach((item) => item.classList.remove("active"));
      }
    }
  });
});
