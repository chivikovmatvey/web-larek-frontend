import { Component } from './base/Component';
import { IProduct } from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/Events';

interface IBasketCard {
	index: number;
	title: string;
	price: number;
}

export class BasketCard extends Component<IBasketCard> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _deleteButton: HTMLButtonElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);

		this._deleteButton.addEventListener('click', () => {
			events.emit('basket:delete', { id: this.id });
		});
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
	}
} 