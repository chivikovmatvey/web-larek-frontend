import { EventEmitter } from '../base/Events';

export class Modal {
	content: HTMLElement | null = null;
	private modal: HTMLElement;
	private emitter: EventEmitter;

	constructor(modalContainer?: HTMLElement, emitter?: EventEmitter) {
		this.modal = modalContainer || document.querySelector('#modal-container')!;
		this.emitter = emitter || (window as any).globalEmitter;
		const closeBtn = this.modal.querySelector('.modal__close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => this.close());
		}
	}

	open() {
		this.modal.classList.add('modal_active');
		document.body.style.overflow = 'hidden';
		const wrapper = document.querySelector('.page__wrapper');
		if (wrapper) wrapper.classList.add('page__wrapper_locked');
		if (this.content) {
			const content = this.modal.querySelector('.modal__content');
			if (content) {
				content.innerHTML = '';
				content.appendChild(this.content);
			}
		}
		this.emitter?.emit('modal:open');
	}

	close() {
		this.modal.classList.remove('modal_active');
		document.body.style.overflow = '';
		const wrapper = document.querySelector('.page__wrapper');
		if (wrapper) wrapper.classList.remove('page__wrapper_locked');
		const content = this.modal.querySelector('.modal__content');
		if (content) content.innerHTML = '';
		this.emitter?.emit('modal:close');
	}
}
