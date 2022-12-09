import analytics from "@react-native-firebase/analytics";
import fetch from "cross-fetch";

/*
 *   PlantRecog's ML/DL service to recognize
 *   plants and present their possible
 *   class/specie name. The service
 *   consists of multiple routes created
 *   to aid the applications.
 */

const baseUrl = "https://plantrecog.up.railway.app/";

// Global request builder to be used in all requests
const FetchBuilder = (route: string, conf: RequestInit | undefined) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rawResp = await fetch(baseUrl + route, conf);
      const resp = await rawResp.json();
      console.log(`Service->PlantRecog->${route} response:`, resp.message);
      resolve(resp);
    } catch (err: any) {
      console.log(`Service->PlantRecog->${route} error:`, err.message);
      await analytics().logEvent("plantrecog_api_error", {
        message: err.message,
      });
      reject(err);
    }
  });
};

// isServiceAvailable calls the server to make sure
// if the server's are running and are available
// also returns all the recognized classes for the latest model
export const isServiceAvailable: () => Promise<ServiceAvailablePayload> =
  () => {
    return new Promise(async (resolve, reject) => {
      try {
        const resp: any = await FetchBuilder("", undefined);
        resolve(resp.payload);
      } catch (err) {
        reject(err);
      }
    });
  };

// getFlowerImagePrediction calls the "/predict"
// route on the server and fetches the top five
// predictions made by ML/DL model
export const getFlowerImagePrediction: (
  photoUri: string
) => Promise<PredictPayload> = (photoUri) => {
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
      const resp: any = await FetchBuilder("predict", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        method: "POST",
        body,
      });
      resolve(resp.payload);
    } catch (err) {
      reject(err);
    }
  });
};
