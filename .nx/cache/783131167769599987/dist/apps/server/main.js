/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const people_module_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            people_module_1.PeopleModule
        ]
    })
], AppModule);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeopleModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const cache_manager_1 = __webpack_require__(8);
const people_controller_1 = __webpack_require__(9);
const people_service_1 = __webpack_require__(10);
const people_provider_1 = __webpack_require__(14);
const people_cache_1 = __webpack_require__(11);
let PeopleModule = class PeopleModule {
};
exports.PeopleModule = PeopleModule;
exports.PeopleModule = PeopleModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.register({
                ttl: process.env.EXPIRE_TIME_HOMEWORLD_CACHE ? Number(process.env.EXPIRE_TIME_HOMEWORLD_CACHE) : 36000, // seconds
                max: process.env.EXPIRE_TIME_HOMEWORLD_CACHE ? Number(process.env.MAX_AMOUNT_HOMEWORLD_CACHE) : 100,
            }),
        ],
        controllers: [people_controller_1.PeopleController],
        providers: [people_service_1.PeopleService, people_provider_1.PeopleProvider, people_cache_1.PeopleCache],
        exports: [people_provider_1.PeopleProvider],
    })
], PeopleModule);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeopleController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const people_service_1 = __webpack_require__(10);
let PeopleController = class PeopleController {
    constructor(appService) {
        this.appService = appService;
    }
    async getPeople(page, search) {
        common_1.Logger.log(`getPeople page ${page}`);
        return this.appService.getPeople(Number(page) || 1, search);
    }
};
exports.PeopleController = PeopleController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)('page')),
    tslib_1.__param(1, (0, common_1.Query)('search')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PeopleController.prototype, "getPeople", null);
