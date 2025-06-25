# Проектная работа "Веб-ларёк"

**Стек**: HTML, SCSS, TypeScript, Webpack

## Структура проекта

- `src/` — исходные файлы проекта
- `src/components/` — компоненты приложения
  - `src/components/base/` — базовые классы и утилиты
  - `src/components/view/` — классы слоя представления (View)
  - `src/components/model/` — классы слоя данных (Model)
- `src/pages/` — HTML-страницы
- `src/scss/` — стили
- `src/types/` — типы данных
- `src/utils/` — утилиты

**Важные файлы**:
- `src/pages/index.html` — HTML-файл главной страницы
- `src/types/type-index.ts` — файл с типами данных
- `src/index.ts` — точка входа приложения
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — константы
- `src/utils/utils.ts` — утилиты
- `src/components/model/WebLarekApi.ts` — класс для работы с API

## Установка и запуск

```bash
npm install
npm run start
```

или

```bash
yarn
yarn start
```

## Сборка

```bash
npm run build
```

или

```bash
yarn build
```

---

## Архитектура проекта

### Типы данных

Все типы данных описаны в файле `src/types/type-index.ts`.

```typescript
// Способы оплаты
type PaymentMethod = 'online' | 'offline';

// Интерфейс товара
interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
}

// Интерфейс для экземпляра товара
interface IProductInstance extends IProduct {
    data(): IProduct;
}

// Элемент корзины
interface ICartItem {
    product: IProduct;
    count: number;
}

// Корзина
interface ICart {
    items: ICartItem[];
    total: number;
}

// Данные заказа
interface IOrderRequest {
    payment: PaymentMethod;
    address: string;
    email: string;
    phone: string;
    total: number;
    items: string[];
}

// Ответ сервера после создания заказа
interface IOrderResponse {
    id: string;
    total: number;
}

// Ошибка API
interface IApiError {
    error: string;
}

// Состояние формы
interface IFormState {
    valid: boolean;
    errors: Partial<Record<keyof IOrderRequest, string>>;
}

// События приложения
enum AppEvents {
    ProductView = 'product:view',
    ProductAddToCart = 'product:addToCart',
    ProductRemoveFromCart = 'product:removeFromCart',
    CartOpen = 'cart:open',
    CartUpdate = 'cart:update',
    OrderStart = 'order:start',
    OrderStep1Submit = 'order:step1Submit',
    OrderStep2Submit = 'order:step2Submit',
    OrderSuccess = 'order:success',
    OrderError = 'order:error',
    ModalOpen = 'modal:open',
    ModalClose = 'modal:close'
}

// Данные для событий
type IAppEventData = {
    [AppEvents.ProductView]: IProduct;
    [AppEvents.ProductAddToCart]: IProduct;
    [AppEvents.ProductRemoveFromCart]: IProduct;
    [AppEvents.CartOpen]: void;
    [AppEvents.CartUpdate]: ICart;
    [AppEvents.OrderStart]: void;
    [AppEvents.OrderStep1Submit]: { payment: PaymentMethod; address: string };
    [AppEvents.OrderStep2Submit]: { email: string; phone: string };
    [AppEvents.OrderSuccess]: IOrderResponse;
    [AppEvents.OrderError]: IApiError;
    [AppEvents.ModalOpen]: HTMLElement;
    [AppEvents.ModalClose]: void;
};
```

---

### Слой Model

Слой Model отвечает за управление данными и взаимодействие с API. Все классы этого слоя используют `EventEmitter` для уведомления о изменениях.

#### 1. WebLarekApi
- **Описание**: Класс для работы с API магазина, расширяет базовый класс `Api`.
- **Назначение**: Выполняет запросы к серверу для получения данных о товарах и отправки заказов.
- **Методы**:
  - `getProducts(category?: string, limit?: number): Promise<ApiListResponse<IProduct>>` — получает список товаров с возможной фильтрацией.
  - `getProduct(id: string): Promise<IProduct>` — получает данные о конкретном товаре.
  - `createOrder(request: IOrderRequest): Promise<IOrderResponse>` — отправляет заказ на сервер.
- **Типизация**: Использует `IProduct`, `IOrderRequest`, `IOrderResponse`, `IApiError`.
- **Особенности**:
  - Ошибки обрабатываются через `Promise.reject` с типом `IApiError`.

