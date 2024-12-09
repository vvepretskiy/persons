import { getAverageHeight } from "./parser";

describe('getAverageHeight', () => {
    it('should return "0" for an empty array', () => {
        const result = getAverageHeight([]);
        expect(result).toBe('0');
    });

    it('should return the average height as a string with no decimal if the average is a whole number', () => {
        const data = [{ height: '160' }, { height: '180' }, { height: '160' }];
        const result = getAverageHeight(data);
        expect(result).toBe('166.7');
    });

    it('should return the average height as a string with one decimal if the average is not a whole number', () => {
        const data = [{ height: '160' }, { height: '170' }, { height: '180' }];
        const result = getAverageHeight(data);
        expect(result).toBe('170');
    });

    it('should handle non-numeric height values gracefully', () => {
        const data = [{ height: '160' }, { height: 'abc' }, { height: '180' }];
        const result = getAverageHeight(data);
        expect(result).toBe('170');
    });

    it('should handle all non-numeric height values and return "0"', () => {
        const data = [{ height: 'abc' }, { height: 'def' }];
        const result = getAverageHeight(data);
        expect(result).toBe('0');
    });

    it('should handle mixed numeric and non-numeric height values', () => {
        const data = [{ height: '150' }, { height: '200' }, { height: 'xyz' }];
        const result = getAverageHeight(data);
        expect(result).toBe('175');
    });
});
