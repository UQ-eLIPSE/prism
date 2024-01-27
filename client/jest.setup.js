/* eslint-disable no-undef */
const originalEnv = global.window._env_;

global.window._env_ = {
  API_URL: "https://example.com",
  PROJECT_TITLE: "Test Project",
  USE_SSO: true,
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
);

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  global.window._env_ = originalEnv;
});
