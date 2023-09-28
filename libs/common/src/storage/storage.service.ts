/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import {
  GetFilesOptions,
  GetSignedUrlConfig,
  Storage,
} from '@google-cloud/storage';
import { Readable } from 'stream';
import * as pathSeparate from 'path';
import { Either, left, right } from '../core/result';
import * as AppErrors from '../core/app.error';
// Create .env file on root of your project by cloning .env.example file
@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;
  constructor(bucketName: string, keyString: string | undefined) {
    Logger.log('Initializing Google Cloud Storage with key:');
    Logger.log(JSON.parse(keyString));
    this.storage = new Storage({
      projectId: 'marshtravel',
      credentials: JSON.parse(keyString),
    });
    this.bucketName = bucketName;
  }

  uploadFileToStorage = async (
    file: Express.Multer.File,
    path: string,
    name: string,
  ): Promise<Either<AppErrors.GCSError, string>> => {
    const bucketName = this.bucketName;
    // Get a reference to the bucket
    const myBucket = this.storage.bucket(bucketName);

    // Create a reference to a file object
    const fileExtension = pathSeparate.extname(file.originalname);
    const fileName = name + fileExtension;
    const fileSave = myBucket.file(`${path}/${fileName}`);

    const streamFile = fileSave.createWriteStream({ public: true });

    const storage = this.storage;
    const handleUpload = Readable.from(file.buffer).pipe(streamFile);
    return new Promise((resolve, reject) => {
      handleUpload.on('error', function (err) {
        Logger.error(err, err.stack);
        reject(left(new AppErrors.GCSError('Upload Image Error: ' + err)));
      });

      handleUpload.on('finish', function () {
        const publicFileUrl = `${storage.apiEndpoint}/${bucketName}/${path}/${fileName}`;
        // const authenticatedFileUrl = `https://storage.cloud.google.com/${bucket}/${path}/${fileName}`;
        resolve(right(publicFileUrl));
      });
    });
  };

  generateUploadSignedUrl = async (
    path: string,
    name: string,
    options: GetSignedUrlConfig,
  ): Promise<Either<AppErrors.GCSError, string>> => {
    try {
      const storage = this.storage;
      const bucketName = this.bucketName;

      const fileName = `${path}/${name}`;

      // Get a signed URL for uploading file
      const [url] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);

      return right(url);
    } catch (err) {
      return left(new AppErrors.GCSError('Generate Signed Key Error: ' + err));
    }
  };

  // getFilesByPrefix = async (
  //   options: GetFilesOptions,
  //   testId: string,
  // ): Promise<Either<AppErrors.GCSError, RecordedAudiosResponseDTO>> => {
  //   try {
  //     const RECORDED_AUDIO_FILENAME_REGEX = /\/(.*?)\/(.*)\/(.*).wav/;
  //     const SCORE_PATTERN = '__score__';

  //     const storage = this.storage;
  //     const bucketName = this.bucketName;

  //     const [files] = await storage.bucket(bucketName).getFiles(options);
  //     const recordedAudios = files.map(({ storage, name, metadata }) => {
  //       const nameMatches = name.match(RECORDED_AUDIO_FILENAME_REGEX) || [];
  //       const fileNameWithScore =
  //         nameMatches[nameMatches.length - 1].split(SCORE_PATTERN);
  //       const fileName = fileNameWithScore[0];
  //       const score = fileNameWithScore[1];

  //       return {
  //         url: `${storage.apiEndpoint}/${bucketName}/${name}`,
  //         fileName,
  //         score,
  //         createdAt: metadata['timeCreated'],
  //       };
  //     });

  //     const result: RecordedAudiosResponseDTO = {
  //       testId,
  //       recordedAudios,
  //     };

  //     return right(result);
  //   } catch (err) {
  //     return left(new AppErrors.GCSError('Can not get files: ' + err));
  //   }
  // };
}
