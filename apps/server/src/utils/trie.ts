class TrieNode<T> {
    public data: T;
    public children: { [key: string]: TrieNode<T> };
    public isEnd: boolean;

    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}

export class Trie<T> {
    private root: TrieNode<T>;
    constructor() {
        this.root = new TrieNode<T>();
    }

    add(word: string, data: T) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEnd = true;
        node.data = data;
    }

    search(word: string): { isMatched: boolean, data: T } {
        let node = this.root;
        let matchedData = null;
        let isMatched = false;

        for (let idx = 0; idx < word.length; idx++) {
            const char = word[idx];
            if (!node.children[char]) {
                break;
            }
            node = node.children[char];

            if (node.isEnd) {
                isMatched = idx === word.length - 1;
                matchedData = node.data;
            }
        }

        return matchedData ? { isMatched, data: matchedData } : undefined;
    }
}
