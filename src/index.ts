import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';
import { WebLarekApi } from './models/WebLarekApi';
import { EventEmitter } from './components/base/Events';
import { MainPagePresenter } from './components/presenters/MainPagePresenter';
import { ProductPresenter } from './components/presenters/ProductPresenter';
import { CartPresenter } from './components/presenters/CartPresenter';
import { OrderPresenter } from './components/presenters/OrderPresenter';
import { Cart } from './models/Cart';
import { Order } from './models/Order';
import { Modal } from './components/common/Modal';

const catalogContainer = document.querySelector<HTMLElement>('.gallery');
const modalContainer = document.querySelector<HTMLElement>('#modal-container');
const orderContainer = document.querySelector<HTMLElement>('#order');
const contactsContainer = document.querySelector<HTMLElement>('#contacts');
const successContainer = document.querySelector<HTMLElement>('#success');

const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const api = new WebLarekApi(API_URL);
const emitter = new EventEmitter();
const cart = new Cart(emitter);
const order = new Order(api, emitter);

const modal = new Modal();

const mainPagePresenter = new MainPagePresenter(
	api,
	emitter,
	catalogContainer!,
	cardTemplate
);
const productPresenter = new ProductPresenter(
	api,
	emitter,
	modal,
	cardPreviewTemplate
);
const cartPresenter = new CartPresenter(
	cart,
	emitter,
	cardBasketTemplate,
	modal
);
const orderPresenter = new OrderPresenter(
	order,
	emitter,
	null,
	contactsContainer,
	successContainer,
	cart
);

mainPagePresenter.init();