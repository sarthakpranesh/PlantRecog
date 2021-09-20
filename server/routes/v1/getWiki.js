const app = require("express")();
const puppeteer = require('puppeteer');
const NodeCache = require( "node-cache" );

// initialize cache
const cache = new NodeCache({ stdTTL: 60*60*24 });

// get same plant images
app.get("/wiki/:name", async (res, req) => {
    var name = req.req.params.name;
    let wiki = cache.get(name+"Wiki");
    if (wiki === undefined) {
        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox']
          });
        let page = await browser.newPage();
        await page.goto("https://www.google.co.in");
        await page.waitForSelector('input');
        await page.type('input', name + " wikipedia");
        await Promise.all([
            page.waitForNavigation(),
            page.keyboard.press("Enter"),
        ]);
        await page.screenshot({path: "./example.png"})
        wiki = await page.evaluate(() => {
            let divWrapper = document.getElementsByClassName("g")[0];
            let description = divWrapper.getElementsByClassName("lEBKkf")[0].innerText;
            let wikiLink = divWrapper.getElementsByTagName("a")[0].href;
            return {
                description,
                wikiLink,
            };
        });
        cache.set(name+"Wiki", wiki);
    }
    return res.res
        .setHeader("Content-type", "application/json")
        .status(200)
        .send(
            JSON.stringify({
                message: "Success",
                payload: {
                    wiki,
                },
            })
        );
});

module.exports = app;
