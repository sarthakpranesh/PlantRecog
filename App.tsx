import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';

const {width, height} = Dimensions.get('screen');

let camera: Camera;

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
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

    const photo = await camera.takePictureAsync();
    console.log(photo);
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(r) => camera = r}>
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
