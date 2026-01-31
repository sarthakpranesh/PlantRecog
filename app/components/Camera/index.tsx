import analytics from "@react-native-firebase/analytics";
import { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  ToastAndroid,
} from "react-native";
import { Camera as RNCamera, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";
import {
  ImageLibraryOptions,
  launchImageLibrary,
  PhotoQuality,
} from "react-native-image-picker";

// importing components
import { Camera as CameraIcon, Folder } from "../Icons";
import { H2 } from "../Typography";

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

  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { photoResolution: { width: imageDimensions.width, height: imageDimensions.height } },
  ])
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const camera = useRef<RNCamera>(null);

  const takePictureAsync = async () => {
    analytics().logEvent("click_image");
    // const photo = await camera.current?.takePictureAsync({
    //   quality: imageDimensions.quality,
    //   width: imageDimensions.width,
    // });
    const photo = await camera.current?.takePhoto();
    if (photo === undefined) {
      analytics().logEvent("errorTakingPhoto", { photo });
      return ToastAndroid.showWithGravity(
        "Unable to capture image!",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
    recognizeImage(photo.path);
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

  if (hasPermission === false) {
    return <H2 text="No access to camera" />;
  }
  if (!device) return null;

  return (
    <View style={styles.camera}>
      <RNCamera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        photo
        video={false}
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
