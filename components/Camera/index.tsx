import { Camera as ExpoCamera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";

// importing components
import { Camera as CameraIcon, Folder } from "../Icons";

const { width, height } = Dimensions.get("screen");
let camera: ExpoCamera;

export type CameraProps = {
  hasPermissionCamera: boolean;
  hasPermissionPicker: boolean;
  recognizeImage: (image: string) => void;
};

const Camera = ({
  hasPermissionCamera,
  hasPermissionPicker,
  recognizeImage,
}: CameraProps) => {
  const takePictureAsync = async () => {
    if (!hasPermissionCamera) {
      const { status } = await ExpoCamera.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Oh! Snap", "App does not have permission for the Camera!");
      }
    }

    const photo = await camera.takePictureAsync({
      quality: 1,
    });

    recognizeImage(photo.uri);
  };

  const pickImage = async () => {
    if (!hasPermissionPicker) {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Oh! Snap",
          "Not having enough permission to open gallery!"
        );
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      recognizeImage(result.uri);
    }
  };

  return (
    <ExpoCamera
      style={styles.camera}
      type={ExpoCamera.Constants.Type.back}
      ref={(r) => (camera = r)}
      ratio="1:1"
    >
      <TouchableOpacity
        style={styles.mainCameraButton}
        onPress={takePictureAsync}
      >
        <CameraIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainGalleryButton} onPress={pickImage}>
        <Folder />
      </TouchableOpacity>
    </ExpoCamera>
  );
};

const styles = StyleSheet.create({
  camera: {
    height: height / 2 + 50,
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
    position: "absolute",
    bottom: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
  },
  mainGalleryButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: `rgba(249, 249, 249, 0.8)`,
    position: "absolute",
    bottom: 60,
    right: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 8,
      height: 8,
    },
    shadowColor: "black",
    shadowRadius: 8,
  },
});

export default Camera;
