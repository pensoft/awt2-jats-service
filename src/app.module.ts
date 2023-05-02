import { Module } from '@nestjs/common';
import { ValidateModule } from './validate/validate.module';
import { CommonModule } from './common/common.module';
import { getEnvPath } from '@app/common/utils/env.helper';
import { ConfigModule } from '@nestjs/config';
import { MainModule } from '@app/main/main.module';

const envFilePath: string = getEnvPath(`${__dirname}/..`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    ValidateModule,
    CommonModule,
    MainModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
