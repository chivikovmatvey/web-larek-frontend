import { WebLarekApi } from '../../models/WebLarekApi';
import { EventEmitter } from '../base/Events';
import { AppEvents, IProduct } from '../../types';

export class MainPagePresenter {
	constructor(
		private api: WebLarekApi,
		private emitter: EventEmitter,
		private catalogContainer: HTMLElement,
		private cardTemplate: HTMLTemplateElement
	) {}

	async init() {
		console.debug('[MainPagePresenter] init()');
		try {
			const result = await this.api.getProducts();
			console.debug('[MainPagePresenter] api.getProducts result:', result);
			if ('items' in result) {
				this.renderCatalog(result.items);
			} else {
				console.error('[MainPagePresenter] Ошибка загрузки каталога:', result);
			}
		} catch (e) {
			console.error('[MainPagePresenter] Ошибка при загрузке каталога:', e);
		}
	}

	renderCatalog(products: IProduct[]) {
		console.debug('[MainPagePresenter] renderCatalog()', products);
		if (!this.catalogContainer) {
			console.error('[MainPagePresenter] catalogContainer не найден');
			return;
		}
		this.catalogContainer.innerHTML = '';
		const { CDN_URL } = require('../../utils/constants');
		const { settings } = require('../../utils/constants');
		products.forEach((product, idx) => {
			const tpl = this.cardTemplate.content.cloneNode(true) as HTMLElement;
			const cardEl = tpl.querySelector('.card');
			if (cardEl) {
				const title = cardEl.querySelector('.card__title');
				if (title) title.textContent = product.title;
				const category = cardEl.querySelector('.card__category');
				if (category) {
					category.textContent = product.category;
					const catClass = settings[product.category?.toLowerCase?.()] || '';
					if (catClass) category.classList.add(catClass);
				}
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
				if (btn) {
					btn.addEventListener('click', (e) => {
						e.stopPropagation();
						this.emitter.emit(AppEvents.ProductAddToCart, {
							id: product.id,
							product,
						});
					});
				}
				cardEl.addEventListener('click', () => {
					console.debug('[MainPagePresenter] Клик по карточке', product);
					this.emitter.emit(AppEvents.ProductView, { id: product.id });
				});
				this.catalogContainer.appendChild(cardEl);
				console.debug(
					`[MainPagePresenter] Карточка #${idx} добавлена`,
					cardEl,
					product
				);
			}
		});
		console.debug('[MainPagePresenter] Всего карточек:', products.length);
	}
}
