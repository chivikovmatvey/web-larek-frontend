import { Component } from './base/Component';

export class MainPageView extends Component<unknown> {
	private gallery: HTMLElement;
	private basketCounter: HTMLElement;
	private basketButton: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		this.gallery = container.querySelector('.gallery')!;
		this.basketCounter = container.querySelector('.header__basket-counter')!;
		this.basketButton = container.querySelector('.header__basket')!;
	}

	renderItems(items: HTMLElement[]): void {
		this.gallery.replaceChildren(...items);
	}

	public lockScroll(lock: boolean): void {
		const wrapper = document.querySelector('.page__wrapper');
		if (wrapper) {
			if (lock) {
				wrapper.classList.add('page__wrapper_locked');
				document.body.style.overflow = 'hidden';
			} else {
				wrapper.classList.remove('page__wrapper_locked');
				document.body.style.overflow = '';
			}
		}
	}
	setBasketCount(count: number): void {
		this.basketCounter.textContent = String(count);
	}

	onBasketClick(handler: () => void): void {
		this.basketButton.addEventListener('click', handler);
	}
}
