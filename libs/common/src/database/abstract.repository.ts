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

  async count(filterQuery: FilterQuery<TDocument>) {
    return this.model.countDocuments(filterQuery);
  }

  // group count by field
  async countByField(field: keyof TDocument) {
    return this.model.aggregate([
      {
        $group: {
          _id: `${field.toString()}`,
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async findPagination(
    filterQuery: FilterQuery<TDocument>,
    page: number,
    pageSize: number,
    sortBy: string,
  ) {
    const totalCount = await this.model.countDocuments(filterQuery); // Count the total number of documents

    const totalPages = Math.ceil(totalCount / pageSize); // Calculate the total number of pages

    // Một lỗi khá dị của page là nó có thể là string hoặc number
    page = parseInt(page.toString());

    // if (page > totalPages) {
    //   page = totalPages; // Adjust the page number if it exceeds the total number of pages
    // }

    const results = await this.model
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
      .skip((page - 1) * pageSize) // page starts from 1
      .limit(pageSize);

    return { page, totalPages, results };
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
