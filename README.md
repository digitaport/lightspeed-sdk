# Lightspeed SDK

**Note**: _This is not a Lightspeed official package._

[![npm version](https://badge.fury.io/js/lightspeed-sdk.svg)](https://badge.fury.io/js/lightspeed-sdk)

## Installation

Use your favorite package manager to install any of the packages and save to your package.json:

```
npm install lightspeed-sdk
```

## Usage

Create an instance of Lightspeed class:

```js
const lightspeed = new Lightspeed({
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  refreshToken: 'REFRESH_TOKEN',
});
```

### Examples

Retrieve account information:

```js
const account = await lightspeed.getAccount();
```

Retrieve items by id:

```js
const item = await lightspeed.getItemById('accountNumber', 'id');
```

Retrieve all items:

```js
const items = await lightspeed.getItems('accountNumber');
for await (const item of items) {
  console.log(item); // { itemID: 'X', ... }
}
```

or

```js
const items = await lightspeed.getItems('accountNumber').toArray();
console.log(items); // [{ itemID: 'X', ... }, {...}]
```

### Pagination

Pagination is handled by the SDK by returning a cursor when querying:

- getItems
- getCategories
- getManufacturers

The object has an [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator)
so you can do a `for await` loop to retrieve all the items,
or load all at the same time by doing `.toArray()` on the object. Doing `.toArray()` could lead to performance
issues if the collection is too big.

## Requirements

This package supports Node v8 LTS and higher. It's highly recommended to use the latest LTS version of node, and the documentation is written using syntax and features from that version.
