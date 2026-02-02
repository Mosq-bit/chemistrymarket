
class ChemistryMarketAPI {
    constructor() {

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
        

        this.demoProductsMap = new Map();
        this.demoProductsInitialized = false;
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
    

    initDemoProducts() {
        if (this.demoProductsInitialized) return;
        
        console.log('Инициализация демо-данных товаров...');
        
        // Создаем предопределенные демо-товары
        const demoProductsData = [
            { id: 302016, name: 'Серная кислота техническая', cas: '7664-93-9', formula: 'H₂SO₄', price: '150', category: 'acids' },
            { id: 302017, name: 'Гидроксид натрия каустический', cas: '1310-73-2', formula: 'NaOH', price: '120', category: 'alkalis' },
            { id: 302018, name: 'Ацетон высшей очистки', cas: '67-64-1', formula: 'C₃H₆O', price: '95', category: 'solvents' },
            { id: 302019, name: 'Диоксид титана рутильный', cas: '13463-67-7', formula: 'TiO₂', price: '230', category: 'pigments' },
            { id: 302020, name: 'Соляная кислота реактивная', cas: '7647-01-0', formula: 'HCl', price: '85', category: 'acids' },
            { id: 302021, name: 'Азотная кислота концентрированная', cas: '7697-37-2', formula: 'HNO₃', price: '110', category: 'acids' },
            { id: 302022, name: 'Перекись водорода 37%', cas: '7722-84-1', formula: 'H₂O₂', price: '75', category: 'reagents' },
            { id: 302023, name: 'Толуол технический', cas: '108-88-3', formula: 'C₇H₈', price: '90', category: 'solvents' },
            { id: 302024, name: 'Ксилол нефтяной', cas: '1330-20-7', formula: 'C₈H₁₀', price: '105', category: 'solvents' },
            { id: 302025, name: 'Уайт-спирит НЕФРАС', cas: '64742-82-1', formula: 'C₂H₅OH', price: '80', category: 'solvents' },
            { id: 302026, name: 'Этилацетат пищевой', cas: '141-78-6', formula: 'C₂H₆O₂', price: '125', category: 'solvents' },
            { id: 302027, name: 'Изопропиловый спирт', cas: '67-63-0', formula: 'C₃H₈O', price: '95', category: 'solvents' },
            { id: 302028, name: 'Этиленгликоль антифризный', cas: '107-21-1', formula: 'C₂H₆O₂', price: '115', category: 'raw_materials' },
            { id: 302029, name: 'Полиакриламид анионный', cas: '9003-05-8', formula: '(C₃H₅NO)n', price: '180', category: 'polymers' },
            { id: 302030, name: 'Бентонит натриевый', cas: '1302-78-9', formula: 'Al₂Si₄O₁₀(OH)₂', price: '65', category: 'raw_materials' },
            { id: 302031, name: 'Оксид цинка технический', cas: '1314-13-2', formula: 'ZnO', price: '140', category: 'pigments' },
            { id: 302032, name: 'Карбонат кальция осажденный', cas: '471-34-1', formula: 'CaCO₃', price: '55', category: 'additives' },
            { id: 302033, name: 'Сульфат алюминия', cas: '10043-01-3', formula: 'Al₂(SO₄)₃', price: '70', category: 'reagents' },
            { id: 302034, name: 'Хлорное железо', cas: '7705-08-0', formula: 'FeCl₃', price: '95', category: 'reagents' },
            { id: 302035, name: 'Каолин обогащенный', cas: '1332-58-7', formula: 'Al₂Si₂O₅(OH)₄', price: '45', category: 'raw_materials' }
        ];
        
        // Категории товаров
        const categories = {
            'acids': { id: 'acids', name: 'Кислоты' },
            'alkalis': { id: 'alkalis', name: 'Щелочи' },
            'solvents': { id: 'solvents', name: 'Растворители' },
            'polymers': { id: 'polymers', name: 'Полимеры' },
            'pigments': { id: 'pigments', name: 'Пигменты' },
            'additives': { id: 'additives', name: 'Добавки' },
            'reagents': { id: 'reagents', name: 'Реактивы' },
            'raw_materials': { id: 'raw_materials', name: 'Сырье' }
        };
        
        // Производители
        const manufacturers = ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим'];
        
        // Заполняем карту демо-товаров
        demoProductsData.forEach((product, index) => {
            const manufacturer = manufacturers[index % manufacturers.length];
            const category = categories[product.category];
            
            this.demoProductsMap.set(product.id, {
                id: product.id,
                product_id: product.id,
                name: product.name,
                description: this.getProductDescription(product.name),
                cas_number: product.cas,
                formula: product.formula,
                category: category.id,
                category_name: category.name,
                manufacturer: manufacturer,
                manufacturer_id: Math.floor(Math.random() * 1000),
                packaging: this.getPackagingForProduct(product.name),
                unit: 'кг',
                price: product.price,
                min_order: 100,
                lead_time: '3-5 дней',
                specifications: this.generateSpecsForProduct(product.name),
                certificates: [
                    { name: 'Сертификат качества', url: '#', type: 'pdf' },
                    { name: 'Паспорт безопасности (MSDS)', url: '#', type: 'pdf' }
                ],
                files: [
                    { id: 1, name: 'Технический паспорт', url: '#', size: '2.4 MB', type: 'pdf' },
                    { id: 2, name: 'Инструкция по применению', url: '#', size: '1.2 MB', type: 'pdf' }
                ],
                images: [
                    { id: 1, url: 'https://via.placeholder.com/400x300/4a90e2/ffffff?text=Chemistry+Product', alt: 'Химическая продукция', is_main: true }
                ],
                created_at: '2023-01-15T10:30:00Z',
                updated_at: '2023-12-01T14:20:00Z',
                is_active: true
            });
        });
        
        this.demoProductsInitialized = true;
        console.log('Демо-данные инициализированы:', this.demoProductsMap.size, 'товаров');
    }
    
    // Описание товара в зависимости от типа
    getProductDescription(productName) {
        const descriptions = {
            'кислот': 'Высококачественная техническая кислота промышленного назначения. Используется в химической промышленности, металлургии, производстве удобрений. Соответствует ГОСТ и международным стандартам.',
            'гидроксид': 'Каустическая сода высокой чистоты. Применяется в производстве бумаги, мыла, моющих средств, в нефтепереработке. Гарантированное качество и стабильность поставок.',
            'ацетон': 'Ацетон высшей степени очистки. Используется как растворитель в лакокрасочной промышленности, производстве пластмасс, фармацевтике. Низкое содержание примесей.',
            'диоксид титана': 'Рутильная форма диоксида титана с высокими кроющими свойствами. Применяется в производстве красок, лаков, пластмасс, бумаги. Отличная диспергируемость.',
            'спирт': 'Высококачественный растворитель органического происхождения. Используется в фармацевтической, парфюмерной промышленности, в качестве антисептика. Различные степени очистки.'
        };
        
        for (const [key, desc] of Object.entries(descriptions)) {
            if (productName.toLowerCase().includes(key)) {
                return desc;
            }
        }
        
        return 'Высококачественное химическое сырье промышленного назначения. Соответствует ГОСТ и международным стандартам качества. Гарантированная чистота и стабильные характеристики.';
    }
    
    // Упаковка в зависимости от товара
    getPackagingForProduct(productName) {
        if (productName.includes('кислот') || productName.includes('спирт')) {
            return 'Канистра 25 л';
        } else if (productName.includes('порошок') || productName.includes('оксид')) {
            return 'Мешок 25 кг';
        } else {
            const packagings = ['Канистра 25 л', 'Бочка 200 л', 'Мешок 25 кг', 'Биг-бэг 1000 кг', 'Флакон 1 л', 'Бутыль 5 л'];
            return packagings[Math.floor(Math.random() * packagings.length)];
        }
    }
    
    // Спецификации для конкретного товара
    generateSpecsForProduct(productName) {
        // Базовые спецификации
        const baseSpecs = {
            'Срок годности': '24 месяца',
            'Условия хранения': 'В сухом прохладном месте',
            'Класс опасности': '3',
            'Стандарт': 'ГОСТ, ТУ'
        };
        
        // Специфичные спецификации
        if (productName.includes('серная кислота')) {
            return {
                ...baseSpecs,
                'Внешний вид': 'Прозрачная маслянистая жидкость',
                'Плотность': '1.84 г/см³',
                'Концентрация': '98%',
                'Температура плавления': '10°C',
                'Температура кипения': '337°C',
                'Растворимость': 'Смешивается с водой'
            };
        } else if (productName.includes('гидроксид натрия')) {
            return {
                ...baseSpecs,
                'Внешний вид': 'Белые гранулы/чешуйки',
                'Плотность': '2.13 г/см³',
                'Концентрация': '99%',
                'Температура плавления': '323°C',
                'Температура кипения': '1388°C',
                'Растворимость': 'Хорошо растворим в воде'
            };
        } else if (productName.includes('ацетон')) {
            return {
                ...baseSpecs,
                'Внешний вид': 'Прозрачная жидкость',
                'Плотность': '0.79 г/см³',
                'Концентрация': '99.5%',
                'Температура плавления': '-95°C',
                'Температура кипения': '56°C',
                'Растворимость': 'Смешивается с водой'
            };
        } else if (productName.includes('диоксид титана')) {
            return {
                ...baseSpecs,
                'Внешний вид': 'Белый порошок',
                'Плотность': '4.23 г/см³',
                'Чистота': '99.8%',
                'Температура плавления': '1843°C',
                'Температура кипения': '2972°C',
                'Кристаллическая форма': 'Рутил'
            };
        } else {
            return {
                ...baseSpecs,
                'Внешний вид': 'Порошок/гранулы/жидкость',
                'Плотность': '1.0-2.0 г/см³',
                'Концентрация': '95-99%',
                'Температура плавления': '50-300°C',
                'Температура кипения': '100-400°C',
                'Растворимость': 'Вода/органические растворители'
            };
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
        
        // ИСПРАВЛЕНИЕ: Инициализируем демо-данные если еще не инициализированы
        if (!this.demoProductsInitialized) {
            this.initDemoProducts();
        }
        
        // ИСПРАВЛЕНИЕ: Получаем предопределенные данные из карты
        if (this.demoProductsMap.has(productId)) {
            return this.demoProductsMap.get(productId);
        }
        
        // Если ID нет в карте, создаем новый товар с фиксированными данными
        console.warn(`Товар с ID ${productId} не найден в демо-данных, создаем новый`);
        const newProduct = this.createDemoProduct(productId);
        this.demoProductsMap.set(productId, newProduct);
        return newProduct;
    }
    
    // Создание демо-товара с детерминированными данными
    createDemoProduct(productId) {
        // Список предопределенных товаров
        const productNames = [
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
            'Оксид цинка технический',
            'Карбонат кальция осажденный',
            'Сульфат алюминия',
            'Хлорное железо',
            'Каолин обогащенный'
        ];
        
        const casNumbers = [
            '7664-93-9', '1310-73-2', '67-64-1', '13463-67-7',
            '7647-01-0', '7697-37-2', '7722-84-1', '108-88-3',
            '1330-20-7', '64742-82-1', '141-78-6', '67-63-0',
            '107-21-1', '9003-05-8', '1302-78-9', '1314-13-2',
            '471-34-1', '10043-01-3', '7705-08-0', '1332-58-7'
        ];
        
        const formulas = [
            'H₂SO₄', 'NaOH', 'C₃H₆O', 'TiO₂', 'HCl', 'HNO₃', 
            'H₂O₂', 'C₇H₈', 'C₈H₁₀', 'C₂H₅OH', 'C₂H₆O₂', 
            'C₃H₈O', 'C₂H₆O₂', '(C₃H₅NO)n', 'Al₂Si₄O₁₀(OH)₂',
            'ZnO', 'CaCO₃', 'Al₂(SO₄)₃', 'FeCl₃', 'Al₂Si₂O₅(OH)₄'
        ];
        
        const prices = ['150', '120', '95', '230', '85', '110', '75', '90', '105', '80', '125', '95', '115', '180', '65', '140', '55', '70', '95', '45'];
        const categories = ['acids', 'alkalis', 'solvents', 'pigments', 'acids', 'acids', 'reagents', 'solvents', 'solvents', 'solvents', 'solvents', 'solvents', 'raw_materials', 'polymers', 'raw_materials', 'pigments', 'additives', 'reagents', 'reagents', 'raw_materials'];
        
        // Используем ID для детерминированного выбора
        const index = (productId - 302016) % productNames.length;
        const name = productNames[index];
        const cas = casNumbers[index];
        const formula = formulas[index];
        const price = prices[index];
        const categoryId = categories[index];
        
        const manufacturers = ['BASF', 'Dow Chemical', 'Evonik', 'Sibur', 'Lanxess', 'AkzoNobel', 'Clariant', 'Solvay', 'Химсинтез', 'Уралхим'];
        const categoryNames = {
            'acids': 'Кислоты',
            'alkalis': 'Щелочи',
            'solvents': 'Растворители',
            'polymers': 'Полимеры',
            'pigments': 'Пигменты',
            'additives': 'Добавки',
            'reagents': 'Реактивы',
            'raw_materials': 'Сырье'
        };
        
        const manufacturer = manufacturers[index % manufacturers.length];
        const categoryName = categoryNames[categoryId] || 'Сырье';
        
        return {
            id: productId,
            product_id: productId,
            name: name,
            description: this.getProductDescription(name),
            cas_number: cas,
            formula: formula,
            category: categoryId,
            category_name: categoryName,
            manufacturer: manufacturer,
            manufacturer_id: Math.floor(Math.random() * 1000),
            packaging: this.getPackagingForProduct(name),
            unit: 'кг',
            price: price,
            min_order: 100,
            lead_time: '3-5 дней',
            specifications: this.generateSpecsForProduct(name),
            certificates: [
                { name: 'Сертификат качества', url: '#', type: 'pdf' },
                { name: 'Паспорт безопасности (MSDS)', url: '#', type: 'pdf' }
            ],
            files: [
                { id: 1, name: 'Технический паспорт', url: '#', size: '2.4 MB', type: 'pdf' },
                { id: 2, name: 'Инструкция по применению', url: '#', size: '1.2 MB', type: 'pdf' }
            ],
            images: [
                { id: 1, url: 'https://via.placeholder.com/400x300/4a90e2/ffffff?text=Chemistry+Product', alt: 'Химическая продукция', is_main: true }
            ],
            created_at: '2023-01-15T10:30:00Z',
            updated_at: '2023-12-01T14:20:00Z',
            is_active: true
        };
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
    
    // Исправленный метод получения демо-данных
    getDemoData(page) {
        // Инициализируем демо-данные если еще не инициализированы
        if (!this.demoProductsInitialized) {
            this.initDemoProducts();
        }
        
        const products = [];
        const startIdx = (page - 1) * this.perPage;
        
        // Получаем все ID из карты и сортируем их
        const demoProductIds = Array.from(this.demoProductsMap.keys()).sort((a, b) => a - b);
        
        for (let i = 0; i < this.perPage; i++) {
            const productIndex = startIdx + i;
            
            // Если есть предопределенные товары, используем их
            if (productIndex < demoProductIds.length) {
                const productId = demoProductIds[productIndex];
                const productDetail = this.demoProductsMap.get(productId);
                
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
                    description: productDetail.description.substring(0, 150) + '...',
                    min_order: productDetail.min_order,
                    specifications: productDetail.specifications
                });
            } else {
                // Иначе создаем новый ID
                const productId = 302016 + productIndex;
                const productDetail = this.createDemoProduct(productId);
                this.demoProductsMap.set(productId, productDetail);
                
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
                    description: productDetail.description.substring(0, 150) + '...',
                    min_order: productDetail.min_order,
                    specifications: productDetail.specifications
                });
            }
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
            count: this.demoProductsMap.size,
            next: page < Math.ceil(this.demoProductsMap.size / this.perPage) ? `?page=${page + 1}` : null,
            previous: page > 1 ? `?page=${page - 1}` : null,
            results: filtered
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
        
        // Инициализируем демо-данные заранее
        this.api.initDemoProducts();
        
        // Загружаем данные
        await this.loadCategories();
        await this.loadManufacturers();
        await this.loadProducts();
        this.setupEventListeners();
        
        // Инициализируем форму запроса на странице
        this.initQuoteForm();
        
        // Добавляем стили для темы
        this.addThemeStyles();
    }
    
    addThemeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @media (prefers-color-scheme: dark) {
                .product-card h3 {
                    color: var(--white, #ffffff) !important;
                }
                
                .product-card {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
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
            statusElement.className = 'api-status checking';
            statusElement.innerHTML = '<i class="fas fa-sync fa-spin"></i> Проверка подключения к API...';
            
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
            
            if (page === 1 && container.children.length === 0) {
                requestAnimationFrame(() => {
                    container.innerHTML = this.getLoadingSkeleton();
                });
            }
            
            const data = await this.api.fetchProducts(page);
            
            this.totalProducts = data.count || 0;
            this.totalPages = Math.ceil(this.totalProducts / this.api.perPage);
            
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
            card.dataset.productName = product.name;
            
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
        
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i>
                    </button>`;
        }
        
        if (start > 1) {
            html += `<button class="page-btn" onclick="productManager.goToPage(1)">1</button>`;
            if (start > 2) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
        }
        
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="productManager.goToPage(${i})">${i}</button>`;
        }
        
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) html += `<span style="padding: 12px 5px; color: var(--dark-gray);">...</span>`;
            html += `<button class="page-btn" onclick="productManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }
        
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
        const searchInput = document.getElementById('searchInput');
        const casFilter = document.getElementById('casFilter');
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        
        if (searchInput) searchInput.value = '';
        if (casFilter) casFilter.value = '';
        if (manufacturerFilter) manufacturerFilter.value = '';
        
        const buttons = document.querySelectorAll('#categoriesList button');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        
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
            this.showLoadingModal();
            const productDetail = await this.api.fetchProductDetail(productId);
            this.showDetailModal(productDetail);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showErrorModal();
        }
    }
    
    showLoadingModal() {
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
        const modal = document.getElementById('productDetailModal');
        if (!modal) return;
        
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
    
    // ==================== МЕТОДЫ ДЛЯ МОДАЛЬНОГО ОКНА ЗАЯВКИ ====================
    
    async requestQuote(productId) {
        console.log(`Запрос заявки для товара ID: ${productId}`);
        
        try {
            const productDetail = await this.api.fetchProductDetail(productId);
            console.log(`Получены данные товара: ${productDetail.name} (ID: ${productDetail.id})`);
            
            this.showQuoteModal(productDetail);
            
        } catch (error) {
            console.error('Error getting product details:', error);
            
            this.showQuoteModal({
                id: productId,
                name: `Товар #${productId}`,
                cas_number: '',
                manufacturer: '',
                price: '',
                unit: 'кг'
            });
        }
    }
    
    showQuoteModal(productDetail) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.id = 'quoteRequestModal';
        modal.className = 'quote-modal';
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
            z-index: 2001;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        let priceDisplay = 'По запросу';
        if (productDetail.price) {
            const priceNum = parseFloat(productDetail.price);
            if (!isNaN(priceNum)) {
                priceDisplay = `${Math.round(priceNum)} ₽/${productDetail.unit || 'кг'}`;
            }
        }
        
        modal.innerHTML = `
            <div class="quote-modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                transform: translateY(20px);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            ">
                <button class="close-modal-btn" onclick="productManager.closeQuoteModal()" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: var(--dark-gray);
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.3s;
                ">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 style="color: var(--primary-dark); margin-bottom: 10px; padding-right: 30px;">
                    <i class="fas fa-quote-left" style="color: var(--accent-blue); margin-right: 10px;"></i>
                    Запрос товара
                </h2>
                
                <div style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid var(--accent-blue);
                ">
                    <h3 style="color: var(--primary-dark); margin-bottom: 8px; font-size: 1.1rem;">
                        ${this.escapeHtml(productDetail.name)}
                    </h3>
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 0.9rem;">
                        ${productDetail.cas_number ? `
                            <div>
                                <strong style="color: var(--dark-gray);">CAS:</strong>
                                <span style="color: var(--primary-dark); font-weight: 600;">${productDetail.cas_number}</span>
                            </div>
                        ` : ''}
                        ${productDetail.manufacturer ? `
                            <div>
                                <strong style="color: var(--dark-gray);">Производитель:</strong>
                                <span style="color: var(--primary-dark);">${productDetail.manufacturer}</span>
                            </div>
                        ` : ''}
                        ${priceDisplay !== 'По запросу' ? `
                            <div>
                                <strong style="color: var(--dark-gray);">Цена:</strong>
                                <span style="color: var(--accent-teal); font-weight: 600;">${priceDisplay}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <form id="quoteRequestForm" class="quote-request-form">
                    <div class="form-group">
                        <label>
                            <i class="fas fa-box" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            Количество (вес, объем) *
                        </label>
                        <input type="text" name="quantity" class="form-control" 
                               placeholder="Например: 10 кг, 5 л, 100 шт" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <i class="fas fa-ruler-combined" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            Ед. измерения *
                        </label>
                        <select name="unit" class="form-control" required>
                            <option value="" selected disabled>Выберите единицу измерения</option>
                            <option value="кг">Килограммы (кг)</option>
                            <option value="л">Литры (л)</option>
                            <option value="шт">Штуки (шт)</option>
                            <option value="м">Метры (м)</option>
                            <option value="упак">Упаковки</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <i class="fas fa-industry" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            Для изготовления какого продукта или для каких целей требуется товар? *
                        </label>
                        <textarea name="purpose" class="form-control" rows="3" 
                                  placeholder="Опишите подробно, для чего вам нужен товар" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <i class="fas fa-flask" style="color: var(--accent-blue); margin-right: 8px;"></i>
                            Марка, концентрация основного вещества в % или вид чистоты
                        </label>
                        <input type="text" name="specification" class="form-control" 
                               placeholder="Например: тех, ч, чда, хч, осч"
                               value="${this.escapeHtml(productDetail.name)}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>
                                <i class="fas fa-user" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                Имя *
                            </label>
                            <input type="text" name="name" class="form-control" 
                                   placeholder="Ваше полное имя" required>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-building" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                Компания
                            </label>
                            <input type="text" name="company" class="form-control" 
                                   placeholder="Название компании">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>
                                <i class="fas fa-phone" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                Телефон *
                            </label>
                            <div class="phone-input-container">
                                <span class="phone-prefix">+7</span>
                                <input type="tel" name="phone" class="form-control phone-input-modal" 
                                       placeholder="(999) 123-45-67" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-envelope" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                Email *
                            </label>
                            <input type="email" name="email" class="form-control" 
                                   placeholder="example@domain.com" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>
                                <i class="fas fa-city" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                Город доставки *
                            </label>
                            <input type="text" name="city" class="form-control" 
                                   placeholder="Например: Москва" required>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-id-card" style="color: var(--accent-blue); margin-right: 8px;"></i>
                                ИНН *
                            </label>
                            <input type="text" name="inn" class="form-control" 
                                   placeholder="10 или 12 цифр" required>
                        </div>
                    </div>
                    
                    <div class="consent-checkbox">
                        <input type="checkbox" name="consent" id="modalConsent" required>
                        <label for="modalConsent">
                            Я даю согласие на обработку указанных мной персональных данных в соответствии с 
                            <a href="#">политикой конфиденциальности</a>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn">
                            <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>
                            Отправить запрос
                        </button>
                        <button type="button" onclick="productManager.closeQuoteModal()" 
                                class="btn btn-outline">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            const content = modal.querySelector('.quote-modal-content');
            if (content) {
                content.style.transform = 'translateY(0)';
                content.style.opacity = '1';
            }
        }, 50);
        
        const phoneInput = modal.querySelector('.phone-input-modal');
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
        
        const form = modal.querySelector('#quoteRequestForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            this.clearModalErrors();
            
            let isValid = true;
            
            const formData = new FormData(form);
            const data = {
                product_id: productDetail.id,
                product_name: productDetail.name,
                quantity: formData.get('quantity'),
                unit: formData.get('unit'),
                purpose: formData.get('purpose'),
                specification: formData.get('specification'),
                name: formData.get('name'),
                company: formData.get('company'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                city: formData.get('city'),
                inn: formData.get('inn'),
                timestamp: new Date().toISOString()
            };
            
            const requiredFields = ['quantity', 'unit', 'purpose', 'name', 'phone', 'email', 'city', 'inn'];
            requiredFields.forEach(field => {
                const element = form.querySelector(`[name="${field}"]`);
                if (!data[field] || data[field].trim() === '') {
                    this.showModalError(element, 'Это поле обязательно для заполнения');
                    isValid = false;
                }
            });
            
            const phoneElement = form.querySelector('[name="phone"]');
            if (phoneElement) {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{2}-\d{2}$/;
                if (!phoneRegex.test(data.phone.trim())) {
                    this.showModalError(phoneElement, 'Пожалуйста, укажите телефон в формате (999) 123-45-67');
                    isValid = false;
                }
            }
            
            const emailElement = form.querySelector('[name="email"]');
            if (emailElement) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email.trim())) {
                    this.showModalError(emailElement, 'Пожалуйста, укажите корректный email');
                    isValid = false;
                }
            }
            
            const innElement = form.querySelector('[name="inn"]');
            if (innElement) {
                const innRegex = /^\d{10}$|^\d{12}$/;
                if (!innRegex.test(data.inn.trim())) {
                    this.showModalError(innElement, 'Пожалуйста, укажите корректный ИНН (10 или 12 цифр)');
                    isValid = false;
                }
            }
            
            const consentElement = form.querySelector('[name="consent"]');
            if (consentElement && !consentElement.checked) {
                this.showModalError(consentElement.parentNode, 'Необходимо дать согласие на обработку персональных данных');
                isValid = false;
            }
            
            if (isValid) {
                const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
                quoteRequests.push(data);
                localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
                
                this.showModalSuccess(modal);
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeQuoteModal();
            }
        });
        
        const escHandler = (e) => {
            if (e.key === 'Escape' && modal && modal.parentNode) {
                this.closeQuoteModal();
            }
        };
        document.addEventListener('keydown', escHandler);
        
        modal.dataset.escHandler = 'true';
        
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 100);
        }
    }
    
    showModalError(element, message) {
        element.classList.add('error');
        
        const oldError = element.parentNode.querySelector('.modal-error-message');
        if (oldError) {
            oldError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'modal-error-message';
        errorDiv.style.cssText = 'color: #dc2626; font-size: 0.85rem; margin-top: 5px; font-weight: 500;';
        errorDiv.textContent = message;
        
        if (element.type === 'checkbox') {
            element.parentNode.appendChild(errorDiv);
        } else {
            element.parentNode.appendChild(errorDiv);
        }
    }
    
    clearModalErrors() {
        const modal = document.getElementById('quoteRequestModal');
        if (!modal) return;
        
        modal.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        modal.querySelectorAll('.modal-error-message').forEach(el => {
            el.remove();
        });
    }
    
    showModalSuccess(modal) {
        const form = modal.querySelector('#quoteRequestForm');
        if (!form) return;
        
        form.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="width: 80px; height: 80px; background: #10b981; color: white; 
                            border-radius: 50%; display: flex; align-items: center; 
                            justify-content: center; margin: 0 auto 20px; font-size: 2rem;">
                    <i class="fas fa-check"></i>
                </div>
                <h3 style="color: var(--primary-dark); margin-bottom: 15px;">
                    Запрос успешно отправлен!
                </h3>
                <p style="color: var(--dark-gray); margin-bottom: 20px;">
                    Спасибо за ваш запрос. Мы свяжемся с вами в ближайшее время.
                </p>
                <button onclick="productManager.closeQuoteModal()" class="btn" 
                        style="padding: 12px 30px; margin-top: 10px;">
                    <i class="fas fa-times" style="margin-right: 8px;"></i>
                    Закрыть
                </button>
            </div>
        `;
    }
    
    closeQuoteModal() {
        const modal = document.getElementById('quoteRequestModal');
        if (modal) {
            document.removeEventListener('keydown', () => {});
            
            modal.style.opacity = '0';
            const content = modal.querySelector('.quote-modal-content');
            if (content) {
                content.style.transform = 'translateY(20px)';
                content.style.opacity = '0';
            }
            
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    }
    
    async sendQuoteToServer(data) {
        try {
            console.log('Отправка данных заявки на сервер:', data);
            return true;
        } catch (error) {
            console.error('Ошибка отправки заявки:', error);
            return false;
        }
    }
    
    initQuoteForm() {
        const quoteForm = document.getElementById('quoteForm');
        if (!quoteForm) return;
        
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
        
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            this.clearFormErrors();
            
            let isValid = true;
            
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
                if (!element || !element.value.trim()) {
                    this.showFormError(element, `Пожалуйста, заполните поле "${field.name}"`);
                    isValid = false;
                }
            });
            
            if (phoneInput) {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{2}-\d{2}$/;
                if (!phoneRegex.test(phoneInput.value.trim())) {
                    this.showFormError(phoneInput, 'Пожалуйста, укажите телефон в формате (999) 123-45-67');
                    isValid = false;
                }
            }
            
            const emailInput = document.getElementById('email');
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    this.showFormError(emailInput, 'Пожалуйста, укажите корректный email');
                    isValid = false;
                }
            }
            
            const innInput = document.getElementById('inn');
            if (innInput) {
                const innRegex = /^\d{10}$|^\d{12}$/;
                if (!innRegex.test(innInput.value.trim())) {
                    this.showFormError(innInput, 'Пожалуйста, укажите корректный ИНН (10 или 12 цифр)');
                    isValid = false;
                }
            }
            
            const consentInput = document.getElementById('consent');
            if (consentInput && !consentInput.checked) {
                alert('Необходимо дать согласие на обработку персональных данных');
                consentInput.focus();
                isValid = false;
            }
            
            if (isValid) {
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
                
                const quoteRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
                quoteRequests.push(formData);
                localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests));
                
                this.showSuccessMessage();
                
                setTimeout(() => {
                    quoteForm.reset();
                    this.clearFormErrors();
                }, 2000);
            }
        });
    }
    
    showFormError(element, message) {
        if (!element) return;
        
        element.classList.add('error');
        
        const oldError = element.parentNode.querySelector('.error-message');
        if (oldError) {
            oldError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    }
    
    clearFormErrors() {
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });
        
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
    }
    
    showSuccessMessage() {
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
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 5000);
    }
    
    setupEventListeners() {
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
    
    const productsTitle = document.querySelector('#products h2');
    if (productsTitle) {
        productsTitle.insertAdjacentElement('afterend', apiStatus);
    }
    
    const productCount = document.createElement('div');
    productCount.id = 'productCount';
    productCount.style.cssText = `
        text-align: center;
        margin: 20px 0 30px 0;
        color: var(--dark-gray);
        font-weight: 600;
        font-size: 1.1rem;
    `;
    
    apiStatus.insertAdjacentElement('afterend', productCount);
    
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
    
    window.productManager = new ProductManager();
    window.productManager.init();
    
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
            
            const contacts = JSON.parse(localStorage.getItem('contactRequests') || '[]');
            contacts.push(formData);
            localStorage.setItem('contactRequests', JSON.stringify(contacts));
            
            alert('✅ Спасибо за ваш запрос! Мы свяжемся с вами в ближайшее время.');
            
            contactForm.reset();
        });
    }
    
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
        
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            });
        });
        
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
    }
    
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
    
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .quote-modal {
            animation: modalFadeIn 0.3s ease-out;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .quote-modal-content {
            animation: modalContentFadeIn 0.3s ease-out;
        }
        
        @keyframes modalContentFadeIn {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .quote-request-form .form-group {
            margin-bottom: 15px;
        }
        
        .quote-request-form label {
            display: block;
            margin-bottom: 5px;
            color: var(--primary-dark);
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        .quote-request-form .form-control {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--medium-gray);
            border-radius: var(--radius);
            font-family: 'Open Sans', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: var(--white);
        }
        
        .quote-request-form .form-control:focus {
            outline: none;
            border-color: var(--accent-blue);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .quote-request-form .form-control.error {
            border-color: #dc2626;
            background-color: rgba(220, 38, 38, 0.02);
        }
        
        .quote-request-form .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        @media (max-width: 600px) {
            .quote-request-form .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        .quote-request-form .phone-input-container {
            display: flex;
            align-items: center;
            border: 1px solid var(--medium-gray);
            border-radius: var(--radius);
            overflow: hidden;
        }
        
        .quote-request-form .phone-prefix {
            padding: 0 12px;
            background-color: #f8f9fa;
            border-right: 1px solid var(--medium-gray);
            font-weight: 600;
            color: var(--dark-gray);
        }
        
        .quote-request-form .consent-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--radius);
            margin: 15px 0;
            font-size: 0.9rem;
        }
        
        .quote-request-form .consent-checkbox label {
            margin-bottom: 0;
            font-weight: normal;
            color: var(--dark-gray);
            line-height: 1.5;
        }
        
        .quote-request-form .consent-checkbox a {
            color: var(--accent-blue);
            text-decoration: none;
        }
        
        .quote-request-form .consent-checkbox a:hover {
            text-decoration: underline;
        }
        
        .quote-request-form .form-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .quote-request-form .form-actions .btn {
            flex: 1;
            padding: 12px;
            font-size: 1rem;
        }
        
        .close-modal-btn:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        @media (prefers-color-scheme: dark) {
            .quote-modal-content {
                background: var(--dark-gray);
                color: var(--text-dark);
            }
            
            .quote-modal-content h2,
            .quote-modal-content h3 {
                color: var(--text-dark);
            }
            
            .quote-request-form .form-control {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
                color: var(--text-dark);
            }
            
            .quote-request-form .phone-prefix {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-dark);
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            .quote-request-form .consent-checkbox {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .close-modal-btn {
                color: rgba(255, 255, 255, 0.8);
            }
            
            .close-modal-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    `;
    document.head.appendChild(modalStyles);
});

// ==================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ====================
window.applyFilters = () => window.productManager?.applyFilters();
window.resetFilters = () => window.productManager?.resetFilters();
window.requestQuote = (productId) => window.productManager?.requestQuote(productId);
