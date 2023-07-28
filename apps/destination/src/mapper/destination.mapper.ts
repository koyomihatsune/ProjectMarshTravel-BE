import { Types } from 'mongoose';
import { Destination } from '../entity/destination.entity';
import { DestinationDAO } from '../schemas/destination.schema';
import { UniqueEntityID } from '@app/common/core/domain/unique_entity_id';

export class DestinationMapper {
  public static async toDAO(destination: Destination): Promise<DestinationDAO> {
    return {
      _id: new Types.ObjectId(destination.id.toString()),
      place_id: destination.place_id,
      name: destination.name,
      formatted_address: destination.formatted_address,
      image_url: destination.image_url,
      lat: destination.lat,
      lon: destination.lon,
      reviewIds: destination.reviewIds.map((id) => id.toString()),
    };
  }

  public static toEntity(dao: DestinationDAO): Destination | undefined {
    const destinationIdString = dao._id.toHexString();

    const destinationOrError = Destination.create(
      {
        place_id: dao.place_id,
        name: dao.name,
        formatted_address: dao.formatted_address,
        image_url: dao.image_url,
        lat: dao.lat,
        lon: dao.lon,
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
