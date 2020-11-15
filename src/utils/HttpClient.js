const https = require('https');

module.exports = {
  /**
   * @param {String} path
   * @param {('GET'|'POST'|'PUT'|'DELETE'|'PATCH')} method
   * @param {Object} body
   * @param {Object} additionalHeaders
   */
  performRequest: (apiEndpoint, method, body = {}, headers = {}) => {
    const url = new URL(apiEndpoint);
    const { host } = url;

    const defaultRequestOptions = {
      hostname: host,
      port: 443,
      headers,
    };

    return new Promise((resolve, reject) => {
      const requestOptions = {
        ...defaultRequestOptions,
        path,
        method,
      };

      const request = https.request(requestOptions, (response) => {
        let responseBody = '';

        response.on('data', (chunk) => {
          responseBody += chunk;
        });

        response.on('end', () => {
          if (response.statusCode) {
            let jsonResponse;
            try {
              jsonResponse = JSON.parse(responseBody);
            } catch (error) {
              jsonResponse = responseBody;
            }
            const httpClientResponse = {
              status: response.statusCode,
              jsonResponse,
              headers: response.headers,
            };

            if (response.statusCode < 400) {
              resolve(httpClientResponse);
            } else {
              reject(httpClientResponse);
            }
          } else {
            reject(new Error('Request failed'));
          }
        });
      });

      request.on('error', (error) => reject(error));

      if (body) {
        let bodyString;

        if (typeof body === 'string') {
          bodyString = body;
        } else {
          bodyString = JSON.stringify(body);
        }

        request.write(bodyString);
      }
      request.end();
    });
  },
};
