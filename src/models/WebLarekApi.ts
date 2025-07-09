import { Api } from '../components/base/Api';
import {
	IProduct,
	IOrderRequest,
	IOrderResponse,
	ApiListResponse,
	IApiError,
} from '../types';

export class WebLarekApi extends Api {
	getProducts(
		category?: string,
		limit?: number
	): Promise<ApiListResponse<IProduct> | IApiError> {
		let url = '/product/';
		const params: string[] = [];
		if (category) params.push(`category=${encodeURIComponent(category)}`);
		if (limit) params.push(`limit=${limit}`);
		if (params.length) url += '?' + params.join('&');
		return this.get(url) as Promise<ApiListResponse<IProduct> | IApiError>;
	}

	getProduct(id: string): Promise<IProduct | IApiError> {
		return this.get(`/product/${id}`) as Promise<IProduct | IApiError>;
	}

	createOrder(
		request: IOrderRequest,
		options?: any
	): Promise<IOrderResponse | IApiError> {
		return this.post('/order', request) as Promise<IOrderResponse | IApiError>;
	}
}
