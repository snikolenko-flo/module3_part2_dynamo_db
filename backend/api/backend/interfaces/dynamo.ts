export interface DynamoQueryParams {
  TableName: string;
  KeyConditionExpression: string;
  ExpressionAttributeValues: { [key: string]: any };
  ProjectionExpression?: string;
  FilterExpression?: string;
  Limit?: number;
  ScanIndexForward?: boolean;
  ExclusiveStartKey?: { [key: string]: any };
}
