/**
 * Single prediction from the plant recognition model.
 */
export interface Prediction {
  name: string;
  score: number;
}

/**
 * Array of predictions (e.g. top-N from getFlowerImagePrediction).
 */
export type Predictions = Prediction[];

/**
 * Plant details shown in the bottom sheet (images, description, wiki link, load state).
 */
export interface PlantDetails {
  images: string[];
  description: string;
  link: string;
  loaded: boolean;
}

/**
 * Response payload from the Gyan API (getPlantDetails) for a plant's wiki/details.
 */
export interface DetailsPayload {
  name?: string;
  description: string;
  images?: string[];
  link?: string;
}

/**
 * Response payload from the predict route (getFlowerImagePrediction): predictions and plant details.
 */
export interface PredictPayload {
  predictions: Predictions;
  gyanData: DetailsPayload;
}

/**
 * Response payload from the service availability check (isServiceAvailable): recognized plant classes.
 */
export interface ServiceAvailablePayload {
  recognized: string[];
}
