import { AxiosInstance } from 'axios';
import * as querystring from 'querystring';

class EcomApiCursor<T> {
  private readonly baseUrl: string;
  private readonly axiosClient: AxiosInstance;
  private readonly filters: Record<string, string>;
  private readonly resource: string;
  private recordCount: number;

  constructor(baseUrl: string, axiosClient: AxiosInstance, resource: string, filters = {}) {
    this.baseUrl = baseUrl;
    this.axiosClient = axiosClient;
    this.resource = resource;
    this.filters = filters;
  }

  public async getCount() {
    if (this.recordCount) {
      return this.recordCount;
    }
    const countResponse = await this.axiosClient.get(
      `${this.baseUrl}/count.json?${querystring.stringify(this.filters)}`
    );
    this.recordCount = countResponse.data.count;
    return this.recordCount;
  }

  async toArray(): Promise<T[]> {
    const elements = [];

    for await (const item of this.items()) {
      elements.push(item);
    }
    return elements;
  }

  public async *items(): AsyncGenerator<T, string, boolean> {
    let offset = 0;
    const limit = 250;
    const count = await this.getCount();

    while (offset < count) {
      const qs = querystring.stringify({
        ...this.filters,
        offset,
        limit,
      });
      const url = `${this.baseUrl}.json?${qs}`;

      const apiResponse = await this.axiosClient.get(url);
      const dataSet = apiResponse.data[this.resource];

      if (dataSet === undefined || !Array.isArray(dataSet)) {
        console.error('Data Set Empty');
        return 'done';
      }

      for (const element of dataSet) {
        yield element;
      }

      offset += dataSet.length;
    }
    return 'done';
  }
}

export default EcomApiCursor;
