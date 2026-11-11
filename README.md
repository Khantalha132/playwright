# Universal Playwright login

## Setup
```bash
npm install
npx playwright install chromium
cp .env.example .env   # then edit .env with your real values
```

## Run
```bash
npm run test:login            # headed (browser visible)
npm run test:login:headless   # headless
npm run test:login:debug      # Playwright Inspector
npm run report                # open the HTML report
```

## Use in your own tests
```ts
import { loginToApp } from './loginHelper';
await loginToApp(page, { url, username, password });
```
Works with single-step and two-step (email -> Next -> password) logins.
For unusual sites pass `usernameSelectors`, `passwordSelectors`, `submitSelectors`,
or set `LOGIN_SUCCESS_URL` / `LOGIN_SUCCESS_SELECTOR` in `.env`.
