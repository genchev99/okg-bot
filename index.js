const puppeteer = require('puppeteer');
const {Cluster} = require('puppeteer-cluster');

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: parseInt(process.env.CONCURRENCY) || 5,
        puppeteer: puppeteer,
    });

    await cluster.idle();
    await cluster.close();
})();