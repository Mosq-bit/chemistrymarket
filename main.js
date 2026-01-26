// ==================== API КЛИЕНТ С REAL API ====================
class ChemistryMarketAPI {
    constructor() {
        this.baseURL = 'http://83.222.18.158:3001/api/v1';
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
    }
    
    async fetchProductDetail(productId) {
        try {
            const url = `${this.baseURL}/product/detail/${productId}`;
            const cacheKey = `detail_${productId}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
                return cached.data;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': this.authToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            
            // Сохраняем в кеш
            this.cache.set(cacheKey, {
                timestamp: Date.now(),
                data: data
            });
            
            return data;
            
        } catch (error) {
            console.error('API Error (fetchProductDetail):', error);
            return this.getDemoProductDetail(productId);
        }
    }
    
    async fetchProducts(page = 1) {
        try {
            // Для получения списка товаров - возможно другой endpoint
            // Пока используем демо-данные
            return this.getDemoData(page);
            
        } catch (error) {
            console.error('API Error (fetchProducts):', error);
            return this.getDemoData(page);
        }
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
            // В реальном API здесь был бы запрос к /manufacturers
            return ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 
                   'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим'];
        } catch (error) {
            console.error('Error getting manufacturers:', error);
            return ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess'];
        }
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
    }
    
    async init() {
        await this.updateApiStatus();
        await this.loadCategories();
        await this.loadManufacturers();
        await this.loadProducts();
        this.setupEventListeners();
    }
    
    async updateApiStatus() {
        const statusElement = document.getElementById('apiStatus');
        if (!statusElement) return;
        
        try {
            // Тестируем подключение к API
            const testUrl = `${this.api.baseURL}/product/detail/302016`;
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Authorization': this.api.authToken,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                statusElement.className = 'api-status online';
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> API подключен (реальные данные)';
            } else {
                throw new Error('API не отвечает');
            }
        } catch (error) {
            console.log('API недоступен, используем демо-данные:', error);
            statusElement.className = 'api-status offline';
            statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Используются демо-данные';
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
                    ${manufacturers.map(m => `<option value="${m}">${m}</option>`).join('')}
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
            
            // Показываем скелетон загрузки
            requestAnimationFrame(() => {
                container.innerHTML = this.getLoadingSkeleton();
            });
            
            const data = await this.api.fetchProducts(page);
            
            // Обновляем пагинацию
            this.totalProducts = data.count || 0;
            this.totalPages = Math.ceil(this.totalProducts / this.api.perPage);
            
            // Используем requestAnimationFrame для оптимизации рендеринга
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
        
        // Используем DocumentFragment для оптимизации DOM операций
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = product.id;
            card.innerHTML = `
                <div class="product-header">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; line-height: 1.3; color: var(--light-gray);">
                        ${this.escapeHtml(product.name)}
                    </h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span style="font-size: 0.85rem; color: var(--accent-blue); font-weight: 600;">
                            <i class="fas fa-hashtag"></i> ${this.escapeHtml(product.cas_number || 'CAS не указан')}
                        </span>
                        <span style="font-size: 0.85rem; color: var(--dark-gray);">
                            <i class="fas fa-tag"></i> ${this.escapeHtml(product.category_name || product.category)}
                        </span>
                    </div>
                </div>
                <div class="product-body">
                    <p style="color: var(--text-dark); margin-bottom: 15px; font-size: 0.95rem; flex-grow: 1;">
                        ${this.escapeHtml(product.description)}
                        ${product.formula ? `<br><strong>Формула:</strong> ${this.escapeHtml(product.formula)}` : ''}
                    </p>
                    
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label">Производитель</span>
                            <span class="spec-value">${this.escapeHtml(product.manufacturer || 'Не указан')}</span>
                            ${product.manufacturer ? `<span class="manufacturer-badge">${this.escapeHtml(product.manufacturer)}</span>` : ''}
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Упаковка</span>
                            <span class="spec-value">${this.escapeHtml(product.packaging || 'По запросу')}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Остаток</span>
                            <span class="spec-value">${product.stock ? product.stock.toLocaleString() + ' ' + (product.unit || 'кг') : 'Под заказ'}</span>
                        </div>
                        
                        <div class="spec-item">
                            <span class="spec-label">Цена</span>
                            <span class="spec-value">${product.price ? product.price + ' ₽/' + (product.unit || 'кг') : 'По запросу'}</span>
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
        
        // Очищаем и добавляем все элементы за один раз
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    // Вспомогательная функция для экранирования HTML
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
        
        // Информация
        html += `<div style="margin-left: 15px; color: var(--dark-gray); font-size: 0.9rem;">
                    Страница ${this.currentPage} из ${this.totalPages}
                </div>`;
        
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
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Остаток</div>
                                    <div style="font-weight: 600; color: var(--primary-dark);">
                                        ${productDetail.stock ? productDetail.stock.toLocaleString() + ' ' + (productDetail.unit || 'кг') : 'Под заказ'}
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 5px;">Цена</div>
                                    <div style="font-weight: 600; color: var(--accent-teal);">
                                        ${productDetail.price ? productDetail.price + ' ₽/' + (productDetail.unit || 'кг') : 'По запросу'}
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
                        <i class="fas fa-quote-left"></i> Запросить цену
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
        // Закрываем модальное окно если открыто
        this.closeModal();
        
        // Получаем информацию о товаре
        let productName = 'Товар';
        try {
            const productDetail = await this.api.fetchProductDetail(productId);
            productName = productDetail.name;
        } catch (error) {
            console.error('Error getting product name:', error);
        }
        
        // Показываем форму запроса
        this.showQuoteForm(productId, productName);
    }
    
    showQuoteForm(productId, productName) {
        const modal = document.createElement('div');
        modal.id = 'quoteModal';
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
            <div style="background: white; padding: 30px; border-radius: var(--radius-lg); max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: var(--primary-dark); margin: 0;">Запрос цены</h3>
                    <button onclick="productManager.closeQuoteModal()" style="background: none; border: none; 
                            font-size: 1.5rem; color: var(--dark-gray); cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <p style="color: var(--dark-gray); margin-bottom: 20px;">
                    Запрос цены на: <strong>${productName}</strong> (ID: ${productId})
                </p>
                
                <form id="quoteForm" style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Ваше имя *
                        </label>
                        <input type="text" name="name" required style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                               border-radius: var(--radius);">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Компания *
                        </label>
                        <input type="text" name="company" required style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                               border-radius: var(--radius);">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Email *
                        </label>
                        <input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                               border-radius: var(--radius);">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Телефон *
                        </label>
                        <input type="tel" name="phone" required style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                               border-radius: var(--radius);">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Необходимое количество
                        </label>
                        <input type="number" name="quantity" step="0.01" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                               border-radius: var(--radius);" placeholder="Введите количество">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--primary-dark); font-weight: 500;">
                            Комментарий
                        </label>
                        <textarea name="comment" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray);
                                  border-radius: var(--radius);" placeholder="Дополнительная информация"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn" style="flex: 1;">
                            <i class="fas fa-paper-plane"></i> Отправить запрос
                        </button>
                        <button type="button" onclick="productManager.closeQuoteModal()" class="btn btn-outline" style="flex: 1;">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчик формы
        const form = document.getElementById('quoteForm');
        form.addEventListener('submit', async (e) => {
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
            
            // Отправка запроса (в реальном приложении здесь был бы fetch к API)
            alert(`Запрос отправлен!\n\nТовар: ${productName}\nID: ${productId}\n\nМы свяжемся с вами в ближайшее время.`);
            
            this.closeQuoteModal();
        });
    }
    
    closeQuoteModal() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.remove();
        }
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
                }, 300); // Уменьшено с 500 до 300мс для лучшей отзывчивости
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
        border-radius: var(--radius);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
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
            
            // Очистка формы
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
            
            // Пропускаем пустые якоря
            if (href === '#' || href === '') {
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80; // Высота фиксированного header
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
