import LightspeedRetailApi from '../clients/LightspeedRetailApi';
import nock = require('nock');

describe('LightspeedRetailApi Retail Api', () => {
  it('has all the methods available', () => {
    const lightspeed = new LightspeedRetailApi({
      clientId: 'client',
      clientSecret: 'secret',
      refreshToken: 'token',
    });

    expect(typeof lightspeed).toBe('object');
    expect(typeof lightspeed.getAccount).toBe('function');
    expect(typeof lightspeed.getToken).toBe('function');
    expect(typeof lightspeed.getItems).toBe('function');
    expect(typeof lightspeed.getItemById).toBe('function');
    expect(typeof lightspeed.getManufacturers).toBe('function');
    expect(typeof lightspeed.getSales).toBe('function');
    expect(typeof lightspeed.getSalePaymentByID).toBe('function');
    expect(typeof lightspeed.getSalePaymentBySaleID).toBe('function');
    expect(typeof lightspeed.getSaleLineBySaleID).toBe('function');
    expect(typeof lightspeed.getSaleLineByID).toBe('function');
    expect(typeof lightspeed.getPaymentTypeByID).toBe('function');
    expect(typeof lightspeed.getShopByID).toBe('function');
    expect(typeof lightspeed.getCustomerByID).toBe('function');
    expect(typeof lightspeed.getContactByID).toBe('function');
    expect(typeof lightspeed.getItemMatrixByID).toBe('function');
    expect(typeof lightspeed.getItemsByMatrixID).toBe('function');
    expect(typeof lightspeed.getItemByCustomSku).toBe('function');
    expect(typeof lightspeed.getItemById).toBe('function');
    expect(typeof lightspeed.getCategories).toBe('function');
    expect(typeof lightspeed.getCustomers).toBe('function');
    expect(typeof lightspeed.getCustomerTypes).toBe('function');
    expect(typeof lightspeed.postItem).toBe('function');
    expect(typeof lightspeed.postCustomer).toBe('function');
    expect(typeof lightspeed.postCustomerType).toBe('function');
    expect(typeof lightspeed.postItemAttributeSet).toBe('function');
    expect(typeof lightspeed.postItemMatrix).toBe('function');
    expect(typeof lightspeed.postItemCustomField).toBe('function');
    expect(typeof lightspeed.postPaymentMethod).toBe('function');
    expect(typeof lightspeed.postCustomerCustomField).toBe('function');
    expect(typeof lightspeed.putItem).toBe('function');
    expect(typeof lightspeed.putItemMatrix).toBe('function');
    expect(typeof lightspeed.putCustomer).toBe('function');
  });

  describe('manages rate limit properly', () => {
    let lightspeed;

    beforeAll(() => {
      lightspeed = new LightspeedRetailApi({
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
    const lightspeed = new LightspeedRetailApi({
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
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Item.json?load_relations=%5B%22ItemShops%22%2C%20%22Images%22%2C%20%22Manufacturer%22%5D&offset=0&limit=100'
          )
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

        const response = lightspeed.getItems(12345);

        const elements = [];
        for await (const item of response) {
          console.log(item);
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].itemID).toEqual('1');
        expect(elements[1].itemID).toEqual('2');
        expect(elements[2].itemID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Item.json?load_relations=%5B%22ItemShops%22%2C%20%22Images%22%2C%20%22Manufacturer%22%5D&offset=0&limit=100'
          )
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

        const elements = await lightspeed.getItems(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].itemID).toEqual('1');
        expect(elements[1].itemID).toEqual('2');
        expect(elements[2].itemID).toEqual('3');
      });
    });

    describe('for Categories', () => {
      it('iterates over generator', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/Category.json?offset=0&limit=100')
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

        const response = await lightspeed.getCategories(12345);

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
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/Category.json?offset=0&limit=100')
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

        const elements = await lightspeed.getCategories(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].categoryID).toEqual('1');
        expect(elements[1].categoryID).toEqual('2');
        expect(elements[2].categoryID).toEqual('3');
      });
    });

    describe('for Manufacturers', () => {
      it('iterates over generator', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/Manufacturer.json?offset=0&limit=100')
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

        const response = await lightspeed.getManufacturers(12345);

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
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/Manufacturer.json?offset=0&limit=100')
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

        const elements = await lightspeed.getManufacturers(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].manufacturerID).toEqual('1');
        expect(elements[1].manufacturerID).toEqual('2');
        expect(elements[2].manufacturerID).toEqual('3');
      });
    });

    describe('for Customers', () => {
      it('iterates over generator', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Customer.json?load_relations=%5B%22Contact%22%2C%20%22CustomFieldValues%22%5D&offset=0&limit=100'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: [
              {
                customerID: '1',
              },
              {
                customerID: '2',
              },
              {
                customerID: '3',
              },
            ],
          });

        const response = await lightspeed.getCustomers(12345);

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].customerID).toEqual('1');
        expect(elements[1].customerID).toEqual('2');
        expect(elements[2].customerID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Customer.json?load_relations=%5B%22Contact%22%2C%20%22CustomFieldValues%22%5D&offset=0&limit=100'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: [
              {
                customerID: '1',
              },
              {
                customerID: '2',
              },
              {
                customerID: '3',
              },
            ],
          });

        const elements = await lightspeed.getCustomers(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].customerID).toEqual('1');
        expect(elements[1].customerID).toEqual('2');
        expect(elements[2].customerID).toEqual('3');
      });

      it('allows search Params', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Customer.json?load_relations=%5B%22Contact%22%2C%20%22CustomFieldValues%22%5D&title=~%2C%25Barf%25&lastName=Sagat&firstName=Bob&offset=0&limit=100'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: [
              {
                customerID: '1',
              },
              {
                customerID: '2',
              },
              {
                customerID: '3',
              },
            ],
          });

        const elements = await lightspeed
          .getCustomers(12345, {
            firstName: 'Bob',
            lastName: ['=', 'Sagat'],
            title: ['~', '%Barf%'],
          })
          .toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].customerID).toEqual('1');
        expect(elements[1].customerID).toEqual('2');
        expect(elements[2].customerID).toEqual('3');
      });
    });

    describe('for Customer Types', () => {
      it('iterates over generator', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/CustomerType.json?offset=0&limit=100')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            CustomerType: [
              {
                customerTypeID: '1',
              },
              {
                customerTypeID: '2',
              },
              {
                customerTypeID: '3',
              },
            ],
          });

        const response = await lightspeed.getCustomerTypes(12345);

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].customerTypeID).toEqual('1');
        expect(elements[1].customerTypeID).toEqual('2');
        expect(elements[2].customerTypeID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get('/API/Account/12345/CustomerType.json?offset=0&limit=100')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            CustomerType: [
              {
                customerTypeID: '1',
              },
              {
                customerTypeID: '2',
              },
              {
                customerTypeID: '3',
              },
            ],
          });

        const elements = await lightspeed.getCustomerTypes(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].customerTypeID).toEqual('1');
        expect(elements[1].customerTypeID).toEqual('2');
        expect(elements[2].customerTypeID).toEqual('3');
      });
    });

    describe('for Sales', () => {
      it('iterates over generator', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Sale.json?load_relations=%5B%22TaxCategory%22%2C%22SaleLines%22%2C%22SaleLines.Item%22%2C%22SalePayments%22%2C%22SalePayments.PaymentType%22%2C%22Customer%22%2C%22Discount%22%2C%22Customer.Contact%22%5D&offset=0&limit=100'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Sale: [
              {
                saleID: '1',
              },
              {
                saleID: '2',
              },
              {
                saleID: '3',
              },
            ],
          });

        const response = await lightspeed.getSales(12345);

        const elements = [];
        for await (const item of response) {
          elements.push(item);
        }

        expect(elements.length).toEqual(3);
        expect(elements[0].saleID).toEqual('1');
        expect(elements[1].saleID).toEqual('2');
        expect(elements[2].saleID).toEqual('3');
      });

      it('iterates over array with toArray()', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Sale.json?load_relations=%5B%22TaxCategory%22%2C%22SaleLines%22%2C%22SaleLines.Item%22%2C%22SalePayments%22%2C%22SalePayments.PaymentType%22%2C%22Customer%22%2C%22Discount%22%2C%22Customer.Contact%22%5D&offset=0&limit=100'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Sale: [
              {
                saleID: '1',
              },
              {
                saleID: '2',
              },
              {
                saleID: '3',
              },
            ],
          });

        const elements = await lightspeed.getSales(12345).toArray();

        expect(elements.length).toEqual(3);
        expect(elements[0].saleID).toEqual('1');
        expect(elements[1].saleID).toEqual('2');
        expect(elements[2].saleID).toEqual('3');
      });
    });
  });

  describe('validates one result endpoints', () => {
    describe('for Item', () => {
      it('gets the Item with a specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.merchantos.com')
          .get(
            '/API/Account/12345/Item/1.json?load_relations=%5B%22ItemShops%22%2C%22Images%22%2C%22Manufacturer%22%2C%22CustomFieldValues%22%2C%22CustomFieldValues.value%22%5D'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Item: {
              itemID: '1',
            },
          });

        const item = await lightspeed.getItemById(12345, '1');
        expect(item.itemID).toEqual('1');
      });

      it('gets the Item Matrix with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/ItemMatrix/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            ItemMatrix: {
              itemMatrixID: '1',
            },
          });

        const response = await lightspeed.getItemMatrixByID(12345, '1');
        expect(response.ItemMatrix.itemMatrixID).toEqual('1');
      });

      it('gets the Items from an specific Matrix ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/Item.json?itemMatrixID=1')
          .reply(200, {
            '@attributes': {
              count: '2',
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
            ],
          });

        const response = await lightspeed.getItemsByMatrixID(12345, '1');
        expect(response.Item.length).toEqual(2);
        expect(response.Item[0].itemID).toEqual('1');
        expect(response.Item[1].itemID).toEqual('2');
      });

      it('gets the Items from an specific Custom Sku', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/Item.json?customSku=1')
          .reply(200, {
            '@attributes': {
              count: '2',
              offset: '0',
              limit: '100',
            },
            Item: {
              customSku: '1',
            },
          });

        const response = await lightspeed.getItemByCustomSku(12345, '1');
        expect(response.Item.customSku).toEqual('1');
      });
    });

    describe('for Customer', () => {
      it('gets the Customer with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get(
            '/API/Account/12345/Customer/1.json?load_relations=[%22CustomFieldValues%22,%20%22CustomFieldValues.value%22]'
          )
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: {
              customerID: '1',
            },
          });

        const response = await lightspeed.getCustomerByID(12345, '1');
        expect(response.Customer.customerID).toEqual('1');
      });

      it('gets the Customers Contact with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/Contact/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Contact: {
              contactID: '1',
            },
          });

        const response = await lightspeed.getContactByID(12345, '1');
        expect(response.Contact.contactID).toEqual('1');
      });
    });

    describe('for Sale', () => {
      it('gets the Sale Payment with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/SalePayment/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            SalePayment: {
              salePaymentID: '1',
            },
          });

        const response = await lightspeed.getSalePaymentByID(12345, '1');
        expect(response.SalePayment.salePaymentID).toEqual('1');
      });

      it('gets the Sale Payments with an specific Sale ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/SalePayment.json?saleID=1')
          .reply(200, {
            '@attributes': {
              count: '2',
              offset: '0',
              limit: '100',
            },
            SalePayment: [
              {
                salePaymentID: '1',
              },
              {
                salePaymentID: '2',
              },
            ],
          });

        const response = await lightspeed.getSalePaymentBySaleID(12345, '1');
        expect(response.SalePayment.length).toEqual(2);
        expect(response.SalePayment[0].salePaymentID).toEqual('1');
        expect(response.SalePayment[1].salePaymentID).toEqual('2');
      });

      it('gets the Sale Line with an specific Sale ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/SaleLine.json?saleID=1')
          .reply(200, {
            '@attributes': {
              count: '2',
              offset: '0',
              limit: '100',
            },
            SaleLine: [
              {
                saleLineID: '1',
              },
              {
                saleLineID: '2',
              },
            ],
          });

        const response = await lightspeed.getSaleLineBySaleID(12345, '1');
        expect(response.SaleLine.length).toEqual(2);
        expect(response.SaleLine[0].saleLineID).toEqual('1');
        expect(response.SaleLine[1].saleLineID).toEqual('2');
      });

      it('gets the Sale Line with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/SaleLine/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            SaleLine: {
              saleLineID: '1',
            },
          });

        const response = await lightspeed.getSaleLineByID(12345, '1');
        expect(response.SaleLine.saleLineID).toEqual('1');
      });

      it('gets the Sale Payment Type with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/PaymentType/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            PaymentType: {
              paymentTypeID: '1',
            },
          });

        const response = await lightspeed.getPaymentTypeByID(12345, '1');
        expect(response.PaymentType.paymentTypeID).toEqual('1');
      });

      it('gets the Sales Shop with an specific ID', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .get('/API/Account/12345/Shop/1.json')
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Shop: {
              shopID: '1',
            },
          });

        const response = await lightspeed.getShopByID(12345, '1');
        expect(response.Shop.shopID).toEqual('1');
      });
    });
  });

  describe('validates post endpoints', () => {
    describe('for Customer', () => {
      it('posts a Customer', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/Customer.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: {
              customerID: '1',
            },
          });

        const response = await lightspeed.postCustomer(12345, {
          firstName: 'Bob',
          lastName: 'Sagat',
        });
        expect(response.customerID).toEqual('1');
      });

      it('posts a Sale', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/Sale.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Sale: {
              saleID: '1',
            },
          });

        // @ts-ignore
        const response = await lightspeed.postSale(12345, { completed: true });
        expect(response.saleID).toEqual('1');
      });

      it('posts a Customer Type', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/CustomerType.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            CustomerType: {
              customerTypeID: '1',
            },
          });

        const response = await lightspeed.postCustomerType(12345, { customerTypeID: '1' });
        expect(response.CustomerType.customerTypeID).toEqual('1');
      });

      it('posts a Customer Custom Field', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/Customer/CustomField.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            CustomField: {
              customFieldID: '1',
            },
          });

        const response = await lightspeed.postCustomerCustomField(12345, {
          customFieldID: '1',
        });
        expect(response.CustomField.customFieldID).toEqual('1');
      });
    });

    describe('for Item', () => {
      it('posts an Item', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/Item.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Item: {
              itemID: '1',
            },
          });

        const response = await lightspeed.postItem(12345, { itemID: '1' });
        expect(response.Item.itemID).toEqual('1');
      });

      it('posts an Item Attribute Set', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/ItemAttributeSet.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            ItemAttributeSet: {
              itemAttributeSetID: '1',
            },
          });

        const response = await lightspeed.postItemAttributeSet(12345, {
          itemAttributeSetID: '1',
        });
        expect(response.ItemAttributeSet.itemAttributeSetID).toEqual('1');
      });

      it('posts an Item Matrix', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/ItemMatrix.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            ItemMatrix: {
              itemMatrixID: '1',
            },
          });

        const response = await lightspeed.postItemMatrix(12345, { itemMatrixID: '1' });
        expect(response.ItemMatrix.itemMatrixID).toEqual('1');
      });

      it('posts an Item Custom Field', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/Item/CustomField.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            CustomField: {
              customFieldID: '1',
            },
          });

        const response = await lightspeed.postItemCustomField(12345, {
          customFieldID: '1',
        });
        expect(response.CustomField.customFieldID).toEqual('1');
      });
    });

    describe('for Sale', () => {
      it('posts a Sale Payment Type', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .post('/API/Account/12345/PaymentType.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            PaymentType: {
              paymentTypeID: '1',
            },
          });

        const response = await lightspeed.postPaymentMethod(12345, { paymentTypeID: '1' });
        expect(response.PaymentType.paymentTypeID).toEqual('1');
      });
    });
  });

  describe('validates update endpoints', () => {
    describe('for Customer', () => {
      it('updates a Customer', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .put('/API/Account/12345/Customer/1.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Customer: {
              customerID: '1',
            },
          });

        const response = await lightspeed.putCustomer(12345, { customerID: '1' }, '1');
        expect(response.Customer.customerID).toEqual('1');
      });
    });

    describe('for Item', () => {
      it('updates an Item', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .put('/API/Account/12345/Item/1.json', (body) => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            Item: {
              itemID: '1',
            },
          });

        const response = await lightspeed.putItem(12345, { itemID: '1' }, '1');
        expect(response.Item.itemID).toEqual('1');
      });

      it('updates an Item Matrix', async () => {
        const lightspeed = new LightspeedRetailApi({
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

        nock('https://api.lightspeedapp.com')
          .put('/API/Account/12345/ItemMatrix/1.json', () => true)
          .reply(200, {
            '@attributes': {
              count: '1',
              offset: '0',
              limit: '100',
            },
            ItemMatrix: {
              itemMatrixID: '1',
            },
          });

        const response = await lightspeed.putItemMatrix(12345, { itemMatrixID: '1' }, '1');
        expect(response.ItemMatrix.itemMatrixID).toEqual('1');
      });
    });
  });
});
