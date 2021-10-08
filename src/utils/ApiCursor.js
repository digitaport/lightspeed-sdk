const { Readable } = require('stream');
const querystring = require('querystring');

const { performRequest } = require('./HttpClient');

class ApiCursor extends Readable {
  constructor(baseUrl, resource, instance, qs, opts) {
    super();
    this._baseUrl = baseUrl;
    this._resource = resource;
    this._instance = instance;
    this._qs = qs;
    this.opts = opts;
  }

  async toArray() {
    const elements = [];
    for await (const item of this) {
      elements.push(item);
    }
    return elements;
  }

  async *[Symbol.asyncIterator]() {
    let offset = 0;
    const limit = 100;
    let keepFetching = true;
    const resource = this._resource;
    const lsInstance = this._instance;

    while (keepFetching) {
      console.log('\nNueva iteracion: '+keepFetching);
      const url = `${this._baseUrl}?${querystring.stringify({
        ...this._qs,
        offset,
        limit,
      })}`;

      try {
        const options = {
          method: 'GET',
          url,
        };

        const apiResponse = await lsInstance.performRequest(options);

        // When a list is empty, the API response doesn't return the "resource" attribute
        if (apiResponse.data[resource] == undefined || !Array.isArray(apiResponse.data[resource])) {
          keepFetching = false;
          break;
        }

        for (const element of apiResponse.data[resource]) {
          yield element;
        }

        if (offset + limit > apiResponse.data['@attributes'].count) {
          keepFetching = false;
        } else {
          offset = offset + limit;
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  }
}

module.exports = {
  ApiCursor,
};
