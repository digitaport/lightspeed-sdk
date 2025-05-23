import { AxiosError, AxiosResponse } from 'axios';
import {
  AccessTokenResponse,
  Customer,
  CustomerSearchParams,
  Item,
  PaymentType,
  PostCustomer,
  PostSale,
  Sale,
  SearchParam,
  TaxCategory,
} from './RetailApiTypes';
import RetailApiCursor from '../utils/RetailApiCursor';

const axios = require('axios');
const querystring = require('querystring');
const FormData = require('form-data');

const { sleep } = require('../utils/timeUtils');

type ConstructorOptions = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

interface SearchParams {
  [key: string]: SearchParam | string;
}

const toLSQueryParam = (searchParam: SearchParam | string): string => {
  if (typeof searchParam === 'string') {
    return searchParam;
  } else if (searchParam[0] === '=') {
    return searchParam[1];
  } else {
    return searchParam.join(',');
  }
};

const searchParamsToQueryParams = (searchParams: SearchParams): Record<string, string> => {
  return Object.entries(searchParams).reduce(
    (queryParams, [param, searchParam]) => ({
      [param]: toLSQueryParam(searchParam),
      ...queryParams,
    }),
    {}
  );
};

const getRequiredUnits = (operation: 'GET' | 'POST' | 'PUT'): number => {
  switch (operation) {
    case 'GET':
      return 1;
    case 'POST':
    case 'PUT':
      return 10;
    default:
      return 10;
  }
};

const buildAuthFormData = (clientId: string, clientSecret: string, token: string): FormData => {
  const form = new FormData();

  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);
  form.append('refresh_token', token);
  form.append('grant_type', 'refresh_token');

  return form;
};

class LightspeedRetailApi {
  private lastResponse: AxiosResponse;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private refreshToken: string;

  constructor(opts: ConstructorOptions) {
    const { clientId, clientSecret, refreshToken } = opts;

    this.lastResponse = null;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
  }

  private handleResponseError(msg, err): never {
    console.error(`${msg} - ${err}`);
    throw err;
  }

  private setLastResponse(response) {
    this.lastResponse = response;
  }

  private async handleRateLimit(options): Promise<number> {
    if (!this.lastResponse) return null;

    const { method } = options;

    const requiredUnits = getRequiredUnits(method);
    const rateHeader = this.lastResponse.headers['x-ls-api-bucket-level'];
    if (!rateHeader) return null;

    const [usedUnits, bucketSize] = rateHeader.split('/');
    const availableUnits = bucketSize - usedUnits;
    if (requiredUnits <= availableUnits) return 0;

    const dripRate = this.lastResponse.headers['x-ls-api-drip-rate'];
    const unitsToWait = requiredUnits - availableUnits;
    const delay = Math.ceil((unitsToWait / dripRate) * 1000);
    await sleep(delay);

    return unitsToWait;
  }

  private async performRequest(options): Promise<AxiosResponse | never> {
    // Wait if needed
    await this.handleRateLimit(options);

    // Regenerate token
    // TODO: We are generating a new token on every request, we should probably only do that if its expired.
    const token = (await this.getToken()).access_token;
    if (!token) {
      throw new Error('Error fetching token');
    }

    options.headers = { Authorization: `Bearer ${token}` };

    // Execute request
    try {
      const response = await axios(options);
      // Keep last response
      this.lastResponse = response;
      return response;
    } catch (error) {
      const axiosResponseError = error as AxiosError;
      console.error('Failed request statusText:', axiosResponseError.response.statusText);
      console.error('Failed data:', axiosResponseError.response.data);
      throw axiosResponseError;
    }
  }

