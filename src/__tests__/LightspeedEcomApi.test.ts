import { Order, OrderProduct } from '../clients/EcomTypes';
const nock = require('nock');

import LightspeedEcomApi from '../clients/LightspeedEcomApi';
const AccountData = require('./ecom-responses/account');
const OrdersData = require('./ecom-responses/orders');
const OrderProductsData = require('./ecom-responses/orderProducts');
const VariantProductsData = require('./ecom-responses/productVariants');
const VariantData = require('./ecom-responses/variant');

describe('LightspeedEcom class', () => {
  describe('GET methods', () => {
    const apiKey = 'deadbeef';
    const apiSecret = 'deadbeef2';
    const clusterId = 'us1';
    let client;

    beforeAll(() => {
      client = new LightspeedEcomApi({ apiKey, apiSecret, clusterId });
    });

    it('getAccount', async () => {
      nock('https://api.shoplightspeed.com').get('/us/account.json').reply(200, AccountData);

      const accountData = await client.getAccount();

      expect(accountData.account.id).toBe(123456);
    });

    it('getOrders', async () => {
      nock('https://api.shoplightspeed.com')
        .get('/us/orders/count.json?')
        .reply(200, { count: 16816 });
      nock('https://api.shoplightspeed.com')
        .get('/us/orders.json?offset=0&limit=250')
        .reply(200, OrdersData);
      nock('https://api.shoplightspeed.com')
        .get('/us/orders.json?offset=50&limit=250')
        .reply(200, OrdersData);

      const orderData = client.getOrders();

      expect(await orderData.getCount()).toBe(16816);
      const itemIter = await orderData.items();
      const firstItem: Order = (await itemIter.next()).value;
      expect(firstItem.id).toBe(12016672);
      for (let i in Array(50).fill(1)) {
        await itemIter.next();
      }
    });

    it('getOrderProducts', async () => {
      nock('https://api.shoplightspeed.com')
        .get('/us/orders/12036643/products/count.json?')
        .reply(200, { count: 1 });
      nock('https://api.shoplightspeed.com')
        .get('/us/orders/12036643/products.json?offset=0&limit=250')
        .reply(200, OrderProductsData);

      const productData = client.getOrderProducts(12036643);

      expect(await productData.getCount()).toBe(1);
      const itemIter = await productData.items();
      const firstItem: OrderProduct = (await itemIter.next()).value;
      expect(firstItem.id).toBe(24147495);
    });

    it('getProductVariants', async () => {
      nock('https://api.shoplightspeed.com')
        .get('/us/variants.json?product=36211963')
        .reply(200, VariantProductsData);
      const variantData = await client.getProductVariants(36211963);

      expect(variantData.length).toBe(1);
      expect(variantData[0].id).toBe(59479682);
    });

    it('getVariant', async () => {
      nock('https://api.shoplightspeed.com')
        .get('/us/variants/59479682.json')
        .reply(200, VariantData);
      const variant = await client.getVariant(59479682);

      expect(variant.id).toBe(59479682);
    });
  });
});
