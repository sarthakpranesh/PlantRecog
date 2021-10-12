const app = require("express")();

// index route for server availability check
app.get("/", (res, req) => {
  const classes = Object.keys(req.req.mlModel.classes);
  return res.res
    .status(200)
    .setHeader("Content-type", "application/json")
    .send(
      JSON.stringify({
        message: "Success",
        payload: {
          recognized: classes,
        },
      })
    );
});

module.exports = app;
