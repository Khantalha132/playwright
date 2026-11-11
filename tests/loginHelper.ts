import type { Locator, Page } from '@playwright/test';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type LoginOptions = {
  /** Login page URL. Falls back to LOGIN_URL. */
  url?: string;
  /** Falls back to LOGIN_USERNAME. */
  username?: string;
  /** Falls back to LOGIN_PASSWORD. */
  password?: string;

  /** Override the default selectors when a site is unusual. */
  usernameSelectors?: string[];
  passwordSelectors?: string[];
  submitSelectors?: string[];
  /** "Next" / "Continue" button for two-step logins (email first, password second). */
  nextSelectors?: string[];

  /** Optional explicit success signals. If omitted, success = login form is gone. */
  successUrl?: string | RegExp;
  successSelector?: string;

  /** Max time (ms) to wait for the form and for the login result. Default 15000. */
  timeout?: number;
  /** Throw when login fails (default true). Set false to inspect the result instead. */
  throwOnFailure?: boolean;
  /** Try to close cookie / consent banners before logging in (default true). */
  dismissBanners?: boolean;
  /** Save a full-page screenshot here when login fails. */
  screenshotPath?: string;
};

export type LoginResult = {
  success: boolean;
  url: string;
  errorMessage?: string;
};

export type LoginConfig = {
  url: string;
  username?: string;
  password?: string;
  successUrl?: RegExp;
  successSelector?: string;
};

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_URL = 'https://www.tykstore.com/login';

export const DEFAULT_USERNAME_SELECTORS = [
  'input[type="email"]',
  'input[name="email" i]',
  'input[name="username" i]',
  'input[name="user" i]',
  'input[name="login" i]',
  'input[autocomplete="username"]',
  'input[autocomplete="email"]',
  'input[id*="email" i]',
  'input[id*="user" i]',
  'input[placeholder*="email" i]',
  'input[placeholder*="username" i]',
  'input[placeholder*="phone" i]',
  'input[type="text"]',
];

export const DEFAULT_PASSWORD_SELECTORS = [
  'input[type="password"]',
  'input[name="password" i]',
  'input[autocomplete="current-password"]',
  'input[id*="pass" i]',
  'input[placeholder*="password" i]',
];

export const DEFAULT_SUBMIT_SELECTORS = [
  'button[type="submit"]',
  'input[type="submit"]',
];

export const DEFAULT_NEXT_SELECTORS = [
  'button:has-text("Next")',
  'button:has-text("Continue")',
];

const SUBMIT_NAME = /log\s?in|sign\s?in|submit/i;
const NEXT_NAME = /^\s*(next|continue)\s*$/i;
/** Buttons that look like login buttons but are not the main form submit. */
const NOT_SUBMIT = /google|facebook|apple|github|microsoft|twitter|linkedin|forgot|reset|with|sso/i;

const ERROR_SELECTORS = [
  '[role="alert"]',
  '[data-testid*="error" i]',
  '.alert-danger',
  '.alert-error',
  '.invalid-feedback',
  '.error-message',
  '.errorMessage',
  '.error',
  '.toast-error',
  '[class*="error" i]',
];

/* -------------------------------------------------------------------------- */
/*  Config from environment                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Reads LOGIN_URL / LOGIN_USERNAME / LOGIN_PASSWORD (+ optional success hints) from the environment.
 * NOTE: deliberately does NOT read USERNAME/PASSWORD — on Windows `USERNAME` is the OS account name.
 */
