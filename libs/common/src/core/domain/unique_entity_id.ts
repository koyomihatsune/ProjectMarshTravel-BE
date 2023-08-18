import { parse as uuidParse } from 'uuid';
import { version as uuidVersion } from 'uuid';

import { validate as uuidValidate } from 'uuid';

import { Identifier } from './identifier';
import { Types } from 'mongoose';

export class UniqueEntityID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id ? id : new Types.ObjectId().toHexString());
  }

  /**
   * name
   */
  public toBuffer() {
    const id = this.toString();
    try {
      const bytes = uuidParse(id) as Uint8Array;
      return Buffer.from(bytes);
    } catch {
      return Buffer.from(id);
    }
  }

  public toMongoObjectID() {
    const id = this.toString();
    return new Types.ObjectId(id);
  }
}

export function uuidValidateV1(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 1;
}
