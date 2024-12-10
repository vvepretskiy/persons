import { Trie } from './trie';

describe('Trie Tests', () => {
    let trie: Trie<number>;

    beforeEach(() => {
        trie = new Trie<number>();
    });

    test('Initialize Trie', () => {
        expect(trie.search("hello")).toBeUndefined();
    });

    test('Add Single Word', () => {
        trie.add("hello", 1);
        expect(trie.search("hello")).toEqual({ isMatched: true, data: 1 });
    });

    test('Add Multiple Words', () => {
        trie.add("hello", 1);
        trie.add("world", 2);
        expect(trie.search("hello")).toEqual({ isMatched: true, data: 1 });
        expect(trie.search("world")).toEqual({ isMatched: true, data: 2 });
    });

    test('Search for Non-Existent Word', () => {
        expect(trie.search("notfound")).toBeUndefined();
    });

    test('Add Word with Same Prefix', () => {
        trie.add("hello", 1);
        trie.add("helium", 2);
        expect(trie.search("helium")).toEqual({ isMatched: true, data: 2 });
    });

    test('Search for Prefix', () => {
        trie.add("hello", 1);
        expect(trie.search("hel")).toBeUndefined();
    });

    test('Overwrite Data for Existing Word', () => {
        trie.add("hello", 1);
        trie.add("hello", 3);
        expect(trie.search("hello")).toEqual({ isMatched: true, data: 3 });
    });
});
