//Тип для способа оплаты
export type PaymentMethod = 'online' | 'offline';

//Интерфейс для товара, возвращаемого API
export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

//Интерфейс для экземпляра товара с методом data
export interface IProductInstance extends IProduct {
    data(): IProduct;
}

//Интерфейс для элемента корзины
export interface ICartItem {
    product: IProductInstance;
    quantity: number;
}

//Интерфейс для корзины
export interface ICart {
    items: ICartItem[];
    total: number;
}

//Интерфейс для данных заказа, отправляемых на сервер
export interface IOrderRequest {
    payment: PaymentMethod;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

//Интерфейс для ответа сервера после создания заказа
export interface IOrderResponse {
    id: string;
    total: number;
}

//Тип для ошибок API
export interface IApiError {
    error: string;
}

//Интерфейс для состояния формы
export interface IFormState {
    valid: boolean;
    errors: Partial<Record<keyof IOrderRequest, string>>;
}

//Интерфейс для модального окна
export interface IModal {
    container: HTMLElement;
    open(): void;
    close(): void;
    setContent(content: HTMLElement): void;
}

//Перечисление событий приложения
export enum AppEvents {
    // События для товаров
    ProductView = 'product:view',
    ProductAddToCart = 'product:addToCart',
    ProductRemoveFromCart = 'product:removeFromCart',
    // События корзины
    CartOpen = 'cart:open',
    CartUpdate = 'cart:update',
    // События заказа
    OrderStart = 'order:start',
    OrderStep1Submit = 'order:step1Submit',
    OrderStep2Submit = 'order:step2Submit',
    OrderSuccess = 'order:success',
    OrderError = 'order:error',
    // События модального окна
    ModalOpen = 'modal:open',
    ModalClose = 'modal:close'
}

 //Тип для данных событий приложения
export interface IAppEventData {
    [AppEvents.ProductView]: IProduct;
    [AppEvents.ProductAddToCart]: IProduct;
    [AppEvents.ProductRemoveFromCart]: IProduct;
    [AppEvents.CartOpen]: void;
    [AppEvents.CartUpdate]: ICart;
    [AppEvents.OrderStart]: void;
    [AppEvents.OrderStep1Submit]: Pick<IOrderRequest, 'payment' | 'address'>;
    [AppEvents.OrderStep2Submit]: Pick<IOrderRequest, 'email' | 'phone'>;
    [AppEvents.OrderSuccess]: IOrderResponse;
    [AppEvents.OrderError]: IApiError;
    [AppEvents.ModalOpen]: HTMLElement;
    [AppEvents.ModalClose]: void;
}