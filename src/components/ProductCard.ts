import { Component } from './base/Component';
import { IProduct } from '../types';
import { ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class ProductCard extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._image = container.querySelector('.card__image');
		this._description = container.querySelector('.card__text');
		this._category = container.querySelector('.card__category');
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set image(value: string) {
		const CDN_URL = require('../utils/constants').CDN_URL;
		const fullUrl =
			value && !value.startsWith('http') ? `${CDN_URL}${value}` : value;
		this.setImage(this._image, fullUrl, this.title);
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
		if (!value && this._button) {
			this._button.disabled = true;
		}
	}

	set category(value: string) {
		if (this._category) {
			this.setText(this._category, value);
			const categoryClasses = require('../utils/constants').settings;

			this._category.className = 'card__category';

			const modifierClass = categoryClasses[value];
			if (modifierClass) {
				this.toggleClass(this._category, modifierClass, true);
			} else {
				this.toggleClass(this._category, categoryClasses['другое'], true);
			}
		}
	}

	set description(value: string) {
		if (this._description) {
			this.setText(this._description, value);
		}
	}

	get button(): HTMLButtonElement | undefined {
		return this._button;
	}
}
