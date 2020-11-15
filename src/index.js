const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const FormData = require('form-data');

const { sleep } = require('./utils/timeUtils');

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

  handleResponseError(err) {
    console.log(err);
    throw err;
  }

  async handleRateLimit(options) {
    if (!this._lastResponse) return null;

    const { method: operation } = options;

    const requiredUnits = Lightspeed.getRequiredUnits(operation);
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
      url,
      data,
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

  async getPaginatedEndpoint(baseUrl, resource, qs = {}) {
    let offset = 0;
    const limit = 100;
    let keepFetching = true;
    let response = [];

    while (keepFetching) {
      const url = `${baseUrl}?${querystring.stringify({
        ...qs,
        offset,
        limit,
      })}`;

      const options = {
        method: 'GET',
        url,
      };

      try {
        const apiResponse = await this.performRequest(options);
        response = response.concat(apiResponse.data[resource]);

        if (offset + limit > apiResponse.data['@attributes'].count) {
          keepFetching = false;
        } else {
          offset = offset + limit;
        }
      } catch (err) {
        return this.handleResponseError(`GET ${resource.toUpperCase()}`, err);
      }
    }

    return response;
  }

  getCategories(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Category.json`;
    return this.getPaginatedEndpoint(url, 'Category');
  }

  getManufacturers(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Manufacturer.json`;
    return this.getPaginatedEndpoint(url, 'Manufacturer');
  }

  async getItems(accountId) {
    const url = `https://api.merchantos.com/API/Account/${accountId}/Item.json`;
    return this.getPaginatedEndpoint(url, 'Item', {
      load_relations: '["ItemShops", "Images", "Manufacturer"]',
    });
  }
}

module.exports = Lightspeed;
