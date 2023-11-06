import { Types } from 'mongoose';
import { Destination } from '../entity/destination.entity';
import { DestinationDAO } from '../schemas/destination.schema';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import { Inject } from '@nestjs/common';
import { SingleDestinationResponseDTO } from '../dtos/destination.response.dto';

export class DestinationMapper {
  constructor(
    @Inject() private readonly googleMapsService: GoogleMapsService,
  ) {}

  public static toDAO(destination: Destination): DestinationDAO {
    return {
      _id: new Types.ObjectId(destination.id.toString()),
      place_id: destination.place_id,
      name: destination.name,
      description: destination.description,
      image_url: destination.image_url ? destination.image_url : undefined,
    };
  }

  public static toEntity(dao: DestinationDAO): Destination | undefined {
    const destinationIdString = dao._id.toHexString();

    const destinationOrError = Destination.create(
      {
        place_id: dao.place_id,
        name: dao.name,
        description: dao.description,
        image_url: dao.image_url,
        isRegistered: true,
        isCached: false,
      },
      new UniqueEntityID(destinationIdString),
    );

    return destinationOrError.isSuccess
      ? destinationOrError.getValue()
      : undefined;
  }

  public static searchQueryResultToResponseDTO(
    result: any,
  ): SingleDestinationResponseDTO {
    return {
      place_id: result.place_id,
      name: result.name,
      description: '',
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      mapsSearchDetails: result,
      reviews: [],
      isRegistered: false,
      isCached: false,
    };
  }
}