export function getLoginConfig(): LoginConfig {
  const successUrl = process.env.LOGIN_SUCCESS_URL;
  return {
    url: process.env.LOGIN_URL || DEFAULT_URL,
    username: process.env.LOGIN_USERNAME,
    password: process.env.LOGIN_PASSWORD,
    successUrl: successUrl ? new RegExp(successUrl, 'i') : undefined,
    successSelector: process.env.LOGIN_SUCCESS_SELECTOR || undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

async function isVisible(locator: Locator): Promise<boolean> {
  return locator.isVisible().catch(() => false);
}

/**
 * Polls until one of the candidates is visible (works for SPAs that render the form late).
 * Returns the first visible locator, or null on timeout.
 */
async function waitForFirstVisible(page: Page, candidates: Locator[], timeout: number): Promise<Locator | null> {
  const deadline = Date.now() + timeout;
  do {
    for (const candidate of candidates) {
      if (await isVisible(candidate)) return candidate;
    }
    await page.waitForTimeout(200);
  } while (Date.now() < deadline);
  return null;
}

const fromSelectors = (page: Page, selectors: string[]): Locator[] =>
  selectors.map((selector) => page.locator(selector).first());

/** Backwards-compatible helper: first visible field from a selector list (no waiting). */
export async function findVisibleField(page: Page, selectors: string[]): Promise<Locator | null> {
  for (const locator of fromSelectors(page, selectors)) {
    if (await isVisible(locator)) return locator;
  }
  return null;
}

async function dismissBanners(page: Page): Promise<void> {
  const accept = page
    .locator('[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i]')
    .getByRole('button', { name: /accept|agree|allow|got it|^ok$/i })
    .first();
  if (await isVisible(accept)) {
    await accept.click({ timeout: 2000 }).catch(() => {});
  }
}

async function readError(page: Page): Promise<string | undefined> {
  for (const selector of ERROR_SELECTORS) {
    const matches = page.locator(selector);
    const count = Math.min(await matches.count().catch(() => 0), 5);
    for (let i = 0; i < count; i++) {
      const el = matches.nth(i);
      if (!(await isVisible(el))) continue;
      const text = ((await el.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 200);
    }
  }
  return undefined;
}

function urlMatches(url: string, expected: string | RegExp): boolean {
  return typeof expected === 'string' ? url.includes(expected) : expected.test(url);
}

async function findSubmit(page: Page, passwordField: Locator, custom?: string[]): Promise<Locator | null> {
  // Prefer a button inside the same <form> as the password field, then fall back to the whole page.
  const scopes: Array<Page | Locator> = [passwordField.locator('xpath=ancestor::form[1]'), page];

  for (const scope of scopes) {
    const candidates: Locator[] = [
      ...(custom ?? DEFAULT_SUBMIT_SELECTORS).map((s) => scope.locator(s).first()),
    ];
    if (!custom) {
      candidates.push(
        scope.getByRole('button', { name: SUBMIT_NAME }).filter({ hasNotText: NOT_SUBMIT }).first(),
      );
    }
    for (const candidate of candidates) {
      if (await isVisible(candidate)) return candidate;
    }
  }
  return null;
}

async function failLogin(page: Page, options: LoginOptions, message: string, errorMessage?: string): Promise<LoginResult> {
  if (options.screenshotPath) {
    await page.screenshot({ path: options.screenshotPath, fullPage: true }).catch(() => {});
  }
  const result: LoginResult = { success: false, url: page.url(), errorMessage: errorMessage ?? message };
  if (options.throwOnFailure !== false) {
    throw new Error(`Login failed: ${message} (url: ${result.url})`);
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*  Main entry                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Logs in to (almost) any username/email + password site.
 *  - waits for late-rendered forms
 *  - handles single-step and two-step (email -> Next -> password) flows
 *  - works with Enter key if no submit button is found
 *  - detects failure (still on the login form / error message) instead of assuming success
 */
export async function loginToApp(page: Page, options: LoginOptions = {}): Promise<LoginResult> {
  const config = getLoginConfig();
  const url = options.url ?? config.url;
  const username = options.username ?? config.username;
  const password = options.password ?? config.password;
  const timeout = options.timeout ?? 15000;
  const successUrl = options.successUrl ?? config.successUrl;
  const successSelector = options.successSelector ?? config.successSelector;

  if (!username) throw new Error('No username/email. Set LOGIN_USERNAME in .env or pass { username }.');
  if (!password) throw new Error('No password. Set LOGIN_PASSWORD in .env or pass { password }.');

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Math.max(timeout, 60000) });

  if (options.dismissBanners !== false) await dismissBanners(page);

  /* ---- username / email ------------------------------------------------- */
  const usernameField = await waitForFirstVisible(
    page,
    fromSelectors(page, options.usernameSelectors ?? DEFAULT_USERNAME_SELECTORS),
    timeout,
  );
  if (!usernameField) return failLogin(page, options, 'username/email field not found');
  await usernameField.fill(username);

  /* ---- password (handles two-step flows) -------------------------------- */
  const passwordCandidates = fromSelectors(page, options.passwordSelectors ?? DEFAULT_PASSWORD_SELECTORS);
  let passwordField = await waitForFirstVisible(page, passwordCandidates, 1500);

  if (!passwordField) {
    const nextButton = await waitForFirstVisible(
      page,
      [
        ...fromSelectors(page, options.nextSelectors ?? DEFAULT_NEXT_SELECTORS),
        page.getByRole('button', { name: NEXT_NAME }).first(),
      ],
      500,
    );
    if (nextButton) await nextButton.click();
    else await usernameField.press('Enter');

    passwordField = await waitForFirstVisible(page, passwordCandidates, timeout);
  }
  if (!passwordField) return failLogin(page, options, 'password field not found');
  await passwordField.fill(password);

  /* ---- submit ----------------------------------------------------------- */
  const submit = await findSubmit(page, passwordField, options.submitSelectors);
  if (submit) await submit.click();
  else await passwordField.press('Enter');

  /* ---- decide the outcome ----------------------------------------------- */
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (successSelector && (await isVisible(page.locator(successSelector).first()))) {
      return { success: true, url: page.url() };
    }
    if (successUrl && urlMatches(page.url(), successUrl)) {
      return { success: true, url: page.url() };
    }

    if (!(await isVisible(passwordField))) {
      // Form disappeared: confirm it stays gone (not just a re-render flicker).
      await page.waitForTimeout(500);
      if (!(await isVisible(passwordField)) && !successSelector && !successUrl) {
        await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
        return { success: true, url: page.url() };
      }
    } else {
      const error = await readError(page);
      if (error) return failLogin(page, options, `site showed an error: "${error}"`, error);
    }
    await page.waitForTimeout(250);
  }

  if (successSelector || successUrl) {
    return failLogin(page, options, 'success selector/URL never appeared');
  }
  return failLogin(page, options, 'still on the login form after submitting');
}