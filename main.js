 class ChemistryMarketAPI {
            constructor() {
                this.baseURL = 'https://api.chemistrymarket.com/v1';
                this.cache = new Map();
                this.currentPage = 1;
                this.perPage = 12;
                this.filters = {
                    category: 'all',
                    search: '',
                    cas: '',
                    minStock: 0,
                    sortBy: ''
                };
            }
            
            async getDemoProducts(page = 1) {
                // Имитация задержки API
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const categories = [
                    { id: 'industrial', name: 'Промышленная химия', count: 1500 },
                    { id: 'paint', name: 'Сырье для ЛКМ', count: 800 },
                    { id: 'oil', name: 'Нефтегазовая химия', count: 600 },
                    { id: 'food', name: 'Пищевые добавки', count: 400 },
                    { id: 'water', name: 'Реагенты для водоочистки', count: 300 },
                    { id: 'lab', name: 'Лабораторные реактивы', count: 200 }
                ];
                
                const products = [];
                const startIdx = (page - 1) * this.perPage;
                
                for (let i = 0; i < this.perPage; i++) {
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    products.push({
                        id: startIdx + i + 1,
                        name: this.getRandomProductName(),
                        cas: this.getRandomCAS(),
                        formula: this.getRandomFormula(),
                        category: category.id,
                        category_name: category.name,
                        purity: `${Math.floor(Math.random() * 20) + 80}%`,
                        packaging: ['Канистра 25л', 'Бочка 200л', 'Мешок 25кг', 'Биг-бэг 1000кг'][Math.floor(Math.random() * 4)],
                        unit: 'кг',
                        price: (Math.random() * 500 + 50).toFixed(2),
                        stock: Math.floor(Math.random() * 10000),
                        supplier: ['BASF', 'Dow', 'Sibur', 'Evonik'][Math.floor(Math.random() * 4)],
                        description: 'Высококачественное химическое сырье для промышленного применения.'
                    });
                }
                
                // Применяем фильтры
                let filtered = products.filter(p => {
                    if (this.filters.category !== 'all' && p.category !== this.filters.category) return false;
                    if (this.filters.search && !p.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
                    if (this.filters.cas && !p.cas.includes(this.filters.cas)) return false;
                    if (this.filters.minStock && p.stock < this.filters.minStock) return false;
                    return true;
                });
                
                // Сортировка
                if (this.filters.sortBy) {
                    filtered.sort((a, b) => {
                        switch (this.filters.sortBy) {
                            case 'name_asc': return a.name.localeCompare(b.name);
                            case 'name_desc': return b.name.localeCompare(a.name);
                            case 'price_asc': return a.price - b.price;
                            case 'price_desc': return b.price - a.price;
                            default: return 0;
                        }
                    });
                }
                
                return {
                    products: filtered,
                    pagination: {
                        page: page,
                        per_page: this.perPage,
                        total: 4000,
                        total_pages: Math.ceil(4000 / this.perPage)
                    }
                };
            }
            
            getRandomProductName() {
                const names = [
                    'Серная кислота техническая', 'Гидроксид натрия', 'Ацетон',
                    'Диоксид титана рутильный', 'Карбонат кальция', 'Соляная кислота',
                    'Азотная кислота', 'Перекись водорода', 'Толуол', 'Ксилол',
                    'Уайт-спирит', 'Этилацетат', 'Изопропанол', 'Этиленгликоль',
                    'Глицерин', 'Гипохлорит натрия', 'Сульфат алюминия', 'Полиакриламид'
                ];
                return names[Math.floor(Math.random() * names.length)];
            }
            
            getRandomCAS() {
                const casNumbers = [
                    '7664-93-9', '1310-73-2', '67-64-1', '13463-67-7', '471-34-1',
                    '7647-01-0', '7697-37-2', '7722-84-1', '108-88-3', '1330-20-7'
                ];
                return casNumbers[Math.floor(Math.random() * casNumbers.length)];
            }
            
            getRandomFormula() {
                const formulas = ['H₂SO₄', 'NaOH', 'C₃H₆O', 'TiO₂', 'CaCO₃', 'HCl', 'HNO₃', 'H₂O₂', 'C₇H₈', 'C₈H₁₀'];
                return formulas[Math.floor(Math.random() * formulas.length)];
            }
            
            async getCategories() {
                await new Promise(resolve => setTimeout(resolve, 100));
                return [
                    { id: 'industrial', name: 'Промышленная химия', count: 1500 },
                    { id: 'paint', name: 'Сырье для ЛКМ', count: 800 },
                    { id: 'oil', name: 'Нефтегазовая химия', count: 600 },
                    { id: 'food', name: 'Пищевые добавки', count: 400 },
                    { id: 'water', name: 'Реагенты для водоочистки', count: 300 },
                    { id: 'lab', name: 'Лабораторные реактивы', count: 200 },
                    { id: 'pharma', name: 'Фармацевтические субстанции', count: 150 }
                ];
            }
        }

        class ProductManager {
            constructor() {
                this.api = new ChemistryMarketAPI();
                this.currentPage = 1;
            }
            
            async init() {
                await this.loadCategories();
                await this.loadProducts();
                this.setupEventListeners();
            }
            
            async loadCategories() {
                try {
                    const categories = await this.api.getCategories();
                    const container = document.getElementById('categoriesList');
                    
                    // Добавляем "Все товары"
                    const allItem = document.createElement('li');
                    allItem.innerHTML = `
                        <button class="active" data-category="all">
                            Все товары
                            <span class="category-count">4000</span>
                        </button>
                    `;
                    allItem.querySelector('button').onclick = () => this.filterByCategory('all');
                    container.appendChild(allItem);
                    
                    // Добавляем категории
                    categories.forEach(cat => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <button data-category="${cat.id}">
                                ${cat.name}
                                <span class="category-count">${cat.count}</span>
                            </button>
                        `;
                        li.querySelector('button').onclick = () => this.filterByCategory(cat.id);
                        container.appendChild(li);
                    });
                    
                } catch (error) {
                    console.error('Error loading categories:', error);
                }
            }
            
            async loadProducts(page = 1) {
                try {
                    const container = document.getElementById('productsGrid');
                    
                    // Показываем скелетон загрузки
                    container.innerHTML = this.getLoadingSkeleton();
                    
                    const data = await this.api.getDemoProducts(page);
                    this.currentPage = page;
                    
                    this.renderProducts(data.products);
                    this.renderPagination(data.pagination);
                    
                } catch (error) {
                    console.error('Error loading products:', error);
                    this.showError();
                }
            }
            
            getLoadingSkeleton() {
                let skeleton = '';
                for (let i = 0; i < this.api.perPage; i++) {
                    skeleton += `
                        <div class="product-card" style="opacity: 0.7;">
                            <div class="product-header">
                                <div style="height: 24px; background: var(--medium-gray); border-radius: 4px; margin-bottom: 10px; width: 70%;"></div>
                                <div style="height: 16px; background: var(--medium-gray); border-radius: 4px; width: 50%;"></div>
                            </div>
                            <div class="product-body">
                                <div style="height: 60px; background: var(--medium-gray); border-radius: 4px; margin-bottom: 20px;"></div>
                                <div class="product-specs">
                                    <div style="height: 40px; background: var(--medium-gray); border-radius: 4px;"></div>
                                    <div style="height: 40px; background: var(--medium-gray); border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                return skeleton;
            }
            
            renderProducts(products) {
                const container = document.getElementById('productsGrid');
                
                if (products.length === 0) {
                    container.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                            <i class="fas fa-search" style="font-size: 3rem; color: var(--dark-gray); margin-bottom: 20px;"></i>
                            <h3 style="color: var(--accent-teal); margin-bottom: 10px;">Товары не найдены</h3>
                            <p style="color: var(--dark-gray); margin-bottom: 20px;">Попробуйте изменить параметры поиска или выбрать другую категорию</p>
                            <button onclick="productManager.resetFilters()" class="btn">
                                <i class="fas fa-redo"></i> Сбросить фильтры
                            </button>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = '';
                
                products.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <div class="product-header">
                            <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; line-height: 1.3;">${product.name}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.85rem; color: var(--light-gray);">
                                    <i class="fas fa-tag"></i> ${product.category_name}
                                </span>
                                <span style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 600;">
                                    <i class="fas fa-hashtag"></i> ${product.cas}
                                </span>
                            </div>
                        </div>
                        <div class="product-body">
                            <p style="color: var(--text-dark); margin-bottom: 15px; font-size: 0.95rem; flex-grow: 1;">
                                ${product.description}
                                ${product.formula ? `<br><strong>Формула:</strong> ${product.formula}` : ''}
                            </p>
                            
                            <div class="product-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Чистота</span>
                                    <span class="spec-value">${product.purity}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Упаковка</span>
                                    <span class="spec-value">${product.packaging}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Остаток</span>
                                    <span class="spec-value">${product.stock.toLocaleString()} ${product.unit}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Цена</span>
                                    <span class="spec-value">${product.price} ₽/${product.unit}</span>
                                </div>
                            </div>
                            
                            <div class="product-actions">
                                <button onclick="requestQuote(${product.id})" class="btn" style="background: var(--primary-blue);">
                                    <i class="fas fa-quote-left"></i> Запрос
                                </button>
                                <button onclick="showDetails(${product.id})" class="btn btn-outline">
                                    <i class="fas fa-info-circle"></i> Подробнее
                                </button>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
            
            renderPagination(pagination) {
                const container = document.getElementById('pagination');
                
                if (!pagination || pagination.total_pages <= 1) {
                    container.innerHTML = '';
                    return;
                }
                
                let html = '';
                const maxVisible = 5;
                let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
                let end = Math.min(pagination.total_pages, start + maxVisible - 1);
                
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
                    if (start > 2) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
                }
                
                // Страницы
                for (let i = start; i <= end; i++) {
                    html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="productManager.goToPage(${i})">${i}</button>`;
                }
                
                // Последняя страница
                if (end < pagination.total_pages) {
                    if (end < pagination.total_pages - 1) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
                    html += `<button class="page-btn" onclick="productManager.goToPage(${pagination.total_pages})">${pagination.total_pages}</button>`;
                }
                
                // Следующая страница
                if (this.currentPage < pagination.total_pages) {
                    html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage + 1})">
                                <i class="fas fa-chevron-right"></i>
                            </button>`;
                }
                
                // Информация о странице
                html += `<div style="margin-left: 15px; color: var(--dark-gray); font-size: 0.9rem;">
                            Страница ${this.currentPage} из ${pagination.total_pages}
                         </div>`;
                
                container.innerHTML = html;
            }
            
            goToPage(page) {
                this.currentPage = page;
                this.loadProducts(page);
                window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
            }
            
            filterByCategory(category) {
                // Обновляем активную кнопку
                document.querySelectorAll('#categoriesList button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.category === category) {
                        btn.classList.add('active');
                    }
                });
                
                this.api.filters.category = category;
                this.loadProducts(1);
            }
            
            async applyFilters() {
                const search = document.getElementById('searchInput').value;
                const cas = document.getElementById('casFilter').value;
                const minStock = document.getElementById('minStock').value;
                const sortBy = document.getElementById('sortBy').value;
                
                this.api.filters = {
                    ...this.api.filters,
                    search: search,
                    cas: cas,
                    minStock: minStock ? parseInt(minStock) : 0,
                    sortBy: sortBy
                };
                
                await this.loadProducts(1);
                
                // На мобильных закрываем фильтры после применения
                if (window.innerWidth <= 992) {
                    this.toggleMobileFilters();
                }
            }
            
            resetFilters() {
                // Сбрасываем поля
                document.getElementById('searchInput').value = '';
                document.getElementById('casFilter').value = '';
                document.getElementById('minStock').value = '';
                document.getElementById('sortBy').value = '';
                
                // Сбрасываем категорию
                document.querySelectorAll('#categoriesList button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.category === 'all') {
                        btn.classList.add('active');
                    }
                });
                
                // Сбрасываем фильтры в API
                this.api.filters = {
                    category: 'all',
                    search: '',
                    cas: '',
                    minStock: 0,
                    sortBy: ''
                };
                
                this.loadProducts(1);
            }
            
            showError() {
                const container = document.getElementById('productsGrid');
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
                        <h3 style="color: var(--accent-teal); margin-bottom: 10px;">Ошибка загрузки</h3>
                        <p style="color: var(--light-gray); margin-bottom: 20px;">Не удалось загрузить каталог. Пожалуйста, попробуйте позже.</p>
                        <button onclick="productManager.loadProducts(1)" class="btn">
                            <i class="fas fa-sync-alt"></i> Попробовать снова
                        </button>
                    </div>
                `;
            }
            
            toggleMobileFilters() {
                const sidebar = document.getElementById('filtersSidebar');
                const toggleBtn = document.getElementById('mobileFiltersToggle');
                
                if (sidebar.classList.contains('hidden-on-mobile')) {
                    sidebar.classList.remove('hidden-on-mobile');
                    sidebar.classList.add('visible-on-mobile');
                    toggleBtn.innerHTML = '<i class="fas fa-times"></i> Закрыть фильтры';
                } else {
                    sidebar.classList.remove('visible-on-mobile');
                    sidebar.classList.add('hidden-on-mobile');
                    toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Фильтры';
                }
            }
            
            setupEventListeners() {
                // Поиск с debounce
                let searchTimeout;
                document.getElementById('searchInput').addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.applyFilters();
                    }, 500);
                });
                
                // Изменение других фильтров
                document.getElementById('casFilter').addEventListener('input', () => this.applyFilters());
                document.getElementById('minStock').addEventListener('input', () => this.applyFilters());
                document.getElementById('sortBy').addEventListener('change', () => this.applyFilters());
                
                // Мобильный переключатель фильтров
                document.getElementById('mobileFiltersToggle').addEventListener('click', () => {
                    this.toggleMobileFilters();
                });
                
                // Закрытие фильтров при клике вне их (для мобильных)
                document.addEventListener('click', (e) => {
                    const sidebar = document.getElementById('filtersSidebar');
                    const toggleBtn = document.getElementById('mobileFiltersToggle');
                    
                    if (window.innerWidth <= 992 && 
                        !sidebar.contains(e.target) && 
                        !toggleBtn.contains(e.target) &&
                        sidebar.classList.contains('visible-on-mobile')) {
                        this.toggleMobileFilters();
                    }
                });
                
                // Ресайз окна
                window.addEventListener('resize', () => {
                    const sidebar = document.getElementById('filtersSidebar');
                    const toggleBtn = document.getElementById('mobileFiltersToggle');
                    
                    // На больших экранах всегда показываем фильтры
                    if (window.innerWidth > 992) {
                        sidebar.classList.remove('hidden-on-mobile', 'visible-on-mobile');
                        toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Фильтры';
                    }
                });
            }
        }

        // Глобальные функции
        function requestQuote(productId) {
            alert(`Запрос цены на товар #${productId}\n\nФорма запроса откроется в следующей версии.`);
        }

        function showDetails(productId) {
            alert(`Детальная информация о товаре #${productId}\n\nВ полной версии будет открываться страница товара.`);
        }

        // Инициализация
        let productManager;

        document.addEventListener('DOMContentLoaded', function() {
            productManager = new ProductManager();
            productManager.init();
            
            // Мобильное меню
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navLinks = document.getElementById('navLinks');
            const menuIcon = document.getElementById('menuIcon');

            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-times');
            });
            
            // Smooth scroll
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        // Закрываем мобильное меню если открыто
                        if (navLinks.classList.contains('active')) {
                            navLinks.classList.remove('active');
                            menuIcon.classList.remove('fa-times');
                            menuIcon.classList.add('fa-bars');
                        }
                    }
                });
            });
            
            // Обновление заголовка при скролле
            window.addEventListener('scroll', function() {
                const header = document.querySelector('header');
                if (window.scrollY > 50) {
                    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.boxShadow = 'none';
                }
            });
        });

        // Экспорт в глобальную область видимости
        window.productManager = productManager;
        window.applyFilters = () => productManager.applyFilters();
        window.resetFilters = () => productManager.resetFilters();
        window.requestQuote = requestQuote;
        window.showDetails = showDetails;
