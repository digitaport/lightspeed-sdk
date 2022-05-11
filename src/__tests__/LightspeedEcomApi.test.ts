import { Order } from '../clients/EcomTypes';
const nock = require('nock');

import LightspeedEcomApi from '../clients/LightspeedEcomApi';
const AccountData = require('./ecom-responses/account');
const OrdersData = require('./ecom-responses/orders');

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
  });
});
