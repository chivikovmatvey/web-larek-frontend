import { Component } from './base/Component';
import { ICart, ICartItem } from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';

export class CartView extends Component<ICart> {
	protected _list: HTMLElement;
	protected _price: HTMLElement;
	protected _orderButton: HTMLButtonElement;
	protected _cardBasketTemplate: HTMLTemplateElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._price = ensureElement<HTMLElement>('.basket__price', this.container);
		this._orderButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		); 
		this._cardBasketTemplate =
			ensureElement<HTMLTemplateElement>('#card-basket');

		if (this._orderButton) {
			this._orderButton.addEventListener('click', () => {
				events.emit('cart:order');
			});
		}

		this._list.addEventListener('click', (evt) => {
			const target = evt.target as HTMLElement;
			const deleteButton = target.closest('.basket__item-delete');
			if (deleteButton) {
				const itemId = deleteButton.getAttribute('data-id');
				if (itemId) {
					events.emit('cart:item:remove', { id: itemId });
				}
			}
		});
	}

	createCartItemNode(item: ICartItem, index: number): HTMLElement {
		const cardNode =
			this._cardBasketTemplate.content.firstElementChild?.cloneNode(
				true
			) as HTMLElement;
		if (!cardNode) return document.createElement('div');

		ensureElement<HTMLElement>('.basket__item-index', cardNode).textContent =
			String(index + 1);
		ensureElement<HTMLElement>('.card__title', cardNode).textContent =
			item.product.title;
		ensureElement<HTMLElement>('.card__price', cardNode).textContent =
			item.product.price === null || item.product.price === undefined
				? 'бесценно'
				: `${item.product.price} синапсов`;

		const deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			cardNode
		);
		deleteButton.dataset.id = item.product.id;

		return cardNode;
	}

	renderItems(items: HTMLElement[]): void {
		this._list.replaceChildren(...items);
		this.setOrderButtonDisabled(items.length === 0);
	}

	setOrderButtonDisabled(isDisabled: boolean) {
		if (this._orderButton) {
			this._orderButton.disabled = isDisabled;
		}
	}

	setTotal(total: number): void {
		this.setText(this._price, `${total} синапсов`);
	}
}
