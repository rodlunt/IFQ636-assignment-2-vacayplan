// Mocha root hooks — run once before the entire suite.
// Sets a stable JWT_SECRET fallback so tests that call jwt.sign() work
// without needing the secret injected via GitHub Actions environment.
exports.mochaHooks = {
    beforeAll() {
        if (!process.env.JWT_SECRET) {
            process.env.JWT_SECRET = 'test-jwt-secret';
        }
    },
};
