const app = require("express")();

// get all model details
app.get("/details", (res, req) => {
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
