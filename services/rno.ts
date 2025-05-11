import analytics from "@react-native-firebase/analytics";
import fetch from "cross-fetch";
import { Platform } from "react-native";

/*
 *   Gyan API used to get details about the
 *   recognized plant
 */

const baseUrl = "https://rno.sarthak.work/";

// Global request builder to be used in all requests
const FetchBuilder = (route: string, conf: RequestInit | undefined) => {
  return new Promise(async (resolve, reject) => {
    try {
      const rawResp = await fetch(baseUrl + route, conf);
      const resp = await rawResp.json();
      console.log(`Service -> rno -> ${baseUrl + route} response:`, resp.name);
      resolve(resp);
    } catch (err: any) {
      console.log(`Service -> rno -> ${baseUrl + route} error:`, err.message);
      await analytics().logEvent("rno_api_error", {
        message: err.message,
      });
      reject(err);
    }
  });
};

export const createSession: () => Promise<any> = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp: any = await FetchBuilder("session/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: Platform.OS,
          deviceMake: Platform.Version,
          deviceModel: Platform.Version,
          userToken: "qwertyuiop",
        }),
      });
      console.log(resp);
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};

export const createPerformanceRecords: (
  data: any,
  sessionId: string
) => Promise<any> = (data, sessionId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resp: any = await FetchBuilder(
        `record/create?sessionId=${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      resolve(resp);
    } catch (err) {
      reject(err);
    }
  });
};
