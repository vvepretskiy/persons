import { Injectable, Logger } from "@nestjs/common";
import { People, Person, PersonSchema } from "@persons/shared";
import axios from "axios";
import { getAverageHeight } from "../utils/parser";

type TypePeopleResponse = { results: Person[], count: number };
type TypeHomeworldResponse = { name: string, terrain: string };
type TypeCachedPeopleByPage= { [key: number]: TypeHomeworldResponse };

const UNKNOWN_HOMEWORLD = { name: 'Unknown', terrain: 'Unknown' };

@Injectable()
export class PeopleProvider {
    private readonly apiUrl = 'https://swapi.dev/api/people/?page=';
    private lastCacheUpdate: number = Date.now();
    private homeworldCache: TypeCachedPeopleByPage = {};
    private readonly cacheDuration: number = Number(process.env.CACHE_DURATION_HOMEWORLD || 300000);

    async fetchData(page: number): Promise<People> {
        try {
            const { data } = await axios.get<TypePeopleResponse>(`${this.apiUrl}${page}`);

            await this.fetchHomeworl(data.results);

            const cache = {...this.homeworldCache};

            const persons = data.results.map(({ homeworld: homeworldUrl, ...person }: Person) => {
                const { name: homeworld, terrain } = cache[homeworldUrl] || UNKNOWN_HOMEWORLD;
                return PersonSchema.parse({ ...person, homeworld, terrain });
            });

            const averageHeight = getAverageHeight(persons);

            return {
                data: persons,
                totalCount: data.count,
                averageHeight
            };
        } catch (error) {
            Logger.error(`Error fetching people data: ${error}`);
            throw error;
        }
    }

    public async fetchHomeworl(data: Pick<Person, 'homeworld'>[]) {

        const currentTime = Date.now();

        if (currentTime - this.lastCacheUpdate >= this.cacheDuration) {
            this.homeworldCache = {};
            this.lastCacheUpdate = currentTime;
        }

        const uniqueHomeworlds = [...new Set(data.map(({ homeworld }) => homeworld))];
        const homeworldDataPromises = uniqueHomeworlds.map((i) => this.fetchHomeworld(i));
        return Promise.all(homeworldDataPromises);
    }

    async fetchHomeworld(homeworldUrl: string) {
        const cachedData = this.homeworldCache[homeworldUrl];
        if (cachedData) {
            return { [homeworldUrl]: cachedData };
        }

        try {
            const response = await axios.get<TypeHomeworldResponse>(homeworldUrl);
            this.homeworldCache[homeworldUrl] = response.data;
            return this.homeworldCache[homeworldUrl];
        } catch(error) {
            Logger.error(`Error fetching homeworld data: ${error}`);
            return UNKNOWN_HOMEWORLD;
        }
    }
}
