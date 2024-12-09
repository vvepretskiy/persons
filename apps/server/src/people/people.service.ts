import { Injectable } from '@nestjs/common';
import { People } from '@persons/shared'; // Adjust the import path as necessary
import { PeopleCache } from './people.cache';

@Injectable()
export class PeopleService {
  constructor(private readonly cache: PeopleCache) { }

  async getPeople(page: number, word: string): Promise<People> {
    return await this.cache.tryToGet(page, word);
  }
}
