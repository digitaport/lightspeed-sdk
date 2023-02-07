import axios, { AxiosInstance } from 'axios';
import EcomApiCursor from '../utils/EcomApiCursor';
import { Account, Order, OrderProduct, ProductVariant, Product } from './EcomTypes';

type ClusterId = 'eu1' | 'EU1' | 'us1' | 'US1';

function getClusterUrl(clusterId: ClusterId): string {
  switch (clusterId) {
    case 'EU1':
    case 'eu1':
      return 'api.webshopapp.com';
    case 'us1':
    case 'US1':
      return 'api.shoplightspeed.com';
    default:
      throw new Error(`clusterID ${clusterId} is not supported. Must be 'eu1' or 'us1'`);
  }
}

function buildBaseUrl(clusterId, language) {
  return `https://${getClusterUrl(clusterId)}/${language}/`;
}

type AllowedOptions = {
  apiKey: string;
  apiSecret: string;
  clusterId: ClusterId;
  language?: string;
};

class LightspeedEcomApi {
  private axiosClient: AxiosInstance;

  constructor(opts: AllowedOptions) {
    const { apiKey, apiSecret, clusterId, language } = opts;

    LightspeedEcomApi.__validate(opts);
    this.axiosClient = axios.create({
      baseURL: buildBaseUrl(clusterId, language || 'us'),
      responseType: 'json',
      withCredentials: false,
      auth: {
        username: apiKey,
        password: apiSecret,
      },
    });
  }

  static __validate(opts) {
    let missingField = null;
    const requiredFields = ['apiKey', 'apiSecret', 'clusterId'];

    for (const requiredField of requiredFields) {
      if (!opts[requiredField]) {
        missingField = requiredField;
        break;
      }
    }

    if (missingField) {
      throw new Error(`Param ${missingField} is required`);
    }
  }

  async getAccount(): Promise<Account> {
    const response = await this.axiosClient.get('account.json');
    return response.data as Account;
  }

  getOrders() {
    return new EcomApiCursor<Order>('orders', this.axiosClient, 'orders');
  }

  getOrderProducts(orderId: number) {
    return new EcomApiCursor<OrderProduct>(
      `orders/${orderId}/products`,
      this.axiosClient,
      'orderProducts'
    );
  }

  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    const response = await this.axiosClient.get(`variants.json?product=${productId}`);
    return response.data.variants as ProductVariant[];
  }

  async getVariant(variantId: number): Promise<ProductVariant> {
    const response = await this.axiosClient.get(`variants/${variantId}.json`);
    return response.data.variant as ProductVariant;
  }

   getVariantsAllProducts(): EcomApiCursor<ProductVariant[]> {
   return new EcomApiCursor<ProductVariant[]>('variants', this.axiosClient, 'variants');
  }

  getProducts(): EcomApiCursor<Product[]> {
    return  new EcomApiCursor<Product[]>('products', this.axiosClient, 'products');
  }

}

export default LightspeedEcomApi;
