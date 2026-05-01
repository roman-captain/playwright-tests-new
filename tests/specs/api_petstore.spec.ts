import { test, expect } from '@playwright/test';
import { env } from '../../config/env';
import { testData } from '../fixtures/testData';

test.describe('Petstore API - Pet', () => {

  test('should create a new pet (POST) @api @smoke', async ({ request }) => {
    const response = await request.post(`${env.apiUrl}/pet`, {
      data: {
        id: testData.api.petId,
        name: testData.api.petName,
        status: testData.api.petStatus,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(testData.api.petName);
  });

  test('should get pet by id (GET) @api @smoke', async ({ request }) => {
    const response = await request.get(`${env.apiUrl}/pet/${testData.api.petId}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(testData.api.petId);
    expect(body.status).toBe(testData.api.petStatus);
  });

  test('should delete pet (DELETE) @api @smoke', async ({ request }) => {
    const response = await request.delete(`${env.apiUrl}/pet/${testData.api.petId}`);

    expect(response.status()).toBe(200);
  });
});
