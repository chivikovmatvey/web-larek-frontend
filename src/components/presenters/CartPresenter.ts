import { cloneTemplate } from '../../utils/utils';
import { EventEmitter } from '../base/Events';
import { Cart } from '../../models/Cart';
import { AppEvents, IProduct } from '../../types';
import { CartView } from '../CartView';
import { Modal } from '../common/Modal';

export class CartPresenter {
	constructor(
		private cart: Cart,
		private emitter: EventEmitter,
		private cardBasketTemplate: HTMLTemplateElement,
		private modal: Modal
	) {
		this.emitter.on(
			'cart:check',
			(data?: { id: string; callback: (exists: boolean) => void }) => {
				if (!data || !data.id || !data.callback) return;
				if (!this.cart || typeof this.cart.getProductIds !== 'function') {
					data.callback(false);
					return;
				}
				const ids = this.cart.getProductIds();
				const exists = Array.isArray(ids) && ids.includes(data.id);
				data.callback(!!exists);
			}
		);
		this.emitter.on(AppEvents.CartOpen, () => {
			console.debug('[CartPresenter] AppEvents.CartOpen');
			this.showCart();
		});
		this.emitter.on(
			AppEvents.ProductAddToCart,
			(data: { id: string; product?: IProduct }) => {
				console.debug('[CartPresenter] AppEvents.ProductAddToCart', data);
				if (data?.product) {
					this.cart.add(data.product);
				} else {
					console.warn(
						'[CartPresenter] Нет product в событии ProductAddToCart',
						data
					);
				}
			}
		);
		this.emitter.on(AppEvents.ProductRemoveFromCart, (data: { id: string }) => {
			console.debug('[CartPresenter] AppEvents.ProductRemoveFromCart', data);
			if (!data?.id) {
				console.warn(
					'[CartPresenter] Нет id в событии ProductRemoveFromCart',
					data
				);
				return;
			}
			const cartData = this.cart.getCart();
			const item = cartData.items.find((i) => i.product.id === data.id);
			if (item) {
				this.cart.remove(item.product);
				this.emitter.emit(AppEvents.CartUpdate);
			} else {
				console.warn('[CartPresenter] Не найден товар для удаления', data);
			}
		});
		this.emitter.on(AppEvents.CartUpdate, () => {
			console.debug('[CartPresenter] AppEvents.CartUpdate');
			// Проверяем, открыта ли модалка и отображается ли корзина
			const modal = document.querySelector('#modal-container');
			const isOpen = modal && modal.classList.contains('modal_active');
			const basket = modal?.querySelector('.basket');
			if (isOpen && basket) {
				this.renderCart();
			}
			const counter = document.querySelector('.header__basket-counter');
			if (counter) {
				counter.textContent = String(this.cart.getCart().items.length);
			}
		});
		const basketButton = document.querySelector('.header__basket');
		if (basketButton) {
			basketButton.addEventListener('click', () => {
				console.debug('[index] Клик по .header__basket');
				emitter.emit('cart:open');
			});
		}
	}

	showCart() {
		console.debug('[CartPresenter] showCart');
		const basketNode = cloneTemplate<HTMLElement>('#basket');
		const cartView = new CartView(basketNode, this.cardBasketTemplate);
		cartView.render(this.cart.getCart());
		const orderBtn = basketNode.querySelector(
			'.basket__button'
		) as HTMLButtonElement;
		if (orderBtn) {
			orderBtn.disabled =
				this.cart.getCart().items.length === 0 ? true : undefined;
		}
		basketNode.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('basket__item-delete')) {
				const id = target.getAttribute('data-id');
				console.debug('[CartPresenter] Клик по basket__item-delete', id);
				if (id) this.emitter.emit(AppEvents.ProductRemoveFromCart, { id });
			}
			if (target.classList.contains('basket__button')) {
				e.preventDefault();
				if (orderBtn && orderBtn.disabled) return;
				console.debug('[CartPresenter] Клик по basket__button (оформить)');
				this.emitter.emit(AppEvents.OrderStart);
			}
		});
		this.modal.content = basketNode;
		this.modal.open();
	}

	renderCart() {
		console.debug('[CartPresenter] renderCart');
		const basketNode = cloneTemplate<HTMLElement>('#basket');
		const cartView = new CartView(basketNode, this.cardBasketTemplate);
		cartView.render(this.cart.getCart());
		const orderBtn = basketNode.querySelector('.basket__button') as HTMLButtonElement;
		if (orderBtn) {
			orderBtn.disabled = this.cart.getCart().items.length === 0 ? true : undefined;
		}
		basketNode.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('basket__item-delete')) {
				const id = target.getAttribute('data-id');
				console.debug('[CartPresenter] Клик по basket__item-delete', id);
				if (id) this.emitter.emit(AppEvents.ProductRemoveFromCart, { id });
			}
			if (target.classList.contains('basket__button')) {
				e.preventDefault();
				if (orderBtn && orderBtn.disabled) return;
				console.debug('[CartPresenter] Клик по basket__button (оформить)');
				this.emitter.emit(AppEvents.OrderStart);
			}
		});
		this.modal.content = basketNode;
		this.modal.open();
	}
}
