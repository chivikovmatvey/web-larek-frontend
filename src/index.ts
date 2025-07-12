import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';
import { WebLarekApi } from './models/WebLarekApi';
import { EventEmitter } from './components/base/Events';
import { Cart } from './models/Cart';
import { Order } from './models/Order';
import { Modal } from './components/common/Modal';
import { MainPageView } from './components/MainPageView';
import { CartView } from './components/CartView';
import { ProductCard } from './components/ProductCard';
import { BasketCard } from './components/BasketCard';
import { OrderFormView } from './components/OrderFormView';
import { ContactsFormView } from './components/ContactsFormView';
import { Success } from './components/SuccessView';
import { IOrderForm, IContactsForm, IOrderResponse } from './types';

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

const api = new WebLarekApi(API_URL);
const emitter = new EventEmitter();
const cart = new Cart(emitter);
const order = new Order(emitter);

const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), emitter);
const mainPageView = new MainPageView(document.body);
let cartView: CartView | null = null;

const orderForm = new OrderFormView(cloneTemplate(orderTemplate), emitter);
const contactsForm = new ContactsFormView(
	cloneTemplate(contactsTemplate),
	emitter
);

const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => modal.close(),
});

emitter.on('modal:open', () => {
	mainPageView.lockScroll(true);
});
emitter.on('modal:close', () => {
	mainPageView.lockScroll(false);
});

api
	.getProducts()
	.then((result) => {
		if ('items' in result) {
			emitter.emit('items:change', result.items);
		}
	})
	.catch((err) => {
		console.error(err);
	});

emitter.on('items:change', (items: any[]) => {
	const cards = items.map((product) => {
		const cardElement = cloneTemplate(cardTemplate);
		const card = new ProductCard(cardElement, {
			onClick: () => emitter.emit('product:view', product),
		});

		card.id = product.id;
		card.title = product.title;
		card.image = product.image;
		card.price = product.price;
		card.category = product.category;

		return card.container;
	});
	mainPageView.renderItems(cards);
	mainPageView.setBasketCount(cart.getCart().items.length);
});

emitter.on('product:view', (product: any) => {
	const cardElement = cloneTemplate(cardPreviewTemplate);
	const card = new ProductCard(cardElement);

	card.id = product.id;
	card.title = product.title;
	card.image = product.image;
	card.price = product.price;
	card.description = product.description;
	card.category = product.category;

	const renderButton = () => {
		if (card.button) {
			const inCart = cart
				.getCart()
				.items.some((i) => i.product.id === product.id);
			card.button.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
		}
	};

	if (card.button) {
		card.button.addEventListener('click', () => {
			const inCart = cart
				.getCart()
				.items.some((i) => i.product.id === product.id);
			if (inCart) {
				cart.remove(product.id);
			} else {
				cart.add(product);
			}
			renderButton();
		});
	}

	renderButton();
	modal.content = card.container;
	modal.open();
});

mainPageView.onBasketClick(() => {
	emitter.emit('cart:open');
});

emitter.on('cart:open', () => {
	if (!cartView) {
		const basketNode = cloneTemplate(basketTemplate);
		cartView = new CartView(basketNode, emitter);
	}
	emitter.emit('cart:update');
	if (cartView) {
		modal.content = cartView.container;
		modal.open();
	}
});

emitter.on('cart:update', () => {
	if (!cartView) return;
	const cartData = cart.getCart();
	const items = cartData.items.map((item, index) => {
		const cardElement = cloneTemplate(cardBasketTemplate);
		const card = new BasketCard(cardElement, emitter);
		card.id = item.product.id;
		card.index = index + 1;
		card.title = item.product.title;
		card.price = item.product.price;
		return card.container;
	});
	cartView.items = items;
	cartView.total = cartData.total;
	mainPageView.setBasketCount(cart.getCart().items.length);
});

emitter.on('basket:delete', (data: { id: string }) => {
	cart.remove(data.id);
});

emitter.on('cart:order', () => {
	modal.content = orderForm.container;
	modal.open();
});

emitter.on('order.payment:change', (data: { value: string }) => {
	order.setOrderField('payment', data.value);
});
emitter.on('order.address:change', (data: { value:string }) => {
	order.setOrderField('address', data.value);
});
emitter.on('contacts.email:change', (data: { value: string }) => {
	order.setContactsField('email', data.value);
});
emitter.on('contacts.phone:change', (data: { value: string }) => {
	order.setContactsField('phone', data.value);
});

emitter.on(
	'order:validation',
	(payload: { valid: boolean; errors: string[] }) => {
		orderForm.valid = payload.valid;
		orderForm.errors = payload.errors.join('; ');
	}
);

emitter.on(
	'contacts:validation',
	(payload: { valid: boolean; errors: string[] }) => {
		contactsForm.valid = payload.valid;
		contactsForm.errors = payload.errors.join('; ');
	}
);

emitter.on('order:submit', () => {
	modal.content = contactsForm.container;
	modal.open();
});

emitter.on('contacts:submit', () => {
	order.setItemsAndTotal(cart.getProductIds(), cart.getTotal());

	api
		.createOrder(order.getOrderData())
		.then((response) => {
			emitter.emit('order:success', response);
		})
		.catch((error) => {
			emitter.emit('order:error', error);
		});
});

emitter.on('order:success', (response: IOrderResponse) => {
	cart.clear();
	mainPageView.setBasketCount(0);

	orderForm.reset();
	contactsForm.reset();

	success.total = response.total;

	modal.content = success.container;
	modal.open();
});

emitter.on('order:error', (error) => {
	console.error(error);
	alert('Ошибка оформления заказа!');
});
