// ==================== API КЛИЕНТ С REAL API ====================
class ChemistryMarketAPI {
    constructor() {
        // ИСПРАВЛЕНО: Используем HTTPS и правильный базовый URL
        this.baseURL = 'https://api.webhim.ru/api/v1';
        // Ваш токен: Basic auth для USER="api" и PASS="your_secret_api_key"
        this.authToken = 'Basic YXBpOnlvdXJfc2VjcmV0X2FwaV9rZXk=';
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
    }
    
    async testApiConnection() {
        try {
            // Тестируем подключение к реальному API
            const testUrl = `${this.baseURL}/product/detail/302016`;
            console.log('Тестируем подключение к API:', testUrl);
            
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Authorization': this.authToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // Добавляем таймаут
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                console.log('✅ API доступен!');
                this.apiAvailable = true;
                return true;
            } else {
                console.warn('❌ API ответил с ошибкой:', response.status);
                this.apiAvailable = false;
                return false;
            }
            
        } catch (error) {
            console.warn('❌ Не удалось подключиться к API:', error.message);
            this.apiAvailable = false;
            return false;
        }
    }
    
    async fetchProductDetail(productId) {
        // Если API доступен, пробуем получить реальные данные
        if (this.apiAvailable) {
            try {
                const url = `${this.baseURL}/product/detail/${productId}`;
                const cacheKey = `detail_${productId}`;
                const cached = this.cache.get(cacheKey);
                
                // Проверяем кеш
                if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                    return cached.data;
                }
                
                console.log('Запрашиваем реальные данные для продукта:', productId);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': this.authToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: AbortSignal.timeout(10000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Получены реальные данные:', data);
                    
                    // Сохраняем в кеш
                    this.cache.set(cacheKey, {
                        timestamp: Date.now(),
                        data: data
                    });
                    
                    return data;
                } else {
                    console.warn('Ошибка при запросе деталей:', response.status);
                    throw new Error(`HTTP ${response.status}`);
                }
                
            } catch (error) {
                console.warn('Ошибка API, используем демо-данные:', error.message);
                // При ошибке переключаемся на демо-данные
                this.apiAvailable = false;
            }
        }
        
        // Используем демо-данные если API недоступен
        const demoData = this.getDemoProductDetail(productId);
        // Округляем цену до целого числа
        if (demoData.price) {
            demoData.price = Math.round(parseFloat(demoData.price)).toString();
        }
        return demoData;
    }
    
    async fetchProducts(page = 1) {
        // Если API доступен, пробуем получить реальные товары
        if (this.apiAvailable) {
            try {
                // Согласно документации API, товары можно получить по адресу:
                const url = `${this.baseURL}/product/all/?page=${page}&limit=${this.perPage}`;
                console.log('Запрашиваем список товаров:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': this.authToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: AbortSignal.timeout(10000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Получены реальные товары:', data);
                    
                    // Преобразуем ответ API в формат, ожидаемый нашим приложением
                    return this.transformApiResponse(data, page);
                } else {
                    console.warn('Ошибка при запросе товаров:', response.status);
                    throw new Error(`HTTP ${response.status}`);
                }
                
            } catch (error) {
                console.warn('Ошибка API при запросе товаров, используем демо-данные:', error.message);
                this.apiAvailable = false;
            }
        }
        
        // Используем демо-данные если API недоступен
        return this.getDemoData(page);
    }
    
    transformApiResponse(apiData, page) {
        // Преобразуем ответ API в формат, ожидаемый нашим приложением
        if (!apiData || !apiData.results) {
            return this.getDemoData(page);
        }
        
        // Применяем фильтры к данным API
        let filtered = apiData.results.filter(p => {
            if (this.filters.category !== 'all' && p.category !== this.filters.category) return false;
            if (this.filters.search && !p.name.toLowerCase().includes(this.filters.search.toLowerCase())) return false;
            if (this.filters.manufacturer && p.manufacturer !== this.filters.manufacturer) return false;
            if (this.filters.cas && !p.cas_number?.includes(this.filters.cas)) return false;
            return true;
        });
        
        return {
            count: apiData.count || filtered.length,
            next: apiData.next || null,
            previous: apiData.previous || null,
            results: filtered
        };
    }
    
    // Демо-данные на основе реальной структуры API (остаются как запасной вариант)
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
            // Цена округляется до целого числа при генерации
            price: Math.round(Math.random() * 500 + 50).toString(),
            // Убрано поле stock
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
                    url: 'https://via.placeholder.com/400x300/4a90e2/ffffff?text=Chemistry+Product',
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
                { id: 302017, name: 'Аналогичный продукт A', price: '125' },
                { id: 302018, name: 'Аналогичный продукт B', price: '145' }
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
                // Цена уже округлена до целого числа
                price: productDetail.price,
                // Убрано поле stock
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
    
    // Вспомогательные методы для демо-данных
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
            // Пробуем получить производителей из API
            if (this.apiAvailable) {
                const response = await fetch(`${this.baseURL}/manufacturers`, {
                    method: 'GET',
                    headers: {
                        'Authorization': this.authToken,
                        'Accept': 'application/json'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data;
                }
            }
        } catch (error) {
            console.warn('Не удалось получить производителей из API:', error.message);
        }
        
        // Fallback данные
        return ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 
               'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим'];
    }
    
    async getCategories() {
        try {
            // Пробуем получить категории из API
            if (this.apiAvailable) {
                const response = await fetch(`${this.baseURL}/categories`, {
                    method: 'GET',
                    headers: {
                        'Authorization': this.authToken,
                        'Accept': 'application/json'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.map(cat => ({ ...cat, count: cat.count || Math.floor(Math.random() * 1000) + 100 }));
                }
            }
        } catch (error) {
            console.warn('Не удалось получить категории из API:', error.message);
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
        this.apiStatusChecked = false;
    }
    
    async init() {
        // Сначала проверяем статус API
        await this.updateApiStatus();
        this.apiStatusChecked = true;
        
        // Загружаем данные
        await this.loadCategories();
        await this.loadManufacturers();
        await this.loadProducts();
        this.setupEventListeners();
        
        // Инициализируем форму запроса
        this.initQuoteForm();
        
        // Добавляем стили для темы
        this.addThemeStyles();
    }
    
    addThemeStyles() {
        // Добавляем стили для темной/светлой темы
        const style = document.createElement('style');
        style.textContent = `
            /* Стили для темной темы */
            @media (prefers-color-scheme: dark) {
                .product-card h3 {
                    color: var(--white, #ffffff) !important;
                }
                
                .product-card {
                    background: rgba(30, 30, 40, 0.95) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                .product-card p,
                .product-card .spec-label,
                .product-card .spec-value {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                
                .product-card .btn-outline {
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                
                .product-card .btn-outline:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
            }
            
            /* Стили для светлой темы */
            @media (prefers-color-scheme: light) {
                .product-card h3 {
                    color: var(--primary-dark, #1a202c) !important;
                }
                
                .product-card {
                    background: var(--white, #ffffff) !important;
                    border: 1px solid rgba(0, 0, 0, 0.1) !important;
                }
                
                .product-card p,
                .product-card .spec-label {
                    color: var(--dark-gray, #4a5568) !important;
                }
                
                .product-card .spec-value {
                    color: var(--primary-dark, #1a202c) !important;
                }
            }
            
            /* Общие стили для карточек товаров */
            .product-card {
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                margin-bottom: 20px;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            
            .product-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            .product-header {
                margin-bottom: 15px;
            }
            
            .product-header h3 {
                margin: 0 0 8px 0;
                font-size: 1.1rem;
                line-height: 1.3;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            
            .product-body {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .product-specs {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin: 15px 0;
            }
            
            .spec-item {
                display: flex;
                flex-direction: column;
                padding: 10px;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.03);
            }
            
            @media (prefers-color-scheme: dark) {
                .spec-item {
                    background: rgba(255, 255, 255, 0.05);
                }
            }
            
            .spec-label {
                font-size: 0.8rem;
                font-weight: 500;
                margin-bottom: 4px;
                opacity: 0.8;
            }
            
            .spec-value {
                font-size: 0.95rem;
                font-weight: 600;
            }
            
            .spec-value.price {
                color: var(--accent-teal, #0d9488) !important;
                font-size: 1rem;
                font-weight: 700;
            }
            
            .product-actions {
                display: flex;
                gap: 10px;
                margin-top: auto;
                padding-top: 15px;
            }
            
            .product-actions .btn {
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .product-actions .btn i {
                margin-right: 6px;
            }
            
            /* Стили для мета-информации */
            .product-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
                font-size: 0.85rem;
            }
            
            .product-meta .cas-number {
                color: var(--accent-blue, #3b82f6);
                font-weight: 600;
                background: rgba(59, 130, 246, 0.1);
                padding: 3px 8px;
                border-radius: 4px;
            }
            
            .product-meta .category {
                color: var(--dark-gray, #6b7280);
                background: rgba(107, 114, 128, 0.1);
                padding: 3px 8px;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
    
    async updateApiStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (!statusElement) return;
        
        try {
            // Показываем статус проверки
            statusElement.className = 'api-status checking';
            statusElement.innerHTML = '<i class="fas fa-sync fa-spin"></i> Проверка подключения к API...';
            
            // Тестируем подключение к API
            const isApiAvailable = await this.api.testApiConnection();
            
            if (isApiAvailable) {
                statusElement.className = 'api-status online';
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Подключено к реальному API (данные с сервера)';
                console.log('✅ Используется реальный API');
            } else {
                statusElement.className = 'api-status offline';
                statusElement.innerHTML = '<i class="fas fa-database"></i> Используются демо-данные (оффлайн режим)';
                console.log('⚠️ Используются демо-данные');
            }
            
        } catch (error) {
            console.log('Ошибка проверки API:', error);
            statusElement.className = 'api-status offline';
            statusElement.innerHTML = '<i class="fas fa-database"></i> Используются демо-данные';
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
        try {
            this.currentPage = page;
            const container = document.getElementById('productsGrid');
            
            if (!container) {
                console.error('Container #productsGrid not found');
                return;
            }
            
            // Показываем скелетон загрузки только при первой загрузке
            if (page === 1 && container.children.length === 0) {
                requestAnimationFrame(() => {
                    container.innerHTML = this.getLoadingSkeleton();
                });
            }
            
            // Получаем данные
            const data = await this.api.fetchProducts(page);
            
            // Обновляем пагинацию
            this.totalProducts = data.count || 0;
            this.totalPages = Math.ceil(this.totalProducts / this.api.perPage);
            
            // Рендерим продукты
            requestAnimationFrame(() => {
                this.renderProducts(data.results || []);
                this.renderPagination();
                this.updateProductCount();
            });
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        }
    }
    
    getLoadingSkeleton() {
        let skeleton = '';
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
                            <div class="skeleton-line" style="height: 40px;"></div>
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
                    <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Товары не найдены</h3>
                    <p style="color: var(--dark-gray); margin-bottom: 20px;">Попробуйте изменить параметры поиска</p>
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
            
            // Округляем цену до целого числа
            let priceDisplay = 'По запросу';
            if (product.price) {
                const priceNum = parseFloat(product.price);
                if (!isNaN(priceNum)) {
                    priceDisplay = `${Math.round(priceNum)} ₽/${product.unit || 'кг'}`;
                }
            }
            
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
                    <p>
                        ${this.escapeHtml(product.description)}
                        ${product.formula ? `<br><strong>Формула:</strong> ${this.escapeHtml(product.formula)}` : ''}
                    </p>
                    
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label">Производитель</span>
                            <span class="spec-value">${this.escapeHtml(product.manufacturer || 'Не указан')}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Упаковка</span>
                            <span class="spec-value">${this.escapeHtml(product.packaging || 'По запросу')}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Минимальный заказ</span>
                            <span class="spec-value">${product.min_order || '100'} ${product.unit || 'кг'}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Цена</span>
                            <span class="spec-value price">${priceDisplay}</span>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button onclick="productManager.requestQuote(${product.id})" class="btn">
                            <i class="fas fa-quote-left"></i> Заявка
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
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    renderPagination() {
        const container = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            container.innerHTML = '';
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
            if (start > 2) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
        }
        
        // Страницы
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="productManager.goToPage(${i})">${i}</button>`;
        }
        
        // Последняя страница
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
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
            countElement.textContent = `Найдено товаров: ${this.totalProducts}`;
        }
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadProducts(page);
        window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' });
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
        const buttons = document.querySelectorAll('#categoriesList button');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Сбрасываем фильтры в API
        this.api.filters = {
            category: 'all',
            search: '',
            manufacturer: '',
            cas: ''
        };
        
        this.loadProducts(1);
    }
    
    showError() {
        const container = document.getElementById('productsGrid');
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
    
    async showProductDetails(productId) {
        this.selectedProductId = productId;
        
        try {
            // Показываем модальное окно с загрузкой
            this.showLoadingModal();
            
            // Загружаем детальную информацию
            const productDetail = await this.api.fetchProductDetail(productId);
            
            // Показываем детальную информацию
            this.showDetailModal(productDetail);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showErrorModal();
        }
    }
    
    showLoadingModal() {
        // Создаем модальное окно загрузки
        const modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: var(--radius-lg); text-align: center; min-width: 300px;">
                <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Загрузка данных...</h3>
                <p style="color: var(--dark-gray);">Получение информации о товаре</p>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showDetailModal(productDetail) {
        // Обновляем модальное окно с детальной информацией
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
        // Форматируем спецификации
        const specsHTML = productDetail.specifications ? `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--primary-dark); margin-bottom: 15px; border-bottom: 2px solid var(--accent-teal); padding-bottom: 5px;">
                    Характеристики
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${Object.entries(productDetail.specifications).map(([key, value]) => `
                        <div style="background: var(--light-gray); padding: 10px; border-radius: var(--radius);">
                            <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">${key}</div>
                            <div style="font-weight: 600; color: var(--primary-dark);">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        // Форматируем файлы
        const filesHTML = productDetail.files && productDetail.files.length > 0 ? `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--primary-dark); margin-bottom: 15px; border-bottom: 2px solid var(--accent-teal); padding-bottom: 5px;">
                    Документация
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${productDetail.files.map(file => `
                        <a href="${file.url}" style="display: inline-flex; align-items: center; gap: 8px;
                           padding: 10px 15px; background: var(--light-gray); border-radius: var(--radius);
                           text-decoration: none; color: var(--primary-dark); font-weight: 500;">
                            <i class="fas fa-file-pdf" style="color: #dc2626;"></i>
                            ${file.name}
                            ${file.size ? `<span style="font-size: 0.8rem; color: var(--dark-gray);">(${file.size})</span>` : ''}
                        </a>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        // Округляем цену для отображения в модальном окне
        let priceDisplay = 'По запросу';
        if (productDetail.price) {
            const priceNum = parseFloat(productDetail.price);
            if (!isNaN(priceNum)) {
                priceDisplay = `${Math.round(priceNum)} ₽/${productDetail.unit || 'кг'}`;
            }
        }
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: var(--radius-lg); 
                        max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;">
                <button onclick="productManager.closeModal()" style="position: absolute; top: 15px; right: 15px;
                        background: none; border: none; font-size: 1.5rem; color: var(--dark-gray); cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 style="color: var(--primary-dark); margin-bottom: 15px; padding-right: 30px;">${productDetail.name}</h2>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; min-width: 250px;">
                        <div style="background: var(--light-gray); padding: 20px; border-radius: var(--radius);">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">CAS номер</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">${productDetail.cas_number || 'Не указан'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Формула</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">${productDetail.formula || 'Не указана'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Производитель</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">${productDetail.manufacturer || 'Не указан'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Упаковка</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">${productDetail.packaging || 'По запросу'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Минимальный заказ</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">
                                        ${productDetail.min_order || '100'} ${productDetail.unit || 'кг'}
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Цена</div>
                                    <div style="font-weight: 600; color: var(--accent-teal); font-size: 1.1rem;">
                                        ${priceDisplay}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="flex: 1; min-width: 250px;">
                        <div style="background: var(--light-gray); padding: 20px; border-radius: var(--radius); height: 100%;">
                            <h4 style="color: var(--primary-dark); margin-bottom: 15px;">Описание</h4>
                            <p style="color: var(--text-dark); line-height: 1.6;">${productDetail.description}</p>
                        </div>
                    </div>
                </div>
                
                ${specsHTML}
                ${filesHTML}
                
                <div style="margin-top: 30px; display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="productManager.requestQuote(${productDetail.id})" class="btn" style="flex: 1; min-width: 200px;">
                        <i class="fas fa-quote-left"></i> Заявка
                    </button>
                    <button onclick="productManager.closeModal()" class="btn btn-outline" style="flex: 1; min-width: 200px;">
                        <i class="fas fa-times"></i> Закрыть
                    </button>
                </div>
            </div>
        `;
    }
    
    showErrorModal() {
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: var(--radius-lg); text-align: center; min-width: 300px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Ошибка загрузки</h3>
                <p style="color: var(--dark-gray); margin-bottom: 20px;">Не удалось загрузить информацию о товаре</p>
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
        }
    }
    
    async requestQuote(productId) {
        // Получаем информацию о товаре
        let productName = 'Товар';
        try {
            const productDetail = await this.api.fetchProductDetail(productId);
            productName = productDetail.name;
            
            // Прокручиваем к форме запроса
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Автозаполнение поля спецификации с именем товара
                const specInput = document.getElementById('specification');
                if (specInput) {
                    specInput.value = productDetail.name;
                    
                    // Фокус на поле после небольшой задержки
                    setTimeout(() => {
                        specInput.focus();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error getting product details:', error);
            
            // Все равно прокручиваем к форме
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    // Инициализация формы запроса
    initQuoteForm() {
        const quoteForm = document.getElementById('quoteForm');
        if (!quoteForm) return;
        
        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    value = '(' + value.substring(0, 3);
                }
                if (value.length > 4) {
                    value = value.substring(0, 4) + ') ' + value.substring(4, 7);
                }
                if (value.length > 9) {
                    value = value.substring(0, 9) + '-' + value.substring(9, 11);
                }
                if (value.length > 12) {
                    value = value.substring(0, 12) + '-' + value.substring(12, 14);
                }
                
                e.target.value = value;
            });
        }
        
        // Обработчик отправки формы
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Сброс предыдущих ошибок
            this.clearFormErrors();
            
            let isValid = true;
            
            // Валидация всех обязательных полей
            const fields = [
                { id: 'quantity', name: 'Количество' },
                { id: 'unit', name: 'Единица измерения' },
                { id: 'purpose', name: 'Цель использования' },
                { id: 'specification', name: 'Марка/концентрация' },
                { id: 'name', name: 'Имя' },
                { id: 'phone', name: 'Телефон' },
                { id: 'email', name: 'Email' },
                { id: 'city', name: 'Город доставки' },
                { id: 'inn', name: 'ИНН' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (!element.value.trim()) {
                    this.showFormError(element, `Пожалуйста, заполните поле "${field.name}"`);
                    isValid = false;
                }
            });
            
            // Специфическая валидация телефона
            if (phoneInput) {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{2}-\d{2}$/;
                if (!phoneRegex.test(phoneInput.value.trim())) {
                    this.showFormError(phoneInput, 'Пожалуйста, укажите телефон в формате (999) 123-45-67');
                    isValid = false;
                }
            }
            
            // Валидация email
            const emailInput = document.getElementById('email');
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    this.showFormError(emailInput, 'Пожалуйста, укажите корректный email');
                    isValid = false;
                }
            }
            
            // Валидация ИНН
            const innInput = document.getElementById('inn');
            if (innInput) {
                const innRegex = /^\d{10}$|^\d{12}$/;
                if (!innRegex.test(innInput.value.trim())) {
                    this.showFormError(innInput, 'Пожалуйста, укажите корректный ИНН (10 или 12 цифр)');
                    isValid = false;
                }
            }
            
            // Проверка согласия
            const consentInput = document.getElementById('consent');
            if (consentInput && !consentInput.checked) {
                alert('Необходимо дать согласие на обработку персональных данных');
                consentInput.focus();
                isValid = false;
            }
            
            // Если форма валидна, отправляем данные
            if (isValid) {
                // Собираем данные формы
                const formData = {
                    quantity: document.getElementById('quantity').value,
                    unit: document.getElementById('unit').value,
                    purpose: document.getElementById('purpose').value,
                    specification: document.getElementById('specification').value,
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    city: document.getElementById('city').value,
                    inn: document.getElementById('inn').value,
                    timestamp: new Date().toISOString()
                };
                
                // Сохраняем в localStorage
                const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
                quoteRequests.push(formData);
                localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
                
                // Показываем сообщение об успехе
                this.showSuccessMessage();
                
                // Очищаем форму
                setTimeout(() => {
                    quoteForm.reset();
                    this.clearFormErrors();
                }, 2000);
            }
        });
    }
    
    showFormError(element, message) {
        element.classList.add('error');
        
        // Удаляем старую ошибку если есть
        const oldError = element.parentNode.querySelector('.error-message');
        if (oldError) {
            oldError.remove();
        }
        
        // Добавляем новое сообщение об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }
    
    clearFormErrors() {
        // Удаляем классы ошибок
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Удаляем сообщения об ошибках
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
    }
    
    showSuccessMessage() {
        // Создаем или находим элемент для сообщения
        let successDiv = document.querySelector('.success-message');
        
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            const quoteForm = document.getElementById('quoteForm');
            quoteForm.appendChild(successDiv);
        }
        
        successDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 15px;"></i>
                <h3 style="color: #065f46; margin-bottom: 10px;">Запрос успешно отправлен!</h3>
                <p style="color: #047857;">Мы свяжемся с вами в ближайшее время.</p>
            </div>
        `;
        
        successDiv.classList.add('show');
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 5000);
    }
    
    setupEventListeners() {
        // Оптимизированный debounce для поиска
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            const debouncedSearch = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.applyFilters();
                    });
                }, 300);
            };
            searchInput.addEventListener('input', debouncedSearch, { passive: true });
        }
        
        // Другие фильтры с debounce
        const casFilter = document.getElementById('casFilter');
        if (casFilter) {
            let casTimeout;
            casFilter.addEventListener('input', () => {
                clearTimeout(casTimeout);
                casTimeout = setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.applyFilters();
                    });
                }, 300);
            }, { passive: true });
        }
        
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        if (manufacturerFilter) {
            manufacturerFilter.addEventListener('change', () => {
                requestAnimationFrame(() => {
                    this.applyFilters();
                });
            });
        }
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Создаем элемент статуса API
    const apiStatus = document.createElement('div');
    apiStatus.id = 'apiStatus';
    apiStatus.className = 'api-status';
    apiStatus.style.cssText = `
        margin: 20px 0;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f0f9ff;
        color: #0369a1;
        border: 1px solid #bae6fd;
    `;
    
    // Вставляем статус после заголовка "Каталог продукции"
    const productsTitle = document.querySelector('#products h2');
    if (productsTitle) {
        productsTitle.insertAdjacentElement('afterend', apiStatus);
    }
    
    // Создаем элемент счетчика товаров
    const productCount = document.createElement('div');
    productCount.id = 'productCount';
    productCount.style.cssText = `
        text-align: center;
        margin: 20px 0 30px 0;
        color: var(--dark-gray);
        font-weight: 600;
        font-size: 1.1rem;
    `;
    
    // Вставляем счетчик после статуса API
    apiStatus.insertAdjacentElement('afterend', productCount);
    
    // Добавляем фильтр по производителю в сайдбар
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (filtersSidebar) {
        const manufacturerFilterHTML = `
            <div class="filter-group manufacturer-filter">
                <h4><i class="fas fa-industry"></i> Производитель</h4>
                <select id="manufacturerFilter" class="form-control">
                    <option value="">Загрузка...</option>
                </select>
            </div>
        `;
        
        const existingFilters = filtersSidebar.querySelector('.filter-group');
        if (existingFilters) {
            existingFilters.insertAdjacentHTML('afterend', manufacturerFilterHTML);
        }
        
        // Добавляем кнопки действий
        const filterActions = document.createElement('div');
        filterActions.className = 'filter-actions';
        filterActions.style.cssText = 'margin-top: 20px; display: flex; gap: 10px;';
        filterActions.innerHTML = `
            <button onclick="window.productManager.applyFilters()" class="btn" style="flex: 1;">
                <i class="fas fa-check"></i> Применить
            </button>
            <button onclick="window.productManager.resetFilters()" class="btn btn-outline" style="flex: 1;">
                <i class="fas fa-redo"></i> Сбросить
            </button>
        `;
        
        filtersSidebar.appendChild(filterActions);
    }
    
    // Инициализируем менеджер
    window.productManager = new ProductManager();
    window.productManager.init();
    
    // Обработчик старой формы контактов (если еще существует)
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
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };
            
            // Сохраняем в localStorage
            const contacts = JSON.parse(localStorage.getItem('contactRequests') || '[]');
            contacts.push(formData);
            localStorage.setItem('contactRequests', JSON.stringify(contacts));
            
            alert('✅ Спасибо за ваш запрос! Мы свяжемся с вами в ближайшее время.');
            
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
            
            if (isActive) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
        
        // Закрытие меню при клике на ссылку
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
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
    
    // Плавная прокрутка для якорных ссылок
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
    
    // Инициализация масок для телефона во всех формах
    function initPhoneMasks() {
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    value = '(' + value.substring(0, 3);
                }
                if (value.length > 4) {
                    value = value.substring(0, 4) + ') ' + value.substring(4, 7);
                }
                if (value.length > 9) {
                    value = value.substring(0, 9) + '-' + value.substring(9, 11);
                }
                if (value.length > 12) {
                    value = value.substring(0, 12) + '-' + value.substring(12, 14);
                }
                
                e.target.value = value;
            });
        });
    }
    
    initPhoneMasks();
});

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.applyFilters = () => window.productManager?.applyFilters();
window.resetFilters = () => window.productManager?.resetFilters();