import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

// importing components
import { Camera as CameraIcon, Folder } from './components/Icons';

// importing services
import { isServiceAvailable, getFlowerImagePrediction } from './services/plantRecog';
import { H1, H2, H3 } from './components/Typography';

const {width, height} = Dimensions.get('screen');

let camera: Camera;

export default function App() {
  const [hasPermissionCamera, setHasPermissionCamera] = useState(false);
  const [hasPermissionPicker, setHasPermissionPicker] = useState(false);

  const [title, setTitle] = useState<string>("PlantRecog");

  useEffect(() => {
    (async () => {
      const [isPlantServiceUp, cameraPer, pickerPer] = await Promise.all([
        isServiceAvailable(),
        Camera.requestPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync()
      ])
      if (!isPlantServiceUp) {
        Alert.alert('Service Down', 'The service is currently unavailable, please check later');
      } else {
        setInterval(() => {
          isServiceAvailable()
        }, 10*60*1000);
      }
      setHasPermissionCamera(cameraPer.status === 'granted');
      setHasPermissionPicker(pickerPer.status === 'granted');
    })();
  }, []);

  if (hasPermissionCamera === null) {
    return <View />;
  }

  if (hasPermissionCamera === false) {
    return <Text>No access to camera</Text>;
  }

  const takePictureAsync = async () => {
    if (camera === null) {
      return;
    }

    setTitle('Processing Image...');

    const photo = await camera.takePictureAsync({
      quality: 0,
    });

    try {
      const prediction: any = await getFlowerImagePrediction(photo.uri);
      if (prediction !== null) {
        setTitle(prediction.prediction.toUpperCase());
      } else {
        return Alert.alert(
          'Ops',
          'Looks like something bad happened, please try again!',
        )
      }
    } catch (err) {
      console.log('Request failed');
    }
  }

  const pickImage = async () => {
    if (!hasPermissionPicker) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Error',
          'Not having enough permission to open gallery!',
        )
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });

    console.log(result);

    if (!result.cancelled) {
      try {
        const prediction: any = await getFlowerImagePrediction(result.uri);
        if (prediction !== null) {
          setTitle(prediction.prediction.toUpperCase());
        } else {
          return Alert.alert(
            'Ops',
            'Looks like something bad happened, please try again!',
          )
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={(r) => camera = r}
        ratio='1:1'
      >
        <TouchableOpacity
          style={styles.mainCameraButton}
          onPress={takePictureAsync}>
          <CameraIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mainGalleryButton}
          onPress={pickImage}>
          <Folder />
        </TouchableOpacity>
      </Camera>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        <H1 text={title} />
        <H2 text="Know plants with just a click" />
        <H3 text="How we do it? We run our Tensorflow based image classification model as an API service using Nodejs. We currently support 5 flower category." />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  camera: {
    height: width,
    width,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
  },
  mainCameraButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: `rgba(249, 249, 249, 0.8)`,
    position: 'absolute',
    bottom: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: 'black',
    shadowRadius: 8,
  },
  mainGalleryButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: `rgba(249, 249, 249, 0.8)`,
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: 'black',
    shadowRadius: 8,
  },
  scrollViewContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    padding: 8,
    width: width,
  }
});