exports.PeopleController = PeopleController = tslib_1.__decorate([
    (0, common_1.Controller)('people'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof people_service_1.PeopleService !== "undefined" && people_service_1.PeopleService) === "function" ? _a : Object])
], PeopleController);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeopleService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const people_cache_1 = __webpack_require__(11);
let PeopleService = class PeopleService {
    constructor(cache) {
        this.cache = cache;
    }
    async getPeople(page, word) {
        return await this.cache.tryToGet(page, word);
    }
};
exports.PeopleService = PeopleService;
exports.PeopleService = PeopleService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof people_cache_1.PeopleCache !== "undefined" && people_cache_1.PeopleCache) === "function" ? _a : Object])
], PeopleService);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeopleCache = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const trie_1 = __webpack_require__(12);
const parser_1 = __webpack_require__(13);
const people_provider_1 = __webpack_require__(14);
const PAGE_SIZE = 10;
let PeopleCache = class PeopleCache {
    constructor(provider) {
        this.provider = provider;
        this.peoplePageCache = {};
        this.peopleFilterCache = new trie_1.Trie();
        this.lastCacheUpdate = Date.now();
        this.cacheDuration = Number(process.env.CACHE_DURATION || 240000);
    }
    async tryToGet(page, word) {
        const currentTime = Date.now();
        if (currentTime - this.lastCacheUpdate >= this.cacheDuration) {
            common_1.Logger.log('Cache expired, resetting cache');
            this.peoplePageCache = {};
            this.peopleFilterCache = new trie_1.Trie();
            this.lastCacheUpdate = currentTime;
        }
        if (word) {
            return await this.tryToGetFilterCache(page, word);
        }
        if (!this.peoplePageCache[page]) {
            common_1.Logger.log(`Fetch data page = ${page}`);
            await this.fetch(page, true);
        }
        return this.peoplePageCache[page];
    }
    async tryToGetFilterCache(page, word) {
        const cacheData = this.peopleFilterCache.search(word);
        if (cacheData?.isMatched) {
            common_1.Logger.log(`Search: ${word} isMatched`);
            return cacheData.data[page];
        }
        let data;
        if (!cacheData) {
            common_1.Logger.log(`Fetch data page = ${page} search = ${word}`);
            await this.fetch(page);
            data = this.peoplePageCache;
        }
        else {
            common_1.Logger.log(`Search: ${word} not isMatched`);
            data = cacheData.data;
        }
        const allData = Object.keys(data).flatMap((pageNumber) => {
            return data[parseInt(pageNumber)].data.filter((person) => {
                const result = Object.keys(person).some((key) => key !== 'height' && person[key].indexOf(word) !== -1);
                return result;
            });
        });
        console.log('tryToGetFilterCache', allData);
        const totalDataCount = allData.length;
        if (totalDataCount > 0) {
            const count = Math.ceil(totalDataCount / PAGE_SIZE);
            const cache = {};
            for (let pageNum = 1; pageNum <= count; pageNum++) {
                const items = allData.splice(0, PAGE_SIZE);
                cache[pageNum] = {
                    data: items,
                    averageHeight: (0, parser_1.getAverageHeight)(items),
                    totalCount: totalDataCount,
                };
            }
            this.peopleFilterCache.add(word, cache);
            return page <= count ? cache[page] : cache[count];
        }
        else {
            const emptyData = {
                [1]: {
                    data: [],
                    averageHeight: '0',
                    totalCount: 0
                }
            };
            this.peopleFilterCache.add(word, emptyData);
            return emptyData[1];
        }
    }
    async fetch(page, isBackgroundAsync) {
        if (!this.peoplePageCache[page]) {
            this.peoplePageCache[page] = await this.provider.fetchData(page);
        }
        const totalCount = this.peoplePageCache[page].totalCount;
        const pageCount = Math.ceil(totalCount / PAGE_SIZE);
        const promises = [];
        for (let i = 1; i <= pageCount; i++) {
            if (!this.peoplePageCache[i]) {
                promises.push(this.provider.fetchData(i).then((data) => {
                    common_1.Logger.log(`Promise fetch page ${i}`);
                    this.peoplePageCache[i] = data;
                }));
            }
        }
        if (isBackgroundAsync) {
            Promise.all(promises);
            common_1.Logger.log(`Fetch in background`);
        }
        else {
            common_1.Logger.log(`Fetch not background`);
            await Promise.all(promises);
        }
    }
};
exports.PeopleCache = PeopleCache;
exports.PeopleCache = PeopleCache = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof people_provider_1.PeopleProvider !== "undefined" && people_provider_1.PeopleProvider) === "function" ? _a : Object])
], PeopleCache);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trie = void 0;
class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }
}
class Trie {
    constructor() {
        this.root = new TrieNode();
    }
    add(word, data) {
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
    search(word) {
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
exports.Trie = Trie;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAverageHeight = void 0;
const getAverageHeight = (data) => {
    const items = data.filter(({ height }) => !isNaN(Number(height)) && !isNaN(parseFloat(height)));
    if (items.length === 0)
        return '0';
    const sum = items.reduce((acc, { height }) => acc + (parseInt(height) || 0), 0);
    const average = sum / items.length;
    const roundedAverage = Math.round(average * 10) / 10;
    return roundedAverage % 1 === 0 ? roundedAverage.toFixed(0) : roundedAverage.toFixed(1);
};
exports.getAverageHeight = getAverageHeight;


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PeopleProvider = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const shared_1 = __webpack_require__(15);
const axios_1 = tslib_1.__importDefault(__webpack_require__(19));
const parser_1 = __webpack_require__(13);
const cache_manager_1 = __webpack_require__(8);
const UNKNOWN_HOMEWORLD = { name: 'Unknown', terrain: 'Unknown' };
let PeopleProvider = class PeopleProvider {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.apiUrl = 'https://swapi.dev/api/people/?page=';
    }
    async fetchData(page) {
        try {
            const { data } = await axios_1.default.get(`${this.apiUrl}${page}`);
            const homeworldCache = this.getHomeworldCache(data.results);
            const persons = data.results.map(({ homeworld: homeworldUrl, ...person }) => {
                const { name: homeworld, terrain } = homeworldCache[homeworldUrl] || UNKNOWN_HOMEWORLD;
                return shared_1.PersonSchema.parse({ ...person, homeworld, terrain });
            });
            const averageHeight = (0, parser_1.getAverageHeight)(persons);
            return {
                data: persons,
                totalCount: data.count,
                averageHeight
            };
        }
        catch (error) {
            common_1.Logger.error(`Error fetching people data: ${error}`);
            throw error;
        }
    }
    async getHomeworldCache(data) {
        const uniqueHomeworlds = [...new Set(data.map(({ homeworld }) => homeworld))];
        const homeworlds = async () => {
            const homeworldDataPromises = uniqueHomeworlds.map(homeworld => this.fetchHomeworld(homeworld));
            const homeworldData = await Promise.all(homeworldDataPromises);
            return homeworldData;
        };
        return await homeworlds;
    }
    async fetchHomeworld(homeworldUrl) {
        const cachedData = await this.cacheManager.get(homeworldUrl);
        if (cachedData) {
            return { [homeworldUrl]: cachedData };
        }
        try {
            const response = await axios_1.default.get(homeworldUrl);
            const homeworldData = response.data;
            await this.cacheManager.set(homeworldUrl, homeworldData);
            return { [homeworldUrl]: homeworldData };
        }
        catch {
            return { [homeworldUrl]: UNKNOWN_HOMEWORLD };
        }
    }
};
exports.PeopleProvider = PeopleProvider;
exports.PeopleProvider = PeopleProvider = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof cache_manager_1.Cache !== "undefined" && cache_manager_1.Cache) === "function" ? _a : Object])
], PeopleProvider);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(18), exports);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonSchema = void 0;
const zod_1 = __webpack_require__(17);
exports.PersonSchema = zod_1.z.object({
    name: zod_1.z.string(),
    birth_year: zod_1.z.string(),
    homeworld: zod_1.z.string(),
    terrain: zod_1.z.string(),
    height: zod_1.z.string(),
});


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("axios");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const helmet_1 = tslib_1.__importDefault(__webpack_require__(4));
const dotenv = tslib_1.__importStar(__webpack_require__(5));
const app_module_1 = __webpack_require__(6);
async function bootstrap() {
    try {
        const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
        dotenv.config({ path: envFile });
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        /*
          Content Security Policy (CSP): Helps prevent cross-site scripting (XSS) attacks by controlling which resources can be loaded.
          X-DNS-Prefetch-Control: Controls browser DNS prefetching.
          X-Frame-Options: Protects against clickjacking by controlling whether your site can be embedded in an iframe.
          X-Content-Type-Options: Prevents browsers from MIME-sniffing a response away from the declared content type.
          Strict-Transport-Security: Enforces secure (HTTP over SSL/TLS) connections to the server.
          X-XSS-Protection: Enables the Cross-site scripting (XSS) filter built into most browsers.
          */
        // Use helmet middleware for security
        app.use((0, helmet_1.default)());
        app.enableCors({
            origin: process.env.CLIENT_FRONTEND_URL || "*",
            methods: 'GET,HEAD',
        });
        // Set global prefix for API routes
        const globalPrefix = 'api';
        app.setGlobalPrefix(globalPrefix);
        const port = process.env.PORT || 3000;
        await app.listen(port);
        common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        common_1.Logger.error('Error during application bootstrap:', error);
        process.exit(1); // Exit the process with a failure code
    }
}
bootstrap();

})();

/******/ })()
;