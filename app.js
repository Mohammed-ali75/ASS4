const request = require("request");
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

const path = require("path");
const x = path.join(__dirname, "/");
app.use(express.static(x));

app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index", {
    title: "HOME",
    desc: "This is home page",
  });
});

const forecast = (latitude, longitude, callback) => {
  const url =
    "https://api.weatherapi.com/v1/current.json?key=51a20bc2793045b6b26142621220803&q=" +
    latitude +
    "," +
    longitude;
  request({ url, json: true }, (error, response) => {
    if (error) {
      callback("Unable to connect weather service", undefined);
    } else if (response.body.error) {
      callback(response.body.error.message, undefined);
    } else {
      callback(
        undefined,
        response.body.location.name +
          " It is " +
          response.body.current.condition.text +
          " and temp is " +
          response.body.current.temp_c
      );
    }
  });
};

const geocode = (address, callback) => {
  const geocodeUrl =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    address +
    ".json?access_token=pk.eyJ1IjoiZmFyYWgxMjMiLCJhIjoiY2tpb3ZrNnE4MDB0cjJ0cDlzZXZ5eHQ5dSJ9.F6mgRF14yRJ6WN9JqtpWtw";
  request({ url: geocodeUrl, json: true }, (error, response) => {
    if (error) {
      callback("Unable to connect geocde service", undefined);
    } else if (response.body.message) {
      callback(response.body.message, undefined);
    } else if (response.body.features.length == 0) {
      callback("Your search is invalid", undefined);
    } else {
      callback(undefined, {
        latitude: response.body.features[0].center[0],
        longitude: response.body.features[0].center[1],
      });
    }
  });
};

app.get("/weather", (req, res) => {
  if (!req.query.address) {
    return res.send({
      error: "You must provide address",
    });
  }
  geocode(req.query.address, (error, data) => {
    if (error) {
      return res.send({ error });
    }
    forecast(data.latitude, data.longitude, (error, forecastData) => {
      if (error) {
        return res.send({ error });
      }
      res.send({
        forecast: forecastData,
        location: req.query.address,
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
