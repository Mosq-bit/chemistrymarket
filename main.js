// ==================== API КЛИЕНТ С REAL API ====================
class ChemistryMarketAPI {
    constructor() {
        // ИСПРАВЛЕНО: Определяем базовый URL динамически
        this.baseURL = this.determineBaseURL();
        this.authToken = 'Basic YXBpOnlvdXJfc2VjcmV0X2FwaV9rZXk='; // Ваш токен из примера
        this.cache = new Map();
        this.cacheDuration = 300000; // 5 минут
        this.currentPage = 1;
        this.perPage = 12;
        this.filters = {
            category: 'all',
            search: '',
            manufacturer: '',
            cas: ''
        };
        this.apiAvailable = false;
        this.initialized = false;
    }
    
    determineBaseURL() {
        const isProduction = window.location.hostname.includes('github.io');
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isProduction) {
            // В production пробуем разные варианты
            const possibleURLs = [
                'https://83.222.18.158:3001/api/v1',
                'https://chemistrymarket-api.onrender.com/api/v1', // пример для Render/Heroku
                'https://corsproxy.io/?https://83.222.18.158:3001/api/v1'
            ];
            return possibleURLs[0]; // Используем первый вариант
        } else if (isLocalhost) {
            // Для локальной разработки
            return 'http://localhost:3001/api/v1';
        } else {
            // Для других случаев
            return 'https://83.222.18.158:3001/api/v1';
        }
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Тестируем подключение к API
            await this.testConnection();
            this.initialized = true;
        } catch (error) {
            console.warn('API инициализация не удалась, используем демо-режим:', error.message);
            this.apiAvailable = false;
        }
    }
    
    async testConnection() {
        const testURLs = [
            `${this.baseURL}/product/detail/302016`,
            `https://corsproxy.io/?${encodeURIComponent(`http://83.222.18.158:3001/api/v1/product/detail/302016`)}`
        ];
        
        for (const url of testURLs) {
            try {
                console.log('Тестируем подключение к:', url);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': this.authToken,
                        'Accept': 'application/json'
                    },
                    signal: AbortSignal.timeout(3000)
                });
                
                if (response.ok) {
                    this.apiAvailable = true;
                    console.log('API доступен через:', url);
                    return true;
                }
            } catch (error) {
                console.log('Не удалось подключиться к:', url, error.message);
                continue;
            }
        }
        
        this.apiAvailable = false;
        return false;
    }
    
    async safeFetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': this.authToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('Ошибка fetch:', error.message);
            return null;
        }
    }
    
    async fetchProductDetail(productId) {
        const cacheKey = `detail_${productId}`;
        
        // Проверяем кеш
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        
        if (this.apiAvailable) {
            try {
                // Пробуем прямое подключение
                const directUrl = `${this.baseURL}/product/detail/${productId}`;
                const data = await this.safeFetch(directUrl);
                
                if (data) {
                    this.cache.set(cacheKey, {
                        timestamp: Date.now(),
                        data: data
                    });
                    return data;
                }
                
                // Если прямое подключение не сработало, пробуем через CORS прокси
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`http://83.222.18.158:3001/api/v1/product/detail/${productId}`)}`;
                const proxyData = await this.safeFetch(proxyUrl);
                
                if (proxyData) {
                    this.cache.set(cacheKey, {
                        timestamp: Date.now(),
                        data: proxyData
                    });
                    return proxyData;
                }
            } catch (error) {
                console.warn('Ошибка получения данных с API:', error.message);
            }
        }
        
        // Если API недоступен, используем демо-данные
        const demoData = this.getDemoProductDetail(productId);
        this.cache.set(cacheKey, {
            timestamp: Date.now(),
            data: demoData
        });
        return demoData;
    }
    
    async fetchProducts(page = 1) {
        this.currentPage = page;
        
        // В реальном API здесь был бы запрос к /products
        // Пока используем демо-данные
        return this.getDemoData(page);
    }
    
    // Демо-данные на основе реальной структуры API
    getDemoProductDetail(productId) {
        const manufacturers = [
            'BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess',
            'AkzoNobel', 'Clariant', 'Solvay', 'Honeywell', 'DuPont',
            'Химсинтез', 'Уралхим', 'ФосАгро', 'НИОС', 'Акрон'
        ];
        
        const categories = [
            { id: 'acids', name: 'Кислоты' },
            { id: 'alkalis', name: 'Щелочи' },
            { id: 'solvents', name: 'Растворители' },
            { id: 'polymers', name: 'Полимеры' },
            { id: 'pigments', name: 'Пигменты' },
            { id: 'additives', name: 'Добавки' },
            { id: 'reagents', name: 'Реактивы' },
            { id: 'raw_materials', name: 'Сырье' }
        ];
        
        const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        return {
            id: productId,
            product_id: productId,
            name: this.getRandomProductName(),
            description: 'Высококачественное химическое сырье промышленного назначения. Соответствует ГОСТ и международным стандартам качества.',
            cas_number: this.getRandomCAS(),
            formula: this.getRandomFormula(),
            category: category.id,
            category_name: category.name,
            manufacturer: manufacturer,
            manufacturer_id: Math.floor(Math.random() * 1000),
            packaging: this.getRandomPackaging(),
            unit: 'кг',
            price: (Math.random() * 500 + 50).toFixed(2),
            stock: Math.floor(Math.random() * 10000),
            min_order: 100,
            lead_time: '3-5 дней',
            specifications: this.generateSpecs(),
            certificates: [
                {
                    name: 'Сертификат качества',
                    url: '#',
                    type: 'pdf'
                },
                {
                    name: 'Паспорт безопасности (MSDS)',
                    url: '#',
                    type: 'pdf'
                }
            ],
            files: [
                {
                    id: 1,
                    name: 'Технический паспорт',
                    url: '#',
                    size: '2.4 MB',
                    type: 'pdf'
                },
                {
                    id: 2,
                    name: 'Инструкция по применению',
                    url: '#',
                    size: '1.2 MB',
                    type: 'pdf'
                }
            ],
            images: [
                {
                    id: 1,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
                    alt: 'Химическая продукция',
                    is_main: true
                }
            ],
            created_at: '2023-01-15T10:30:00Z',
            updated_at: '2023-12-01T14:20:00Z',
            is_active: true,
            supplier_info: {
                name: manufacturer,
                rating: 4.8,
                delivery_time: '2-7 дней',
                country: 'Германия'
            },
            similar_products: [
                { id: 302017, name: 'Аналогичный продукт A', price: '125.00' },
                { id: 302018, name: 'Аналогичный продукт B', price: '145.00' }
            ]
        };
    }
    
    getDemoData(page) {
        const products = [];
        const startIdx = (page - 1) * this.perPage;
        
        for (let i = 0; i < this.perPage; i++) {
            const productId = 302016 + startIdx + i;
            const productDetail = this.getDemoProductDetail(productId);
            
            // Формируем краткую информацию для списка
            products.push({
                id: productId,
                product_id: productId,
                name: productDetail.name,
                cas_number: productDetail.cas_number,
                formula: productDetail.formula,
                category: productDetail.category,
                category_name: productDetail.category_name,
                manufacturer: productDetail.manufacturer,
                packaging: productDetail.packaging,
                unit: productDetail.unit,
                price: productDetail.price,
                stock: productDetail.stock,
                description: productDetail.description.substring(0, 150) + '...',
                min_order: productDetail.min_order,
                specifications: productDetail.specifications
            });
        }
        
        // Применяем фильтры
        let filtered = products.filter(p => {
            if (this.filters.category !== 'all' && p.category !== this.filters.category) return false;
            if (this.filters.search && !p.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
            if (this.filters.manufacturer && p.manufacturer !== this.filters.manufacturer) return false;
            if (this.filters.cas && !p.cas_number.includes(this.filters.cas)) return false;
            return true;
        });
        
        return {
            count: 4000,
            next: page < 3 ? `?page=${page + 1}` : null,
            previous: page > 1 ? `?page=${page - 1}` : null,
            results: filtered
        };
    }
    
    // Вспомогательные методы
    getRandomProductName() {
        const names = [
            'Серная кислота техническая',
            'Гидроксид натрия каустический',
            'Ацетон высшей очистки',
            'Диоксид титана рутильный',
            'Соляная кислота реактивная',
            'Азотная кислота концентрированная',
            'Перекись водорода 37%',
            'Толуол технический',
            'Ксилол нефтяной',
            'Уайт-спирит НЕФРАС',
            'Этилацетат пищевой',
            'Изопропиловый спирт',
            'Этиленгликоль антифризный',
            'Полиакриламид анионный',
            'Бентонит натриевый',
            'Каолин обогащенный',
            'Оксид цинка технический',
            'Карбонат кальция осажденный',
            'Сульфат алюминия',
            'Хлорное железо'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    getRandomCAS() {
        const casNumbers = [
            '7664-93-9', '1310-73-2', '67-64-1', '13463-67-7',
            '7647-01-0', '7697-37-2', '7722-84-1', '108-88-3',
            '1330-20-7', '64742-82-1', '141-78-6', '67-63-0',
            '107-21-1', '9003-05-8', '1302-78-9', '1332-58-7',
            '1314-13-2', '471-34-1', '10043-01-3', '7705-08-0'
        ];
        return casNumbers[Math.floor(Math.random() * casNumbers.length)];
    }
    
    getRandomFormula() {
        const formulas = [
            'H₂SO₄', 'NaOH', 'C₃H₆O', 'TiO₂', 'HCl', 'HNO₃', 
            'H₂O₂', 'C₇H₈', 'C₈H₁₀', 'C₂H₅OH', 'C₂H₆O₂', 
            '(C₃H₅NO)n', 'Al₂(SO₄)₃', 'FeCl₃', 'ZnO', 'CaCO₃'
        ];
        return formulas[Math.floor(Math.random() * formulas.length)];
    }
    
    getRandomPackaging() {
        const packagings = [
            'Канистра 25 л', 'Бочка 200 л', 'Мешок 25 кг', 
            'Биг-бэг 1000 кг', 'Флакон 1 л', 'Бутыль 5 л',
            'Контейнер IBC 1000 л', 'Барабан 180 кг'
        ];
        return packagings[Math.floor(Math.random() * packagings.length)];
    }
    
    generateSpecs() {
        return {
            'Внешний вид': ['Прозрачная жидкость', 'Белый порошок', 'Гранулы', 'Кристаллы'][Math.floor(Math.random() * 4)],
            'Плотность': `${(Math.random() * 2 + 0.5).toFixed(2)} г/см³`,
            'Температура плавления': `${Math.floor(Math.random() * 200)}°C`,
            'Температура кипения': `${Math.floor(Math.random() * 300) + 50}°C`,
            'Растворимость': ['Вода', 'Спирт', 'Органические растворители'][Math.floor(Math.random() * 3)],
            'Класс опасности': Math.floor(Math.random() * 4) + 1,
            'Срок годности': '24 месяца',
            'Условия хранения': 'В сухом прохладном месте'
        };
    }
    
    async getManufacturers() {
        try {
            if (this.apiAvailable) {
                const data = await this.safeFetch(`${this.baseURL}/manufacturers`);
                if (data && Array.isArray(data)) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('Не удалось получить производителей:', error.message);
        }
        
        // Fallback данные
        return ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 
               'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим'];
    }
    
    async getCategories() {
        try {
            if (this.apiAvailable) {
                const data = await this.safeFetch(`${this.baseURL}/categories`);
                if (data && Array.isArray(data)) {
                    return data.map(cat => ({ ...cat, count: Math.floor(Math.random() * 1000) + 100 }));
                }
            }
        } catch (error) {
            console.warn('Не удалось получить категории:', error.message);
        }
        
        // Fallback данные
        const categories = [
            { id: 'all', name: 'Все категории', count: 4000 },
            { id: 'acids', name: 'Кислоты', count: 800 },
            { id: 'alkalis', name: 'Щелочи', count: 600 },
            { id: 'solvents', name: 'Растворители', count: 900 },
            { id: 'polymers', name: 'Полимеры', count: 700 },
            { id: 'pigments', name: 'Пигменты', count: 500 },
            { id: 'additives', name: 'Добавки', count: 500 },
            { id: 'reagents', name: 'Реактивы', count: 400 },
            { id: 'raw_materials', name: 'Сырье', count: 600 }
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
        this.selectedProductId = null;
        this.isLoading = false;
    }
    
    async init() {
        try {
            // Показываем статус загрузки
            this.showLoadingStatus();
            
            // Инициализируем API
            await this.api.init();
            
            // Загружаем данные
            await Promise.all([
                this.updateApiStatus(),
                this.loadCategories(),
                this.loadManufacturers()
            ]);
            
            // Загружаем продукты
            await this.loadProducts();
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения. Пожалуйста, обновите страницу.');
        }
    }
    
    showLoadingStatus() {
        const statusElement = this.getOrCreateApiStatus();
        statusElement.className = 'api-status loading';
        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка каталога...';
        statusElement.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
    
    getOrCreateApiStatus() {
        let statusElement = document.getElementById('apiStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'apiStatus';
            statusElement.style.cssText = `
                margin: 20px 0;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            // Вставляем статус после заголовка "Каталог продукции"
            const productsTitle = document.querySelector('#products h2');
            if (productsTitle) {
                productsTitle.insertAdjacentElement('afterend', statusElement);
            } else {
                document.body.prepend(statusElement);
            }
        }
        return statusElement;
    }
    
    async updateApiStatus() {
        const statusElement = this.getOrCreateApiStatus();
        
        if (this.api.apiAvailable) {
            statusElement.className = 'api-status online';
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Режим реальных данных';
            statusElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            statusElement.className = 'api-status offline';
            statusElement.innerHTML = '<i class="fas fa-database"></i> Демо-режим (данные сгенерированы локально)';
            statusElement.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        }
    }
    
    async loadCategories() {
        try {
            const categories = await this.api.getCategories();
            const container = document.getElementById('categoriesList');
            if (!container) return;
            
            container.innerHTML = '';
            
            categories.forEach(category => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <button class="${category.id === 'all' ? 'active' : ''}" 
                            data-category="${category.id}">
                        ${category.name}
                        <span class="category-count">${category.count}</span>
                    </button>
                `;
                li.querySelector('button').onclick = () => this.filterByCategory(category.id);
                container.appendChild(li);
            });
            
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async loadManufacturers() {
        try {
            const manufacturers = await this.api.getManufacturers();
            const container = document.getElementById('manufacturerFilter');
            
            if (container) {
                container.innerHTML = `
                    <option value="">Все производители</option>
                    ${manufacturers.map(m => `<option value="${this.escapeHtml(m)}">${this.escapeHtml(m)}</option>`).join('')}
                `;
            }
            
        } catch (error) {
            console.error('Error loading manufacturers:', error);
        }
    }
    
    async loadProducts(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;
        const container = document.getElementById('productsGrid');
        
        if (!container) {
            console.error('Container #productsGrid not found');
            return;
        }
        
        try {
            // Показываем скелетон загрузки
            this.showLoadingSkeleton(container);
            
            // Получаем данные
            const data = await this.api.fetchProducts(page);
            
            // Обновляем состояние
            this.totalProducts = data.count || 0;
            this.totalPages = Math.max(1, Math.ceil(this.totalProducts / this.api.perPage));
            
            // Рендерим продукты
            this.renderProducts(data.results || []);
            this.renderPagination();
            this.updateProductCount();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Ошибка загрузки товаров. Пожалуйста, попробуйте снова.');
        } finally {
            this.isLoading = false;
        }
    }
    
    showLoadingSkeleton(container) {
        let skeleton = '';
        const skeletonCount = this.api.perPage;
        
        for (let i = 0; i < skeletonCount; i++) {
            skeleton += `
                <div class="product-card skeleton">
                    <div class="skeleton-content">
                        <div class="skeleton-line" style="width: 70%; height: 24px; margin-bottom: 10px;"></div>
                        <div class="skeleton-line" style="width: 50%; height: 16px; margin-bottom: 20px;"></div>
                        <div class="skeleton-line" style="height: 80px; margin-bottom: 20px;"></div>
                        <div class="skeleton-specs">
                            ${Array(4).fill('<div class="skeleton-line" style="height: 40px;"></div>').join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = skeleton;
    }
    
    renderProducts(products) {
        const container = document.getElementById('productsGrid');
        
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                    <button onclick="productManager.resetFilters()" class="btn">
                        <i class="fas fa-redo"></i> Сбросить фильтры
                    </button>
                </div>
            `;
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = product.id;
            card.innerHTML = `
                <div class="product-header">
                    <h3>${this.escapeHtml(product.name)}</h3>
                    <div class="product-meta">
                        <span class="cas-number">
                            <i class="fas fa-hashtag"></i> ${this.escapeHtml(product.cas_number || 'CAS не указан')}
                        </span>
                        <span class="category">
                            <i class="fas fa-tag"></i> ${this.escapeHtml(product.category_name || product.category)}
                        </span>
                    </div>
                </div>
                <div class="product-body">
                    <p class="description">
                        ${this.escapeHtml(product.description)}
                        ${product.formula ? `<br><strong>Формула:</strong> ${this.escapeHtml(product.formula)}` : ''}
                    </p>
                    
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label">Производитель</span>
                            <span class="spec-value manufacturer">${this.escapeHtml(product.manufacturer || 'Не указан')}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Упаковка</span>
                            <span class="spec-value">${this.escapeHtml(product.packaging || 'По запросу')}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Остаток</span>
                            <span class="spec-value stock">${product.stock ? this.formatNumber(product.stock) + ' ' + (product.unit || 'кг') : 'Под заказ'}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Цена</span>
                            <span class="spec-value price">${product.price ? product.price + ' ₽/' + (product.unit || 'кг') : 'По запросу'}</span>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button onclick="productManager.requestQuote(${product.id})" class="btn">
                            <i class="fas fa-quote-left"></i> Запросить цену
                        </button>
                        <button onclick="productManager.showProductDetails(${product.id})" class="btn btn-outline">
                            <i class="fas fa-info-circle"></i> Подробнее
                        </button>
                    </div>
                </div>
            `;
            fragment.appendChild(card);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    formatNumber(num) {
        return num.toLocaleString('ru-RU');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        
        if (!container || this.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '';
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
            if (start > 2) html += `<span class="pagination-ellipsis">...</span>`;
        }
        
        // Страницы
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="productManager.goToPage(${i})">${i}</button>`;
        }
        
        // Последняя страница
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) html += `<span class="pagination-ellipsis">...</span>`;
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
        // Следующая страница
        if (this.currentPage < this.totalPages) {
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage + 1})">
                        <i class="fas fa-chevron-right"></i>
                    </button>`;
        }
        
        container.innerHTML = html;
    }
    
    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = `Найдено товаров: ${this.formatNumber(this.totalProducts)}`;
            countElement.style.cssText = `
                text-align: center;
                margin: 20px 0 30px;
                color: var(--dark-gray);
                font-weight: 600;
                font-size: 1.1rem;
                padding: 10px;
                background: var(--light-gray);
                border-radius: 8px;
            `;
        }
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.loadProducts(page);
        
        // Плавная прокрутка к каталогу
        const productsSection = document.getElementById('products');
        if (productsSection) {
            window.scrollTo({
                top: productsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
    
    filterByCategory(category) {
        const buttons = document.querySelectorAll('#categoriesList button');
        if (buttons.length === 0) return;
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        this.api.filters.category = category;
        this.loadProducts(1);
    }
    
    async applyFilters() {
        const search = document.getElementById('searchInput')?.value || '';
        const cas = document.getElementById('casFilter')?.value || '';
        const manufacturer = document.getElementById('manufacturerFilter')?.value || '';
        
        this.api.filters = {
            category: this.api.filters.category,
            search: search,
            manufacturer: manufacturer,
            cas: cas
        };
        
        await this.loadProducts(1);
    }
    
    resetFilters() {
        // Сбрасываем поля
        const searchInput = document.getElementById('searchInput');
        const casFilter = document.getElementById('casFilter');
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        
        if (searchInput) searchInput.value = '';
        if (casFilter) casFilter.value = '';
        if (manufacturerFilter) manufacturerFilter.value = '';
        
        // Сбрасываем категорию
        this.filterByCategory('all');
        
        // Сбрасываем фильтры в API
        this.api.filters = {
            category: 'all',
            search: '',
            manufacturer: '',
            cas: ''
        };
        
        this.loadProducts(1);
    }
    
    showError(message) {
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка</h3>
                <p>${this.escapeHtml(message)}</p>
                <button onclick="productManager.loadProducts(1)" class="btn">
                    <i class="fas fa-sync-alt"></i> Повторить
                </button>
            </div>
        `;
    }
    
    async showProductDetails(productId) {
        this.selectedProductId = productId;
        
        try {
            this.showLoadingModal();
            
            const productDetail = await this.api.fetchProductDetail(productId);
            
            this.showDetailModal(productDetail);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showErrorModal('Не удалось загрузить информацию о товаре');
        }
    }
    
    showLoadingModal() {
        this.closeModal(); // Закрываем предыдущее модальное окно
        
        const modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="loading-spinner"></div>
                <h3>Загрузка данных...</h3>
                <p>Получение информации о товаре</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }
    
    showDetailModal(productDetail) {
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
        const specsHTML = productDetail.specifications ? `
            <div class="modal-section">
                <h4>Характеристики</h4>
                <div class="specs-grid">
                    ${Object.entries(productDetail.specifications).map(([key, value]) => `
                        <div class="spec-item-modal">
                            <div class="spec-key">${key}</div>
                            <div class="spec-value">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        const filesHTML = productDetail.files && productDetail.files.length > 0 ? `
            <div class="modal-section">
                <h4>Документация</h4>
                <div class="files-grid">
                    ${productDetail.files.map(file => `
                        <a href="${file.url}" class="file-link" target="_blank">
                            <i class="fas fa-file-pdf"></i>
                            <span>${file.name}</span>
                            ${file.size ? `<small>(${file.size})</small>` : ''}
                        </a>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        modal.innerHTML = `
            <div class="modal-content detailed">
                <button onclick="productManager.closeModal()" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2>${this.escapeHtml(productDetail.name)}</h2>
                
                <div class="modal-row">
                    <div class="modal-column">
                        <div class="info-card">
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">CAS номер</div>
                                    <div class="info-value">${productDetail.cas_number || 'Не указан'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Формула</div>
                                    <div class="info-value">${productDetail.formula || 'Не указана'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Производитель</div>
                                    <div class="info-value">${productDetail.manufacturer || 'Не указан'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Упаковка</div>
                                    <div class="info-value">${productDetail.packaging || 'По запросу'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Остаток</div>
                                    <div class="info-value">
                                        ${productDetail.stock ? this.formatNumber(productDetail.stock) + ' ' + (productDetail.unit || 'кг') : 'Под заказ'}
                                    </div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Цена</div>
                                    <div class="info-value price-highlight">
                                        ${productDetail.price ? productDetail.price + ' ₽/' + (productDetail.unit || 'кг') : 'По запросу'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-column">
                        <div class="description-card">
                            <h4>Описание</h4>
                            <p>${this.escapeHtml(productDetail.description)}</p>
                        </div>
                    </div>
                </div>
                
                ${specsHTML}
                ${filesHTML}
                
                <div class="modal-actions">
                    <button onclick="productManager.requestQuote(${productDetail.id})" class="btn btn-primary">
                        <i class="fas fa-quote-left"></i> Запросить цену
                    </button>
                    <button onclick="productManager.closeModal()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `;
    }
    
    showErrorModal(message) {
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>${this.escapeHtml(message)}</p>
                <button onclick="productManager.closeModal()" class="btn">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        `;
    }
    
    closeModal() {
        const modal = document.getElementById('productDetailModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
    
    async requestQuote(productId) {
        this.closeModal();
        
        let productName = 'Товар';
        try {
            const productDetail = await this.api.fetchProductDetail(productId);
            productName = productDetail.name;
        } catch (error) {
            console.error('Error getting product name:', error);
        }
        
        this.showQuoteForm(productId, productName);
    }
    
    showQuoteForm(productId, productName) {
        this.closeQuoteModal();
        
        const modal = document.createElement('div');
        modal.id = 'quoteModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Запрос цены</h3>
                    <button onclick="productManager.closeQuoteModal()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <p class="quote-product-info">
                        Запрос цены на: <strong>${this.escapeHtml(productName)}</strong> (ID: ${productId})
                    </p>
                    
                    <form id="quoteForm">
                        <div class="form-group">
                            <label>Ваше имя *</label>
                            <input type="text" name="name" required placeholder="Иван Иванов">
                        </div>
                        
                        <div class="form-group">
                            <label>Компания *</label>
                            <input type="text" name="company" required placeholder="ООО 'Пример'">
                        </div>
                        
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required placeholder="ivan@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label>Телефон *</label>
                            <input type="tel" name="phone" required placeholder="+7 (999) 123-45-67">
                        </div>
                        
                        <div class="form-group">
                            <label>Необходимое количество</label>
                            <input type="number" name="quantity" step="0.01" placeholder="Введите количество">
                        </div>
                        
                        <div class="form-group">
                            <label>Комментарий</label>
                            <textarea name="comment" rows="3" placeholder="Дополнительная информация"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Отправить запрос
                            </button>
                            <button type="button" onclick="productManager.closeQuoteModal()" class="btn btn-secondary">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        const form = document.getElementById('quoteForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                product_id: productId,
                product_name: productName,
                name: formData.get('name'),
                company: formData.get('company'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                quantity: formData.get('quantity'),
                comment: formData.get('comment'),
                timestamp: new Date().toISOString()
            };
            
            // В реальном приложении здесь был бы fetch к API
            alert(`Запрос отправлен!\n\nТовар: ${productName}\nID: ${productId}\n\nМы свяжемся с вами в ближайшее время.`);
            
            this.closeQuoteModal();
        });
    }
    
    closeQuoteModal() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
    
    setupEventListeners() {
        // Оптимизированный поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
        
        // Остальные фильтры
        const casFilter = document.getElementById('casFilter');
        if (casFilter) {
            let casTimeout;
            casFilter.addEventListener('input', () => {
                clearTimeout(casTimeout);
                casTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
        
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        if (manufacturerFilter) {
            manufacturerFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Обработчик ESC для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeQuoteModal();
            }
        });
    }
}

// ==================== СТИЛИ ДЛЯ МОДАЛЬНЫХ ОКОН И КОМПОНЕНТОВ ====================
const injectStyles = () => {
    const styles = `
        /* API статус */
        .api-status {
            margin: 20px 0;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .api-status.online {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .api-status.offline {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .api-status.loading {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        
        /* Модальные окна */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalAppear 0.3s ease-out;
        }
        
        @keyframes modalAppear {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--dark-gray);
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: all 0.2s;
        }
        
        .modal-close:hover {
            background: var(--light-gray);
            color: var(--primary-dark);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--accent-teal);
        }
        
        .modal-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid var(--light-gray);
        }
        
        .modal-section h4 {
            color: var(--primary-dark);
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        
        /* Скелетон загрузки */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .skeleton-line {
            background: var(--light-gray);
            border-radius: 4px;
        }
        
        /* Индикатор загрузки */
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--light-gray);
            border-top: 3px solid var(--accent-teal);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Адаптивные стили */
        @media (max-width: 768px) {
            .modal-content {
                padding: 20px;
                margin: 10px;
            }
            
            .modal-row {
                flex-direction: column;
            }
            
            .modal-column {
                width: 100% !important;
            }
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Встраиваем стили
    injectStyles();
    
    // Создаем глобальный объект менеджера
    window.productManager = new ProductManager();
    
    // Добавляем фильтр по производителю если есть сайдбар
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (filtersSidebar) {
        const existingFilters = filtersSidebar.querySelector('.filter-group');
        if (existingFilters) {
            existingFilters.insertAdjacentHTML('afterend', `
                <div class="filter-group manufacturer-filter">
                    <h4><i class="fas fa-industry"></i> Производитель</h4>
                    <select id="manufacturerFilter" class="form-control">
                        <option value="">Загрузка...</option>
                    </select>
                </div>
            `);
        }
        
        // Добавляем кнопки действий
        const filterActions = document.createElement('div');
        filterActions.className = 'filter-actions';
        filterActions.innerHTML = `
            <button onclick="productManager.applyFilters()" class="btn">
                <i class="fas fa-check"></i> Применить
            </button>
            <button onclick="productManager.resetFilters()" class="btn btn-outline">
                <i class="fas fa-redo"></i> Сбросить
            </button>
        `;
        filtersSidebar.appendChild(filterActions);
    }
    
    // Инициализируем менеджер
    window.productManager.init();
    
    // Обработчик формы контактов
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                product: document.getElementById('product').value,
                quantity: document.getElementById('quantity').value,
                message: document.getElementById('message').value
            };
            
            // В реальном приложении здесь был бы fetch к API
            console.log('Данные формы контактов:', formData);
            alert('Спасибо за ваш запрос! Мы свяжемся с вами в ближайшее время.');
            
            contactForm.reset();
        });
    }
    
    // Обработчик мобильного меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const menuIcon = document.getElementById('menuIcon');
    
    if (mobileMenuBtn && navLinks && menuIcon) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            
            // Меняем иконку
            menuIcon.classList.toggle('fa-bars', !isActive);
            menuIcon.classList.toggle('fa-times', isActive);
        });
        
        // Закрытие меню при клике на ссылку
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            });
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.applyFilters = () => window.productManager?.applyFilters();
window.resetFilters = () => window.productManager?.resetFilters();
