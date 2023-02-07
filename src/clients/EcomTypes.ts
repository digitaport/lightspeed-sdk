export type TaxObject = {
  name: string;
  rate: number;
  amount: number;
};

export type AddressObject = {
  id: number;
  code: string;
  code3?: string;
  title?: string;
  name?: string;
};

export type ShipmentData = {
  method: string;
  shipment_id: number;
  shipping_value_id: number;
};

export type LanguageData = {
  id: number;
  code: string;
  locale: string;
  title: string;
};

export type ResourceLink = {
  resource: {
    id: number;
    url: string;
    link: string;
  };
};

export type ImageResource = {
  createdAt: string,
  updatedAt: string,
  extension: string,
  size: number,
  title: string,
  thumb: string,   //url
  src: string //url
};

export type PaymentData = {
  method: string;
};

export type PaymentStatus = 'not_paid' | 'partially_paid' | 'paid' | 'cancelled';

export type Account = {
  id: number;
  appId: boolean;
  apiKey: string;
  signout: ResourceLink;
  permissions: ResourceLink;
  ratelimit: ResourceLink;
  metafields: ResourceLink;
};

export type Order = {
  id: number;
  createdAt: string;
  updatedAt: string;
  number: string;
  status: string;
  customStatusId?: number;
  channel: string;
  remoteIp: string;
  userAgent: string;
  referralId: boolean;
  priceCost: number;
  priceExcl: number;
  priceIncl: number;
  weight: number;
  volume: number;
  colli: number;
  gender: boolean;
  birthDate: string;
  nationalId: string;
  email: string;
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  mobile: string;
  newsletterSubscribed: boolean;
  isCompany: boolean;
  companyName: string;
  companyCoCNumber: string;
  companyVatNumber: string;
  addressBillingName: string;
  addressBillingStreet: string;
  addressBillingStreet2: string;
  addressBillingNumber: string;
  addressBillingExtension: string;
  addressBillingZipcode: string;
  addressBillingCity: string;
  addressBillingRegion: string;
  addressBillingCountry: AddressObject;
  addressBillingRegionData: AddressObject;
  addressShippingCompany: boolean;
  addressShippingName: string;
  addressShippingStreet: string;
  addressShippingStreet2: string;
  addressShippingNumber: string;
  addressShippingExtension: string;
  addressShippingZipcode: string;
  addressShippingCity: string;
  addressShippingRegion: string;
  addressShippingCountry: AddressObject;
  addressShippingRegionData: AddressObject;
  paymentId: string;
  paymentStatus: PaymentStatus;
  paymentIsPost: boolean;
  paymentIsInvoiceExternal: boolean;
  paymentTaxRate: number;
  paymentTaxRates: TaxObject[];
  paymentBasePriceExcl: number;
  paymentBasePriceIncl: number;
  paymentPriceExcl: number;
  paymentPriceIncl: number;
  paymentTitle: string;
  paymentData: PaymentData[];
  shipmentId: string;
  shipmentStatus: string;
  shipmentIsCashOnDelivery: boolean;
  shipmentIsPickup: boolean;
  shipmentTaxRate: number;
  shipmentTaxRates: TaxObject[];
  shipmentBasePriceExcl: number;
  shipmentBasePriceIncl: number;
  shipmentPriceExcl: number;
  shipmentPriceIncl: number;
  shipmentDiscountExcl: number;
  shipmentDiscountIncl: number;
  shipmentTitle: string;
  shipmentData: ShipmentData;
  shippingDate: string;
  deliveryDate: string;
  isDiscounted: boolean;
  discountType: string;
  discountAmount: number;
  discountPercentage: number;
  discountCouponCode: string;
  taxRates: TaxObject[];
  isNewCustomer: boolean;
  comment: string;
  memo: string;
  allowNotifications: boolean;
  doNotifyNew: boolean;
  doNotifyReminder: boolean;
  doNotifyCancelled: boolean;
  language: LanguageData;
  customer: ResourceLink;
  invoices: ResourceLink;
  shipments: ResourceLink;
  products: ResourceLink;
  metafields: ResourceLink;
  quote: ResourceLink;
  events: ResourceLink;
  giftCardsPayment: ResourceLink; //might be wrong?
};

export type OrderProduct = {
  id: number;
  supplierTitle: string;
  brandTitle: string;
  productTitle: string;
  variantTitle: string;
  taxRate: number;
  taxRates: TaxObject[];
  quantityOrdered: number;
  quantityInvoiced: number;
  quantityShipped: number;
  quantityRefunded: number;
  quantityReturned: number;
  articleCode: string;
  ean: string;
  sku: '';
  weight: number;
  volume: number;
  colli: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  priceCost: number;
  customExcl: number;
  customIncl: number;
  basePriceExcl: number;
  basePriceIncl: number;
  priceExcl: number;
  priceIncl: number;
  discountExcl: number;
  discountIncl: number;
  customFields: boolean;
  product: ResourceLink;
  variant: ResourceLink;
};

export type ProductVariant = {
  additionalcost: boolean;
  articleCode: string;
  colli: number;
  createdAt: string;
  ean: string;
  hs: unknown;
  id: number;
  image: boolean;
  isDefault: boolean;
  matrix: boolean;
  metafields: ResourceLink;
  movements: ResourceLink;
  oldPriceExcl: number;
  oldPriceIncl: number;
  options: unknown[];
  priceCost: number;
  priceExcl: number;
  priceIncl: number;
  product: ResourceLink;
  sizeUnit: string;
  sizeX: number;
  sizeXValue: string;
  sizeY: number;
  sizeYValue: string;
  sizeZ: number;
  sizeZValue: string;
  sku: string;
  sortOrder: number;
  stockAlert: number;
  stockBuyMaximum: number;
  stockBuyMinimum: number;
  stockBuyMininum: number;
  stockLevel: number;
  stockMinimum: number;
  stockSold: number;
  stockTracking: string;
  tax: boolean;
  taxType: string;
  title: string;
  unitPrice: number;
  unitUnit: null;
  updatedAt: string;
  volume: number;
  volumeUnit: string;
  volumeValue: number;
  weight: number;
  weightUnit: string;
  weightValue: string;
};


export type Product = {
  id: number,
  createdAt: string,
  updatedAt: string,
  isVisible: boolean,
  visibility: string,
  hasMatrix: boolean,
  data01: string,
  data02: string,
  data03: string,
  url: string,
  title: string,
  fulltitle: string,
  description: string,
  content: string,
  set: boolean,
  brand: ResourceLink,
  categories: ResourceLink,
  deliverydate: boolean,
  image: ImageResource,
  images: ResourceLink,
  relations: ResourceLink,
  metafields: ResourceLink,
  reviews: ResourceLink,
  type: boolean,
  attributes: ResourceLink,
  supplier: ResourceLink,
  tags: ResourceLink,
  variants: ResourceLink,
  movements: ResourceLink
}