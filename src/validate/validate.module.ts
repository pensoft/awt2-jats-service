import { Module } from '@nestjs/common';
import { ValidateService } from './service/validate.service';
import { ValidateController } from './controller/validate.controller';

@Module({
  providers: [ValidateService],
  controllers: [ValidateController]
})
export class ValidateModule {}
