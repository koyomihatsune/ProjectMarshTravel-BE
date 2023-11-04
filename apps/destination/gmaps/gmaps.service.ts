import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_MAPS_API } from '../src/constants/services';
import {
  GetOnePlaceFromTextDTO,
  GetMultiplePlacesFromTextDTO,
  GetMultiplePlacesFromPageTokenDTO,
  GetPlaceDetailsDTO,
  GetPlaceAutocompleteDTO,
  GetMultiplePlaceDistanceDTO,
  GetMultiplePlaceDistanceResponseDTO,
} from './types/gmaps.places.types';
import axios, { AxiosResponse } from 'axios';
import AppErrors from '@app/common/core/app.error';

export interface TokenPayload {
  accessToken: string;
}
@Injectable()
export class GoogleMapsService {
  constructor(private configService: ConfigService) {}

  isVietnamOnly = true;

  getApiKey(): string {
    return this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  /* Tìm một địa điểm từ text: https://developers.google.com/maps/documentation/places/web-service/search-find-place#maps_http_places_findplacefromtext_phonenumber-js

  queryParams: 
  */

  async fetchFromGoogleMapsAPI(
    route: string,
    params: URLSearchParams,
  ): Promise<any> {
    const url = `${GOOGLE_MAPS_API.BASE_URL}${route}`;
    params.append('key', this.getApiKey());
    // console.log(url);
    // console.log(params);
    const response: AxiosResponse = await axios.get(url, {
      params: params,
    });
    if (
      [
        GOOGLE_MAPS_API.STATUS_CODE.OK,
        GOOGLE_MAPS_API.STATUS_CODE.ZERO_RESULTS,
      ].includes(response.data.status)
    ) {
      return response.data;
    }
    return new AppErrors.UnexpectedError(response.data.error_message);
  }

  public async getProvinceNameFromLatLon(
    lat: number,
    lon: number,
    language: string,
  ): Promise<string> {
    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.GEOCODE,
      new URLSearchParams({
        latlng: `${lat},${lon}`,
        language: language === 'vi' ? 'vi' : 'en',
      }),
    );
    // console.log(result.results[0].address_components);
    const provinceName =
      result.results[0].address_components?.find((item) =>
        item.types.includes('administrative_area_level_1'),
      )?.long_name ?? '';
    // console.log(provinceName);
    return provinceName;
  }

  public async getOnePlaceFromText(dto: GetOnePlaceFromTextDTO): Promise<any> {
    const queryParams = new URLSearchParams({
      input: dto.input,
      language: dto.language ? 'vi' : '',
      inputtype: 'textquery',
      fields:
        'formatted_address,place_id,name,opening_hours,types,rating,geometry',
    });

    if (dto.lat && dto.lon) {
      queryParams.append('locationbias', `circle:50000@:${dto.lat},${dto.lon}`);
    }

    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.FIND_PLACE,
      queryParams,
    );

