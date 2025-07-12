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
		const content = this.modal.querySelector('.modal__content');
		if (content) content.innerHTML = '';
		this.emitter?.emit('modal:close');
	}
}
