import { Form } from './common/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/Events';

export class OrderFormView extends Form<IOrderForm> {
	protected _paymentButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._paymentButtons = Array.from(
			container.querySelectorAll('.button_alt')
		);
		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				this.onPaymentMethodChange(button.name);
			});
		});
	}

	onPaymentMethodChange(name: string) {
		this._paymentButtons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
		});
		this.events.emit('order.payment:change', { field: 'payment', value: name });
	}

	reset() {
		super.reset();
		this._paymentButtons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', false);
		});
	}

	showErrors(errors: string) {
		this.errors = errors;
	}

	setSubmitDisabled(disabled: boolean) {
		this.valid = !disabled;
	}
}
