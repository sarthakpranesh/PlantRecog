import "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Alert,
  BackHandler,
  Image,
  TouchableOpacity,
} from "react-native";

// importing components
import CusCamera from "./components/Camera";
import { Github } from "./components/Icons";
// importing services
import { H1, H2, H3, Paragraph } from "./components/Typography";
import {
  isServiceAvailable,
  getRecognizedClasses,
  getFlowerImagePrediction,
} from "./services/plantRecog";

const { width } = Dimensions.get("screen");

export default function App() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["48%", "100%"], []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [appIsReady, setAppIsReady] = useState(false);
  const [hasPermissionCamera, setHasPermissionCamera] = useState(false);
  const [hasPermissionPicker, setHasPermissionPicker] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [allPredicted, setAllPredicted] = useState([
    {
      name: "",
      score: null,
    },
  ]);
  const [recognized, setRecognized] = useState([]);

  // do all permission tasks and initial server requests
  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      const [isPlantServiceUp, cameraPer, pickerPer, recogPayload] =
        await Promise.all([
          isServiceAvailable(),
          Camera.requestPermissionsAsync(),
          ImagePicker.requestMediaLibraryPermissionsAsync(),
          getRecognizedClasses(),
        ]);
      if (!isPlantServiceUp) {
        Alert.alert(
          "Oh! Snap",
          "The service is currently unavailable, please check later!",
          [{ text: "Close App", onPress: () => BackHandler.exitApp() }]
        );
      }
      setHasPermissionCamera(cameraPer.status === "granted");
      setHasPermissionPicker(pickerPer.status === "granted");
      setAppIsReady(true);
      setRecognized(recogPayload.recognized);
    })();
  }, []);

  // to avoid flicker remove the splash, when actual app renders after appIsReady changes to "true"
  const onLayout = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // if app is not ready then render nothing
  if (!appIsReady) {
    return null;
  }

  const recognizeImage = async (image: string) => {
    try {
      setAllPredicted([
        {
          name: "Processing",
          score: 0,
        },
      ]);
      setImage(image);
      const payload: any = await getFlowerImagePrediction(image);
      if (payload.predictions !== null) {
        setAllPredicted(payload.predictions);
      } else {
        return Alert.alert(
          "Ops",
          "Looks like something bad happened, please try again!"
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar hidden />
      <CusCamera
        hasPermissionCamera={hasPermissionCamera}
        hasPermissionPicker={hasPermissionPicker}
        recognizeImage={recognizeImage}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollViewContainer}
        >
          {image === null ? null : (
            <>
              <Image style={styles.plantImage} source={{ uri: image }} />
              <H1 text={allPredicted[0].name} />
              {allPredicted.map((d, i) => {
                return (
                  <>
                    <H3 key={`${i}`} text={d.name + ": " + d.score} />
                  </>
                );
              })}
            </>
          )}
          <H2 style={{ marginTop: 10 }} text="Get Started" />
          <Paragraph text="Try taking a photo of your favorite flower, and see what they're called, or Do you already have a flower photo? Open the image gallery to select it." />
          <H2 style={{ marginTop: 10 }} text="About" />
          <Paragraph text="PlantRecog is an Open Source project. It allows you to know plants with just a click. How we do it? We run our Tensorflow based image classification model as an API service using Nodejs. All the components (service + app + research) used in the project are available on Github. Show your support by leaving a 🌟 on our Github Repo (link below)" />
          <TouchableOpacity
            style={styles.github}
            onPress={() =>
              Linking.openURL("https://github.com/sarthakpranesh/PlantRecog")
            }
          >
            <Github />
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#F9F9F9",
    backgroundColor: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  scrollViewContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignContent: "flex-start",
    padding: 8,
    width,
  },
  plantImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
  },
  github: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `rgba(249, 249, 249, 0.8)`,
    alignSelf: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});
