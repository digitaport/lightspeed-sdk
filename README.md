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

## Requirements

This package supports Node v8 LTS and higher. It's highly recommended to use the latest LTS version of node, and the documentation is written using syntax and features from that version.
