export class Modal {
	content: HTMLElement | null = null;

	constructor() {
		const modal = document.querySelector('#modal-container');
		if (modal) {
			const closeBtn = modal.querySelector('.modal__close');
			if (closeBtn) {
				closeBtn.addEventListener('click', () => this.close());
			}
		}
	}

	open() {
		const modal = document.querySelector('#modal-container');
		if (modal) {
			modal.classList.add('modal_active');
			document.body.style.overflow = 'hidden';
			const wrapper = document.querySelector('.page__wrapper');
			if (wrapper) wrapper.classList.add('page__wrapper_locked');
			if (this.content) {
				const content = modal.querySelector('.modal__content');
				if (content) {
					content.innerHTML = '';
					content.appendChild(this.content);
				}
			}
		}
	}

	close() {
		const modal = document.querySelector('#modal-container');
		if (modal) {
			modal.classList.remove('modal_active');
			document.body.style.overflow = '';
			const wrapper = document.querySelector('.page__wrapper');
			if (wrapper) wrapper.classList.remove('page__wrapper_locked');
			const content = modal.querySelector('.modal__content');
			if (content) content.innerHTML = '';
		}
	}
}
