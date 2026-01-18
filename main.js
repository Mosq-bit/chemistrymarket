
        class ChemistryMarketAPI {
            constructor() {
                this.baseURL = 'https://api.chemistrymarket.com/v1'; // Change to your API endpoint
                this.cache = new Map();
                this.cacheDuration = 300000; // 5 minutes
                this.currentPage = 1;
                this.perPage = 12;
                this.filters = {
                    category: 'all',
                    search: '',
                    cas: '',
                    minStock: 0
                };
            }
            
            async request(endpoint, params = {}) {
                try {
                    const url = new URL(`${this.baseURL}${endpoint}`);
                    
                    // Add query parameters
                    Object.keys(params).forEach(key => {
                        if (params[key] !== undefined && params[key] !== '') {
                            url.searchParams.append(key, params[key]);
                        }
                    });
                    
                    // Check cache
                    const cacheKey = url.toString();
                    const cached = this.cache.get(cacheKey);
                    
                    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                        console.log('Using cached data:', endpoint);
                        return cached.data;
                    }
                    
                    // For demo purposes - simulate API response
                    if (this.baseURL.includes('demo')) {
                        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                        return this.getDemoData(endpoint, params);
                    }
                    
                    // Real API request
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer YOUR_API_TOKEN' // Add your API token
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Cache the response
                    this.cache.set(cacheKey, {
                        timestamp: Date.now(),
                        data: data
                    });
                    
                    return data;
                    
                } catch (error) {
                    console.error('API Request Error:', error);
                    // Fallback to demo data
                    return this.getDemoData(endpoint, params);
                }
            }
            
            // Demo data for testing
            getDemoData(endpoint, params) {
                if (endpoint === '/categories') {
                    return {
                        success: true,
                        data: [
                            { name: 'Промышленная химия', count: 1500, slug: 'industrial' },
                            { name: 'Сырье для ЛКМ', count: 800, slug: 'paint' },
                            { name: 'Нефтегазовая химия', count: 600, slug: 'oil' },
                            { name: 'Пищевые добавки', count: 400, slug: 'food' },
                            { name: 'Реагенты для водоочистки', count: 300, slug: 'water' },
                            { name: 'Лабораторные реактивы', count: 200, slug: 'lab' },
                            { name: 'Фармацевтические субстанции', count: 150, slug: 'pharma' }
                        ]
                    };
                }
                
                if (endpoint === '/products') {
                    const demoProducts = this.generateDemoProducts(params.page || 1, params.per_page || 12);
                    return {
                        success: true,
                        data: {
                            products: demoProducts,
                            pagination: {
                                page: params.page || 1,
                                per_page: params.per_page || 12,
                                total: 4000,
                                total_pages: Math.ceil(4000 / (params.per_page || 12))
                            }
                        }
                    };
                }
                
                return { success: true, data: [] };
            }
            
            generateDemoProducts(page, perPage) {
                const categories = ['industrial', 'paint', 'oil', 'food', 'water', 'lab', 'pharma'];
                const names = [
                    'Серная кислота техническая', 'Гидроксид натрия', 'Ацетон технический',
                    'Диоксид титана рутильный', 'Карбонат кальция осажденный', 'Соляная кислота',
                    'Азотная кислота', 'Перекись водорода', 'Метилэтилкетон', 'Толуол',
                    'Ксилол', 'Уайт-спирит', 'Этилацетат', 'Бутилацетат', 'Изопропанол',
                    'Этиленгликоль', 'Пропиленгликоль', 'Глицерин технический', 'Сода каустическая',
                    'Сода кальцинированная', 'Гипохлорит натрия', 'Сульфат алюминия', 'Хлорное железо',
                    'Полиакриламид', 'Бентонит', 'Каолин', 'Тальк', 'Слюда', 'Барит'
                ];
                
                const casNumbers = [
                    '7664-93-9', '1310-73-2', '67-64-1', '13463-67-7', '471-34-1',
                    '7647-01-0', '7697-37-2', '7722-84-1', '78-93-3', '108-88-3',
                    '1330-20-7', '64742-82-1', '141-78-6', '123-86-4', '67-63-0',
                    '107-21-1', '57-55-6', '56-81-5', '1310-73-2', '497-19-8',
                    '7681-52-9', '10043-01-3', '7705-08-0', '9003-05-8', '1302-78-9',
                    '1332-58-7', '14807-96-6', '12001-26-2', '7727-43-7'
                ];
                
                const products = [];
                const startIndex = (page - 1) * perPage;
                
                for (let i = 0; i < perPage; i++) {
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    const name = names[Math.floor(Math.random() * names.length)];
                    const cas = casNumbers[Math.floor(Math.random() * casNumbers.length)];
                    
                    products.push({
                        id: startIndex + i + 1,
                        name: name,
                        cas: cas,
                        formula: this.getFormulaForName(name),
                        category: category,
                        category_name: this.getCategoryName(category),
                        purity: `${Math.floor(Math.random() * 30) + 70}%`,
                        packaging: this.getRandomPackaging(),
                        unit: 'кг',
                        price: (Math.random() * 500 + 50).toFixed(2),
                        stock: Math.floor(Math.random() * 10000),
                        supplier: this.getRandomSupplier(),
                        description: `${name} — химическое сырье для промышленного применения. CAS номер: ${cas}. Высокая степень очистки, соответствует техническим требованиям.`,
                        specifications: {
                            'Внешний вид': 'Жидкость/Порошок/Гранулы',
                            'Плотность': `${(Math.random() * 2 + 0.5).toFixed(2)} г/см³`,
                            'Температура плавления': `${Math.floor(Math.random() * 200)}°C`,
                            'Растворимость': 'Вода/Спирт/Органические растворители'
                        }
                    });
                }
                
                // Apply filters
                return products.filter(product => {
                    if (this.filters.category !== 'all' && product.category !== this.filters.category) return false;
                    if (this.filters.search && !product.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
                    if (this.filters.cas && !product.cas.includes(this.filters.cas)) return false;
                    if (this.filters.minStock && product.stock < this.filters.minStock) return false;
                    return true;
                });
            }
            
            getFormulaForName(name) {
                const formulas = {
                    'Серная кислота': 'H₂SO₄',
                    'Гидроксид натрия': 'NaOH',
                    'Ацетон': 'C₃H₆O',
                    'Диоксид титана': 'TiO₂',
                    'Карбонат кальция': 'CaCO₃',
                    'Соляная кислота': 'HCl',
                    'Азотная кислота': 'HNO₃',
                    'Перекись водорода': 'H₂O₂'
                };
                
                for (const [key, formula] of Object.entries(formulas)) {
                    if (name.includes(key)) return formula;
                }
                return '';
            }
            
            getCategoryName(category) {
                const names = {
                    'industrial': 'Промышленная химия',
                    'paint': 'Сырье для ЛКМ',
                    'oil': 'Нефтегазовая химия',
                    'food': 'Пищевые добавки',
                    'water': 'Реагенты для водоочистки',
                    'lab': 'Лабораторные реактивы',
                    'pharma': 'Фармацевтические субстанции'
                };
                return names[category] || category;
            }
            
            getRandomPackaging() {
                const packagings = ['Канистра 25 л', 'Бочка 200 л', 'Мешок 25 кг', 'Биг-бэг 1000 кг', 'Бутыль 5 л', 'Флакон 1 л'];
                return packagings[Math.floor(Math.random() * packagings.length)];
            }
            
            getRandomSupplier() {
                const suppliers = ['BASF', 'Dow', 'Sibur', 'Evonik', 'AkzoNobel', 'Clariant', 'Lanxess', 'Solvay'];
                return suppliers[Math.floor(Math.random() * suppliers.length)];
            }
            
            // Public methods
            async getCategories() {
                const response = await this.request('/categories');
                return response.data || [];
            }
            
            async getProducts(page = 1, filters = {}) {
                this.currentPage = page;
                this.filters = { ...this.filters, ...filters };
                
                const params = {
                    page: page,
                    per_page: this.perPage,
                    ...this.filters
                };
                
                const response = await this.request('/products', params);
                return response.data || { products: [], pagination: {} };
            }
            
            async searchProducts(query, limit = 10) {
                const response = await this.request('/search', { q: query, limit: limit });
                return response.data || [];
            }
            
            clearCache() {
                this.cache.clear();
            }
        }

        // ==================== UI MANAGER ====================
        class UIManager {
            constructor() {
                this.api = new ChemistryMarketAPI();
                this.currentPage = 1;
                this.totalPages = 1;
                this.searchTimeout = null;
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
                    
                    // Clear existing (except "All")
                    const allButton = container.querySelector('button[data-category="all"]').parentNode;
                    container.innerHTML = '';
                    container.appendChild(allButton);
                    
                    // Add categories
                    categories.forEach(category => {
                        const li = document.createElement('li');
                        const button = document.createElement('button');
                        button.textContent = `${category.name} (${category.count})`;
                        button.dataset.category = category.slug;
                        button.onclick = () => this.filterByCategory(category.slug);
                        
                        li.appendChild(button);
                        container.appendChild(li);
                    });
                    
                } catch (error) {
                    console.error('Error loading categories:', error);
                }
            }
            
            async loadProducts(page = 1) {
                try {
                    const container = document.getElementById('productsGrid');
                    container.innerHTML = `
                        <div class="loading">
                            <div class="loading-spinner"></div>
                            <p>Загрузка товаров...</p>
                        </div>
                    `;
                    
                    const { products, pagination } = await this.api.getProducts(page);
                    
                    this.currentPage = pagination.page;
                    this.totalPages = pagination.total_pages;
                    
                    this.renderProducts(products);
                    this.renderPagination(pagination);
                    
                } catch (error) {
                    console.error('Error loading products:', error);
                    const container = document.getElementById('productsGrid');
                    container.innerHTML = `
                        <div class="loading">
                            <p style="color: #dc2626;">Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>
                        </div>
                    `;
                }
            }
            
            renderProducts(products) {
                const container = document.getElementById('productsGrid');
                
                if (products.length === 0) {
                    container.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                            <i class="fas fa-search" style="font-size: 3rem; color: var(--dark-gray); margin-bottom: 20px;"></i>
                            <h3 style="color: var(--accent-teal);">Товары не найдены</h3>
                            <p style="color: var(--dark-gray);">Попробуйте изменить параметры поиска</p>
                            <button onclick="resetFilters()" class="btn" style="margin-top: 20px;">Сбросить фильтры</button>
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
                            <h3 style="margin-bottom: 5px; color: var(--accent-teal);">${product.name}</h3>
                            ${product.cas ? `<p style="color: var(--dark-gray); font-size: 0.9rem; margin-bottom: 10px;"><strong>CAS:</strong> ${product.cas}</p>` : ''}
                            ${product.formula ? `<p style="color: var(--dark-gray); font-size: 0.9rem;"><strong>Формула:</strong> ${product.formula}</p>` : ''}
                        </div>
                        <div class="product-body">
                            <p style="color: var(--text-dark); margin-bottom: 15px; font-size: 0.95rem;">${product.description}</p>
                            
                            <div class="product-specs">
                                <div class="spec-item">
                                    <span class="spec-label">Категория</span>
                                    <span class="spec-value">${product.category_name || product.category}</span>
                                </div>
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
                            </div>
                            
                            <div class="product-actions">
                                <button onclick="requestQuote(${product.id})" class="btn">
                                    <i class="fas fa-quote-left"></i> Запросить цену
                                </button>
                                <button onclick="showProductDetails(${product.id})" class="btn btn-outline">
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
                
                if (pagination.total_pages <= 1) {
                    container.innerHTML = '';
                    return;
                }
                
                let html = '';
                const maxPagesToShow = 5;
                let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
                let endPage = Math.min(pagination.total_pages, startPage + maxPagesToShow - 1);
                
                if (endPage - startPage + 1 < maxPagesToShow) {
                    startPage = Math.max(1, endPage - maxPagesToShow + 1);
                }
                
                // Previous button
                if (this.currentPage > 1) {
                    html += `<button class="page-btn" onclick="uiManager.goToPage(${this.currentPage - 1})">
                                <i class="fas fa-chevron-left"></i>
                            </button>`;
                }
                
                // First page
                if (startPage > 1) {
                    html += `<button class="page-btn" onclick="uiManager.goToPage(1)">1</button>`;
                    if (startPage > 2) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
                }
                
                // Page numbers
                for (let i = startPage; i <= endPage; i++) {
                    html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="uiManager.goToPage(${i})">${i}</button>`;
                }
                
                // Last page
                if (endPage < pagination.total_pages) {
                    if (endPage < pagination.total_pages - 1) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
                    html += `<button class="page-btn" onclick="uiManager.goToPage(${pagination.total_pages})">${pagination.total_pages}</button>`;
                }
                
                // Next button
                if (this.currentPage < pagination.total_pages) {
                    html += `<button class="page-btn" onclick="uiManager.goToPage(${this.currentPage + 1})">
                                <i class="fas fa-chevron-right"></i>
                            </button>`;
                }
                
                container.innerHTML = html;
            }
            
            goToPage(page) {
                this.currentPage = page;
                this.loadProducts(page);
                window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
            }
            
            filterByCategory(category) {
                // Update active button
                document.querySelectorAll('.category-list button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.category === category) {
                        btn.classList.add('active');
                    }
                });
                
                this.api.filters.category = category;
                this.loadProducts(1);
            }
            
            setupEventListeners() {
                // Search input with debounce
                const searchInput = document.getElementById('searchInput');
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.api.filters.search = e.target.value;
                        this.loadProducts(1);
                    }, 500);
                });
                
                // CAS filter
                const casFilter = document.getElementById('casFilter');
                casFilter.addEventListener('input', (e) => {
                    this.api.filters.cas = e.target.value;
                });
                
                // Min stock filter
                const minStock = document.getElementById('minStock');
                minStock.addEventListener('input', (e) => {
                    this.api.filters.minStock = e.target.value ? parseInt(e.target.value) : 0;
                });
                
                // Contact form
                const contactForm = document.getElementById('contactForm');
                contactForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(contactForm);
                    const data = Object.fromEntries(formData.entries());
                    
                    // Show loading
                    const submitBtn = contactForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                    submitBtn.disabled = true;
                    
                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        // Success
                        alert(`Спасибо, ${data.name}! Ваш запрос отправлен. Наш менеджер свяжется с вами в течение 30 минут.`);
                        contactForm.reset();
                        
                    } catch (error) {
                        alert('Ошибка отправки формы. Пожалуйста, попробуйте позже или позвоните нам.');
                    } finally {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                });
            }
        }

        // ==================== GLOBAL FUNCTIONS ====================
        let uiManager;

        function applyFilters() {
            const casFilter = document.getElementById('casFilter').value;
            const minStock = document.getElementById('minStock').value;
            
            uiManager.api.filters.cas = casFilter;
            uiManager.api.filters.minStock = minStock ? parseInt(minStock) : 0;
            uiManager.loadProducts(1);
        }

        function resetFilters() {
            // Reset form inputs
            document.getElementById('searchInput').value = '';
            document.getElementById('casFilter').value = '';
            document.getElementById('minStock').value = '';
            
            // Reset category
            document.querySelectorAll('.category-list button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') {
                    btn.classList.add('active');
                }
            });
            
            // Reset API filters
            uiManager.api.filters = {
                category: 'all',
                search: '',
                cas: '',
                minStock: 0
            };
            
            uiManager.loadProducts(1);
        }

        function requestQuote(productId) {
            // Show modal or redirect to contact form with product info
            const productInput = document.getElementById('product');
            if (productInput) {
                // In real app, you would fetch product name from API
                productInput.value = `Товар #${productId}`;
            }
            
            // Scroll to contact form
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }

        function showProductDetails(productId) {
            // In real app, this would open a modal or redirect to product page
            alert(`Детальная информация о товаре #${productId}\n\nВ реальном приложении здесь будет открываться страница товара с полным описанием, техническими характеристиками, документацией и формой запроса.`);
        }

        // ==================== MOBILE MENU ====================
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        const menuIcon = document.getElementById('menuIcon');

        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            if (navLinks.classList.contains('active')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            });
        });

        // ==================== INITIALIZATION ====================
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize UI Manager
            uiManager = new UIManager();
            uiManager.init();
            
            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Sticky header on scroll
            window.addEventListener('scroll', () => {
                const header = document.querySelector('header');
                if (window.scrollY > 100) {
                    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                } else {
                    header.style.boxShadow = 'var(--shadow)';
                }
            });
            
            // Auto-refresh products every 5 minutes
            setInterval(() => {
                uiManager.api.clearCache();
                uiManager.loadProducts(uiManager.currentPage);
            }, 5 * 60 * 1000);
            
            // Print company info
            console.log('%c🚀 ChemistryMarket 🚀', 'font-size: 20px; font-weight: bold; color: #1e3a8a;');
            console.log('%cПоставщик химического сырья с 2015 года', 'font-size: 14px; color: #475569;');
            console.log('%cAPI Status: ✅ Ready', 'color: #06d6a0; font-weight: bold;');
        });

        // ==================== WINDOW EXPORTS ====================
        window.uiManager = uiManager;
        window.applyFilters = applyFilters;
        window.resetFilters = resetFilters;
        window.requestQuote = requestQuote;

        window.showProductDetails = showProductDetails;
