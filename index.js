require('dotenv').config();
const puppeteer = require('puppeteer');
const {Cluster} = require('puppeteer-cluster');

/* Validation of credentials */
if (!process.env.MOODLE_USERNAME) {
    console.error('Please provide a proper username in the .env file');
    process.exit(1);
}

if (!process.env.MOODLE_PASSWORD) {
    console.error('Please provide a proper password in the .env file');
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({headless: false, ignoreHTTPSErrors: true});
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().endsWith('recorder.php') && request.method() === 'POST') {
            const body = request.postData();

            if (body.indexOf('START') !== -1) {
                request.continue();
                return;
            }

            const ACTION = getValue(body, '"ACTION"');
            const MODEL = getValue(body,'"MODEL"');
            const DIFFICULTY = getValue(body,'"DIFFICULTY"');
            const MAX_SCORE = getValue(body,'"MAX_SCORE"');
            const SCORE = getValue(body,'"SCORE"');
            const TIME = getValue(body,'"TIME"');
            const CLICKS = getValue(body,'"CLICKS"');
            const COMPETENCES = getValue(body,'"COMPETENCES"');

            console.log({
                ACTION,
                MODEL,
                DIFFICULTY,
                MAX_SCORE,
                SCORE,
                TIME,
                CLICKS,
                COMPETENCES,
            });

            console.log(request.headers());

            request.continue({headers: request.headers(), postData: `ACTION=${ACTION}&MODEL=${MODEL}&DIFFICULTY=${DIFFICULTY}&MAX_SCORE=${MAX_SCORE}&SCORE=${MAX_SCORE}&TIME=81798&CLICKS=81798&COMPETENCES=${COMPETENCES}`});
        } else {
            request.continue();
        }
    });

    await page.goto('https://learn.fmi.uni-sofia.bg/login/index.php');

    await page.type('#username', process.env.MOODLE_USERNAME, {delay: 25});
    await page.type('#password', process.env.MOODLE_PASSWORD, {delay: 25});

    await page.click('#loginbtn', {delay: 25});

    await page.waitFor(4000);

    for (let model = 9; model <= 9; model++) {
        for (let difficulty = 0; difficulty < 3; difficulty++) {
            for (let times = 0; times < 20; times++) {
                const url = `http://pavel.it.fmi.uni-sofia.bg/courses/okg/tests/model.html?models=t00${model}&difficulty=${difficulty}`;
                console.log('opening: ', url);
                await page.goto(url, {timeout: 200000});

                await page.waitFor('[corner=topLeft]');
                await page.click('[corner=topLeft]');

                await page.waitFor(1000);
                await page.waitFor('#infoPanel');
                await page.click('#infoPanel');
            }
        }
    }
})();

const getValue = (body, string) => {
    return (body.slice(body.indexOf(string) + string.length, body.length)).split('\r\n')[2];
};