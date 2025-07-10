import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(public container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
			if (this.events && typeof this.events.emit === 'function') {
				this.events.emit(`${this.container.name}.${String(field)}:change`, {
					field,
					value,
				});
			}
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			if (this.events && typeof this.events.emit === 'function') {
				this.events.emit(`${this.container.name}:submit`);
			}
		});
	}

	protected onInputChange(field: keyof T, value: string) {}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}

	reset() {
		(this.container as HTMLFormElement).reset();
		this.valid = false;
		this.errors = '';
	}
}