#### 2. Product
- **Описание**: Класс, представляющий товар.
- **Назначение**: Хранит данные о товаре и предоставляет доступ к ним через геттеры.
- **Поля**:
  - `id: string`
  - `title: string`
  - `description: string`
  - `image: string`
  - `category: string`
  - `price: number | null`
- **Методы**:
  - `data(): IProduct` — возвращает данные товара.
- **Типизация**: Реализует `IProductInstance`.
- **Особенности**: Используется в `Cart` и представлениях, не взаимодействует с DOM.

#### 3. Cart
- **Описание**: Класс для управления корзиной.
- **Назначение**: Хранит товары в корзине, управляет добавлением/удалением, подсчитывает общую сумму.
- **Поля**:
  - `items: ICartItem[]` — список товаров в корзине.
  - `total: number` — общая сумма.
- **Методы**:
  - `add(product: IProduct): void` — добавляет товар в корзину, генерирует событие `ProductAddToCart`.
  - `remove(productId: string): void` — удаляет товар из корзины, генерирует событие `ProductRemoveFromCart`.
  - `getCart(): ICart` — возвращает текущее состояние корзины.
  - `clear(): void` — очищает корзину, генерирует событие `CartUpdate`.
  - `getProductIds(): string[]` — возвращает ID товаров в корзине.
- **Типизация**: Использует `ICart`, `ICartItem`.
- **Особенности**: Генерирует событие `CartUpdate` при любом изменении корзины.

#### 4. Order
- **Описание**: Класс для управления заказом.
- **Назначение**: Хранит данные заказа, выполняет валидацию и отправку на сервер.
- **Поля**:
  - `payment: PaymentMethod`
  - `address: string`
  - `email: string`
  - `phone: string`
  - `total: number`
  - `items: string[]`
  - `errors: Partial<Record<keyof IOrderRequest, string>>`
- **Методы**:
  - `setStep1Data(payment: PaymentMethod, address: string): void` — устанавливает данные первого шага, валидирует и генерирует событие `OrderStep1Submit`.
  - `setStep2Data(email: string, phone: string): void` — устанавливает данные второго шага, валидирует и генерирует событие `OrderStep2Submit`.
  - `setItemsAndTotal(items: string[], total: number): void` — устанавливает товары и сумму заказа.
  - `submit(): Promise<IOrderResponse>` — отправляет заказ через `WebLarekApi`, генерирует события `OrderSuccess` или `OrderError`.
  - `clear(): void` — сбрасывает данные заказа.
- **Типизация**: Использует `IOrderRequest`, `IOrderResponse`, `IApiError`.
- **Особенности**:
  - Валидация полей (адрес, email, телефон) выполняется в этом классе, а не в слое View.
  - Генерирует события для уведомления о прогрессе заказа.

**Взаимодействие**:
- Модели используют `EventEmitter` для уведомления презентера о изменениях.
- Модели не взаимодействуют с DOM, передавая данные через события.

---

### Слой View

Слой View отвечает исключительно за отображение данных в DOM. Все классы этого слоя наследуются от абстрактного класса `Component` и кэшируют DOM-элементы для предотвращения повторного поиска.

#### 1. Component
- **Описание**: Абстрактный базовый класс для всех компонентов представления.
- **Назначение**: Предоставляет базовые методы для работы с DOM.
- **Поля**:
  - `container: HTMLElement` — корневой DOM-элемент компонента.
- **Методы**:
  - `setText(element: HTMLElement, value: string): void` — устанавливает текстовое содержимое.
  - `setHtml(element: HTMLElement, value: string): void` — устанавливает HTML-содержимое.
  - `setDisabled(element: HTMLElement, state: boolean): void` — изменяет статус блокировки.
  - `setHidden(element: HTMLElement): void` — скрывает элемент.
  - `setVisible(element: HTMLElement): void` — показывает элемент.
  - `setImage(element: HTMLImageElement, src: string, alt?: string): void` — устанавливает изображение.
  - `toggleClass(element: HTMLElement, className: string): void` — переключает класс.
  - `render(data?: Partial<T>): T` — рендерит компонент с данными.

#### 2. Page
- **Описание**: Класс главной страницы, относящийся к слою View.
- **Назначение**: Отображает каталог товаров, счётчик корзины и кнопку открытия корзины.
- **Поля**:
  - `container: HTMLElement` — корневой элемент страницы.
  - `catalog: HTMLElement` — контейнер для карточек товаров.
  - `basket: HTMLElement` — кнопка корзины (`header__basket`).
  - `counter: HTMLElement` — счётчик товаров в корзине (`header__basket-counter`).
