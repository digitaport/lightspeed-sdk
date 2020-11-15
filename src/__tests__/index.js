const Lightspeed = require('../index');

describe('Lightspeed class', () => {
  it('has all the methods available', () => {
    const lightspeed = new Lightspeed({
      clientId: 'client',
      clientSecret: 'secret',
      refreshToken: 'token',
    });

    expect(typeof lightspeed).toBe('object');
    expect(typeof lightspeed.getAccount).toBe('function');
    expect(typeof lightspeed.getItems).toBe('function');
    expect(typeof lightspeed.getItemById).toBe('function');
    expect(typeof lightspeed.getManufacturers).toBe('function');
    expect(typeof lightspeed.getToken).toBe('function');
  });

  describe('validates constructor values', () => {
    const clientId = 'client';
    const clientSecret = 'secret';
    const refreshToken = 'token';

    it('clientId', () => {
      expect(() => new Lightspeed({ clientSecret, refreshToken })).toThrowError(
        'Param clientId is required'
      );
    });

    it('clientSecret', () => {
      expect(() => new Lightspeed({ clientId, refreshToken })).toThrowError(
        'Param clientSecret is required'
      );
    });

    it('refreshToken', () => {
      expect(() => new Lightspeed({ clientId, clientSecret })).toThrowError(
        'Param refreshToken is required'
      );
    });
  });
});
