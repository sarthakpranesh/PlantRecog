import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import fetch from 'node-fetch';

// importing services
import { isServiceAvailable, getFlowerImagePrediction } from './services/plantRecog';

const {width, height} = Dimensions.get('screen');

let camera: Camera;

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const [isPlantServiceUp, { status }] = await Promise.all([
        isServiceAvailable(),
        Camera.requestPermissionsAsync()
      ])
      if (!isPlantServiceUp) {
        Alert.alert('Service Down', 'The service is currently unavailable, please check later');
      }
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePictureAsync = async () => {
    if (camera === null) {
      return;
    }

    const photo = await camera.takePictureAsync({
      quality: 0,
    });

    try {
      const prediction = getFlowerImagePrediction(photo.uri);
      if (prediction !== null) {
        return null;
      } else {
        return Alert.alert(
          'Ops',
          'Looks like something bad happened, please try again!',
        )
      }
    } catch (err) {

    }
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={(r) => camera = r}
        ratio='1:1'
      >
        <TouchableOpacity style={styles.mainCameraButton} onPress={takePictureAsync} />
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'pink',
  },
  camera: {
    flex: 1,
    height,
    width,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",   
  },
  mainCameraButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: `rgba(255, 255, 255, 0.8)`,
    position: 'absolute',
    bottom: 10,
  }
});
