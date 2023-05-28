export interface DynamoUser {
  email: string;
  password: string;
  salt: string;
}

export interface DynamoImage {
  email: string;
  id: string;
  type: string;
  filename: string;
  path: string;
  metadata: object;
  date: Date;
}

export interface DynamoObject {
  email: string;
  imageArray: object[];
}