- **Методы**:
  - `setCatalog(items: HTMLElement[]): void` — отображает карточки товаров в каталоге.
  - `setCounter(value: number): void` — обновляет счётчик корзины.
  - `setLocked(value: boolean): void` — блокирует/разблокирует страницу (например, при открытии модального окна).
- **Типизация**: Работает с `HTMLElement[]` для карточек, не зависит от структуры шаблонов карточек.
- **Особенности**:
  - Не зависит от шаблонов карточек, что позволяет отображать любые карточки.
  - Кэширует DOM-элементы (`header__basket`, `header__basket-counter`).

#### 3. Card
- **Описание**: Класс для отображения карточки товара.
- **Назначение**: Рендерит карточку товара в разных контекстах (галерея, модальное окно, корзина).
- **Поля**:
  - `container: HTMLElement` — корневой элемент карточки.
  - `id: string` — идентификатор товара.
  - `title: HTMLElement` — элемент названия.
  - `image: HTMLImageElement` — элемент изображения.
  - `description: HTMLElement` — элемент описания (для модального окна).
  - `category: HTMLElement` — элемент категории.
  - `price: HTMLElement` — элемент цены.
  - `button: HTMLButtonElement` — кнопка действия (добавить/удалить).
- **Конструктор**:
  - `constructor(container: HTMLElement, actions: ICardActions)` — принимает шаблон и обработчики событий.
- **Методы**:
  - `setId(value: string): void` — устанавливает ID.
  - `setTitle(value: string): void` — устанавливает название.
  - `setImage(value: string): void` — устанавливает изображение.
  - `setDescription(value: string): void` — устанавливает описание.
  - `setCategory(value: string): void` — устанавливает категорию.
  - `setPrice(value: number | null): void` — устанавливает цену, отключает кнопку для товаров без цены.
  - `setButtonText(value: string): void` — устанавливает текст кнопки.
- **Типизация**: Использует `IProduct` для данных.
- **Особенности**:
  - Универсальный класс, работает с разными шаблонами (`card-preview`, `card-catalog`, `card-basket`).
  - Обработчики событий передаются через параметр `actions`.

#### 4. Modal
- **Описание**: Универсальный класс для управления модальными окнами.
- **Назначение**: Отображает любой контент в модальном окне (`#modal-container`).
- **Поля**:
  - `container: HTMLElement` — контейнер модального окна.
  - `content: HTMLElement` — контейнер для содержимого.
  - `closeButton: HTMLButtonElement` — кнопка закрытия.
- **Методы**:
  - `open(): void` — открывает модальное окно, генерирует событие `ModalOpen`.
  - `close(): void` — закрывает модальное окно, генерирует событие `ModalClose`.
  - `setContent(content: HTMLElement): void` — устанавливает содержимое модального окна.
- **Особенности**:
  - Закрывается по клику вне окна или на кнопку закрытия.
  - Универсален для всех типов контента (товар, корзина, формы, успех).

#### 5. Basket
- **Описание**: Класс для отображения корзины.
- **Назначение**: Рендерит список товаров в корзине и общую сумму.
- **Поля**:
  - `container: HTMLElement` — корневой элемент корзины.
  - `list: HTMLElement` — контейнер для списка товаров.
  - `total: HTMLElement` — элемент общей суммы.
  - `button: HTMLButtonElement` — кнопка оформления заказа.
- **Методы**:
  - `setItems(items: HTMLElement[]): void` — отображает список товаров.
  - `setTotal(total: number): void` — устанавливает общую сумму.
  - `setButtonDisabled(state: boolean): void` — управляет доступностью кнопки оформления.
- **Типизация**: Работает с `ICart` и `HTMLElement[]`.
- **Особенности**: Не зависит от структуры шаблонов карточек.

#### 6. Form
- **Описание**: Абстрактный класс для форм (родительский для `OrderForm` и `ContactForm`).
- **Назначение**: Предоставляет общую функциональность для форм ввода.
- **Поля**:
  - `container: HTMLFormElement` — форма.
  - `submitButton: HTMLButtonElement` — кнопка отправки.
  - `errors: HTMLElement` — элемент для отображения ошибок.
