const app = require("express")();
const NodeCache = require("node-cache");
const puppeteer = require("puppeteer");

// initialize cache
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });
let browser;
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
})();

// get same plant images
app.get("/details/:name", async (res, req) => {
  const name = req.req.params.name;
  const [imgs, wiki] = await Promise.all([
    getPlantImages(name),
    getPlantWiki(name),
  ])
  res.res
    .status(200)
    .setHeader("Content-type", "application/json")
    .send(
      JSON.stringify({
        message: "Success",
        payload: {
          images: imgs,
          ...wiki,
        },
      })
    )
    .end();
});

// get plant wiki function
const getPlantWiki = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let wiki = cache.get(name + "Wiki");
      const isCacheMiss = wiki === undefined;
      if (isCacheMiss) {
        // const browser = await puppeteer.launch({
        //   headless: true,
        //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // });
        const page = await browser.newPage();
        await page.goto("https://www.google.co.in");
        await page.waitForSelector("input");
        await page.type("input", name + " wikipedia");
        await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);
        wiki = await page.evaluate(() => {
          try {
            const divWrapper = document.getElementsByClassName("g")[0];
            const description =
              divWrapper.getElementsByClassName("lEBKkf")[0].innerText;
            const wikiLink = divWrapper.getElementsByTagName("a")[0].href;
            return {
              description,
              wikiLink,
            };
          } catch (err) {
            console.log(err);
            return {
              description: "",
              wikiLink: "",
            };
          }
        });
        page.close();
      }
      resolve(wiki);
      if (isCacheMiss) {
        cache.set(name + "Wiki", wiki);
      }
    } catch (err) {
      console.log("Error getting Wiki:", err.message);
      reject(err);
    }
  })
}

// get plant images function
const getPlantImages = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let imgs = cache.get(name);
      const isCacheMiss = imgs === undefined;
      if (isCacheMiss) {
        // const browser = await puppeteer.launch({
        //   headless: true,
        //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // });
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
            for (let i = 0; i < 5; i++) {
              images.push(imgs[i].src);
            }
            return images;
          } catch (err) {
            console.log(err);
            return [];
          }
        });
        page.close();
      }
      if (isCacheMiss) {
        cache.set(name, imgs);
      }
      resolve(imgs);
    } catch (err) {
      console.log("Error Retriving Images:", err.message);
      reject(err);
    }
  });
};

module.exports = app;
