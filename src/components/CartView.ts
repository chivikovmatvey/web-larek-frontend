import { Component } from './base/Component';
import { ICart, ICartItem } from '../types';
import { ensureElement, cloneTemplate } from '../utils/utils';

export class CartView extends Component<ICart> {
	private list: HTMLElement;
	private price: HTMLElement;
	private cardBasketTemplate: HTMLTemplateElement;

	constructor(element: HTMLElement, cardBasketTemplate?: HTMLTemplateElement) {
		super(element);
		this.list = ensureElement<HTMLElement>('.basket__list', this.container);
		this.price = ensureElement<HTMLElement>('.basket__price', this.container);
		if (cardBasketTemplate) {
			this.cardBasketTemplate = cardBasketTemplate;
		} else {
			this.cardBasketTemplate =
				ensureElement<HTMLTemplateElement>('#card-basket');
		}
	}

	render(cart: ICart): HTMLElement {
		this.list.innerHTML = '';
		if (cart.items.length === 0) {
			const empty = document.createElement('p');
			empty.textContent = 'Корзина пуста';
			this.list.appendChild(empty);
		} else {
			cart.items.forEach((item: ICartItem, idx: number) => {
				const card = cloneTemplate<HTMLElement>(this.cardBasketTemplate);
				const indexEl = card.querySelector('.basket__item-index');
				if (indexEl) indexEl.textContent = String(idx + 1);
				const titleEl = card.querySelector('.card__title');
				if (titleEl) titleEl.textContent = item.product.title;
				const priceEl = card.querySelector('.card__price');
				if (priceEl) priceEl.textContent = `${item.product.price} синапсов`;
				const delBtn = card.querySelector('.basket__item-delete');
				if (delBtn)
					(delBtn as HTMLElement).setAttribute('data-id', item.product.id);
				this.list.appendChild(card);
			});
		}
		this.price.textContent = `${cart.total} синапсов`;
		return this.container;
	}
}
