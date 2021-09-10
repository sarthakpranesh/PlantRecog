import fetch from "node-fetch";

/*
 *   PlantRecog's ML/DL service to recognize
 *   plants and present their possible
 *   class/specie name. The service
 *   consists of multiple routes created
 *   to aid the applications.
 */

const baseUrl = "https://plantrecog.herokuapp.com/v1/";

// isServiceAvailable calls the server to make sure
// if the server's are running and are available
export const isServiceAvailable = async () => {
  try {
    const rawResp = await fetch(baseUrl);
    const resp = await rawResp.json();
    console.log("From service->plantRecog->isServiceAvailable response:", resp);
    return true;
  } catch (err) {
    console.log(
      "From service->plantRecog->isServiceAvailable error:",
      err.message
    );
    return err;
  }
};

// getRecognizedClasses calls the "/all" route on
// server to fetch all the recognized classes for
// a specific version, if no version specified
// then fetched for the latest version available
export const getRecognizedClasses = async () => {
  try {
    const rawResp = await fetch(baseUrl + "details");
    const resp = await rawResp.json();
    console.log(
      "From service->plantRecog->getRecognizedClasses response:",
      resp.message
    );
    return resp.payload;
  } catch (err) {
    console.log(
      "From service->plantRecog->getRecognizedClasses error:",
      err.message
    );
    return err;
  }
};

// getFlowerImagePrediction calls the "/predict"
// route on the server and fetches the top five
// predictions made by ML/DL model
export const getFlowerImagePrediction = async (photoUri) => {
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

    const rawResp = await fetch(baseUrl + "predict", {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: "POST",
      body,
    });
    const resp = await rawResp.json();
    console.log(
      "From service->plantRecog->getFlowerImagePrediction response:",
      resp
    );
    return resp.payload.predictions;
  } catch (err) {
    console.log(
      "From service->photoRecog->getFlowerImagePrediction error:",
      err.message
    );
    return err;
  }
};
