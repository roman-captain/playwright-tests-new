import { env } from '../../config/env';

export const testData = {
  signIn: {
    email: env.testUserEmail,
    password: env.testUserPassword,
  },
  signUp: {
    email: 'example@.com',
    password: 'Password12345',
    username: 'BraddPitt',
    country: 'Ukraine',
  },
  subscribe: {
    email: 'example@gmail.com',
    country: 'Ukraine',
    successText: 'Thanks for subscribing',
  },
  search: {
    query: 'art',
  },
  pricing: {
    headerText: 'Try the Copilot-powered platform',
    compareFeaturesText: 'Compare features',
  },
  support: {
    termsUrlPattern: /github-terms-of-service/,
    supportTitle: 'Welcome to GitHub Support',
  },
  api: {
    petId: 98765,
    petName: 'Rex',
    petStatus: 'available',
  },
};
