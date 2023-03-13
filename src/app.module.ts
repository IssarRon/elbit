import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightController } from './flight/flight.controller';
import { FlightModule } from './flight/flight.module';
import { FlightService } from './flight/flight.service';

@Module({
  imports: [FlightModule],
  controllers: [AppController, FlightController],
  providers: [AppService, FlightService],
})
export class AppModule {}
