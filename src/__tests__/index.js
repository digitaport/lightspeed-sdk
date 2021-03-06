const nock = require('nock');
const Lightspeed = require('../index');

describe('Lightspeed class', () => {
  it('has all the methods available', () => {
    const lightspeed = new Lightspeed({
      clientId: 'client',
      clientSecret: 'secret',
      refreshToken: 'token',
    });

    expect(typeof lightspeed).toBe('object');
    expect(typeof lightspeed.getAccount).toBe('function');
    expect(typeof lightspeed.getItems).toBe('function');
    expect(typeof lightspeed.getItemById).toBe('function');
    expect(typeof lightspeed.getManufacturers).toBe('function');
    expect(typeof lightspeed.getToken).toBe('function');
  });

  describe('validates constructor values', () => {
    const clientId = 'client';
    const clientSecret = 'secret';
    const refreshToken = 'token';

    it('clientId', () => {
      expect(() => new Lightspeed({ clientSecret, refreshToken })).toThrowError(
        'Param clientId is required'
      );
    });

    it('clientSecret', () => {
      expect(() => new Lightspeed({ clientId, refreshToken })).toThrowError(
        'Param clientSecret is required'
      );
    });

    it('refreshToken', () => {
      expect(() => new Lightspeed({ clientId, clientSecret })).toThrowError(
        'Param refreshToken is required'
      );
    });
  });

  describe('manages rate limit properly', () => {
    let lightspeed;

    beforeAll(() => {
      lightspeed = new Lightspeed({
        clientId: 'client',
        clientSecret: 'secret',
        refreshToken: 'token',
      });
    });

    it('when no last response is available', async () => {
      const unitsToWait = await lightspeed.handleRateLimit({
        method: 'POST',
      });

      expect(unitsToWait).toBe(null);
    });

    it('when last response does not have the rate limit header', async () => {
      lightspeed.setLastResponse({
        headers: {},
      });

      const unitsToWait = await lightspeed.handleRateLimit({
        method: 'POST',
      });

      expect(unitsToWait).toBe(null);
    });

    it('when available units are enough', async () => {
      lightspeed.setLastResponse({
        headers: {
          'x-ls-api-bucket-level': '60/180',
        },
      });

      const unitsToWait = await lightspeed.handleRateLimit({
        method: 'POST',
      });

      expect(unitsToWait).toBe(0);
    });

    it('when available units are not enough', async () => {
      lightspeed.setLastResponse({
        headers: {
          'x-ls-api-bucket-level': '81/90',
        },
      });

      const unitsToWait = await lightspeed.handleRateLimit({
        method: 'POST',
      });

      expect(unitsToWait).toBe(1);
    });
  });

  it('generates access token', async () => {
    const lightspeed = new Lightspeed({
      clientId: 'client',
      clientSecret: 'secret',
      refreshToken: 'token',
    });

    nock('https://cloud.merchantos.com')
      .post(/.*/, (body) => true)
      .reply(200, {
        access_token: 'access_token',
        expires_in: 1800,
        token_type: 'bearer',
        scope: 'employee:all',
      });

    const token = await lightspeed.getToken();

    expect(token.access_token).toEqual('access_token');
  });

  describe('validates paginated endpoints', () => {
    describe('for Items', () => {
      it('iterates over generator', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Item.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Item: [
              {
                itemID: '1',
              },
              {
                itemID: '2',
              },
              {
                itemID: '3',
              },
            ],
          });

        const response = await lightspeed.getItems('testAccount');

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].itemID).toEqual('1');
        expect(elements[1].itemID).toEqual('2');
        expect(elements[2].itemID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Item.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Item: [
              {
                itemID: '1',
              },
              {
                itemID: '2',
              },
              {
                itemID: '3',
              },
            ],
          });

        const elements = await lightspeed.getItems('testAccount').toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].itemID).toEqual('1');
        expect(elements[1].itemID).toEqual('2');
        expect(elements[2].itemID).toEqual('3');
      });
    });

    describe('for Categories', () => {
      it('iterates over generator', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Category.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Category: [
              {
                categoryID: '1',
              },
              {
                categoryID: '2',
              },
              {
                categoryID: '3',
              },
            ],
          });

        const response = await lightspeed.getCategories('testAccount');

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].categoryID).toEqual('1');
        expect(elements[1].categoryID).toEqual('2');
        expect(elements[2].categoryID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Category.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Category: [
              {
                categoryID: '1',
              },
              {
                categoryID: '2',
              },
              {
                categoryID: '3',
              },
            ],
          });

        const elements = await lightspeed.getCategories('testAccount').toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].categoryID).toEqual('1');
        expect(elements[1].categoryID).toEqual('2');
        expect(elements[2].categoryID).toEqual('3');
      });
    });

    describe('for Manufacturers', () => {
      it('iterates over generator', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Manufacturer.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Manufacturer: [
              {
                manufacturerID: '1',
              },
              {
                manufacturerID: '2',
              },
              {
                manufacturerID: '3',
              },
            ],
          });

        const response = await lightspeed.getManufacturers('testAccount');

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].manufacturerID).toEqual('1');
        expect(elements[1].manufacturerID).toEqual('2');
        expect(elements[2].manufacturerID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new Lightspeed({
          clientId: 'client',
          clientSecret: 'secret',
          refreshToken: 'token',
        });

        nock('https://api.merchantos.com')
          .get('/API/Account/testAccount/Manufacturer.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Manufacturer: [
              {
                manufacturerID: '1',
              },
              {
                manufacturerID: '2',
              },
              {
                manufacturerID: '3',
              },
            ],
          });

        const elements = await lightspeed.getManufacturers('testAccount').toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].manufacturerID).toEqual('1');
        expect(elements[1].manufacturerID).toEqual('2');
        expect(elements[2].manufacturerID).toEqual('3');
      });
    });
  });
});
