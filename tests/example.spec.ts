
import { chromium, type Page } from 'playwright';

async function runLoginTest(): Promise<void> {
    const email: string = 'test2002@yopmail.com';
    const password: string = 'Talha229@@';

    const browser = await chromium.launch({
        headless: false
    });

    const page: Page = await browser.newPage();

    try {
        console.log('1. Opening TYK Store...');

        await page.goto('https://tykstore.com', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('2. Finding Sign In...');

        const signIn = page.getByRole('link', {
            name: /sign\s*in|log\s*in/i
        }).or(
            page.getByRole('button', {
                name: /sign\s*in|log\s*in/i
            })
        ).or(
            page.getByText(/sign\s*in|log\s*in/i)
        );

        await signIn.first().waitFor({
            state: 'visible',
            timeout: 20000
        });

        await signIn.first().click();

        console.log('3. Waiting for login form...');

        const emailInput = page.locator(
            'input[type="email"], input[name*="email" i], input[placeholder*="email" i]'
        ).first();

        const passwordInput = page.locator(
            'input[type="password"]'
        ).first();

        await emailInput.waitFor({
            state: 'visible',
            timeout: 20000
        });

        await passwordInput.waitFor({
            state: 'visible',
            timeout: 20000
        });

        console.log('4. Entering credentials...');

        await emailInput.fill(email);
        await passwordInput.fill(password);

        console.log('5. Submitting login...');

        await page.getByRole('button', {
            name: /sign\s*in|log\s*in|login|continue/i
        }).last().click();

        await page.waitForTimeout(5000);

        await page.screenshot({
            path: 'tykstore-after-login.png',
            fullPage: true
        });

        const loginStillVisible = await passwordInput
            .isVisible()
            .catch(() => false);

        console.log('Current URL:', page.url());

        console.log(
            loginStillVisible
                ? 'Login may have failed or requires verification.'
                : 'Login form is no longer visible. Verify the result.'
        );

        console.log('Screenshot saved successfully.');

    } catch (error) {
        console.error('TEST FAILED:', error);

        await page.screenshot({
            path: 'tykstore-login-error.png',
            fullPage: true
        }).catch(() => {});

    } finally {
        await browser.close();
    }
}

runLoginTest();
