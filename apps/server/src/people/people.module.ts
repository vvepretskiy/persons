import { Module } from '@nestjs/common';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { PeopleProvider } from './people.provider';
import { PeopleCache } from './people.cache';

@Module({
  controllers: [PeopleController],
  providers: [PeopleService, PeopleProvider, PeopleCache],
  exports: [PeopleProvider],
})
export class PeopleModule { }
