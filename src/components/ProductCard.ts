import { Component } from './base/Component';
import { IProduct } from '../types';

export class ProductCard extends Component<IProduct> {
	constructor(element: HTMLElement) {
		super(element);
	}

	render(product: IProduct): HTMLElement {
		this.container.className = 'card';
		const { CDN_URL } = require('../utils/constants');
		const imageUrl = product.image
			? product.image.startsWith('http')
				? product.image
				: `${CDN_URL}/${product.image}`
			: '';
		const priceText =
			product.price === null || product.price === undefined
				? 'бесценно'
				: `${product.price} синапсов`;
		this.container.innerHTML = `
      <img class="card__image" src="${imageUrl}" alt="${product.title}" />
      <div class="card__content">
        <h3 class="card__title">${product.title}</h3>
        <div class="card__category">${product.category}</div>
        <div class="card__price">${priceText}</div>
        <div class="card__description">${product.description ?? ''}</div>
      </div>
    `;
		return this.container;
	}
}
