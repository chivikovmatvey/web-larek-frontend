import { EventEmitter } from '../base/Events';
import { WebLarekApi } from '../../models/WebLarekApi';
import { AppEvents} from '../../types';
import { Modal } from '../common/Modal';

export class ProductPresenter {
	constructor(
		private api: WebLarekApi,
		private emitter: EventEmitter,
		private modal: Modal,
		private cardPreviewTemplate: HTMLTemplateElement
	) {
		this.emitter.on(AppEvents.ProductView, (data: { id: string }) => {
			if (data && typeof data.id === 'string') {
				this.showProduct(data.id);
			}
		});
	}

	async showProduct(id: string) {
		const product = await this.api.getProduct(id);
		if ('id' in product && this.modal) {
			const { CDN_URL } = require('../../utils/constants');
			const tpl = this.cardPreviewTemplate.content.cloneNode(
				true
			) as HTMLElement;
			const cardEl = tpl.querySelector('.card');
			if (cardEl) {
				const category = cardEl.querySelector('.card__category');
				if (category) category.textContent = product.category;
				const title = cardEl.querySelector('.card__title');
				if (title) title.textContent = product.title;
				const text = cardEl.querySelector('.card__text');
				if (text) text.textContent = product.description ?? '';
				const image = cardEl.querySelector('.card__image') as HTMLImageElement;
				if (image) {
					image.src = product.image
						? product.image.startsWith('http')
							? product.image
							: `${CDN_URL}/${product.image}`
						: '';
					image.alt = product.title;
				}
				const price = cardEl.querySelector('.card__price');
				if (price) {
					if (product.price === null || product.price === undefined) {
						price.textContent = 'бесценно';
					} else {
						price.textContent = product.price + ' синапсов';
					}
				}
				const btn = cardEl.querySelector('.card__button');
				const updateBtn = (inCart: boolean) => {
					if (btn) {
						btn.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
						btn.classList.toggle('card__button_remove', inCart);
					}
				};
				let inCart = false;
				this.emitter.emit('cart:check', {
					id: product.id,
					callback: (exists: boolean) => {
						inCart = exists;
						updateBtn(inCart);
					},
				});
				if (btn) {
					btn.addEventListener('click', (e) => {
						e.stopPropagation();
						if (inCart) {
							this.emitter.emit(AppEvents.ProductRemoveFromCart, {
								id: product.id,
							});
							inCart = false;
							updateBtn(false);
						} else {
							this.emitter.emit(AppEvents.ProductAddToCart, {
								id: product.id,
								product,
							});
							inCart = true;
							updateBtn(true);
						}
					});
				}
				this.modal.content = cardEl as HTMLElement;
				this.modal.open();
			}
		}
	}
}
