import "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import analytics from "@react-native-firebase/analytics";
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
  SafeAreaView,
  Dimensions,
  Alert,
  BackHandler,
  Image,
  TouchableOpacity,
} from "react-native";

// importing components
import CusCamera from "./components/Camera";
import { Github } from "./components/Icons";
import { H1, H2, H3, Paragraph } from "./components/Typography";
// importing services
import { floatToPercentage } from "./services/math";
import {
  isServiceAvailable,
  getRecognizedClasses,
  getFlowerImagePrediction,
  getPlantDetails,
} from "./services/plantRecog";

const { width } = Dimensions.get("screen");

export default function App() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["48%", "100%"], []);

  const [appIsReady, setAppIsReady] = useState(false);
  const [hasPermissionCamera, setHasPermissionCamera] = useState(false);
  const [hasPermissionPicker, setHasPermissionPicker] = useState(false);

  const [image, setImage] = useState<string | null>(null);
  const [allPredicted, setAllPredicted] = useState([
    {
      name: "",
      score: 0,
    },
  ]);
  const [details, setDetails] = useState({
    images: [],
    description: "",
    wikiLink: "",
  });
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
      await analytics().logEvent("app_open", {
        time: Date.now(),
      });
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
      // Remove old predictions if any
      await Promise.all([
        analytics().logEvent("predict_image"),
        setAllPredicted([
          {
            name: "Processing",
            score: 0,
          },
        ]),
        setImage(image),
        setDetails({
          images: [],
          description: "",
          wikiLink: "",
        })
      ]);
      // animate bottom sheet to cover whole screen
      bottomSheetRef.current?.snapToIndex(1);
      // call prediction service with image
      const predictions: any = await getFlowerImagePrediction(image);
      if (predictions !== null) {
        setAllPredicted(predictions);
      } else {
        return Alert.alert(
          "Ops",
          "Looks like something bad happened, please try again!"
        );
      }
      const details = await getPlantDetails(predictions[0].name)
      console.log(details);
      setDetails(details);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const renderImages = () => {
    return (
      <>
        <H3 text="Plant Images" />
        {details.images.length === 0 ? (
          <Paragraph text="Loading..." />
        ) : (
          <BottomSheetFlatList
            style={{
              borderRadius: 8,
              backgroundColor: "#F9F9F9",
              marginBottom: 10,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={details.images}
            keyExtractor={(_, i) => `${i}`}
            renderItem={({ item }) => {
              return (
                <Image
                  style={{
                    width: 100,
                    height: 160,
                    resizeMode: "cover",
                    margin: 4,
                    borderRadius: 8,
                  }}
                  source={{ uri: item }}
                />
              );
            }}
          />
        )}
      </>
    );
  };

  const renderWiki = () => {
    return (
      <>
        <H3 text="Description" />
        {details.description.length === 0 ? (
          <Paragraph text="Loading..." />
        ) : (
          <>
            <Paragraph text={details.description} />
            <TouchableOpacity
              onPress={() => {
                if (details.wikiLink !== "") {
                  Linking.openURL(details.wikiLink);
                }
              }}
            >
              <H3
                style={{ color: "blue", marginTop: 0 }}
                text="Open in Wikipedia"
              />
            </TouchableOpacity>
          </>
        )}
      </>
    );
  };

  const renderOtherPrediction = () => {
    if (allPredicted.length <= 1) {
      return null;
    }
    return (
      <>
        <H3 text="Other Predictions" />
        {allPredicted.slice(1).map((d, i) => {
          if (d.score === 0) {
            return null;
          }
          return (
            <Paragraph
              style={{ marginTop: 0 }}
              key={d.name}
              text={`Class: ${d.name}, Accuracy: ${floatToPercentage(d.score)}`}
            />
          );
        })}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} onLayout={onLayout}>
      <StatusBar hidden />
      <CusCamera
        hasPermissionCamera={hasPermissionCamera}
        hasPermissionPicker={hasPermissionPicker}
        recognizeImage={recognizeImage}
      />
      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}
        >
          {image === null ? null : (
            <View>
              <Image style={styles.plantImage} source={{ uri: image }} />
              <H1 text={allPredicted[0].name} />
              <Paragraph
                text={`Accuracy: ${floatToPercentage(allPredicted[0].score)}`}
              />
              {renderImages()}
              {renderWiki()}
              {renderOtherPrediction()}
            </View>
          )}
          <H2 text="Get Started" />
          <Paragraph text="Try taking a photo of your favorite flower, and see what they're called, or Do you already have a flower photo? Open the image gallery to select it." />
          <H2 text="About" />
          <Paragraph
            text={`PlantRecog is an Open Source project, it allows you to know plants with just a click. How we do it? We run our Tensorflow based image classification model as an API service using Nodejs. All the components (service + app + research) used in the project are available on Github and we can currently recognize ${recognized.length} plants from there flowers. Show your support by leaving a 🌟 on our Github Repo (click icon below)`}
          />
          <TouchableOpacity
            style={styles.github}
            onPress={async () => {
              await analytics().logEvent("github_open");
              Linking.openURL("https://github.com/sarthakpranesh/PlantRecog")
            }}
          >
            <Github />
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "white",
    alignSelf: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    elevation: 4,
  },
});
