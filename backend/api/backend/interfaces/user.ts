export interface DynamoUser {
  email: string;
  filename: string;
  path?: string;
  password: string;
  salt: string;
}

export interface DynamoImage {
  email: string;
  filename: string;
  path: string;
  metadata: object;
  date: Date;
}
