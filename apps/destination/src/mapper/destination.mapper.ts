import { Types } from 'mongoose';
import { Destination } from '../entity/destination.entity';
import { DestinationDAO } from '../schemas/destination.schema';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';
import { GoogleMapsService } from 'apps/destination/gmaps/gmaps.service';
import { Inject } from '@nestjs/common';

export class DestinationMapper {
  constructor(
    @Inject() private readonly googleMapsService: GoogleMapsService,
  ) {}

  public static async toDAO(destination: Destination): Promise<DestinationDAO> {
    return {
      _id: new Types.ObjectId(destination.id.toString()),
      place_id: destination.place_id,
      image_url: destination.image_url ? destination.image_url : undefined,
      reviewIds: destination.reviewIds.map((id) => id.toString()),
    };
  }

  public static async toEntity(
    dao: DestinationDAO,
  ): Promise<Destination | undefined> {
    const destinationIdString = dao._id.toHexString();

    const destinationOrError = Destination.create(
      {
        place_id: dao.place_id,
        image_url: dao.image_url,
        reviewIds: dao.reviewIds.map((id) => new UniqueEntityID(id)),
        isRegistered: true,
      },
      new UniqueEntityID(destinationIdString),
    );

    return destinationOrError.isSuccess
      ? destinationOrError.getValue()
      : undefined;
  }
}
