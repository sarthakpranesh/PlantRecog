import fetch from 'node-fetch';

const baseUrl = 'https://plantrecog.herokuapp.com/';

// index for service availability 
export const isServiceAvailable = async () => {
    try {
        const rawResp = await fetch(baseUrl);
        const resp = await rawResp.json();
        console.log('From service->plantRecog->isServiceAvailable response:', resp);
        return true;
    } catch (err) {
        console.log('From service->plantRecog->isServiceAvailable error:', err.message);
        return false;
    }
}

export const getFlowerImagePrediction = async (photoUri) => {
    try {
        // create the file object
        let imageToSend = {
            uri: photoUri,
            type: 'image/jpeg',
            name: 'image.jpg',
        };
        // create the form data
        let body = new FormData();
        body.append("image", imageToSend);

        const rawResp = await fetch(baseUrl+'predict', {
            headers: {
                'Content-Type': 'multipart/form-data'
              },
            method: 'POST',
            body,
        });
        const resp = await rawResp.json();
        console.log('From service->plantRecog->getFlowerImagePrediction response:', resp);
        if (resp.status === 2) {
            return resp.payload;
        } else {
            return null;
        }
    } catch (err) {
        console.log('From service->photoRecog->getFlowerImagePrediction error:', err.message);
    }
}
