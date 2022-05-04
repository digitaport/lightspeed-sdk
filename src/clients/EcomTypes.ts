export type AddressObject = {
  id: number;
  code: string;
  code3?: string;
  title?: string;
};

export type TaxObject = {
  name: string;
  rate: number;
  amount: number;
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
