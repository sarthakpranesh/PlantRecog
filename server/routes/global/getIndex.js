const app = require("express")();

// index route for server availability check
app.get("/", (res, _) => {
    return res.res.status(200).setHeader("Content-type", "application/json").send(
      JSON.stringify({
        message: "Server Up and Fine",
      })
    );
});

module.exports = app;
