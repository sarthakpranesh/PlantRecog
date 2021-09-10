const app = require("express")();

// get all model details
app.get("/details", (res, req) => {
    return res.res.setHeader("Content-type", "application/json").send(
        JSON.stringify({
            message: "Success",
            payload: {
                recognized: Object.keys(req.req.mlModel.classes),
            },
        })
    );
});

module.exports = app;
