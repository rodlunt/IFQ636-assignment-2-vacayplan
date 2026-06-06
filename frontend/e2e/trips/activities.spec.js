const { test, expect } = require('@playwright/test');

const MARKER_EMAIL = 'marker@vacayplan.com';
const MARKER_PASSWORD = 'MarkerPass123!';

const loginAsMarker = async (page) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(MARKER_EMAIL);
  await page.getByPlaceholder('Password').fill(MARKER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

// Post-VP-99 TripDetail rewrite, the itinerary lives inside the "Itinerary"
// tab panel which is not selected by default. Tests must click into it before
// asserting on activity rows or the AddActivity form.
const openItineraryTab = async (page) => {
  await page.getByRole('tab', { name: 'Itinerary' }).click();
};

let authToken = null;

test.beforeAll(async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/auth/login`, {
    data: { email: MARKER_EMAIL, password: MARKER_PASSWORD },
  });
  const body = await res.json();
  authToken = body.token;
});

test.describe('trip activities CRUD', () => {
  let createdTrip;

  test.beforeEach(async ({ request, baseURL, page }) => {
    const res = await request.post(`${baseURL}/api/trips`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        destination: `e2e-activities-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        startDate: '2026-11-01',
        endDate: '2026-11-08',
      },
    });
    createdTrip = await res.json();
    await loginAsMarker(page);
  });

  test.afterEach(async ({ request, baseURL }) => {
    if (createdTrip?._id) {
      await request
        .delete(`${baseURL}/api/trips/${createdTrip._id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .catch(() => {});
    }
  });

  test('Add Activity form: fill + submit → activity appears in itinerary', async ({ page }) => {
    await page.goto(`/trips/${createdTrip._id}`);
    await openItineraryTab(page);
    await page.getByRole('button', { name: /\+ Add activity/ }).click();

    await page.getByLabel(/Location/).fill('Sushi Dinner');
    await page.getByLabel(/Date/).fill('2026-11-03');
    await page.getByLabel(/Time/).fill('19:00');
    await page.getByRole('button', { name: 'Add activity', exact: true }).click();

    await expect(page.getByText('Sushi Dinner')).toBeVisible();
  });

  test('Delete activity: confirm dialog → activity removed from itinerary', async ({ page, request, baseURL }) => {
    // Pre-create activity via API
    const activityRes = await request.post(
      `${baseURL}/api/trips/${createdTrip._id}/activities`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          date: '2026-11-04',
          time: '10:00',
          location: 'Morning Walk',
        },
      },
    );
    const activity = await activityRes.json();

    await page.goto(`/trips/${createdTrip._id}`);
    await openItineraryTab(page);
    // Scope to the itinerary item to avoid matching the dialog body
    // (which also contains the location name in its confirmation copy)
    const itineraryItem = page.locator('li').filter({ hasText: 'Morning Walk' });
    await expect(itineraryItem).toBeVisible();

    await page.getByRole('button', { name: `Delete ${activity.location}` }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await expect(dialog).not.toBeVisible();

    // After dialog closes, the itinerary li should be gone
    await expect(itineraryItem).not.toBeVisible();
  });

  test('Status toggle: default wishlist → click → booked', async ({ page, request, baseURL }) => {
    const activityRes = await request.post(
      `${baseURL}/api/trips/${createdTrip._id}/activities`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          date: '2026-11-05',
          time: '14:00',
          location: 'Beach Day',
        },
      },
    );
    const activity = await activityRes.json();
    // Activities default to status:'wishlist' per backend model

    await page.goto(`/trips/${createdTrip._id}`);
    await openItineraryTab(page);
    const toggleBtn = page.getByRole('button', {
      name: `Mark ${activity.location} as booked`,
    });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // After toggle, aria-label flips to "as wishlist"
    await expect(
      page.getByRole('button', {
        name: `Mark ${activity.location} as wishlist`,
      }),
    ).toBeVisible();
  });

  test('Edit activity link points to /trips/:tripId/activities/:id/edit', async ({ page, request, baseURL }) => {
    const activityRes = await request.post(
      `${baseURL}/api/trips/${createdTrip._id}/activities`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          date: '2026-11-06',
          time: '11:00',
          location: 'Coffee Catch-up',
        },
      },
    );
    const activity = await activityRes.json();

    await page.goto(`/trips/${createdTrip._id}`);
    await openItineraryTab(page);
    // Scope to the itinerary <li> to disambiguate the activity Edit link
    // from the trip-level Edit link in the page header.
    const itineraryItem = page
      .locator('li')
      .filter({ hasText: 'Coffee Catch-up' });
    const editLink = itineraryItem.getByRole('link', { name: 'Edit' });
    await expect(editLink).toHaveAttribute(
      'href',
      `/trips/${createdTrip._id}/activities/${activity._id}/edit`,
    );
  });
});
