import { Injectable, Logger } from "@nestjs/common";
import { People } from "@persons/shared";
import { Trie } from "../utils/trie";
import { getAverageHeight } from "../utils/parser";
import { PeopleProvider } from "./people.provider";

type TypeCachedPeopleByPage = { [key: number]: People };

const PAGE_SIZE = 10;

@Injectable()
export class PeopleCache {
    private peoplePageCache: TypeCachedPeopleByPage = {};
    private peopleFilterCache: Trie<TypeCachedPeopleByPage> = new Trie<TypeCachedPeopleByPage>();
    private lastCacheUpdate: number = Date.now();
    private readonly cacheDuration: number = Number(process.env.CACHE_DURATION || 240000);

    constructor(private readonly provider: PeopleProvider) { }

    async tryToGet(page: number, word?: string): Promise<People> {

        const currentTime = Date.now();

        if (currentTime - this.lastCacheUpdate >= this.cacheDuration) {
            Logger.log('Cache expired, resetting cache');
            this.peoplePageCache = {};
            this.peopleFilterCache = new Trie<TypeCachedPeopleByPage>();
            this.lastCacheUpdate = currentTime;
        }

        if (word) {
            return await this.tryToGetFilterCache(page, word);
        }

        if (!this.peoplePageCache[page]) {
            Logger.log(`Fetch data page = ${page}`);
            await this.fetch(page, true)
        }

        return this.peoplePageCache[page];
    }

    private async tryToGetFilterCache(page: number, word: string) {
        const notCaseSensetiveWord = word.toLocaleLowerCase();
        const cacheData = this.peopleFilterCache.search(notCaseSensetiveWord);

        if (cacheData?.isMatched) {
            Logger.log(`Search: ${notCaseSensetiveWord} isMatched`);
            return cacheData.data[page];
        }

        let data: TypeCachedPeopleByPage;

        if (!cacheData) {
            Logger.log(`Fetch data page = ${page} search = ${notCaseSensetiveWord}`);

            await this.fetch(page);

            data = this.peoplePageCache;
        } else {
            Logger.log(`Search: ${notCaseSensetiveWord} not isMatched`);
            data = cacheData.data;
        }

        const allData = Object.keys(data).flatMap((pageNumber) => {
            return data[parseInt(pageNumber)].data.filter((person) => {
                const result = Object.keys(person).some((key) => key !== 'height' && person[key].toLocaleLowerCase().indexOf(notCaseSensetiveWord) !== -1);
                return result;
            })
        });

        const totalDataCount = allData.length;

        if (totalDataCount > 0) {

            const count = Math.ceil(totalDataCount / PAGE_SIZE);
            const cache: TypeCachedPeopleByPage = {};
            for (let pageNum = 1; pageNum <= count; pageNum++) {
                const items = allData.splice(0, PAGE_SIZE);
                cache[pageNum] = {
                    data: items,
                    averageHeight: getAverageHeight(items),
                    totalCount: totalDataCount,
                };
            }

            this.peopleFilterCache.add(notCaseSensetiveWord, cache);
            return page <= count ? cache[page] : cache[count];
        } else {
            const emptyData = {
                [1]: {
                    data: [],
                    averageHeight: '0',
                    totalCount: 0
                }
            };

            this.peopleFilterCache.add(notCaseSensetiveWord, emptyData);
            return emptyData[1];
        }
    }

    public async fetch(page: number, isBackgroundAsync?: boolean): Promise<void> {
        if (!this.peoplePageCache[page]) {
            this.peoplePageCache[page] = await this.provider.fetchData(page);
        }

        const totalCount = this.peoplePageCache[page].totalCount;
        const pageCount = Math.ceil(totalCount / PAGE_SIZE);

        const promises = [];
        for (let i = 1; i <= pageCount; i++) {
            if (!this.peoplePageCache[i]) {
                promises.push(this.provider.fetchData(i).then((data) => {
                    Logger.log(`Promise fetch page ${i}`);
                    this.peoplePageCache[i] = data
                }));
            }
        }

        if (isBackgroundAsync) {
            Promise.all(promises);
            Logger.log(`Fetch in background`);
        } else {
            Logger.log(`Fetch not background`);
            await Promise.all(promises);
        }
    }
}