import { Form } from './common/Form';
import { IContactsForm } from '../types';
import { IEvents } from './base/Events';

export class ContactsFormView extends Form<IContactsForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	showErrors(errors: string) {
		this.errors = errors;
	}

	setSubmitDisabled(disabled: boolean) {
		this.valid = !disabled;
	}
}
