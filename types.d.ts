declare type Prediction = {
    name: string;
    score: number;
}

declare type Predictions = Prediction[];

declare type PlantDetails = {
    images: string[],
    description: string;
    wikiLink: string;
}

// API PAYLOADS
declare type ServiceAvailablePayload = {
    recognized: string[];
}
declare type PredictPayload = {
    predictions: Predictions;
}
declare type DetailsPayload = PlantDetails;