  async getToken(): Promise<AccessTokenResponse | never> {
    const url = 'https://cloud.merchantos.com/oauth/access_token.php';

    const data: FormData = buildAuthFormData(this.clientId, this.clientSecret, this.refreshToken);

    const options = {
      method: 'POST',
      url,
      data,
      headers: {
        // @ts-ignore
        'content-type': `multipart/form-data; boundary=${data._boundary}`,
      },
    };

    try {
      const response = await axios(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET TOKEN', err);
    }
  }

  async postItem(accountId, item) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item.json`;

    const options = {
      method: 'POST',
      url,
      data: item,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM', err);
    }
  }

  async postCustomer(
    accountId: number | string,
    customer: PostCustomer
  ): Promise<Customer | never> {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer.json`;

    const options = {
      method: 'POST',
      url,
      data: customer,
    };

    try {
      const response = await this.performRequest(options);
      return response.data.Customer;
    } catch (err) {
      return this.handleResponseError('POST CUSTOMER', err);
    }
  }

  async postCustomerType(accountId, customerType) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/CustomerType.json`;

    const options = {
      method: 'POST',
      url,
      data: customerType,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST CUSTOMER TYPE', err);
    }
  }

  async postItemAttributeSet(accountId, attributeSet) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemAttributeSet.json`;

