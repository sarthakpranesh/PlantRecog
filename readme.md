<div style="text-align: center">

<img center src="./assets/icon.png" />

</div>

<br />

# PlantRecog

PlantRecog aims to become or lead to the goto "Free Plant Recognition" solution. Why? As of today, 30th August 2021, their aren't many online free services or apps available to solve this problem. The existing solutions are mostly paid and have high subscription amounts per year. I want to create a fairly basic but usable set of services (app + api + models) for people who want to develop tools that recognize plants.

The current version of the project is able to recognize 104 plants using their flowers. This flower recognition model is hosted as an API available for public use and is also used in the PlantRecog App that can be downloaded from `Github Releases` (soon will be available on Google Play Store).

This is work in progress :>

<br />

## App
The PlantRecog expo app is still under development phase, therefore please check out the `pre-release` available in the `Github release` section [here](https://github.com/sarthakpranesh/PlantRecog/releases).

<br />

## Recognition Service
API link - https://plantrecog.herokuapp.com

| Request | Payload | Description |
| --- | --- | --- |
| `get "/"` | `{"message":"Server Up and Fine"}` | Index route to make sure server is running, Heroku puts the server to sleep so it'll be great to call this in start of your app to wake the server up |
| `get "/details"` | `{"message":"Success","payload":{"recognized":["Abutilon","Acacia",...,"Zenobia","Zinnia"]}}` | Get all the recognized classes for the latest model available on the server |
| `post "/predict" content-type="multipart/form-data" parameter="image"` | `{"messages":"Success","payload":{"predictions":[{"name":"MorningGlory","score":0.38581109046936035},{"name":"Acacia","score":0.14158271253108978},{"name":"MoonflowerVine","score":0.12431787699460983},{"name":"LilyoftheValley","score":0.06644751876592636},{"name":"FrangipaniFlower","score":0.062477629631757736}]}}` | Post plant image using `multipart/form-data`, parameter name should be `image` and the route will provide the top 5 prediction for the plant image |
| `get "/images/:name"` | `{"message":"Success","payload":{"images":["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBUWFRgVFRUYG/...",...]}}` | Get images scrapped from Google for the name keyword passed to the route, can be used to get images similar to the predicted one |
| `get "/wiki/:name"` | `{"message":"Success","payload":{"description":"A rose is a woody perennial flowering plant of the genus Rosa, in the family Rosaceae, or the flower it bears. There are over three hundred species and tens ...","wikiLink":"https://en.wikipedia.org/wiki/Rose"}}` | Get short description from Wikipedia about the name keyword passed to the route, can be used to get details regarding the recognized plant |

<br />

## Issues
If you come across any issues or have feature requests please open them [here](https://github.com/sarthakpranesh/PlantRecog/issues)

<br />

<div style="text-align:center">

<h3>Made with ♥</h3>

</div>