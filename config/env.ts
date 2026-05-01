import dotenv from 'dotenv';
dotenv.config();

export const env = {
  baseUrl: process.env.BASE_URL || 'https://github.com',
  apiUrl: process.env.API_URL || 'https://petstore.swagger.io/v2',
  headless: process.env.HEADLESS === 'true',
  testUserEmail: process.env.TEST_USER_EMAIL || '',
  testUserPassword: process.env.TEST_USER_PASSWORD || '',
};
