import { QueryOutput } from '@aws-sdk/client-dynamodb';

export interface DynamoQueryParams {
  TableName: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: { [key: string]: any };
  ExpressionAttributeNames: { '#pk': string };
  ProjectionExpression?: string;
  FilterExpression?: string;
  Limit?: number;
  ScanIndexForward?: boolean;
  ExclusiveStartKey?: { [key: string]: any };
}

export type DynamoOutput = Array<string> & QueryOutput;
