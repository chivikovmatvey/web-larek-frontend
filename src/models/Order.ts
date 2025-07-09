import { IOrderRequest, IOrderResponse } from '../types';
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

	setStep1Data(payment: string, address: string) {
		this.data.payment = payment as any;
		this.data.address = address;
	}

	setStep2Data(email: string, phone: string) {
		this.data.email = email;
		this.data.phone = phone;
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
