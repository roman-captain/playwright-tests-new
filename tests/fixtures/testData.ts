import { env } from '../../config/env';

// Unique per run: GitHub signup validates email/username availability
// and password strength live – static values go stale and keep the
// "Create account" button disabled (data-disable-invalid).
const runId = Date.now();

export const testData = {
  signIn: {
    email: env.testUserEmail,
    password: env.testUserPassword,
  },
  signUp: {
    email: `qa.rc.${runId}@gmail.com`,
    password: `Qa-R3silient-${runId}`,
    username: `qa-rc-${runId}`,
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
    headerText: 'Try GitHub, the complete developer platform',
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
