const querystring = require('querystring');

const { performRequest } = require('./HttpClient');

async function* getPaginatedEndpointGenerator(baseUrl, resource, qs = {}) {
  let offset = 0;
  const limit = 100;
  let keepFetching = true;

  while (keepFetching) {
    const url = `${baseUrl}?${querystring.stringify({
      ...qs,
      offset,
      limit,
    })}`;

    try {
      const apiResponse = await performRequest(url, 'GET');

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

module.exports = {
  getPaginatedEndpointGenerator,
};
