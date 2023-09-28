import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: StorageService,
      useFactory: () =>
        new StorageService(
          process.env.GCLOUD_STORAGE_BUCKET_NAME || 'marshtravel-staging',
          process.env.GCLOUD_SA,
        ),
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
