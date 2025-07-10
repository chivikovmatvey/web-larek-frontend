export abstract class Component<T> {
	public readonly container: HTMLElement;

	protected constructor(container: HTMLElement) {
		this.container = container;
	}

	toggleClass(el: HTMLElement, cls: string, force?: boolean): void {
		el.classList.toggle(cls, force);
	}

	protected setText(el: HTMLElement, val: unknown): void {
		if (el) el.textContent = String(val);
	}

	setDisabled(el: HTMLElement, state: boolean): void {
		if (!el) return;
		state
			? el.setAttribute('disabled', 'disabled')
			: el.removeAttribute('disabled');
	}

	protected setHidden(el: HTMLElement): void {
		el.style.display = 'none';
	}

	protected setVisible(el: HTMLElement): void {
		el.style.removeProperty('display');
	}

	protected setImage(img: HTMLImageElement, src: string, alt?: string): void {
		if (!img) return;
		img.src = src;
		if (alt) img.alt = alt;
	}

	render(data?: Partial<T>): HTMLElement {
		if (data) Object.assign(this as object, data);
		return this.container;
	}
}
