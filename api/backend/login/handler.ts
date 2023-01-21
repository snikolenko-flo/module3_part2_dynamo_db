import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const signup: APIGatewayProxyHandlerV2 = async (event) => {
  log(event);
  try {
    console.log('signup');
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

export const login: APIGatewayProxyHandlerV2 = async (event) => {
  log(event);
  try {
    console.log('login');
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

export const loadGallery: APIGatewayProxyHandlerV2 = async (event) => {
  log(event);
  try {
    console.log('gallery');
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};
