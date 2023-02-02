import S3rver from 's3rver';
import { corsConfig } from './configs/cors';
import { websiteConfig } from './configs/website';

new S3rver({
  configureBuckets: [
    {
      name: 'local-bucket',
      configs: [corsConfig, websiteConfig],
    },
  ],
  port: 4569,
  address: 'localhost',
  silent: false,
  directory: '/tmp',
}).run(() => console.log(`The S3 server is running at http://localhost:4569`));
