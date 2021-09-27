const app = require("express")();
const NodeCache = require("node-cache");
const puppeteer = require("puppeteer");

// initialize cache
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });

// get same plant images
app.get("/images/:name", async (res, req) => {
  const name = req.req.params.name;
  let imgs = cache.get(name);
  const isCacheMiss = imgs === undefined;
  if (isCacheMiss) {
    wasTheirImages = false;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://www.google.co.in/imghp?hl=en&ogbl");
    await page.waitForSelector("input");
    await page.type("input", `${name} flower or plant`);
    await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);
    imgs = await page.evaluate(() => {
      try {
        const divWrapper = document.getElementsByClassName("gBPM8")[0];
        const imgs = divWrapper.querySelectorAll("img");
        const images = [];
        for (let i = 0; i < 10; i++) {
          images.push(imgs[i].src);
        }
        return images;
      } catch (err) {
        console.log(err);
        return [];
      }
    });
    browser.close();
  }
  res.res
    .status(200)
    .setHeader("Content-type", "application/json")
    .send(
      JSON.stringify({
        message: "Success",
        payload: {
          images: imgs,
        },
      })
    )
    .end();
  if (isCacheMiss) {
    cache.set(name, imgs);
  }
});

module.exports = app;