    return result.candidates[0];
  }

  /* Tìm nhiều địa điểm từ text
  Document: https://developers.google.com/maps/documentation/places/web-service/search-text
  */

  public async getMultiplePlacesFromText(
    dto: GetMultiplePlacesFromTextDTO,
  ): Promise<{
    htmlAttributions: any[];
    nextPageToken?: string;
    results: any[];
  }> {
    const queryParams = new URLSearchParams({
      query: dto.input,
      radius: dto.radius ? dto.radius.toString() : '', // meters
      language: dto.language ? 'vi' : '',
      region: this.isVietnamOnly ? 'VN' : 'VN',
      // opennow: dto.opennow ? 'true' : '',
      type: dto.type ? dto.type : '',
      locationbias: dto.lat && dto.lon ? `${dto.lat},${dto.lon}` : '',
    });
    // console.log("Lat lon tồn tại");

    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.TEXT_SEARCH,
      queryParams,
    );
    /* Trả về cấu trúc sau: {
            html_attributions: [],
            next_page_token: lưu token này để query tiếp trang sau. Nếu không có token này thì hết kết quả rồi.
            results: [] // Mảng kết quả
    } */
    return {
      htmlAttributions: result.html_attributions,
      nextPageToken: result.next_page_token
        ? result.next_page_token
        : undefined,
      results: result.results,
    };
  }

  public async getMultiplePlacesPaginationFromPageToken(
    dto: GetMultiplePlacesFromPageTokenDTO,
  ): Promise<any> {
    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.TEXT_SEARCH,
      new URLSearchParams({
        pagetoken: dto.nextPageToken,
      }),
    );
    /* Trả về cấu trúc sau: 
        {
            html_attributions: [],
            next_page_token: lưu token này để query tiếp trang sau. Nếu không có token này thì hết kết quả rồi.
            results: [] // Mảng kết quả
        }
    */
    return {
      nextPageToken: result.next_page_token,
      results: result.results,
    };
  }

  /* Chi tiết một địa điểm
    Document: https://developers.google.com/maps/documentation/places/web-service/details

    - Paremeter "fields":
        Basic

        The Basic category includes the following fields: address_components, adr_address, business_status, formatted_address, geometry, icon, icon_mask_base_uri, icon_background_color, name, permanently_closed (deprecated), photo, place_id, plus_code, type, url, utc_offset, vicinity, wheelchair_accessible_entrance.

        Contact

        The Contact category includes the following fields: current_opening_hours, formatted_phone_number, international_phone_number, opening_hours, secondary_opening_hours, website

        Atmospherefor

        The Atmosphere category includes the following fields: curbside_pickup, delivery, dine_in, editorial_summary, price_level, rating, reservable, reviews, serves_beer, serves_breakfast, serves_brunch, serves_dinner, serves_lunch, serves_vegetarian_food, serves_wine, takeout, user_ratings_total.
    
  */
  public async getPlaceByID(dto: GetPlaceDetailsDTO): Promise<any> {
    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.PLACE_DETAILS,
      new URLSearchParams({
        place_id: dto.placeId,
        language: dto.language ? 'vi' : '',
        fields:
          'address_components,formatted_address,photo,name,type,place_id,geometry,website,formatted_phone_number,price_level,current_opening_hours,secondary_opening_hours',
        sessiontoken: dto.sessionToken ? dto.sessionToken : '',
      }),
    );
    if (result.error)
      Logger.error(
        "Can't find any place with place_id " + dto.placeId,
        'GoogleMapsService',
      );
    return result.result ? result.result : undefined;
  }

  public async getPlaceAutocomplete(
    dto: GetPlaceAutocompleteDTO,
  ): Promise<any> {
    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.PLACE_AUTO_COMPLETE,
      new URLSearchParams({
        input: dto.input,
        radius: dto.radius ? dto.radius.toString() : '500000', // meters
        language: dto.language,
        region: this.isVietnamOnly ? 'VN' : '',
        sessiontoken: dto.sessionToken ? dto.sessionToken : '',
      }),
    );
    return result.predictions;
  }

  public async getDistanceMatrixList(
    dto: GetMultiplePlaceDistanceDTO,
  ): Promise<GetMultiplePlaceDistanceResponseDTO> {
    const origins = dto.origins.map((origin) => 'place_id:' + origin);
    const destinations = dto.destinations.map(
      (destination) => 'place_id:' + destination,
    );

    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.DISTANCE_MATRIX,
      new URLSearchParams({
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        language: dto.language,
        region: this.isVietnamOnly ? 'VN' : '',
      }),
    );
    const response: GetMultiplePlaceDistanceResponseDTO = [];

    for (let i = 0; i < origins.length; i++) {
      for (let j = 0; j < destinations.length; j++) {
        const origin = origins[i].replace('place_id:', '');
        const destination = destinations[j].replace('place_id:', '');
        const element = result.rows[i].elements[j];

        const distance = element.distance ? element.distance.value : undefined;
        const duration = element.duration ? element.duration.value : undefined;

        const status = element.status;

        response.push({
          origin_place_id: origin,
          destination_place_id: destination,
          distance,
          duration,
          status,
        });
      }
    }

    return response;
  }
}
