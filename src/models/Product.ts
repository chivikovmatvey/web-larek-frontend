import { IProduct, IProductInstance } from '../types';

export class Product implements IProductInstance {
	constructor(private dataObj: IProduct) {}

	get id() {
		return this.dataObj.id;
	}
	get title() {
		return this.dataObj.title;
	}
	get price() {
		return this.dataObj.price;
	}
	get description() {
		return this.dataObj.description;
	}
	get image() {
		return this.dataObj.image;
	}
	get category() {
		return this.dataObj.category;
	}

	data(): IProduct {
		return { ...this.dataObj };
	}
}