    const options = {
      method: 'POST',
      url,
      data: attributeSet,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM ATTRIBUTE SET', err);
    }
  }

  async postItemMatrix(accountId, itemMatrix) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemMatrix.json`;

    const options = {
      method: 'POST',
      url,
      data: itemMatrix,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM MATRIX', err);
    }
  }

  async postItemCustomField(accountId, customField) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item/CustomField.json`;

    const options = {
      method: 'POST',
      url,
      data: customField,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM CUSTOM FIELD', err);
    }
  }

  async postPaymentMethod(accountId, paymentMethod) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/PaymentType.json`;

    const options = {
      method: 'POST',
      url,
      data: paymentMethod,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST PAYMENT METHOD', err);
    }
  }

  async postCustomerCustomField(accountId, customField) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer/CustomField.json`;

    const options = {
      method: 'POST',
      url,
      data: customField,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST CUSTOMER CUSTOM FIELD', err);
    }
  }

  async postSale(accountId, sale: PostSale): Promise<Sale> {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Sale.json`;

    const options = {
      method: 'POST',
      url,
      data: sale,
    };

    try {
      const response = await this.performRequest(options);
      return response.data.Sale as Sale;
    } catch (err) {
      return this.handleResponseError('POST SALE', err);
    }
  }

  async putItem(accountId, item, ID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item/${ID}.json`;

    const options = {
      method: 'PUT',
      url,
      data: item,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('PUT ITEM', err);
    }
  }

  async putItemMatrix(accountId, matrix, ID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemMatrix/${ID}.json`;

    const options = {
      method: 'PUT',
      url,
      data: matrix,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('PUT ITEM MATRIX', err);
    }
  }

  async putCustomer(accountId, customer, ID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer/${ID}.json`;

    const options = {
      method: 'PUT',
      url,
      data: customer,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('PUT CUSTOMER', err);
    }
  }

  async getAccount() {
    const url = 'https://api.merchantos.com/API/Account.json';

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET ACCOUNT', err);
    }
  }

  async getTaxCategory(accountId, taxCategoryId): Promise<TaxCategory> {
    const url = `https://api.merchantos.com/API/V3/Account/${accountId}/TaxCategory/${taxCategoryId}.json`;

    return (await this.performRequest({ method: 'GET', url })).data.TaxCategory as TaxCategory;
  }

  getCompletedSalesByPeriod(accountId, start, end) {
    let url = null;
    if (end == undefined) {
      url = `https://api.merchantos.com/API/Account/${accountId}/Sale.json?completed=true&completeTime=${encodeURIComponent(
        `>,${start}`
      )}`;
    } else {
      url = `https://api.merchantos.com/API/Account/${accountId}/Sale.json?completed=true&completeTime=${encodeURIComponent(
        `><,${start},${end}`
      )}`;
    }

    return new RetailApiCursor(url, 'Sale', this, {
      load_relations:
        '["TaxCategory","SaleLines","SaleLines.Item","SalePayments","SalePayments.PaymentType","Customer","Discount","Customer.Contact"]',
    });
  }

  getSales(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Sale.json`;
    return new RetailApiCursor(url, 'Sale', this, {
      load_relations:
        '["TaxCategory","SaleLines","SaleLines.Item","SalePayments","SalePayments.PaymentType","Customer","Discount","Customer.Contact"]',
    });
  }

  public async getSale(accountId, saleId) {
    const queryString = {
      load_relations: JSON.stringify([
        'TaxCategory',
        'SaleLines',
        'SalePayments',
        'SalePayments.PaymentType',
      ]),
    };
    const url = `https://api.merchantos.com/API/Account/${accountId}/Sale/${saleId}.json?${querystring.stringify(
      queryString
    )}`;
    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SALE PAYMENT', err);
    }
  }

  async getSalePaymentByID(accountId, salePaymentID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/SalePayment/${salePaymentID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SALE PAYMENT', err);
    }
  }

  async getSalePaymentBySaleID(accountId, saleID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/SalePayment.json?saleID=${saleID}`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SALE PAYMENT', err);
    }
  }

  async getSaleLineBySaleID(accountId, saleID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/SaleLine.json?saleID=${saleID}`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SALE LINE', err);
    }
  }

  async getSaleLineByID(accountId, saleLineID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/SaleLine/${saleLineID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SALE LINE', err);
    }
  }

  async getPaymentTypeByID(accountId, paymentTypeID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/PaymentType/${paymentTypeID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET PAYMENT TYPE', err);
    }
  }

  async getShopByID(accountId, shopID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Shop/${shopID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET SHOP', err);
    }
  }

  async getDiscountByID(accountId, discountID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Discount/${discountID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET DISCOUNT', err);
    }
  }

  async getCustomerByID(accountId, customerID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer/${customerID}.json?load_relations=["CustomFieldValues", "CustomFieldValues.value"]`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET CUSTOMER', err);
    }
  }

  async getContactByID(accountId, contactID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Contact/${contactID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET CONTACT', err);
    }
  }

  async getItemMatrixByID(accountId, itemMatrixID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemMatrix/${itemMatrixID}.json`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET ITEM MATRIX', err);
    }
  }

  async getItemsByMatrixID(accountId, itemMatrixID) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item.json?itemMatrixID=${itemMatrixID}`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET ITEM', err);
    }
  }

  async getItemByCustomSku(accountId, customSku) {
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item.json?customSku=${customSku}`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('GET ACCOUNT', err);
    }
  }

  async getItemById(
    accountId,
    itemId,
    loadRelations = [
      'ItemShops',
      'Images',
      'Manufacturer',
      'CustomFieldValues',
      'CustomFieldValues.value',
    ]
  ): Promise<Item> {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Item/${itemId}.json?load_relations=${querystring.escape(
      JSON.stringify(loadRelations)
    )}`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data.Item;
    } catch (err) {
      return this.handleResponseError(`GET ITEM BY ID ${itemId}`, err);
    }
  }

  getCategories(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Category.json`;
    return new RetailApiCursor(url, 'Category', this);
  }

  getManufacturers(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Manufacturer.json`;
    return new RetailApiCursor(url, 'Manufacturer', this);
  }

  getItems(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Item.json`;
    return new RetailApiCursor(url, 'Item', this, {
      load_relations: '["ItemShops", "Images", "Manufacturer"]',
    });
  }

  getPaymentTypes(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/PaymentType.json`;
    return new RetailApiCursor<PaymentType>(url, 'PaymentType', this, {});
  }

  getCustomers(
    accountId,
    customersSearchParams: CustomerSearchParams = {}
  ): RetailApiCursor<Customer> {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Customer.json`;
    return new RetailApiCursor(url, 'Customer', this, {
      load_relations: '["Contact", "CustomFieldValues"]',
      ...searchParamsToQueryParams(customersSearchParams),
    });
  }

  getCustomerTypes(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/CustomerType.json`;
    return new RetailApiCursor(url, 'CustomerType', this);
  }
}

export default LightspeedRetailApi;
