require('dotenv').config();
const puppeteer = require('puppeteer');
const {Cluster} = require('puppeteer-cluster');

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

    await cluster.idle();
    await cluster.close();
})();