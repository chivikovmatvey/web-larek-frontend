import { ICart, ICartItem, IProduct } from '../types';
import { EventEmitter } from '../components/base/Events';

export class Cart {
	private items: ICartItem[] = [];
	private emitter: EventEmitter;

	constructor(emitter: EventEmitter) {
		this.emitter = emitter;
	}

	add(product: IProduct) {
		const found = this.items.find((i) => i.product.id === product.id);
		if (found) {
			found.count++;
		} else {
			this.items.push({ product, count: 1 });
		}
		this.emitUpdate();
	}

	remove(product: IProduct) {
		this.items = this.items.filter((i) => i.product.id !== product.id);
		this.emitUpdate();
	}

	getCart(): ICart {
		return {
			items: this.items,
			total: this.items.reduce((sum, i) => sum + i.product.price * i.count, 0),
		};
	}

	clear() {
		this.items = [];
		this.emitUpdate();
	}

	getProductIds(): string[] {
		return this.items.map((i) => i.product.id);
	}

	private emitUpdate() {
		this.emitter.emit('cart:update', this.getCart());
	}
}
