const axios = require('axios');
const querystring = require('querystring');
const FormData = require('form-data');

const { sleep } = require('./utils/timeUtils');

const { ApiCursor } = require('./utils/ApiCursor');

class Lightspeed {
  constructor(opts) {
    const { clientId, clientSecret, refreshToken } = opts;

    Lightspeed.validate(opts);

    this._lastResponse = null;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._refreshToken = refreshToken;
  }

  static validate(opts) {
    let missingField = null;

    const requiredFields = ['clientId', 'clientSecret', 'refreshToken'];

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

  static getRequiredUnits(operation) {
    switch (operation) {
      case 'GET':
        return 1;
      case 'POST':
      case 'PUT':
        return 10;
      default:
        return 10;
    }
  }

  handleResponseError(msg, err) {
    console.log(`${msg} - ${err}`);
    throw err;
  }

  setLastResponse(response) {
    this._lastResponse = response;
  }

  async handleRateLimit(options) {
    if (!this._lastResponse) return null;

    const { method } = options;

    const requiredUnits = Lightspeed.getRequiredUnits(method);
    const rateHeader = this._lastResponse.headers['x-ls-api-bucket-level'];
    if (!rateHeader) return null;

    const [usedUnits, bucketSize] = rateHeader.split('/');
    const availableUnits = bucketSize - usedUnits;
    if (requiredUnits <= availableUnits) return 0;

    const dripRate = this._lastResponse.headers['x-ls-api-drip-rate'];
    const unitsToWait = requiredUnits - availableUnits;
    const delay = Math.ceil((unitsToWait / dripRate) * 1000);
    await sleep(delay);

    return unitsToWait;
  }

  async performRequest(options) {
    // Wait if needed
    await this.handleRateLimit(options);

    // Regenerate token
    const token = (await this.getToken()).access_token;
    if (!token) {
      throw new Error('Error fetching token');
    }

    options.headers = { Authorization: `Bearer ${token}` };

    // Execute request
    const response = await axios(options);

    // Keep last response
    this._lastResponse = response;
    return response;
  }

  static buildAuthFormData(clientId, clientSecret, token) {
    const form = new FormData();

    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);
    form.append('refresh_token', token);
    form.append('grant_type', 'refresh_token');

    return form;
  }

  async getToken() {
    const url = 'https://cloud.merchantos.com/oauth/access_token.php';

    const data = Lightspeed.buildAuthFormData(
      this._clientId,
      this._clientSecret,
      this._refreshToken
    );

    const options = {
      method: 'POST',
      url: url,
      data: data,
      headers: {
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

  async postItem(accountId, item){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Item.json`;

    const options = {
      method: 'POST',
      url: url,
      data: item
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM', err);
    }
  }

  async postCustomer(accountId, customer){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer.json`;

    const options = {
      method: 'POST',
      url: url,
      data: customer
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST CUSTOMER', err);
    }
  }

  async postCustomerType(accountId, customerType){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/CustomerType.json`

    const options = {
      method: 'POST',
      url: url,
      data: customerType
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST CUSTOMER TYPE', err);
    }
  }

  async postItemMatrix(accountId, itemMatrix){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemMatrix.json`
  
    const options = {
      method: 'POST',
      url: url,
      data: itemMatrix
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('POST ITEM MATRIX', err);
    }
  }

  async putItemMatrix(accountId, matrix, ID){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/ItemMatrix/${ID}.json`;

    const options = {
      method: 'PUT',
      url: url,
      data: matrix
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError('PUT ITEM MATRIX', err);
    }
  }

  async putCustomer(accountId, customer, ID){
    const url = `https://api.lightspeedapp.com/API/Account/${accountId}/Customer/${ID}.json`;

    const options = {
      method: 'PUT',
      url: url,
      data: customer
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

  async getItemByCustomSku(accountId, customSku){
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

  async getItemById(accountId, itemId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Item/${itemId}.json?load_relations=["ItemShops", "Images", "Manufacturer"]`;

    const options = {
      method: 'GET',
      url,
    };

    try {
      const response = await this.performRequest(options);
      return response.data;
    } catch (err) {
      return this.handleResponseError(`GET ITEM BY ID ${itemId}`, err);
    }
  }

  getCategories(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Category.json`;
    return new ApiCursor(url, 'Category', this);
  }

  getManufacturers(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Manufacturer.json`;
    return new ApiCursor(url, 'Manufacturer', this);
  }

  getItems(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Item.json`;
    return new ApiCursor(url, 'Item', this, {
      load_relations: '["ItemShops", "Images", "Manufacturer"]',
    });
  }

  getCustomers(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Customer.json`;
    return new ApiCursor(url, 'Customer', this, {
      load_relations: '["Contact", "CustomFieldValues"]',
    });
  }

  getCustomerTypes(accountId) {
    const url  = `https://api.merchantos.com/API/Account/${accountId}/CustomerType.json`;
    return new ApiCursor(url, 'CustomerType', this);
  }
}

module.exports = Lightspeed;
