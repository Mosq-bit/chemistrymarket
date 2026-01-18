// ==================== API КЛИЕНТ С НОВОЙ СТРУКТУРОЙ ====================
class ChemistryMarketAPI {
  constructor() {
    this.baseURL = "http://ваш-сервер/api"; // Замените на ваш сервер
    this.productsEndpoint = "/product_files/products/?format=api";
    this.cache = new Map();
    this.cacheDuration = 300000; // 5 минут
    this.currentPage = 1;
    this.perPage = 12;
    this.filters = {
      category: "all",
      search: "",
      manufacturer: "",
      cas: "",
    };
  }

  async fetchProducts(page = 1) {
    try {
      const url = new URL(this.baseURL + this.productsEndpoint);

      // Добавляем пагинацию (если API поддерживает)
      url.searchParams.append("page", page);
      url.searchParams.append("page_size", this.perPage);

      // Добавляем фильтры
      if (this.filters.search) {
        url.searchParams.append("search", this.filters.search);
      }
      if (this.filters.category !== "all") {
        url.searchParams.append("category", this.filters.category);
      }
      if (this.filters.manufacturer) {
        url.searchParams.append("manufacturer", this.filters.manufacturer);
      }
      if (this.filters.cas) {
        url.searchParams.append("cas", this.filters.cas);
      }

      const cacheKey = url.toString();
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        console.log("Используем кешированные данные");
        return cached.data;
      }

      // Реальный запрос к API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Сохраняем в кеш
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: data,
      });

      return data;
    } catch (error) {
      console.error("API Error:", error);
      // Возвращаем демо-данные если API недоступен
      return this.getDemoData(page);
    }
  }

  // Демо-данные для тестирования
  getDemoData(page) {
    const manufacturers = [
      "BASF",
      "Dow Chemical",
      "Evonik",
      "Sibur",
      "Lanxess",
      "AkzoNobel",
      "Clariant",
      "Solvay",
      "Honeywell",
      "DuPont",
    ];

    const categories = [
      { id: "acids", name: "Кислоты" },
      { id: "alkalis", name: "Щелочи" },
      { id: "solvents", name: "Растворители" },
      { id: "polymers", name: "Полимеры" },
      { id: "pigments", name: "Пигменты" },
      { id: "additives", name: "Добавки" },
    ];

    const products = [];
    const startIdx = (page - 1) * this.perPage;

    for (let i = 0; i < this.perPage; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const manufacturer =
        manufacturers[Math.floor(Math.random() * manufacturers.length)];

      products.push({
        id: startIdx + i + 1,
        name: this.getRandomProductName(),
        cas: this.getRandomCAS(),
        formula: this.getRandomFormula(),
        category: category.id,
        category_name: category.name,
        manufacturer: manufacturer,
        packaging: this.getRandomPackaging(),
        unit: "кг",
        price: (Math.random() * 500 + 50).toFixed(2),
        stock: Math.floor(Math.random() * 10000),
        description:
          "Высококачественное химическое сырье промышленного назначения.",
        specifications: this.generateSpecs(),
        files: [
          {
            name: "Технический паспорт",
            url: "#",
            size: "2.4 MB",
          },
        ],
      });
    }

    // Применяем фильтры
    let filtered = products.filter((p) => {
      if (
        this.filters.category !== "all" &&
        p.category !== this.filters.category
      )
        return false;
      if (
        this.filters.search &&
        !p.name.toLowerCase().includes(this.filters.search.toLowerCase())
      )
        return false;
      if (
        this.filters.manufacturer &&
        p.manufacturer !== this.filters.manufacturer
      )
        return false;
      if (this.filters.cas && !p.cas.includes(this.filters.cas)) return false;
      return true;
    });

    return {
      count: 4000,
      next: page < 3 ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: filtered,
    };
  }

  getRandomProductName() {
    const names = [
      "Серная кислота техническая",
      "Гидроксид натрия каустический",
      "Ацетон высшей очистки",
      "Диоксид титана рутильный",
      "Соляная кислота реактивная",
      "Азотная кислота концентрированная",
      "Перекись водорода 37%",
      "Толуол технический",
      "Ксилол нефтяной",
      "Уайт-спирит НЕФРАС",
      "Этилацетат пищевой",
      "Изопропиловый спирт",
      "Этиленгликоль антифризный",
      "Полиакриламид анионный",
      "Бентонит натриевый",
      "Каолин обогащенный",
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRandomCAS() {
    const casNumbers = [
      "7664-93-9",
      "1310-73-2",
      "67-64-1",
      "13463-67-7",
      "7647-01-0",
      "7697-37-2",
      "7722-84-1",
      "108-88-3",
      "1330-20-7",
      "64742-82-1",
      "141-78-6",
      "67-63-0",
      "107-21-1",
      "9003-05-8",
      "1302-78-9",
      "1332-58-7",
    ];
    return casNumbers[Math.floor(Math.random() * casNumbers.length)];
  }

  getRandomFormula() {
    const formulas = [
      "H₂SO₄",
      "NaOH",
      "C₃H₆O",
      "TiO₂",
      "HCl",
      "HNO₃",
      "H₂O₂",
      "C₇H₈",
      "C₈H₁₀",
      "C₂H₅OH",
    ];
    return formulas[Math.floor(Math.random() * formulas.length)];
  }

  getRandomPackaging() {
    const packagings = [
      "Канистра 25 л",
      "Бочка 200 л",
      "Мешок 25 кг",
      "Биг-бэг 1000 кг",
      "Флакон 1 л",
    ];
    return packagings[Math.floor(Math.random() * packagings.length)];
  }

  generateSpecs() {
    return {
      "Температура плавления": `${Math.floor(Math.random() * 200)}°C`,
      Плотность: `${(Math.random() * 2 + 0.5).toFixed(2)} г/см³`,
      Растворимость: "Вода/Спирт/Органические растворители",
      "Класс опасности": Math.floor(Math.random() * 4) + 1,
    };
  }

  async getManufacturers() {
    try {
      const data = await this.fetchProducts(1);
      const manufacturers = new Set();

      if (data.results) {
        data.results.forEach((product) => {
          if (product.manufacturer) {
            manufacturers.add(product.manufacturer);
          }
        });
      }

      return Array.from(manufacturers).sort();
    } catch (error) {
      console.error("Error getting manufacturers:", error);
      return ["BASF", "Dow Chemical", "Evonik", "Sibur", "Lanxess"];
    }
  }

  async getCategories() {
    const categories = [
      { id: "all", name: "Все категории", count: 4000 },
      { id: "acids", name: "Кислоты", count: 800 },
      { id: "alkalis", name: "Щелочи", count: 600 },
      { id: "solvents", name: "Растворители", count: 900 },
      { id: "polymers", name: "Полимеры", count: 700 },
      { id: "pigments", name: "Пигменты", count: 500 },
      { id: "additives", name: "Добавки", count: 500 },
    ];
    return categories;
  }

  clearCache() {
    this.cache.clear();
  }
}

// ==================== ОБНОВЛЕННЫЙ UI МЕНЕДЖЕР ====================
class ProductManager {
  constructor() {
    this.api = new ChemistryMarketAPI();
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalProducts = 0;
  }

  async init() {
    await this.updateApiStatus();
    await this.loadCategories();
    await this.loadManufacturers();
    await this.loadProducts();
    this.setupEventListeners();
  }

  async updateApiStatus() {
    const statusElement = document.getElementById("apiStatus");
    if (!statusElement) return;

    try {
      const response = await fetch(
        this.api.baseURL + this.api.productsEndpoint
      );
      if (response.ok) {
        statusElement.className = "api-status online";
        statusElement.innerHTML =
          '<i class="fas fa-check-circle"></i> API подключен';
      } else {
        throw new Error("API не отвечает");
      }
    } catch (error) {
      statusElement.className = "api-status offline";
      statusElement.innerHTML =
        '<i class="fas fa-exclamation-triangle"></i> Используются демо-данные';
    }
  }

  async loadCategories() {
    try {
      const categories = await this.api.getCategories();
      const container = document.getElementById("categoriesList");
      container.innerHTML = "";

      categories.forEach((category) => {
        const li = document.createElement("li");
        li.innerHTML = `
                    <button class="${category.id === "all" ? "active" : ""}" 
                            data-category="${category.id}">
                        ${category.name}
                        <span class="category-count">${category.count}</span>
                    </button>
                `;
        li.querySelector("button").onclick = () =>
          this.filterByCategory(category.id);
        container.appendChild(li);
      });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async loadManufacturers() {
    try {
      const manufacturers = await this.api.getManufacturers();
      const container = document.getElementById("manufacturerFilter");

      if (container) {
        container.innerHTML = `
                    <option value="">Все производители</option>
                    ${manufacturers.map((m) => `<option value="${m}">${m}</option>`).join("")}
                `;
      }
    } catch (error) {
      console.error("Error loading manufacturers:", error);
    }
  }

  async loadProducts(page = 1) {
    try {
      this.currentPage = page;
      const container = document.getElementById("productsGrid");

      // Показываем скелетон загрузки
      container.innerHTML = this.getLoadingSkeleton();

      const data = await this.api.fetchProducts(page);

      // Обновляем пагинацию
      this.totalProducts = data.count || 0;
      this.totalPages = Math.ceil(this.totalProducts / this.api.perPage);

      this.renderProducts(data.results || []);
      this.renderPagination();
      this.updateProductCount();
    } catch (error) {
      console.error("Error loading products:", error);
      this.showError();
    }
  }

  getLoadingSkeleton() {
    let skeleton = "";
    for (let i = 0; i < this.api.perPage; i++) {
      skeleton += `
                <div class="product-card skeleton">
                    <div class="product-header">
                        <div class="skeleton-line" style="width: 70%; height: 24px; margin-bottom: 10px;"></div>
                        <div class="skeleton-line" style="width: 50%; height: 16px;"></div>
                    </div>
                    <div class="product-body">
                        <div class="skeleton-line" style="height: 60px; margin-bottom: 20px;"></div>
                        <div class="product-specs">
                            <div class="skeleton-line" style="height: 40px;"></div>
                            <div class="skeleton-line" style="height: 40px;"></div>
                        </div>
                    </div>
                </div>
            `;
    }
    return skeleton;
  }

  renderProducts(products) {
    const container = document.getElementById("productsGrid");

    if (products.length === 0) {
      container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--dark-gray); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Товары не найдены</h3>
                    <p style="color: var(--dark-gray); margin-bottom: 20px;">Попробуйте изменить параметры поиска</p>
                    <button onclick="productManager.resetFilters()" class="btn">
                        <i class="fas fa-redo"></i> Сбросить фильтры
                    </button>
                </div>
            `;
      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
                <div class="product-header">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; line-height: 1.3; color: var(--light-gray);">
                        ${product.name}
                    </h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 600;">
                            <i class="fas fa-hashtag"></i> ${product.cas || "CAS не указан"}
                        </span>
                        <span style="font-size: 0.85rem; color: var(--dark-gray);">
                            <i class="fas fa-tag"></i> ${product.category_name || product.category}
                        </span>
                    </div>
                </div>
                <div class="product-body">
                    ${
                      product.description
                        ? `
                        <p style="color: var(--text-dark); margin-bottom: 15px; font-size: 0.95rem; flex-grow: 1;">
                            ${product.description}
                            ${product.formula ? `<br><strong>Формула:</strong> ${product.formula}` : ""}
                        </p>
                    `
                        : ""
                    }
                    
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label">Производитель</span>
                            <span class="spec-value">${product.manufacturer || "Не указан"}</span>
                            ${product.manufacturer ? `<span class="manufacturer-badge">${product.manufacturer}</span>` : ""}
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Упаковка</span>
                            <span class="spec-value">${product.packaging || "По запросу"}</span>
                        </div>
                        
                                                
                        <div class="spec-item">
                            <span class="spec-label">Цена</span>
                            <span class="spec-value">${product.price ? product.price + " ₽/" + (product.unit || "кг") : "По запросу"}</span>
                        </div>
                    </div>
                    
                    ${
                      product.files && product.files.length > 0
                        ? `
                        <div style="margin-top: 15px; padding: 10px; background: var(--light-gray); border-radius: var(--radius);">
                            <strong style="font-size: 0.9rem; color: var(--primary-dark);">Документы:</strong>
                            <div style="margin-top: 5px;">
                                ${product.files
                                  .map(
                                    (file) => `
                                    <a href="${file.url}" style="display: inline-flex; align-items: center; gap: 5px; 
                                        font-size: 0.85rem; color: var(--accent-blue); text-decoration: none; margin-right: 10px;">
                                        <i class="fas fa-file-pdf"></i> ${file.name}
                                    </a>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="product-actions">
                        <button onclick="productManager.requestQuote(${product.id}, '${product.name}')" class="btn">
                            <i class="fas fa-quote-left"></i> Запросить цену
                        </button>
                        <button onclick="productManager.showDetails(${product.id})" class="btn btn-outline">
                            <i class="fas fa-info-circle"></i> Подробнее
                        </button>
                    </div>
                </div>
            `;
      container.appendChild(card);
    });
  }

  renderPagination() {
    const container = document.getElementById("pagination");

    if (this.totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = "";
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Предыдущая страница
    if (this.currentPage > 1) {
      html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>`;
    }

    // Первая страница
    if (start > 1) {
      html += `<button class="page-btn" onclick="productManager.goToPage(1)">1</button>`;
      if (start > 2)
        html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
    }

    // Страницы
    for (let i = start; i <= end; i++) {
      html += `<button class="page-btn ${i === this.currentPage ? "active" : ""}" 
                        onclick="productManager.goToPage(${i})">${i}</button>`;
    }

    // Последняя страница
    if (end < this.totalPages) {
      if (end < this.totalPages - 1)
        html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
      html += `<button class="page-btn" onclick="productManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
    }

    // Следующая страница
    if (this.currentPage < this.totalPages) {
      html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>`;
    }

    // Информация
    html += `<div style="margin-left: 15px; color: var(--dark-gray); font-size: 0.9rem;">
                    Страница ${this.currentPage} из ${this.totalPages}
                </div>`;

    container.innerHTML = html;
  }

  updateProductCount() {
    const countElement = document.getElementById("productCount");
    if (countElement) {
      countElement.textContent = `Найдено товаров: ${this.totalProducts}`;
    }
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadProducts(page);
    window.scrollTo({
      top: document.getElementById("products").offsetTop - 100,
      behavior: "smooth",
    });
  }

  filterByCategory(category) {
    // Обновляем активную кнопку
    document.querySelectorAll("#categoriesList button").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.category === category) {
        btn.classList.add("active");
      }
    });

    this.api.filters.category = category;
    this.loadProducts(1);
  }

  async applyFilters() {
    const search = document.getElementById("searchInput").value;
    const cas = document.getElementById("casFilter").value;
    const manufacturer =
      document.getElementById("manufacturerFilter")?.value || "";

    this.api.filters = {
      category: this.api.filters.category,
      search: search,
      manufacturer: manufacturer,
      cas: cas,
    };

    await this.loadProducts(1);
  }

  resetFilters() {
    // Сбрасываем поля
    document.getElementById("searchInput").value = "";
    document.getElementById("casFilter").value = "";
    const manufacturerFilter = document.getElementById("manufacturerFilter");
    if (manufacturerFilter) manufacturerFilter.value = "";

    // Сбрасываем категорию
    document.querySelectorAll("#categoriesList button").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.category === "all") {
        btn.classList.add("active");
      }
    });

    // Сбрасываем фильтры в API
    this.api.filters = {
      category: "all",
      search: "",
      manufacturer: "",
      cas: "",
    };

    this.loadProducts(1);
  }

  showError() {
    const container = document.getElementById("productsGrid");
    container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Ошибка загрузки каталога</h3>
                <p style="color: var(--dark-gray); margin-bottom: 20px;">Не удалось подключиться к серверу. Используются демо-данные.</p>
                <button onclick="productManager.loadProducts(1)" class="btn">
                    <i class="fas fa-sync-alt"></i> Обновить
                </button>
            </div>
        `;
  }

  requestQuote(productId, productName) {
    // В реальном приложении здесь будет модальное окно или форма
    alert(
      `Запрос цены на: ${productName}\nID: ${productId}\n\nФорма запроса будет открыта в следующей версии.`
    );
  }

  showDetails(productId) {
    alert(
      `Детальная информация о товаре #${productId}\n\nВ полной версии будет открываться страница товара с характеристиками, документацией и формой запроса.`
    );
  }

  setupEventListeners() {
    // Поиск с debounce
    let searchTimeout;
    document.getElementById("searchInput").addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    });

    // Другие фильтры
    document
      .getElementById("casFilter")
      ?.addEventListener("input", () => this.applyFilters());
    document
      .getElementById("manufacturerFilter")
      ?.addEventListener("change", () => this.applyFilters());

    // Кнопка сброса
    document
      .getElementById("resetFilters")
      ?.addEventListener("click", () => this.resetFilters());
  }
}

// Инициализация
let productManager;

document.addEventListener("DOMContentLoaded", function () {
  // Создаем элемент статуса API
  const apiStatus = document.createElement("div");
  apiStatus.id = "apiStatus";
  apiStatus.className = "api-status";
  apiStatus.innerHTML =
    '<i class="fas fa-sync fa-spin"></i> Проверка подключения...';

  // Вставляем статус перед каталогом
  const productsSection = document.getElementById("products");
  if (productsSection) {
    const container = productsSection.querySelector(".container");
    if (container) {
      const h2 = container.querySelector("h2");
      if (h2) {
        h2.insertAdjacentElement("afterend", apiStatus);
      }
    }
  }

  // Создаем элемент счетчика товаров
  const productCount = document.createElement("div");
  productCount.id = "productCount";
  productCount.style.cssText =
    "text-align: center; margin: 20px 0; color: var(--dark-gray); font-weight: 600;";

  // Вставляем счетчик после статуса API
  apiStatus.insertAdjacentElement("afterend", productCount);

  // Инициализируем менеджер
  productManager = new ProductManager();
  productManager.init();

  // Добавляем фильтр по производителю в сайдбар
  const filtersSidebar = document.querySelector(".filters-sidebar");
  if (filtersSidebar) {
    const manufacturerFilterHTML = `
            <div class="filter-group manufacturer-filter">
                <h4><i class="fas fa-industry"></i> Производитель</h4>
                <select id="manufacturerFilter" class="form-control">
                    <option value="">Загрузка...</option>
                </select>
            </div>
        `;

    const categoryGroup = filtersSidebar.querySelector(".filter-group");
    if (categoryGroup) {
      categoryGroup.insertAdjacentHTML("afterend", manufacturerFilterHTML);
    }
  }

  // Добавляем кнопку сброса фильтров
  const filterActions = document.createElement("div");
  filterActions.className = "filter-actions";
  filterActions.innerHTML = `
        <button onclick="productManager.applyFilters()" class="btn">
            <i class="fas fa-check"></i> Применить
        </button>
        <button id="resetFilters" class="btn btn-outline">
            <i class="fas fa-redo"></i> Сбросить
        </button>
    `;

  if (filtersSidebar) {
    filtersSidebar.appendChild(filterActions);
  }
});

// Экспорт в глобальную область
window.productManager = productManager;

document.addEventListener("DOMContentLoaded", function () {
  productManager = new ProductManager();
  productManager.init();

  // Мобильное меню
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");

  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.toggle("fa-times");
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Закрываем мобильное меню если открыто
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          menuIcon.classList.remove("fa-times");
          menuIcon.classList.add("fa-bars");
        }
      }
    });
  });

  // Обновление заголовка при скролле
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
      header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    } else {
      header.style.boxShadow = "none";
    }
  });
});

// Экспорт в глобальную область видимости
window.productManager = productManager;
window.applyFilters = () => productManager.applyFilters();
window.resetFilters = () => productManager.resetFilters();
window.requestQuote = requestQuote;
window.showDetails = showDetails;
