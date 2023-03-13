import { Controller, Get, Param } from '@nestjs/common';
import { FlightService } from './flight.service';

@Controller('api/flight')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  //this api path returns the number of all flights (inbound and outbound), and receives an optional parameter - country, that can be used to filter results
  @Get('/allFlightsCount/:countryName?')
  FlightCount(@Param('countryName') countryName?: string) {
    return this.flightService.getAllFlights(countryName);
  }

  //this api path returns the number of all inbound flights, either from a certain country or just in general - using an optional parameter for country name
  @Get('/inboundFlightsCount/:countryName?')
  outboundCount(@Param('countryName') countryName?: string) {
    return this.flightService.getInboundFlights(countryName);
  }

  //this api path returns the number of all outbound flights, either to a certain country or without a filter - using an optional parameter for country name
  @Get('/outboundFlightsCount/:countryName?')
  inboundCount(@Param('countryName') countryName?: string) {
    return this.flightService.getOutboundFlights(countryName);
  }

  //this api path returns the number of all delayed flights
  @Get('/delayedFlightsCount')
  delayedCount() {
    return this.flightService.getDelayedFlights();
  }

  //this api path returns the country name of the most popular destination
  @Get('/mostPopularDestination')
  mostPopularDest() {
    return this.flightService.mostPopularDest();
  }

  //this api path returns either none, or a pair of flights that can be used for a quick getaway abroad
  @Get('/getaway')
  quickGetaway() {
    return this.flightService.quickGetAway();
  }
}
