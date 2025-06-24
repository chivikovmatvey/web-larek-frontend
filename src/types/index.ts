// Тип для способа оплаты
type PaymentMethod = 'card' | 'cash';

// Интерфейс для товара, возвращаемого API
interface IProduct {
    id: string; 
    description: string; 
    image: string; 
    title: string;
    category: string; 
    price: number | null; 
}

// Интерфейс для экземпляра товара с методом data
interface IProductInstance extends IProduct {
    data(): IProduct;
}

// Интерфейс для элемента корзины
interface ICartItem {
    product: IProductInstance; 
    quantity: number;
}

// Интерфейс для корзины
interface ICart {
    items: ICartItem[]; 
    total: number;
}

// Интерфейс для данных заказа, отправляемых на сервер
interface IOrderRequest {
    payment: PaymentMethod; 
    email: string; 
    phone: string; 
    address: string; 
    total: number; 
    items: string[];
}

// Интерфейс для ответа сервера после создания заказа
interface IOrderResponse {
    id: string; 
    total: number; 
}

// Тип для ошибок API
interface IApiError {
    error: string; 
}

// Интерфейс для модального окна
interface IModal {
    container: HTMLElement;
    open(): void;
    close(): void;
    setContent(content: HTMLElement): void;
}

// Типы событий приложения
enum AppEvents {
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
    ModalOpen = 'modal:open', 
    ModalClose = 'modal:close'
}

// Тип для данных событий
interface IAppEventData {
    [AppEvents.ProductView]: IProduct;
    [AppEvents.ProductAddToCart]: IProduct;
    [AppEvents.ProductRemoveFromCart]: { productId: string };
    [AppEvents.CartOpen]: undefined;
    [AppEvents.CartUpdate]: ICart;
    [AppEvents.OrderStart]: undefined;
    [AppEvents.OrderStep1Submit]: Pick<IOrderRequest, 'payment' | 'address'>;
    [AppEvents.OrderStep2Submit]: Pick<IOrderRequest, 'email' | 'phone'>;
    [AppEvents.OrderSuccess]: IOrderResponse;
    [AppEvents.OrderError]: IApiError;
    [AppEvents.ModalOpen]: HTMLElement;
    [AppEvents.ModalClose]: undefined;
}

export {
    PaymentMethod,
    IProduct,
    IProductInstance,
    ICartItem,
    ICart,
    IOrderRequest,
    IOrderResponse,
    IApiError,
    IModal,
    AppEvents,
    IAppEventData
};