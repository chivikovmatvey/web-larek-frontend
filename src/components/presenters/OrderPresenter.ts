import { EventEmitter } from '../base/Events';
import { Order } from '../../models/Order';
import { AppEvents, IOrderRequest } from '../../types';
import { Cart } from '../../models/Cart';
import { Form } from '../common/Form';

export class OrderPresenter {
	constructor(
		private order: Order,
		private emitter: EventEmitter,
		private orderForm: Form<any>,
		private contactsContainer: HTMLElement,
		private successContainer: HTMLElement,
		private cart: Cart
	) {
		this.emitter.on(AppEvents.OrderStart, () => {
			this.showOrderForm();
		});
		this.emitter.on(
			AppEvents.OrderStep1Submit,
			(data: { payment: string; address: string }) => {
				this.order.setStep1Data(data.payment, data.address);
			}
		);
		this.emitter.on(
			AppEvents.OrderStep2Submit,
			(data: { email: string; phone: string }) => {
				this.order.setStep2Data(data.email, data.phone);
			}
		);
		this.emitter.on(AppEvents.OrderSuccess, (data: any) => {
			const successTemplate = document.getElementById(
				'success'
			) as HTMLTemplateElement;
			if (!successTemplate) return;
			const successNode = successTemplate.content.cloneNode(
				true
			) as HTMLElement;
			const desc = successNode.querySelector(
				'.order-success__description'
			) as HTMLElement;
			if (desc && data && typeof data.total === 'number') {
				desc.textContent = `Списано ${data.total} синапсов`;
			}
			const closeBtn = successNode.querySelector(
				'.order-success__close'
			) as HTMLButtonElement;
			if (closeBtn) {
				closeBtn.addEventListener('click', () => {
					const modal = document.querySelector('#modal-container');
					if (modal) {
						modal.classList.remove('modal_active');
						const content = modal.querySelector('.modal__content');
						if (content) content.innerHTML = '';
					}
					document.body.style.overflow = '';
					const wrapper = document.querySelector('.page__wrapper');
					if (wrapper) wrapper.classList.remove('page__wrapper_locked');
					this.cart.clear();
					const counter = document.querySelector('.header__basket-counter');
					if (counter) counter.textContent = '0';
				});
			}
			const modal = document.querySelector('#modal-container');
			if (modal) {
				const content = modal.querySelector('.modal__content');
				if (content) {
					content.innerHTML = '';
					content.appendChild(successNode);
				}
				modal.classList.add('modal_active');
				document.body.style.overflow = 'hidden';
				const wrapper = document.querySelector('.page__wrapper');
				if (wrapper) wrapper.classList.add('page__wrapper_locked');
			}
		});
	}

	showOrderForm() {
		const orderTemplate = document.getElementById(
			'order'
		) as HTMLTemplateElement;
		if (!orderTemplate) return;
		const orderNode = orderTemplate.content.cloneNode(true) as HTMLElement;
		const form = orderNode.querySelector('form');
		const addressInput = form?.querySelector(
			'input[name="address"]'
		) as HTMLInputElement;
		const payBtns = form?.querySelectorAll('.order__buttons .button');
		const nextBtn = form?.querySelector('.order__button') as HTMLButtonElement;
		const errorEl = form?.querySelector('.form__errors') as HTMLElement;
		let selectedPayment = '';

		let addressHint = form?.querySelector('.form__hint') as HTMLElement;
		if (!addressHint && nextBtn) {
			addressHint = document.createElement('span');
			addressHint.className = 'form__hint';
			addressHint.style.marginLeft = '16px';
			nextBtn.parentElement?.appendChild(addressHint);
		}

		const validate = () => {
			const address = addressInput?.value.trim();
			let valid = true;
			let errorMsg = '';
			let hintMsg = '';
			if (!selectedPayment) {
				valid = false;
				errorMsg = '';
			}
			if (!address) {
				valid = false;
				hintMsg = 'Необходимо указать адрес доставки';
			}
			if (nextBtn) nextBtn.disabled = !valid;
			if (errorEl) errorEl.textContent = errorMsg;
			if (addressHint) addressHint.textContent = hintMsg;
			return valid;
		};

		payBtns?.forEach((btn) => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				payBtns.forEach((b) => b.classList.remove('button_alt-active'));
				btn.classList.add('button_alt-active');
				selectedPayment = btn.getAttribute('name') || '';
				validate();
			});
		});
		addressInput?.addEventListener('input', validate);

		form?.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!validate()) {
				if (errorEl)
					errorEl.textContent = 'Заполните адрес и выберите способ оплаты';
				return;
			}
			this.emitter.emit(AppEvents.OrderStep1Submit, {
				payment: selectedPayment,
				address: addressInput.value.trim(),
			});
			this.showContactsForm();
		});

		const modal = document.querySelector('#modal-container');
		if (modal) {
			const content = modal.querySelector('.modal__content');
			if (content) {
				content.innerHTML = '';
				content.appendChild(orderNode);
			}
			modal.classList.add('modal_active');
			document.body.style.overflow = 'hidden';
			const wrapper = document.querySelector('.page__wrapper');
			if (wrapper) wrapper.classList.add('page__wrapper_locked');
		}
	}

	showContactsForm() {
		const contactsTemplate = document.getElementById(
			'contacts'
		) as HTMLTemplateElement;
		if (!contactsTemplate) return;
		const contactsNode = contactsTemplate.content.cloneNode(
			true
		) as HTMLElement;
		const form = contactsNode.querySelector('form');
		const emailInput = form?.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		const phoneInput = form?.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		const payBtn = form?.querySelector(
			'button[type="submit"]'
		) as HTMLButtonElement;
		const errorEl = form?.querySelector('.form__errors') as HTMLElement;

		const validate = () => {
			const email = emailInput?.value.trim();
			const phone = phoneInput?.value.trim();
			const emailValid = !!email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
			const phoneValid = !!phone && /^\+?\d[\d\s\-()]{9,}$/.test(phone);
			if (payBtn) payBtn.disabled = !(emailValid && phoneValid);
			if (errorEl) errorEl.textContent = '';
			return emailValid && phoneValid;
		};
		emailInput?.addEventListener('input', validate);
		phoneInput?.addEventListener('input', validate);

		form?.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!validate()) {
				if (errorEl) errorEl.textContent = 'Введите корректные email и телефон';
				return;
			}
			const email = emailInput.value.trim();
			const phone = phoneInput.value.trim();
			this.emitter.emit(AppEvents.OrderStep2Submit, { email, phone });
			const cartData = this.cart.getCart();
			const items = cartData.items.map((i) => i.product.id);
			const total = cartData.total;
			this.submitOrder({
				payment: this.order['data'].payment as any,
				address: this.order['data'].address || '',
				email,
				phone,
				total,
				items,
			});
		});

		const modal = document.querySelector('#modal-container');
		if (modal) {
			const content = modal.querySelector('.modal__content');
			if (content) {
				content.innerHTML = '';
				content.appendChild(contactsNode);
			}
			modal.classList.add('modal_active');
			document.body.style.overflow = 'hidden';
			const wrapper = document.querySelector('.page__wrapper');
			if (wrapper) wrapper.classList.add('page__wrapper_locked');
		}
	}

	submitOrder(request: IOrderRequest) {
		this.order.setItemsAndTotal(request.items, request.total);
		this.order.submit();
	}
}
