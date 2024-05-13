import * as testHelper from 'Helpers/tests';

describe('Log', () => {
  describe('format', () => {
    test('format возвращает корректные значения', () => {
      const log = testHelper.createMockLog({ id: '1', msg: '2', date: '3' });

      expect(log.format()).toEqual({ id: '1', msg: '2', date: '3' });
    });
  });
});
