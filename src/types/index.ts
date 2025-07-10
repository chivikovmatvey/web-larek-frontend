export type PaymentMethod = 'online' | 'offline';

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface IProductInstance extends IProduct {
	data(): IProduct;
}

export interface ICartItem {
	product: IProduct;
	count: number;
}

export interface ICart {
	items: ICartItem[];
	total: number;
}

export interface IOrderRequest {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IOrderResponse {
	id: string;
	total: number;
}

export interface IOrderForm {
	payment: PaymentMethod;
	address: string;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IApiError {
	error: string;
}

export enum AppEvents {
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
	ModalClose = 'modal:close',
}

export type IAppEventData = {
	[AppEvents.ProductView]: { id: string };
	[AppEvents.ProductAddToCart]: { id: string };
	[AppEvents.ProductRemoveFromCart]: { id: string };
	[AppEvents.CartOpen]: void;
	[AppEvents.CartUpdate]: ICart;
	[AppEvents.OrderStart]: void;
	[AppEvents.OrderStep1Submit]: { payment: PaymentMethod; address: string };
	[AppEvents.OrderStep2Submit]: { email: string; phone: string };
	[AppEvents.OrderSuccess]: IOrderResponse;
	[AppEvents.ModalOpen]: { content: HTMLElement };
	[AppEvents.ModalClose]: void;
};

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};
