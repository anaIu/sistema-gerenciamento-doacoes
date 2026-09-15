module.exports = {
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
  },
  reporter: [["html", { open: "never" }], ["list"]],
  globalTeardown: "./e2e/cleanup.js",
  webServer: {
    command: "npm run db:setup && npm start",
    url: "http://localhost:3000",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  },
};