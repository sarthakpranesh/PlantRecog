import analytics from "@react-native-firebase/analytics";
import { useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  ToastAndroid,
} from "react-native";
import { RNCamera } from "react-native-camera";
import {
  ImageLibraryOptions,
  launchImageLibrary,
  PhotoQuality,
} from "react-native-image-picker";

// importing components
import { Camera as CameraIcon, Folder } from "../Icons";

const { width, height } = Dimensions.get("window");

export type CameraProps = {
  recognizeImage: (image: string) => void;
};

// helper data
const imageDimensions = {
  width: 500,
  height: 500,
  quality: 0.7,
};

const Camera = ({ recognizeImage }: CameraProps) => {
  const camera = useRef<RNCamera>(null);

  const takePictureAsync = async () => {
    analytics().logEvent("click_image");
    const photo = await camera.current?.takePictureAsync({
      quality: imageDimensions.quality,
      width: imageDimensions.width,
    });
    if (photo === undefined) {
      analytics().logEvent("errorTakingPhoto", { photo });
      return ToastAndroid.showWithGravity(
        "Unable to capture image!",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
    recognizeImage(photo.uri);
  };

  const pickImage = async () => {
    analytics().logEvent("pick_image");

    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: imageDimensions.quality as PhotoQuality,
      maxHeight: imageDimensions.height,
      maxWidth: imageDimensions.width,
    };
    const result = await launchImageLibrary(options);

    if (!result.didCancel) {
      recognizeImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.camera}>
      <RNCamera
        ref={camera}
        style={StyleSheet.absoluteFill}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.auto}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: "Permission to use camera",
          message: "We need your permission to use your camera",
          buttonPositive: "Ok",
          buttonNegative: "Cancel",
        }}
      />
      <TouchableOpacity
        style={styles.mainCameraButton}
        onPress={takePictureAsync}
      >
        <CameraIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainGalleryButton} onPress={pickImage}>
        <Folder />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    height: height / 2 + 100,
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
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    position: "absolute",
    bottom: 90,
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
    backgroundColor: "rgba(249, 249, 249, 0.8)",
    position: "absolute",
    bottom: 90,
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
