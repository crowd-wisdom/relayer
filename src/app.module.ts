import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SemaphoreModule } from './semaphore/semaphore.module.js';
import { MaciController } from './maci/maci.controller.js';
import { MaciModule } from './maci/maci.module.js';
import { IpfsModule } from './ipfs/ipfs.module.js';
import { HealthModule } from './health/health.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ([{
      ttl: Number(config.get('THROTTLE_TTL')),
      limit: Number(config.get('THROTTLE_LIMIT')),
    }]),
  }),    
  ScheduleModule.forRoot(),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      // if (process.env.NODE_ENV === "test") {
      //   // const { getTestMongooseModuleOptions } = await import("./jest/mongo.js");

      //   // return getTestMongooseModuleOptions();
      // }
      return {
        uri: config.get('MONGO_DB_URI'),
        auth: {
          username: config.get('MONGODB_USER'),
          password: config.get('MONGODB_PASSWORD'),
        },
        dbName: config.get('MONGODB_DATABASE'),
      };
    },
  }),ConfigModule.forRoot(),SemaphoreModule, MaciModule,IpfsModule,HealthModule,MaciModule],
  controllers: [MaciController]
})
export class AppModule {}
