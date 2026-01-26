// ==================== API КЛИЕНТ С ДЕМО-ДАННЫМИ ====================
class ChemistryMarketAPI {
    constructor() {
        // Полностью переходим на демо-режим
        this.baseURL = 'https://demo.chemistrymarket.api';
        this.apiAvailable = false; // API недоступен
        this.useDemoData = true; // Используем только демо-данные
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
        this.initialized = true; // Инициализирован сразу
    }
    
    async init() {
        // Ничего не делаем, сразу доступны демо-данные
        return Promise.resolve();
    }
    
    async testConnection() {
        // API недоступен, возвращаем false
        this.apiAvailable = false;
        return false;
    }
    
    async fetchProductDetail(productId) {
        const cacheKey = `detail_${productId}`;
        
        // Проверяем кеш
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        
        // Используем демо-данные
        const demoData = this.getDemoProductDetail(productId);
        
        // Сохраняем в кеш
        this.cache.set(cacheKey, {
            timestamp: Date.now(),
            data: demoData
        });
        
        return demoData;
    }
    
    async fetchProducts(page = 1) {
        this.currentPage = page;
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
        
        const manufacturer = manufacturers[productId % manufacturers.length];
        const category = categories[productId % categories.length];
        
        return {
            id: productId,
            product_id: productId,
            name: this.getRandomProductName(productId),
            description: 'Высококачественное химическое сырье промышленного назначения. Соответствует ГОСТ и международным стандартам качества. Чистота: 99.9%. Производство соответствует ISO 9001.',
            cas_number: this.getRandomCAS(productId),
            formula: this.getRandomFormula(productId),
            category: category.id,
            category_name: category.name,
            manufacturer: manufacturer,
            manufacturer_id: (productId % 1000) + 1,
            packaging: this.getRandomPackaging(productId),
            unit: 'кг',
            price: ((productId % 500) + 50).toFixed(2),
            stock: (productId % 10000) + 100,
            min_order: 100,
            lead_time: '3-5 дней',
            specifications: this.generateSpecs(productId),
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
                rating: 4.8 - (productId % 10) / 10,
                delivery_time: '2-7 дней',
                country: this.getCountryByManufacturer(manufacturer)
            },
            similar_products: [
                { id: productId + 1, name: 'Аналогичный продукт A', price: ((productId + 1) % 500 + 50).toFixed(2) },
                { id: productId + 2, name: 'Аналогичный продукт B', price: ((productId + 2) % 500 + 50).toFixed(2) }
            ]
        };
    }
    
    getCountryByManufacturer(manufacturer) {
        const countries = {
            'BASF': 'Германия',
            'Dow Chemical': 'США',
            'Evonik': 'Германия',
            'Sibur': 'Россия',
            'Lanxess': 'Германия',
            'AkzoNobel': 'Нидерланды',
            'Clariant': 'Швейцария',
            'Solvay': 'Бельгия',
            'Honeywell': 'США',
            'DuPont': 'США',
            'Химсинтез': 'Россия',
            'Уралхим': 'Россия',
            'ФосАгро': 'Россия',
            'НИОС': 'Россия',
            'Акрон': 'Россия'
        };
        return countries[manufacturer] || 'Германия';
    }
    
    getDemoData(page) {
        const products = [];
        const startIdx = (page - 1) * this.perPage;
        
        for (let i = 0; i < this.perPage; i++) {
            const productId = 302016 + startIdx + i;
            const productDetail = this.getDemoProductDetail(productId);
            
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
            next: page < 10 ? `?page=${page + 1}` : null,
            previous: page > 1 ? `?page=${page - 1}` : null,
            results: filtered
        };
    }
    
    // Вспомогательные методы
    getRandomProductName(id) {
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
        return names[id % names.length] + ' ' + ['марка А', 'высший сорт', 'технический', 'реактивный', 'пищевой'][id % 5];
    }
    
    getRandomCAS(id) {
        const casNumbers = [
            '7664-93-9', '1310-73-2', '67-64-1', '13463-67-7',
            '7647-01-0', '7697-37-2', '7722-84-1', '108-88-3',
            '1330-20-7', '64742-82-1', '141-78-6', '67-63-0',
            '107-21-1', '9003-05-8', '1302-78-9', '1332-58-7',
            '1314-13-2', '471-34-1', '10043-01-3', '7705-08-0'
        ];
        return casNumbers[id % casNumbers.length];
    }
    
    getRandomFormula(id) {
        const formulas = [
            'H₂SO₄', 'NaOH', 'C₃H₆O', 'TiO₂', 'HCl', 'HNO₃', 
            'H₂O₂', 'C₇H₈', 'C₈H₁₀', 'C₂H₅OH', 'C₂H₆O₂', 
            '(C₃H₅NO)n', 'Al₂(SO₄)₃', 'FeCl₃', 'ZnO', 'CaCO₃'
        ];
        return formulas[id % formulas.length];
    }
    
    getRandomPackaging(id) {
        const packagings = [
            'Канистра 25 л', 'Бочка 200 л', 'Мешок 25 кг', 
            'Биг-бэг 1000 кг', 'Флакон 1 л', 'Бутыль 5 л',
            'Контейнер IBC 1000 л', 'Барабан 180 кг'
        ];
        return packagings[id % packagings.length];
    }
    
    generateSpecs(id) {
        const appearances = ['Прозрачная жидкость', 'Белый порошок', 'Гранулы', 'Кристаллы', 'Вязкая жидкость'];
        const solubilities = ['Вода', 'Спирт', 'Органические растворители', 'Не растворяется', 'Частично растворяется'];
        
        return {
            'Внешний вид': appearances[id % appearances.length],
            'Плотность': `${(1 + (id % 100) / 100).toFixed(2)} г/см³`,
            'Температура плавления': `${(id % 200)}°C`,
            'Температура кипения': `${100 + (id % 200)}°C`,
            'Растворимость': solubilities[id % solubilities.length],
            'Класс опасности': (id % 4) + 1,
            'Срок годности': '24 месяца',
            'Условия хранения': 'В сухом прохладном месте',
            'pH': (1 + (id % 13)).toFixed(1),
            'Влажность': `${(id % 5)}%`,
            'Зольность': `${(id % 2)}%`
        };
    }
    
    async getManufacturers() {
        return ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 
               'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим',
               'ФосАгро', 'НИОС', 'Акрон', 'Honeywell', 'DuPont'];
    }
    
    async getCategories() {
        const categories = [
            { id: 'all', name: 'Все категории', count: 4000 },
            { id: 'acids', name: 'Кислоты', count: 800 },
            { id: 'alkalis', name: 'Щелочи', count: 600 },
            { id: 'solvents', name: 'Растворители', count: 900 },
            { id: 'polymers', name: 'Полимеры', count: 700 },
            { id: 'pigments', name: 'Пигменты', count: 500 },
            { id: 'additives', name: 'Добавки', count: 500 },
            { id: 'reagents', name: 'Реактивы', count: 400 },
            { id: 'raw_materials', name: 'Сырье', count: 600 },
            { id: 'catalysts', name: 'Катализаторы', count: 300 },
            { id: 'surfactants', name: 'ПАВы', count: 350 }
        ];
        return categories;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// ==================== UI МЕНЕДЖЕР ====================
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
            // Инициализируем API
            await this.api.init();
            
            // Сразу показываем статус демо-режима
            this.updateApiStatus();
            
            // Загружаем данные
            await Promise.all([
                this.loadCategories(),
                this.loadManufacturers()
            ]);
            
            // Загружаем продукты
            await this.loadProducts();
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
            
            // Скрываем прелоадер если есть
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.style.display = 'none';
                }
            }, 500);
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения. Пожалуйста, обновите страницу.');
        }
    }
    
    updateApiStatus() {
        const statusElement = this.getOrCreateApiStatus();
        statusElement.className = 'api-status demo';
        statusElement.innerHTML = '<i class="fas fa-database"></i> Демо-режим (работает без сервера)';
        statusElement.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        statusElement.style.color = 'white';
        statusElement.style.margin = '20px 0';
        statusElement.style.padding = '12px 20px';
        statusElement.style.borderRadius = '8px';
        statusElement.style.fontWeight = '500';
        statusElement.style.display = 'flex';
        statusElement.style.alignItems = 'center';
        statusElement.style.gap = '10px';
    }
    
    getOrCreateApiStatus() {
        let statusElement = document.getElementById('apiStatus');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'apiStatus';
            
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
            this.isLoading = false;
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
            
            // Имитируем задержку сети для реалистичности
            await new Promise(resolve => setTimeout(resolve, 300));
            
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
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--dark-gray); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Товары не найдены</h3>
                    <p style="color: var(--dark-gray); margin-bottom: 20px;">Попробуйте изменить параметры поиска</p>
                    <button onclick="productManager.resetFilters()" class="btn" style="background: var(--accent-teal); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
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
            card.style.cssText = `
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                padding: 20px;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s, box-shadow 0.3s;
            `;
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            };
            card.onmouseleave = () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            };
            
            card.dataset.productId = product.id;
            card.innerHTML = `
                <div class="product-header" style="margin-bottom: 15px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; line-height: 1.3; color: var(--primary-dark);">
                        ${this.escapeHtml(product.name)}
                    </h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 600; background: #e6f7ff; padding: 3px 8px; border-radius: 4px;">
                            <i class="fas fa-hashtag"></i> ${this.escapeHtml(product.cas_number || 'CAS не указан')}
                        </span>
                        <span style="font-size: 0.85rem; color: var(--dark-gray); background: #f5f5f5; padding: 3px 8px; border-radius: 4px;">
                            <i class="fas fa-tag"></i> ${this.escapeHtml(product.category_name || product.category)}
                        </span>
                    </div>
                </div>
                <div class="product-body" style="flex-grow: 1; display: flex; flex-direction: column;">
                    <p style="color: var(--text-dark); margin-bottom: 15px; font-size: 0.95rem; flex-grow: 1;">
                        ${this.escapeHtml(product.description)}
                        ${product.formula ? `<br><strong>Формула:</strong> ${this.escapeHtml(product.formula)}` : ''}
                    </p>
                    
                    <div class="product-specs" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        <div style="background: var(--light-gray); padding: 10px; border-radius: 6px;">
                            <div style="font-size: 0.8rem; color: var(--dark-gray); margin-bottom: 3px;">Производитель</div>
                            <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${this.escapeHtml(product.manufacturer || 'Не указан')}</div>
                        </div>
                        
                        <div style="background: var(--light-gray); padding: 10px; border-radius: 6px;">
                            <div style="font-size: 0.8rem; color: var(--dark-gray); margin-bottom: 3px;">Упаковка</div>
                            <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${this.escapeHtml(product.packaging || 'По запросу')}</div>
                        </div>
                        
                        <div style="background: var(--light-gray); padding: 10px; border-radius: 6px;">
                            <div style="font-size: 0.8rem; color: var(--dark-gray); margin-bottom: 3px;">Остаток</div>
                            <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">
                                ${product.stock ? this.formatNumber(product.stock) + ' ' + (product.unit || 'кг') : 'Под заказ'}
                            </div>
                        </div>
                        
                        <div style="background: var(--accent-teal); color: white; padding: 10px; border-radius: 6px;">
                            <div style="font-size: 0.8rem; margin-bottom: 3px; opacity: 0.9;">Цена</div>
                            <div style="font-weight: 600; font-size: 0.9rem;">
                                ${product.price ? product.price + ' ₽/' + (product.unit || 'кг') : 'По запросу'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-actions" style="display: flex; gap: 10px; margin-top: auto;">
                        <button onclick="productManager.requestQuote(${product.id})" 
                                style="flex: 1; background: var(--accent-blue); color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-quote-left"></i> Запросить цену
                        </button>
                        <button onclick="productManager.showProductDetails(${product.id})" 
                                style="flex: 1; background: white; color: var(--accent-blue); border: 2px solid var(--accent-blue); padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 500;">
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
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage - 1})"
                     style="background: var(--light-gray); border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-chevron-left"></i>
                    </button>`;
        }
        
        // Первая страница
        if (start > 1) {
            html += `<button class="page-btn" onclick="productManager.goToPage(1)"
                     style="background: var(--light-gray); border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">1</button>`;
            if (start > 2) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
        }
        
        // Страницы
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="productManager.goToPage(${i})"
                        style="background: ${i === this.currentPage ? 'var(--accent-teal)' : 'var(--light-gray)'}; 
                               color: ${i === this.currentPage ? 'white' : 'var(--primary-dark)'};
                               border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: ${i === this.currentPage ? '600' : '400'};">
                        ${i}
                    </button>`;
        }
        
        // Последняя страница
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.totalPages})"
                     style="background: var(--light-gray); border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">${this.totalPages}</button>`;
        }
        
        // Следующая страница
        if (this.currentPage < this.totalPages) {
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage + 1})"
                     style="background: var(--light-gray); border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
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
                padding: 12px;
                background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                border-radius: 8px;
                border-left: 4px solid var(--accent-teal);
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
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Ошибка</h3>
                <p style="color: var(--dark-gray); margin-bottom: 20px;">${this.escapeHtml(message)}</p>
                <button onclick="productManager.loadProducts(1)" class="btn" style="background: var(--accent-teal); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> Повторить
                </button>
            </div>
        `;
    }
    
    async showProductDetails(productId) {
        this.selectedProductId = productId;
        
        try {
            this.showLoadingModal();
            
            // Имитируем задержку сети
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const productDetail = await this.api.fetchProductDetail(productId);
            this.showDetailModal(productDetail);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showErrorModal('Не удалось загрузить информацию о товаре');
        }
    }
    
    showLoadingModal() {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            backdrop-filter: blur(3px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; min-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--accent-teal); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Загрузка данных...</h3>
                <p style="color: var(--dark-gray);">Получение информации о товаре</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }
    
    showDetailModal(productDetail) {
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
        const specsHTML = productDetail.specifications ? `
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--light-gray);">
                <h4 style="color: var(--primary-dark); margin-bottom: 15px; border-bottom: 2px solid var(--accent-teal); padding-bottom: 5px;">
                    Характеристики
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${Object.entries(productDetail.specifications).map(([key, value]) => `
                        <div style="background: var(--light-gray); padding: 15px; border-radius: 8px; border-left: 4px solid var(--accent-teal);">
                            <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px; font-weight: 500;">${key}</div>
                            <div style="font-weight: 600; color: var(--primary-dark);">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; 
                        max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <button onclick="productManager.closeModal()" style="position: absolute; top: 15px; right: 15px;
                        background: none; border: none; font-size: 1.5rem; color: var(--dark-gray); cursor: pointer; padding: 5px; border-radius: 4px;">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 style="color: var(--primary-dark); margin-bottom: 15px; padding-right: 30px; font-size: 1.5rem;">${productDetail.name}</h2>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; min-width: 250px;">
                        <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; border-radius: 8px; border: 1px solid var(--light-gray);">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">CAS номер</div>
                                    <div style="font-weight: 600; color: var(--primary-dark); background: #e6f7ff; padding: 5px 10px; border-radius: 4px;">${productDetail.cas_number || 'Не указан'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Формула</div>
                                    <div style="font-weight: 600; color: var(--primary-dark); background: #f0f9ff; padding: 5px 10px; border-radius: 4px;">${productDetail.formula || 'Не указана'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Производитель</div>
                                    <div style="font-weight: 600; color: var(--primary-dark); background: #f5f3ff; padding: 5px 10px; border-radius: 4px;">${productDetail.manufacturer || 'Не указан'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Упаковка</div>
                                    <div style="font-weight: 600; color: var(--primary-dark); background: #ecfdf5; padding: 5px 10px; border-radius: 4px;">${productDetail.packaging || 'По запросу'}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Остаток</div>
                                    <div style="font-weight: 600; color: var(--primary-dark); background: #fef3c7; padding: 5px 10px; border-radius: 4px;">
                                        ${productDetail.stock ? this.formatNumber(productDetail.stock) + ' ' + (productDetail.unit || 'кг') : 'Под заказ'}
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Цена</div>
                                    <div style="font-weight: 600; color: white; background: linear-gradient(135deg, var(--accent-teal), #0d9488); padding: 5px 10px; border-radius: 4px;">
                                        ${productDetail.price ? productDetail.price + ' ₽/' + (productDetail.unit || 'кг') : 'По запросу'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="flex: 1; min-width: 250px;">
                        <div style="background: var(--light-gray); padding: 20px; border-radius: 8px; height: 100%;">
                            <h4 style="color: var(--primary-dark); margin-bottom: 15px; font-size: 1.1rem;">Описание</h4>
                            <p style="color: var(--text-dark); line-height: 1.6;">${productDetail.description}</p>
                        </div>
                    </div>
                </div>
                
                ${specsHTML}
                
                <div style="margin-top: 30px; display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="productManager.requestQuote(${productDetail.id})" 
                            style="flex: 1; min-width: 200px; background: var(--accent-blue); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 1rem;">
                        <i class="fas fa-quote-left"></i> Запросить цену
                    </button>
                    <button onclick="productManager.closeModal()" 
                            style="flex: 1; min-width: 200px; background: white; color: var(--accent-blue); border: 2px solid var(--accent-blue); padding: 15px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 1rem;">
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
            <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; min-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 20px;"></i>
                <h3 style="color: var(--primary-dark); margin-bottom: 10px;">Ошибка загрузки</h3>
                <p style="color: var(--dark-gray); margin-bottom: 20px;">${this.escapeHtml(message)}</p>
                <button onclick="productManager.closeModal()" class="btn" style="background: var(--accent-teal); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
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
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(3px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--accent-teal);">
                    <h3 style="color: var(--primary-dark); margin: 0; font-size: 1.3rem;">Запрос цены</h3>
                    <button onclick="productManager.closeQuoteModal()" style="background: none; border: none; 
                            font-size: 1.5rem; color: var(--dark-gray); cursor: pointer; padding: 5px; border-radius: 4px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p style="color: var(--dark-gray);">
                        Запрос цены на: <strong style="color: var(--primary-dark);">${this.escapeHtml(productName)}</strong> 
                        <br><small style="color: var(--dark-gray);">(ID: ${productId})</small>
                    </p>
                </div>
                
                <form id="quoteForm" style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Ваше имя *
                        </label>
                        <input type="text" name="name" required style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                               border-radius: 6px; font-size: 1rem; box-sizing: border-box;" placeholder="Иван Иванов">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Компания *
                        </label>
                        <input type="text" name="company" required style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                               border-radius: 6px; font-size: 1rem; box-sizing: border-box;" placeholder="ООО 'Пример'">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Email *
                        </label>
                        <input type="email" name="email" required style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                               border-radius: 6px; font-size: 1rem; box-sizing: border-box;" placeholder="ivan@example.com">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Телефон *
                        </label>
                        <input type="tel" name="phone" required style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                               border-radius: 6px; font-size: 1rem; box-sizing: border-box;" placeholder="+7 (999) 123-45-67">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Необходимое количество
                        </label>
                        <input type="number" name="quantity" step="0.01" style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                               border-radius: 6px; font-size: 1rem; box-sizing: border-box;" placeholder="Введите количество">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Комментарий
                        </label>
                        <textarea name="comment" rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--medium-gray);
                                  border-radius: 6px; font-size: 1rem; box-sizing: border-box; resize: vertical;" 
                                  placeholder="Дополнительная информация"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button type="submit" style="flex: 1; background: var(--accent-teal); color: white; border: none; padding: 15px; 
                                border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 1rem;">
                            <i class="fas fa-paper-plane"></i> Отправить запрос
                        </button>
                        <button type="button" onclick="productManager.closeQuoteModal()" style="flex: 1; background: white; color: var(--accent-blue); 
                                border: 2px solid var(--accent-blue); padding: 15px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 1rem;">
                            Отмена
                        </button>
                    </div>
                </form>
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
            
            // Сохраняем в localStorage для демо-целей
            const requests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
            requests.push(data);
            localStorage.setItem('quoteRequests', JSON.stringify(requests));
            
            alert(`✅ Запрос отправлен!\n\nТовар: ${productName}\nID: ${productId}\n\nМы свяжемся с вами в ближайшее время.`);
            
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
        // Поиск с debounce
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
        
        // CAS фильтр
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
        
        // Фильтр по производителю
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        if (manufacturerFilter) {
            manufacturerFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Обработчик ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeQuoteModal();
            }
        });
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Создаем глобальный объект
    window.productManager = new ProductManager();
    
    // Добавляем CSS для скелетона
    const skeletonStyles = `
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
            background: #e0e0e0;
            border-radius: 4px;
        }
        
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
        
        .api-status.demo {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = skeletonStyles;
    document.head.appendChild(styleElement);
    
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
        filterActions.style.cssText = 'margin-top: 20px; display: flex; gap: 10px;';
        filterActions.innerHTML = `
            <button onclick="productManager.applyFilters()" class="btn" style="flex: 1; background: var(--accent-teal); color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-check"></i> Применить
            </button>
            <button onclick="productManager.resetFilters()" class="btn btn-outline" style="flex: 1; background: white; color: var(--accent-blue); border: 2px solid var(--accent-blue); padding: 12px; border-radius: 6px; cursor: pointer;">
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
            
            // Меняем иконку
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
});

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.applyFilters = () => window.productManager?.applyFilters();
window.resetFilters = () => window.productManager?.resetFilters();
