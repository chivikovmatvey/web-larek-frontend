import { IEvents } from './Events';

export const isModel = function <T>(obj: unknown): obj is Model<T> {
	return obj instanceof Model;
};

export abstract class Model<T> {
	protected events: IEvents;

	constructor(data: Partial<T>, events: IEvents) {
		this.events = events;
		if (data) {
			Object.assign(this, data);
		}
	}

	emitChanges(event: string, payload?: object): void {
		this.events.emit(event, payload ? payload : {});
	}
}
