const app = require("express")();
const puppeteer = require('puppeteer');
const NodeCache = require( "node-cache" );

// initialize cache
const cache = new NodeCache({ stdTTL: 60*60*24 });

// get same plant images
app.get("/wiki/:name", async (res, req) => {
    var name = req.req.params.name;
    let wiki = cache.get(name+"Wiki");
    const isCacheMiss = wiki === undefined;
    if (isCacheMiss) {
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
        wiki = await page.evaluate(() => {
            try {
                let divWrapper = document.getElementsByClassName("g")[0];
                let description = divWrapper.getElementsByClassName("lEBKkf")[0].innerText;
                let wikiLink = divWrapper.getElementsByTagName("a")[0].href;
                return {
                    description,
                    wikiLink,
                };
            } catch (err) {
                console.log(err);
                return {
                    description: "",
                    wikiLink: "",
                }
            }
        });
        browser.close();
    }
    res.res.status(200).setHeader("Content-type", "application/json").send(
            JSON.stringify({
                message: "Success",
                payload: wiki,
            })
        )
        .end();
    if (isCacheMiss) {
        cache.set(name+"Wiki", wiki);
    }
});

module.exports = app;
