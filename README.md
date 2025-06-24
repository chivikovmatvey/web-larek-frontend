# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/presenters/ — папка с презентерами (добавлено для MVP-структуры)
- src/models/ — папка с моделями данных
- src/pages/ — HTML-страницы
- src/scss/ — стили
- src/types/ — типы данных
- src/utils/ — утилиты

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами
- src/models/WebLarekApi.ts — класс для работы с API (добавлено)

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

### Описание проекта

Интернет-магазин "Web-ларёк" для веб-разработчиков, позволяющий просматривать каталог товаров, добавлять их в корзину и оформлять заказы. Проект реализован с использованием TypeScript, паттерна MVP, событийно-ориентированной архитектуры и ООП.

### Типы данных

Все типы данных определены в `src/types/index.ts`.

- **PaymentMethod**: Тип-объединение для способов оплаты (`online` | `offline`).
- **IProduct**: Интерфейс для товара (id, description, image, title, category, price).
- **IProductInstance**: Расширение IProduct с методом data() для экземпляров товаров.
- **ICartItem**: Элемент корзины (товар и количество).
- **ICart**: Корзина (список элементов и общая сумма).
- **IOrderRequest**: Данные для создания заказа (payment, email, phone, address, total, items).
- **IOrderResponse**: Ответ сервера после создания заказа (id, total).
- **IApiError**: Структура ошибок API (error).
- **AppEvents**: Перечисление событий приложения (например, `product:view`, `cart:update`, `order:success`, `modal:open`, `modal:close`).
- **IAppEventData**: Тип данных для каждого события, соответствующий AppEvents.

### Архитектура: Модели

Модели отвечают за управление данными и бизнес-логикой, реализуя слой Model в паттерне MVP.

1. **WebLarekApi**:
    
    - Расширяет класс `Api` для работы с API магазина.
    - Методы: `getProducts(category?: string, limit?: number)`, `getProduct(id: string)`, `createOrder(request: IOrderRequest, options?: any)`.
    - Обрабатывает запросы к эндпоинтам `/product/` и `/order`.
    - Типизация: использует `IProduct`, `IOrderRequest`, `IOrderResponse`, `IApiError`.
    - Примечание: Методы возвращают промисы с данными или ошибками.
2. **Product**:
    
    - Хранит данные о товаре (`IProduct`).
    - Предоставляет геттеры для доступа к полям (`id`, `title`, `price` и т.д.).
    - Используется в `Cart` и представлениях.
3. **Cart**:
    
    - Управляет корзиной: добавление/удаление товаров, подсчёт суммы.
    - Методы: `add`, `remove`, `getCart`, `clear`, `getProductIds`.
    - Генерирует события: `CartUpdate`, `ProductAddToCart`, `ProductRemoveFromCart`.
    - Типизация: `ICart`, `ICartItem`.
4. **Order**:
    
    - Управляет заказом: установка данных, отправка на сервер.
    - Методы: `setStep1Data`, `setStep2Data`, `setItemsAndTotal`, `submit`, `clear`.
    - Генерирует события: `OrderStep1Submit`, `OrderStep2Submit`, `OrderSuccess`, `OrderError`.
    - Типизация: `IOrderRequest`, `IOrderResponse`.

**Взаимодействие**:

- Модели используют `EventEmitter` для уведомления о изменениях.
- `WebLarekApi` отделяет запросы к API от бизнес-логики.
- Модели не взаимодействуют с DOM, передавая данные через события.

### Архитектура: Представления

Представления реализуют слой View в паттерне MVP, отвечая за отображение данных и взаимодействие с DOM.

1. **Component**:
    
    - Базовый класс для всех компонентов.
    - Методы: `setText`, `setHtml`, `addEventListener`, `removeEventListener`.
    - Обеспечивает кэширование DOM-элементов и базовую функциональность.
2. **ProductCard**:
    
    - Отображает карточку товара.
    - Методы: `render`, `hasProduct`.
    - Использует `IProduct` для рендеринга.
3. **Modal**:
    
    - Управляет модальными окнами.
    - Методы: `open`, `close`, `setContent`.
    - Закрытие по клику вне окна или на крестик.
4. **CartView**:
    
    - Отображает корзину.
    - Методы: `render`.
    - Использует `ICart` для рендеринга.
5. **OrderForm**:
    
    - Управляет формой заказа.
    - Методы: `getPayment`, `getAddress`, `validateStep1`, `validateStep2`, `updateButtons`.
    - Валидирует поля и управляет кнопками.

**Взаимодействие**:

- Компоненты кэшируют DOM-элементы и готовы к привязке событий через презентеры.
- Используют утилиты (`ensureElement`, `CDN_URL`) для работы с DOM.

### Архитектура: Презентеры

Презентеры реализуют слой Presenter в паттерне MVP, связывая модели и представления.

1. **MainPagePresenter**:
    
    - Управляет главной страницей и каталогом товаров.
    - Методы: `init`, `renderCatalog`, `bindEvents`.
    - Обрабатывает событие `ProductView`.
2. **ProductPresenter**:
    
    - Управляет модальным окном с деталями товара.
    - Методы: `init`, `renderProduct`.
    - Обрабатывает события `ProductAddToCart`, `ProductRemoveFromCart`.
3. **CartPresenter**:
    
    - Управляет корзиной.
    - Методы: `init`, `showCart`, `handleBuy`, `handleRemove`, `renderCart`.
    - Обрабатывает события `CartOpen`, `ProductAddToCart`, `ProductRemoveFromCart`, `CartUpdate`.
4. **OrderPresenter**:
    
    - Управляет процессом оформления заказа.
    - Методы: `init`, `showOrderForm`, `handleStep1`, `handleStep2`, `submitOrder`.
    - Обрабатывает события `OrderStart`, `OrderStep1Submit`, `OrderStep2Submit`.

**Взаимодействие**:

- Презентеры подписываются на события от моделей через `EventEmitter`.
- Управляют отображением через методы представлений.
