export interface DynamoUser {
  email: string;
  id: string;
  type: string;
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
