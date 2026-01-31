import analytics from "@react-native-firebase/analytics";
import type { DetailsPayload } from "../types";

/*
 *   Gyan API used to get details about the
 *   recognized plant
 */

const baseUrl = "https://gyan.sarthak.work/";

// Global request builder to be used in all requests
const FetchBuilder = (route: string, conf: RequestInit | undefined) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(baseUrl + route);
      const rawResp = await fetch(baseUrl + route, conf);
      const resp = await rawResp.json();
      console.log(`Service->Gyan->${route} response:`, resp.name);
      resolve(resp);
    } catch (err: any) {
      console.log(`Service->Gyan->${route} error:`, err.message);
      await analytics().logEvent("gyan_api_error", {
        message: err.message,
      });
      reject(err);
    }
  });
};

// getPlantDetails calls the "/:name"
// route on the Gyan API where name is the class
// of the plant to get plant details
export const getPlantDetails: (name: string) => Promise<DetailsPayload> = (
  name
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp: any = await FetchBuilder(`${name} plant`, undefined);
      if (resp.description.length === 0) {
        analytics().logEvent(`gyanAPIWikiMiss`, {
          name,
          apiResponse: resp,
        });
      }
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};
