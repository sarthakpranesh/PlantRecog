import fetch from "node-fetch";

/*
 *   PlantRecog's ML/DL service to recognize
 *   plants and present their possible
 *   class/specie name. The service
 *   consists of multiple routes created
 *   to aid the applications.
 */

const baseUrl = "https://plantrecog.herokuapp.com/v1/";

// Global request builder to be used in all requests
const FetchBuilder = (route, conf = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rawResp = await fetch(baseUrl + route, conf);
      const resp = await rawResp.json();
      console.log(
        `Service->PlantRecog->${route} response:`,
        resp.message
      );
      resolve(resp);
    } catch (err) {
      console.log(
        `Service->PlantRecog->${route} error:`,
        err.message
      );
      reject(err);
    }
  })
}


// isServiceAvailable calls the server to make sure
// if the server's are running and are available
export const isServiceAvailable = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await FetchBuilder("");
      resolve(true);
    } catch (err) {
      reject(err);
    }
  })
};

// getRecognizedClasses calls the "/all" route on
// server to fetch all the recognized classes for
// a specific version, if no version specified
// then fetched for the latest version available
export const getRecognizedClasses = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await FetchBuilder("details");
      resolve(resp.payload);
    } catch (err) {
      reject(err);
    }
  })
};

// getFlowerImagePrediction calls the "/predict"
// route on the server and fetches the top five
// predictions made by ML/DL model
export const getFlowerImagePrediction = (photoUri) => {
  return new Promise(async (resolve, reject) => {
    try {
      // create the file object
      const imageToSend = {
        uri: photoUri,
        type: "image/jpeg",
        name: "image.jpg",
      };
      // create the form data
      const body = new FormData();
      body.append("image", imageToSend);
  
      const resp = await FetchBuilder("predict", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        method: "POST",
        body,
      })
      resolve(resp.payload.predictions);
    } catch (err) {
      reject(err);
    }
  })
};

// getSimilarImages calls the "/images/:name"
// route on the server where name is the class
// of the plant
export const getSimilarImages = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await FetchBuilder("images/"+name);
      resolve(resp.payload.images);
    } catch (err) {
      reject(err);
    }
  });
};

// getWiki calls the "/wiki/:name"
// route on the server where name is the class
// to retrieve the wikipedia description of the plant
export const getWiki = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await FetchBuilder("wiki/"+name);
      resolve(resp.payload);
    } catch (err) {
      reject(err);
    }
  });
};
