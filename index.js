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
        timeout: 60000, /* 60 to timeout */
        puppeteerOptions: {
            ignoreHTTPSErrors: true,
            headless: !!parseInt(process.env.headless),
        },
    });

    /* Logs into moodle */
    cluster.queue(async ({page}) => {
        await page.goto('https://learn.fmi.uni-sofia.bg/login/index.php');

        await page.type('#username', process.env.USERNAME);
        await page.type('#password', process.env.PASSWORD);

        await page.click('#logintn', {delay: 25});

        await page.waitForNavigation();
    });

    cluster.task(async ({page, data: url}) => {
        await page.setRequestInterception(true);

        page.on('request', request => {
            if (request.url().endsWith('request.php') && request.method() === 'POST') {
                console.log(request.url());
                console.log(request.postData());

                const realData = JSON.parse(request.postData());
                //
                // const postData = JSON.stringify({
                //     offset: 13,
                // }).trim();
                //
                // // const postData = `offset=${realData.offset}`;
                // console.log('my post data: ', postData);
                // console.log(request);
                //
                // request.continue({
                //     'postData': postData,
                // });

                request.continue();
            }

            request.continue();
        });

        await page.goto(url);

        await page.waitFor('[corner=topLeft]');
        await page.click('[corner=topLeft]');

        await page.waitFor('#infoPanel');
        await page.click('#infoPanel');

        await page.close();

        process.exit(1)
    });

    for (let model = 1; model <= 9; model++) {
        for (let difficulty = 0; difficulty < 3; difficulty++) {
            for (let times = 0; times < 5; times++) {
                cluster.queue(`http://pavel.it.fmi.uni-sofia.bg/courses/okg/tests/model.html?models=t00${model}&difficulty=${difficulty}`)
            }
        }
    }

    await cluster.idle();
    await cluster.close();
})();