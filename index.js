require('dotenv').config();
const puppeteer = require('puppeteer');
const {Cluster} = require('puppeteer-cluster');

/* Validation of credentials */
if (!process.env.USERNAME) {
    console.error('Please provide a proper username in the .env file');
    process.exit(1);
}

if (!process.env.PASSWORD) {
    console.error('Please provide a proper password in the .env file');
    process.exit(1);
}

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: parseInt(process.env.CONCURRENCY) || 5,
        puppeteer: puppeteer,
    });

    /* Logs into moodle */
    cluster.queue(async ({page}) => {
        await page.goto('https://learn.fmi.uni-sofia.bg/login/index.php');

        await page.type('#username', process.env.username);
        await page.type('#password', process.env.password);

        await page.click('#logintn', {delay: 25});

        await page.waitForNavigation();
    });

    cluster.task(async ({page, data: url}) => {
        await page.goto(url);

        await page.waitFor('[corner=topLeft]');
        await page.click('[corner=topLeft]');

        await page.waitFor('#infoPanel');
        await page.click('#infoPanel');

        await page.close();
    });

    await cluster.idle();
    await cluster.close();
})();