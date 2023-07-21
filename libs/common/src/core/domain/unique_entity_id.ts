import { v1 as uuidv1 } from 'uuid';
import { parse as uuidParse } from 'uuid';
import { version as uuidVersion } from 'uuid';

import { validate as uuidValidate } from 'uuid';

import { Identifier } from './identifier';

export class UniqueEntityID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id ? id : uuidv1());
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
}

export function uuidValidateV1(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 1;
}
