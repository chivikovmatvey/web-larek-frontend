import { Component } from './base/Component';
import { ICart } from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';

export class CartView extends Component<ICart> {
	protected _list: HTMLElement;
	protected _price: HTMLElement;
	protected _orderButton: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._price = ensureElement<HTMLElement>('.basket__price', this.container);
		this._orderButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		if (this._orderButton) {
			this._orderButton.addEventListener('click', () => {
				events.emit('cart:order');
			});
		}
	}

	set items(items: HTMLElement[]) {
		this._list.replaceChildren(...items);
		this.setOrderButtonDisabled(items.length === 0);
	}

	setOrderButtonDisabled(isDisabled: boolean) {
		if (this._orderButton) {
			this._orderButton.disabled = isDisabled;
		}
	}

	set total(total: number) {
		this.setText(this._price, `${total} синапсов`);
	}
}
