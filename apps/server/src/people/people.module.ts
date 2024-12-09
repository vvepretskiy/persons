import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { PeopleProvider } from './people.provider';
import { PeopleCache } from './people.cache';

@Module({
  imports: [
    CacheModule.register({
      ttl: process.env.EXPIRE_TIME_HOMEWORLD_CACHE ? Number(process.env.EXPIRE_TIME_HOMEWORLD_CACHE) : 36000, // seconds
      max: process.env.EXPIRE_TIME_HOMEWORLD_CACHE ? Number(process.env.MAX_AMOUNT_HOMEWORLD_CACHE) : 100,
    }),
  ],
  controllers: [PeopleController],
  providers: [PeopleService, PeopleProvider, PeopleCache],
  exports: [PeopleProvider],
})
export class PeopleModule { }
