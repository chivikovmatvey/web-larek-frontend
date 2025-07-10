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
import { OrderFormView } from './components/OrderFormView';
import { ContactsFormView } from './components/ContactsFormView';
import { IOrderForm, IContactsForm } from './types';

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const catalogContainer = document.querySelector<HTMLElement>('.gallery');
const modalContainer = document.querySelector<HTMLElement>('#modal-container');

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const api = new WebLarekApi(API_URL);
const emitter = new EventEmitter();
const cart = new Cart(emitter);
const order = new Order(api, emitter);

const modal = new Modal(modalContainer!, emitter);
const mainPageView = new MainPageView(document.body);
let cartView: CartView | null = null;

const orderForm = new OrderFormView(cloneTemplate(orderTemplate), emitter);
const contactsForm = new ContactsFormView(
	cloneTemplate(contactsTemplate),
	emitter
);


emitter.on('modal:open', () => {
	mainPageView.lockScroll(true);
});
emitter.on('modal:close', () => {
	mainPageView.lockScroll(false);
});

api.getProducts().then((result) => {
	if ('items' in result) {
		emitter.emit('items:change', result.items);
	}
});

emitter.on('items:change', (items: any[]) => {
	const cards = items.map((product) => {
		const cardElement = cloneTemplate(cardTemplate);
		const card = new ProductCard(cardElement);

		card.id = product.id;
		card.title = product.title;
		card.image = product.image;
		card.price = product.price;
		card.category = product.category;

		card.container.addEventListener('click', () => {
			emitter.emit('product:view', product);
		});
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
				cart.remove(product);
			} else {
				cart.add(product);
			}
			mainPageView.setBasketCount(cart.getCart().items.length);
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
		const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
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
	const items = cartData.items.map((item, index) =>
		cartView.createCartItemNode(item, index)
	);
	cartView.renderItems(items);
	cartView.setTotal(
		cartData.items.reduce((sum, i) => sum + (i.product.price || 0) * i.count, 0)
	);
});

emitter.on('cart:item:remove', (data: { id: string }) => {
	const item = cart.getCart().items.find((it) => it.product.id === data.id);
	if (item) {
		cart.remove(item.product);
	}
});

emitter.on('cart:order', () => {
	modal.content = orderForm.container;
	modal.open();
});

emitter.on('order.payment:change', (data: { value: string }) => {
	order.setOrderField('payment', data.value);
});
emitter.on('order.address:change', (data: { value: string }) => {
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
	const filteredIds = cart
		.getCart()
		.items.filter(
			(i) => i.product.price !== null && i.product.price !== undefined
		)
		.map((i) => i.product.id);
	const filteredTotal = cart
		.getCart()
		.items.filter(
			(i) => i.product.price !== null && i.product.price !== undefined
		)
		.reduce((sum, i) => sum + (i.product.price || 0) * i.count, 0);
	order.setItemsAndTotal(filteredIds, filteredTotal);

	order.submit();
});

emitter.on('order:success', (response: { total: number }) => {
	cart.clear();
	mainPageView.setBasketCount(0);

	orderForm.reset();
	contactsForm.reset();

	const successContent = cloneTemplate(successTemplate);
	const totalElement = successContent.querySelector(
		'.order-success__description'
	);
	if (totalElement) {
		totalElement.textContent = `Списано ${response.total} синапсов`;
	}

	const closeButton = successContent.querySelector('.order-success__close');
	if (closeButton) {
		closeButton.addEventListener('click', () => {
			modal.close();
		});
	}
	modal.content = successContent;
	modal.open();
});

emitter.on('order:error', (error) => {
	console.error(error);
	alert('Ошибка оформления заказа!');
});
