import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_MAPS_API } from '../src/constants/services';
import {
  GetOnePlaceFromTextDTO,
  GetMultiplePlacesFromTextDTO,
  GetMultiplePlacesFromPageTokenDTO,
  GetPlaceDetailsDTO,
  GetPlaceAutocompleteDTO,
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
  ): Promise<any> {
    const queryParams = new URLSearchParams({
      query: dto.input,
      radius: dto.radius ? dto.radius.toString() : '50000', // meters
      language: dto.language ? 'vi' : '',
      region: this.isVietnamOnly ? 'VN' : '',
      opennow: dto.opennow ? 'true' : '',
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
      nextPageToken: result.next_page_token,
      results: result.results,
    };
  }

  public async getMultiplePlacesPaginationFromPageToken(
    dto: GetMultiplePlacesFromPageTokenDTO,
  ): Promise<any> {
    const result = await this.fetchFromGoogleMapsAPI(
      GOOGLE_MAPS_API.ROUTES.PLACE.TEXT_SEARCH,
      new URLSearchParams({
        pagetoken: dto.pageToken,
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
    return result.result;
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
}
