import { Inject, Injectable, Logger } from "@nestjs/common";
import { People, Person, PersonSchema } from "@persons/shared";
import axios from "axios";
import { getAverageHeight } from "../utils/parser";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

type TypePeopleResponse = { results: Person[], count: number };

const UNKNOWN_HOMEWORLD = { name: 'Unknown', terrain: 'Unknown' };

@Injectable()
export class PeopleProvider {
    private readonly apiUrl = 'https://swapi.dev/api/people/?page=';

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async fetchData(page: number): Promise<People> {
        try {
            const { data } = await axios.get<TypePeopleResponse>(`${this.apiUrl}${page}`);

            const homeworldCache = this.getHomeworldCache(data.results);

            const persons = data.results.map(({ homeworld: homeworldUrl, ...person }: Person) => {
                const { name: homeworld, terrain } = homeworldCache[homeworldUrl] || UNKNOWN_HOMEWORLD;
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

    private async getHomeworldCache(data: Pick<Person, 'homeworld'>[]) {
        const uniqueHomeworlds = [...new Set(data.map(({ homeworld }) => homeworld))];

        const homeworlds = async () => {
            const homeworldDataPromises = uniqueHomeworlds.map(homeworld => this.fetchHomeworld(homeworld));
            const homeworldData = await Promise.all(homeworldDataPromises);
            return homeworldData;
        };

        return await homeworlds;
    }

    async fetchHomeworld(homeworldUrl: string) {
        const cachedData = await this.cacheManager.get(homeworldUrl);
        if (cachedData) {
            return { [homeworldUrl]: cachedData };
        }

        try {
            const response = await axios.get(homeworldUrl);
            const homeworldData = response.data;
            await this.cacheManager.set(homeworldUrl, homeworldData);
            return { [homeworldUrl]: homeworldData };
        } catch {
            return { [homeworldUrl]: UNKNOWN_HOMEWORLD };
        }
    }
}
