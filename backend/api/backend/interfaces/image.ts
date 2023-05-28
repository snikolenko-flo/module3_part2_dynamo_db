export interface DynamoImages extends Array<any> {
  filename: { S: string };
  user: { S: string };
  url: { S: string };
  metadata: { S: string };
  date: { S: string };
}

export interface ImageObject {
  filename: string;
  user: string;
  metadata: object;
  date: Date;
}

export interface ImageArray extends Array<ImageObject> {}
