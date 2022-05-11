# Lightspeed SDK

**Note**: _This is not a Lightspeed official package._

[![npm version](https://badge.fury.io/js/lightspeed-sdk.svg)](https://badge.fury.io/js/lightspeed-sdk)

## Installation

Use your favorite package manager to install any of the packages and save to your package.json:

```
npm install lightspeed-sdk
```

## Usage

Import the Retail API and initialize it:

```js
const { LightspeedRetailApi } = import 'lightspeed-sdk';

const retailApi= new LightspeedRetailApi({
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  refreshToken: 'REFRESH_TOKEN',
});
```

Import the Ecom API and initialize it:

```js
const { LightspeedEcomApi } = import 'lightspeed-sdk';

const ecomApi = new LightspeedEcomApi({ 
  apiKey: 'my_api_key', 
  apiSecret: 'my_api_key', 
  clusterId: 'US1', 
});
```

### Retail API Examples

Post customer information:

```js
const customer = await retailApi.postCustomer(customer);
```

Update customer information:

```js
const customer = await retailApi.putCustomer(customer, customerID);
```

Retrieve account information:

```js
const account = await retailApi.getAccount();
```

Retrieve items by id:

```js
const item = await retailApi.getItemById('accountNumber', 'id');
```

Retrieve all items:

```js
const items = await retailApi.getItems('accountNumber');
for await (const item of items) {
  console.log(item); // { itemID: 'X', ... }
}
```

or

```js
const items = await retailApi.getItems('accountNumber').toArray();
console.log(items); // [{ itemID: 'X', ... }, {...}]
```

### Retail Pagination

Pagination is handled by the SDK by returning a cursor when querying:

- getItems
- getCategories
- getManufacturers
- getSales
- getSaleLineBySaleID
- getSalePaymentBySaleID
- getItemsByMatrixID
- getCustomers
- getCustomerTypes

The object has an [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator)
so you can do a `for await` loop to retrieve all the items,
or load all at the same time by doing `.toArray()` on the object. Doing `.toArray()` could lead to performance
issues if the collection is too big.

## Ecom API Examples

Retrieve account information:

```js
const account = await ecomApi.getAccount();
```

Get orders:

```js
const orders = await ecomApi.getOrders();
```

### Ecom Pagination

Pagination in the ecom api works similarly to the retail api with some minor differences

```js
const orders = await ecomApi.getOrders();
console.log('Number of orders=', orders.getCount());
const iterator = orders.items();
const firstItem = await iterator.next().value;
```


## Requirements

This package supports Node v8 LTS and higher. It's highly recommended to use the latest LTS version of node, and the documentation is written using syntax and features from that version.
