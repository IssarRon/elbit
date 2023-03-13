import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Record } from 'src/consts/types';

@Injectable()
export class FlightService {
  constructor() {}

  //this function receives an optional parameter for country name - and returns the number of flights to and from the specifed country, or all flights
  async getAllFlights(countryName?: string) {
    try {
      //api request to the data store - with the option for adding a query and looking for a certain country in the data store
      const flights = await axios.get(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300${
          countryName ? `&q={"CHLOCCT":"${countryName}"}` : ''
        }`,
      );
      return flights.data.result.records.length;
    } catch (e) {
      return e;
    }
  }

  async getOutboundFlights(countryName?: string) {
    try {
      //api request to the data store - with the option for adding a query and looking for a certain country in the data store
      const flights = await axios.get(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300${
          countryName ? `&q={"CHLOCCT":"${countryName}"}` : ''
        }`,
      );
      //filter the received flights based on the two relevant fields for outbound flights
      return flights.data.result.records.filter(
        (record: Record) => record.CHCINT && record.CHCKZN,
      ).length;
    } catch (e) {
      return e;
    }
  }

  async getInboundFlights(countryName?: string) {
    try {
      const flights = await axios.get(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300${
          countryName ? `&q={"CHLOCCT":"${countryName}"}` : ''
        }`,
      );
      //I tried to filter on the CHCINT and CHCKZN fields to look for nulls but it didnt work
      //filter the received flights based on the two relevant fields for inbound flights
      return flights.data.result.records.filter(
        (record: Record) => !record.CHCINT && !record.CHCKZN,
      ).length;
    } catch (e) {
      return e;
    }
  }

  //this function receives no parameters and returns the number of all the delayed flights
  async getDelayedFlights() {
    try {
      //calling the data store api, looking for keyword DELAYED
      const flights = await axios.get(
        'https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300&q=DELAYED',
      );
      //return the length of received results
      return flights.data.result.records.length;
    } catch (e) {
      return e;
    }
  }

  //this function returns the country with the highest number of flights to
  async mostPopularDest() {
    try {
      //api request to receive all flights
      const flights = await axios.get(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300`,
      );
      //filter all flights by outbound flights
      const outboundFlights = flights.data.result.records.filter(
        (record: Record) => record.CHCINT && record.CHCKZN,
      );
      //create an object holding the values for all countries, key:country name, value:counter
      const countriesCounter: {} = {};
      //go over the filtered flights and increase the value of each country's counter when a flight to it is found
      outboundFlights.forEach((element: Record) => {
        countriesCounter[element.CHLOCCT] == null
          ? (countriesCounter[element.CHLOCCT] = 1)
          : countriesCounter[element.CHLOCCT]++;
      });
      //create an object to hold the current highest counter
      const highestValue = { country: '', value: '' };
      //put a list of all country names into an array
      const allCountries = Object.keys(countriesCounter);
      //go over each country in the array and if its counter is larger than the current one, override its current value
      allCountries.forEach((country) => {
        if (countriesCounter[country] > highestValue.value) {
          highestValue.country = country;
          highestValue.value = countriesCounter[country];
        }
      });
      return highestValue.country;
    } catch (e) {
      return e;
    }
  }

  //this function receives no parameters and looks for a way to match up two flights - inbound and outbound by time difference set by the vacationTime variable
  async quickGetAway() {
    try {
      //api request to get all flights
      const flights = await axios.get(
        'https://data.gov.il/api/3/action/datastore_search?resource_id=e83f763b-b7d7-479e-b172-ae981ddc6de5&limit=300',
      );
      //create separate arrays to hold in and out flights
      const outBoundFlights: Record[] = [];
      const inBoundFlights: Record[] = [];
      //push each flight to its corresponding array
      flights.data.result.records.forEach((flight: Record) => {
        !flight.CHCINT && !flight.CHCKZN
          ? inBoundFlights.push(flight)
          : outBoundFlights.push(flight);
      });
      //parameter indicating number of hours for the getaway
      const vacationTime = 4;
      //create variable to return in the end
      let ans: string | { departure: string; arrival: string } = 'none';
      //go over all inbound flights
      inBoundFlights.forEach((inFlight: Record) => {
        //create flight's date as a date object
        const landDate = new Date(inFlight.CHSTOL);
        //look for outbound flight whose difference with the inbound flight is equal to the vacationTime variable
        const departureFound = outBoundFlights.find((outFlight: Record) => {
          //create a new date object for each flight
          const takeoffDate = new Date(outFlight.CHSTOL);
          //condition holding the comparisons for both airport and time difference
          return (
            outFlight.CHLOC1 == inFlight.CHLOC1 &&
            vacationTime ==
              Math.abs(landDate.valueOf() - takeoffDate.valueOf()) / 36e5
          );
        });
        //if a corresponding outbound flight was found, put its and the inbound flight's numbers in ans variable
        if (departureFound?.CHOPER) {
          ans = { departure: departureFound.CHFLTN, arrival: inFlight.CHFLTN };
        }
      });
      //return either none or the latest couple found
      return ans;
    } catch (e) {
      return e;
    }
  }
}
