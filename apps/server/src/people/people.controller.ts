import { Controller, Get, Logger, Query } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly appService: PeopleService) { }

  @Get()
  async getPeople(@Query('page') page?: string, @Query('search') search?: string) {
    Logger.log(`getPeople page ${page}`);
    return this.appService.getPeople(Number(page) || 1, search);
  }
}
