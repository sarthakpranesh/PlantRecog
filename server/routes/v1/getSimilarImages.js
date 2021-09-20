const app = require("express")();
const puppeteer = require('puppeteer');
const NodeCache = require( "node-cache" );

// initialize cache
const cache = new NodeCache({ stdTTL: 60*60*24 });

// get same plant images
app.get("/images/:name", async (res, req) => {
    var name = req.req.params.name;
    let imgs = cache.get(name);
    if (imgs === undefined) {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox']
          });
        let page = await browser.newPage();
        await page.goto("https://www.google.co.in/imghp?hl=en&ogbl");
        await page.waitForSelector('input');
        await page.type('input', name);
        await Promise.all([
            page.waitForNavigation(),
            page.keyboard.press("Enter"),
        ]);
        imgs = await page.evaluate(() => {
            let divWrapper = document.getElementsByClassName("gBPM8")[0];
            let imgs = divWrapper.querySelectorAll("img");
            let images = [];
            for (let i = 0; i < 20; i++) {
                images.push(imgs[0].src);
            }
            return images;
        });
        cache.set(name, imgs);
    }
    return res.res
        .setHeader("Content-type", "application/json")
        .status(200)
        .send(
            JSON.stringify({
                message: "Success",
                payload: {
                    images: imgs,
                },
            })
        );
});

module.exports = app;
