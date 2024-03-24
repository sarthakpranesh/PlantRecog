declare type Prediction = {
  name: string;
  score: number;
};

declare type Predictions = Prediction[];

declare type PlantDetails = {
  images: string[];
  description: string;
  link: string;
  loaded: boolean;
};

// API PAYLOADS
declare type ServiceAvailablePayload = {
  recognized: string[];
};
declare type PredictPayload = {
  predictions: Predictions;
  gyanData: PlantDetails;
};
declare type DetailsPayload = PlantDetails;
