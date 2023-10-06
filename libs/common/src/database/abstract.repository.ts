import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  UpdateQuery,
  SaveOptions,
  Connection,
  Types,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { SORT_CONST } from '../constants';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async findAllByList(field: keyof TDocument, values: any[]) {
    const filterQuery: FilterQuery<TDocument> = {
      [field]: { $in: values },
    } as FilterQuery<TDocument>;
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async findPagination(
    filterQuery: FilterQuery<TDocument>,
    page: number,
    pageSize: number,
    sortBy: string,
  ) {
    return this.model
      .find(filterQuery, {}, { lean: true })
      .sort(
        sortBy === SORT_CONST.DATE_NEWEST
          ? { createdAt: 1 }
          : sortBy === SORT_CONST.DATE_OLDEST
          ? { createdAt: -1 }
          : sortBy === SORT_CONST.RATING_HIGHEST
          ? { rating: 1 }
          : sortBy === SORT_CONST.RATING_LOWEST
          ? { rating: -1 }
          : {},
      )
      .skip((page - 1) * pageSize) // page start from 1
      .limit(pageSize);
  }

  async likeDocument(
    filterQuery: FilterQuery<TDocument>,
    userId: Types.ObjectId,
  ) {
    const update: UpdateQuery<TDocument> = {
      $addToSet: { likes: userId },
    };
    const document = await this.findOneAndUpdate(filterQuery, update);
    return document;
  }

  async unlikeDocument(
    filterQuery: FilterQuery<TDocument>,
    userId: Types.ObjectId,
  ) {
    const update: UpdateQuery<TDocument> = { $pull: { likes: userId } };
    const document = await this.findOneAndUpdate(filterQuery, update);
    return document;
  }

  // async startTransaction() {
  //   const session = await this.connection.startSession();
  //   session.startTransaction();
  //   return session;
  // }
}
