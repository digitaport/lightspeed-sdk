export type SearchOperator = '=' | '>' | '>=' | '<' | '<=' | '><' | '!=' | '~' | '!~' | 'IN' | 'or';

export type SearchParam = [SearchOperator, string];

export type CustomerParams =
  | 'firstName'
  | 'lastName'
  | 'dob'
  | 'archived'
  | 'title'
  | 'company'
  | 'companyRegistrationNumber'
  | 'vatNumber'
  | 'createTime'
  | 'timeStamp'
  | 'creditAccountID'
  | 'customerTypeID'
  | 'discountID'
  | 'taxCategoryID';

export type CustomerSearchParams = {
  [k in CustomerParams]?: SearchParam | string;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type PostCustomer = Optional<
  Customer,
  'customerID' | 'createTime' | 'timeStamp' | 'archived'
>;

export type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: 'bearer';
  scope: string;
  refresh_token: string;
};

export type Customer = {
  customerID: number;
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  companyRegistrationNumber?: string;
  vatNumber?: string;
  createTime: string;
  timeStamp: string;
  archived: string;
  contactID?: string;
  creditAccountID?: string;
  customerTypeID?: string;
  discountID?: string;
  taxCategoryID?: string;
  Contact?: {
    contactID?: string;
    custom?: string;
    noEmail?: string;
    noPhone?: string;
    noMail?: string;
    Addresses?: {
      ContactAddress?: {
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        countryCode?: string;
        stateCode?: string;
      };
    };
    Phones?: {
      ContactPhone: {
        number: string;
        useType: 'Home' | 'Work' | 'Mobile' | 'Pager' | 'Fax';
      };
    };
    Emails?: {
      ContactEmail: {
        address: string;
        useType: 'Primary' | 'Secondary';
      };
    };
    Websites?: string;
    timeStamp?: string;
  };
  CustomFieldValues?: {
    CustomFieldValue: {
      customFieldValueID: string;
      customFieldID: string;
      name: string;
      type: string;
      value: string;
    };
  };
};

export type CustomFieldValue = {
  customFieldID: number;
  customFieldValueID: number;
  name: string;
  type: 'boolean' | 'string' | 'integer' | 'date' | 'float';
  value: string;
};

export type ItemShop = {
  backorder: number;
  componentBackorder: number;
  componentQoh: number;
  itemID: number;
  itemShopID: number;
  m: {
    layaways: number;
    specialorders: number;
    workorders: number;
  };
  qoh: number;
  reorderLevel: number;
  reorderPoint: number;
  sellable: number;
  shopID: number;
  timeStamp: string;
};

export type ItemPrice = {
  amount: number;
  useType: string;
  useTypeID: number;
};

export type Item = {
  CustomFieldValues?: {
    CustomFieldValue: CustomFieldValue[];
  };
  ItemShops?: {
    ItemShop: ItemShop[];
  };
  Manufacturer: {
    createTime: string;
    manufacturerID: number;
    name: string;
    timeStamp: string;
  };
  Prices: {
    ItemPrice: ItemPrice[];
  };
  archived: boolean;
  avgCost: number;
  categoryID: number;
  createTime: string;
  customSku: string;
  defaultCost: number;
  defaultVendorID: number;
  departmentID: number;
  description: string;
  discountable: string;
  ean: number;
  itemID: number;
  itemMatrixID: number;
  itemType: string;
  manufacturerID: number;
  manufacturerSku: string;
  modelYear: number;
  publishToEcom: boolean;
  seasonID: number;
  serialized: boolean;
  systemSku: number;
  tax: boolean;
  taxClassID: number;
  timeStamp: string;
  upc: string;
};

export type PaymentType = {
  paymentTypeID: number;
  name: string;
  requireCustomer: boolean;
  archived: boolean;
  internalReserved: boolean;
  type: 'cash' | 'gift card' | 'credit account' | 'user defined' | 'ecom';
  refundAsPaymentTypeID: number;
};

export type TaxCategory = {
  taxCategoryID: number;
  isTaxInclusive: boolean;
  tax1Name: string;
  tax2Name: string;
  tax1Rate: number;
  tax2Rate: number;
  timeStamp: string;
};

export type Shop = {
  shopID: number;
  name: string;
  serviceRate: number;
  timeZone: string;
  taxLabor: boolean;
  labelTitle: string;
  labelMsrp: boolean;
  archived: boolean;
  timeStamp: string;
  companyRegistrationNumber?: string;
  vatNumber?: string;
  zebraBrowserPrint: boolean;
  contactID: number;
  taxCategoryID: number;
  receiptSetupID: number;
  vendorID: number;
  ccGatewayID: number;
  gatewayConfigID?: string;
  priceLevelID?: string;
};

export type SalePayment = {
  amount: number;
  paymentTypeID: number;
  registerID: number;
  employeeID: number;
};

export type SalePaymentArrayType = {
  SalePayment: SalePayment;
};

export type SaleLine = {
  unitQuantity: number;
  unitPrice: number;
  itemID: number;
  taxClassID: number;
  tax1Rate?: number;
  tax2Rate?: number;
  tax: boolean;
};

export type SaleLineArrayType = {
  SaleLine: SaleLine;
};

export type PostSale = Optional<
  Sale,
  | 'saleID'
  | 'createTime'
  | 'updateTime'
  | 'timeStamp'
  | 'archived'
  | 'isTaxInclusive'
  | 'tax1Rate'
  | 'MetaData'
  | 'calcAvgCost'
  | 'calcDiscount'
  | 'calcFIFOCost'
  | 'calcNonTaxable'
  | 'calcPayments'
  | 'calcSubtotal'
  | 'calcTax1'
  | 'calcTax2'
  | 'calcTaxable'
  | 'calcTips'
  | 'calcTotal'
  | 'change'
  | 'discountID'
  | 'displayableSubtotal'
  | 'displayableTotal'
  | 'quoteID'
  | 'receiptPreference'
  | 'shipToID'
  | 'tax2Rate'
  | 'taxTotal'
  | 'ticketNumber'
  | 'tipEmployeeID'
  | 'tipEnabled'
  | 'total'
  | 'totalDue'
  | 'discountPercent'
  | 'voided'
  | 'completeTime'
  | 'referenceNumber'
  | 'referenceNumberSource'
>;

export type Sale = {
  saleID: number;
  timeStamp: string;
  discountPercent: number;
  completed: boolean;
  archived: boolean;
  voided: boolean;
  enablePromotions: boolean;
  isTaxInclusive: boolean;
  tipEnabled: boolean;
  createTime: string;
  updateTime: string;
  completeTime: string;
  referenceNumber: number;
  referenceNumberSource: string;
  tax1Rate: number;
  tax2Rate: number;
  change: number;
  receiptPreference: string;
  displayableSubtotal: number;
  ticketNumber: number;
  calcDiscount: number;
  calcTotal: number;
  calcSubtotal: number;
  calcTaxable: number;
  calcNonTaxable: number;
  calcAvgCost: number;
  calcFIFOCost: number;
  calcTax1: number;
  calcTax2: number;
  calcPayments: number;
  calcTips: number;
  total: number;
  totalDue: number;
  displayableTotal: number;
  balance?: number;
  customerID: number;
  discountID: number;
  employeeID: number;
  quoteID: number;
  registerID: number;
  shipToID: number;
  shopID: number;
  taxCategoryID: number;
  tipEmployeeID: number;
  Customer?: Customer;
  Shop?: Shop;
  TaxCategory?: TaxCategory;
  SaleLines: SaleLineArrayType[];
  SalePayments: SalePaymentArrayType[];
  MetaData: any;
  taxTotal: number;
};
