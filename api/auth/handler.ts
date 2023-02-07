import jwt from 'jsonwebtoken';
import { log } from '@helper/logger';
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerWithContextHandler } from 'aws-lambda';

const UNAUTHORIZED = new Error('Unauthorized');
const secret = process.env.SECRET;

// Authorizer with policy response (compatible with REST API)
// See: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html#http-api-lambda-authorizer.v2
export const httpApiPolicy: APIGatewayTokenAuthorizerWithContextHandler<Record<string, any>> = async (event) => {
  log('httpApiPolicy authorizer is triggered');
  const token = event['headers'].Authorization;
  const decodedToken = jwt.verify(token, secret);

  if (token === 'error') {
    throw new Error('Internal server error');
  }

  if (!decodedToken) {
    throw UNAUTHORIZED;
  }

  return generatePolicy('user', 'Allow', '*', {});
};

export function generatePolicy<C extends APIGatewayAuthorizerResult['context']>(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: C
): APIGatewayAuthorizerResult & { context: C } {
  const authResponse: APIGatewayAuthorizerResult & { context: C } = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  return authResponse;
}
