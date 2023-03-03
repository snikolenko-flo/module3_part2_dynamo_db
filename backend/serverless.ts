import type { AWS } from '@serverless/typescript';
import { getGalleryConfig } from './config/serverless/parts/gallery';
import { getLoginConfig } from './config/serverless/parts/login';
import { getSignupConfig } from './config/serverless/parts/signup';
import { joinParts } from './config/serverless/utils';
import { uploadConfig } from './config/serverless/parts/upload';

const CLIENT = '${param:CLIENT}';
const SERVICE_NAME = `template-flo-sls`;
const STAGE = '${opt:stage, "dev"}';
const REGION = '${param:REGION}';
const PROFILE = '${param:PROFILE}';

const masterConfig: AWS = {
  service: SERVICE_NAME,
  // See https://www.serverless.com/framework/docs/guides/parameters#stage-parameters
  params: {
    // default parameters
    default: {
      //REGION: 'us-east-1',
      REGION: 'ap-northeast-1',
      CLIENT: 'FLO',
      PROFILE: 'default',
    },
    dev: {},
    prod: {},
    local: {
      IS_OFFLINE: true,
      OFFLINE_API_BASE_URL: 'http://localhost:3000/local/',
    },
  },
  configValidationMode: 'warn',
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: STAGE,
    // @ts-ignore
    region: REGION,
    profile: PROFILE,
    environment: {
      STAGE,
    },
    tags: {
      client: CLIENT,
    },
    logs: {
      httpApi: true,
    },
    httpApi: {
      payload: '2.0',
      cors: true,
      authorizers: {
        apiAuthorizer: {
          type: 'request',
          name: 'apiAuthorizer',
          enableSimpleResponses: true,
          //issuerUrl: '',
          //audience: '',
          identitySource: '$request.header.Authorization',
        },
      },
    },
  },
  package: {
    individually: true,
    patterns: ['bin/*', '.env'],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      metafile: false,
      // If you want to debug the output than turn this on.
      // In other cases keep it off because serverless-esbuild
      // dont update extra files if they already exists in .esbuild folder.
      // Extra files are files that you define in package.patterns settings.
      keepOutputDirectory: false,
      packager: 'npm',
      inject: ['loadenv.ts'],
      plugins: 'esbuild-plugins.js',
      watch: {
        pattern: ['api/**/*.ts', 'helper/**/*.ts', 'interfaces/**/*.ts', 'models/**/*.ts', 'services/**/*.ts'],
      },
    },
    prune: {
      automatic: true,
      number: 3,
    },
    envFiles: ['env.yml'],
    envEncryptionKeyId: {
      local: '${file(./kms_key.yml):local}',
      // dev: '${file(./kms_key.yml):dev}',
      // test: '${file(./kms_key.yml):test}',
      // prod: '${file(./kms_key.yml):prod}',
    },
    'serverless-offline': {
      ignoreJWTSignature: true,
    },
  },
  plugins: [
    '@redtea/serverless-env-generator',
    'serverless-esbuild',
    'serverless-offline-sqs',
    'serverless-offline',
    'serverless-prune-plugin',
  ],
};

module.exports = joinParts(masterConfig, [getGalleryConfig, getLoginConfig, getSignupConfig, uploadConfig]);
