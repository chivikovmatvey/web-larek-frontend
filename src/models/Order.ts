import {
	IOrderRequest,
	IOrderResponse,
	IOrderForm,
	IContactsForm,
} from '../types';
import { EventEmitter } from '../components/base/Events';
import { WebLarekApi } from './WebLarekApi';

export class Order {
	private data: Partial<IOrderRequest> = {};
	private emitter: EventEmitter;
	private api: WebLarekApi;

	constructor(api: WebLarekApi, emitter: EventEmitter) {
		this.api = api;
		this.emitter = emitter;
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		(this.data as any)[field] = value;
		this.validateStep1();
	}

	setContactsField(field: keyof IContactsForm, value: string) {
		(this.data as any)[field] = value;
		this.validateStep2();
	}

	validateStep1() {
		const errors: string[] = [];
		let valid = true;
		if (!this.data.address || this.data.address.trim().length < 5) {
			errors.push('Введите корректный адрес доставки');
			valid = false;
		}
		if (!this.data.payment) {
			errors.push('Выберите способ оплаты');
			valid = false;
		}
		this.emitter.emit('order:validation', { valid, errors });
	}

	validateStep2() {
		const errors: string[] = [];
		let valid = true;
		if (!this.data.email || !/.+@.+\..+/.test(this.data.email)) {
			errors.push('Введите корректный email');
			valid = false;
		}
		if (!this.data.phone || this.data.phone.replace(/\D/g, '').length < 10) {
			errors.push('Введите корректный телефон');
			valid = false;
		}
		this.emitter.emit('contacts:validation', { valid, errors });
	}

	setItemsAndTotal(items: string[], total: number) {
		this.data.items = items;
		this.data.total = total;
	}

	async submit() {
		try {
			const response = await this.api.createOrder(this.data as IOrderRequest);
			this.emitter.emit('order:success', response as IOrderResponse);
			this.clear();
		} catch (error) {
			this.emitter.emit('order:error', error);
		}
	}

	clear() {
		this.data = {};
	}
}