- **Методы**:
  - `setErrors(value: string): void` — отображает ошибки.
  - `setValid(value: boolean): void` — управляет доступностью кнопки отправки.
  - `render(state: Partial<T> & IFormState): T` — рендерит форму с данными.
- **Особенности**: Содержит общие методы для валидации и управления состоянием формы.

#### 7. OrderForm
- **Описание**: Класс для формы первого шага заказа (способ оплаты и адрес).
- **Назначение**: Отображает и управляет формой выбора способа оплаты и ввода адреса.
- **Поля**:
  - `container: HTMLFormElement` — форма.
  - `paymentOnline: HTMLButtonElement` — кнопка "Онлайн".
  - `paymentOffline: HTMLButtonElement` — кнопка "При получении".
  - `address: HTMLInputElement` — поле ввода адреса.
  - `submitButton: HTMLButtonElement` — кнопка "Далее".
  - `errors: HTMLElement` — элемент для ошибок.
- **Методы**:
  - `setPayment(value: PaymentMethod): void` — устанавливает способ оплаты.
  - `setAddress(value: string): void` — устанавливает адрес.
  - `setErrors(value: string): void` — отображает ошибки.
  - `setValid(value: boolean): void` — управляет кнопкой "Далее".
- **Типизация**: Работает с `PaymentMethod` и `IFormState`.
- **Особенности**:
  - Валидация выполняется в модели `Order`.
  - Генерирует события при изменении полей через `EventEmitter`.

#### 8. ContactForm
- **Описание**: Класс для формы второго шага заказа (email и телефон).
- **Назначение**: Отображает и управляет формой ввода контактных данных.
- **Поля**:
  - `container: HTMLFormElement` — форма.
  - `email: HTMLInputElement` — поле ввода email.
  - `phone: HTMLInputElement` — поле ввода телефона.
  - `submitButton: HTMLButtonElement` — кнопка "Оплатить".
  - `errors: HTMLElement` — элемент для ошибок.
- **Методы**:
  - `setEmail(value: string): void` — устанавливает email.
  - `setPhone(value: string): void` — устанавливает телефон.
  - `setErrors(value: string): void` — отображает ошибки.
  - `setValid(value: boolean): void` — управляет кнопкой "Оплатить".
- **Типизация**: Работает с `IFormState`.
- **Особенности**:
  - Валидация выполняется в модели `Order`.
  - Генерирует события при изменении полей.

#### 9. Success
- **Описание**: Класс для отображения сообщения об успешном оформлении заказа.
- **Назначение**: Рендерит окно с информацией о заказе и кнопкой возврата.
- **Поля**:
  - `container: HTMLElement` — контейнер сообщения.
  - `total: HTMLElement` — элемент с суммой заказа.
  - `button: HTMLButtonElement` — кнопка "За новыми покупками".
- **Методы**:
  - `setTotal(value: number): void` — устанавливает сумму заказа.
- **Типизация**: Работает с `IOrderResponse`.
- **Особенности**: Соответствует шаблону `#success` из `index.html`.

**Взаимодействие**:
- Компоненты View не взаимодействуют друг с другом напрямую.
- Все DOM-элементы кэшируются в полях классов.
- События передаются через `EventEmitter` в презентер.

---

### Слой Presenter

Слой Presenter реализован в файле `index.ts`, который является точкой входа приложения. Все экземпляры классов создаются в `index.ts`, а методы презентера подписываются на события через `EventEmitter`.

**Основные функции презентера**:
1. Инициализация приложения: создание экземпляров классов Model и View.
2. Подписка на события (`EventEmitter.on`) для обработки взаимодействий.
3. Вызов методов Model и View в ответ на события.

**События приложения** (определены в `AppEvents`):
- `product:view` — просмотр товара.
- `product:addToCart` — добавление товара в корзину.
- `product:removeFromCart` — удаление товара из корзины.
- `cart:open` — открытие корзины.
- `cart:update` — обновление корзины.
- `order:start` — начало оформления заказа.
- `order:step1Submit` — отправка данных первого шага.
- `order:step2Submit` — отправка данных второго шага.
- `order:success` — успешное оформление заказа.
- `order:error` — ошибка при оформлении.
- `modal:open` — открытие модального окна.
- `modal:close` — закрытие модального окна.

**Особенности**:
- Презентер не хранит состояния, а только координирует взаимодействие.
- Все подписки на события выполняются в `index.ts`.