import { test, expect } from '@playwright/test';
import { env } from '../../config/env';
import { testData } from '../fixtures/testData';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface PetContract {
  id: number;
  name: string;
  photoUrls: string[];
  status: 'available' | 'pending' | 'sold';
  category?: Category;
  tags?: Tag[];
}

interface ApiErrorResponse {
  code: number;
  type: string;
  message: string;
}

const VALID_STATUSES = ['available', 'pending', 'sold'];

function assertPetContract(pet: PetContract) {
  expect(typeof pet.id, 'id must be a number').toBe('number');
  expect(typeof pet.name, 'name must be a string').toBe('string');
  expect(Array.isArray(pet.photoUrls), 'photoUrls must be an array').toBe(true);
  expect(VALID_STATUSES, 'status must be one of the allowed values').toContain(pet.status);

  if (pet.category !== undefined) {
    expect(typeof pet.category.id).toBe('number');
    expect(typeof pet.category.name).toBe('string');
  }

  if (pet.tags !== undefined) {
    expect(Array.isArray(pet.tags)).toBe(true);
    pet.tags.forEach((tag) => {
      expect(typeof tag.id).toBe('number');
      expect(typeof tag.name).toBe('string');
    });
  }
}

test.describe('Petstore API - Contract Tests', () => {

  test.beforeAll(async ({ request }) => {
    await request.post(`${env.apiUrl}/pet`, {
      data: {
        id: testData.api.petId,
        name: testData.api.petName,
        status: testData.api.petStatus,
        photoUrls: [],
      },
    });
  });

  test.afterAll(async ({ request }) => {
    await request.delete(`${env.apiUrl}/pet/${testData.api.petId}`);
  });

  test('GET /pet/{id} - response structure matches Pet contract @contract', async ({ request }) => {
    const response = await request.get(`${env.apiUrl}/pet/${testData.api.petId}`);

    expect(response.status()).toBe(200);

    const body: PetContract = await response.json();
    assertPetContract(body);
  });

  test('POST /pet - response structure matches Pet contract @contract', async ({ request }) => {
    const response = await request.post(`${env.apiUrl}/pet`, {
      data: {
        id: testData.api.petId,
        name: testData.api.petName,
        status: testData.api.petStatus,
        photoUrls: [],
      },
    });

    expect(response.status()).toBe(200);

    const body: PetContract = await response.json();
    assertPetContract(body);
  });

  test('GET /pet/findByStatus - each item matches Pet contract @contract', async ({ request }) => {
    const response = await request.get(`${env.apiUrl}/pet/findByStatus?status=available`);

    expect(response.status()).toBe(200);

    const body: PetContract[] = await response.json();
    expect(Array.isArray(body), 'response must be an array').toBe(true);
    expect(body.length, 'array must not be empty').toBeGreaterThan(0);

    body.slice(0, 5).forEach((pet) => assertPetContract(pet));
  });

  test('GET /store/inventory - response is object with numeric values @contract', async ({ request }) => {
    const response = await request.get(`${env.apiUrl}/store/inventory`);

    expect(response.status()).toBe(200);

    const body: Record<string, number> = await response.json();
    expect(typeof body, 'response must be an object').toBe('object');
    expect(body).not.toBeNull();

    Object.entries(body).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(typeof value).toBe('number');
    });
  });

  test('GET /pet/{id} unknown id - error response matches contract @contract', async ({ request }) => {
    const unknownId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    await request.delete(`${env.apiUrl}/pet/${unknownId}`);

    const response = await request.get(`${env.apiUrl}/pet/${unknownId}`);

    expect(response.status()).toBe(404);

    const body: ApiErrorResponse = await response.json();
    expect(typeof body.code, 'code must be a number').toBe('number');
    expect(typeof body.type, 'type must be a string').toBe('string');
    expect(typeof body.message, 'message must be a string').toBe('string');
  });

});
