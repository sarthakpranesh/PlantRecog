import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import analytics from "@react-native-firebase/analytics";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Alert,
  BackHandler,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// importing components
import CusCamera from "./components/Camera";
import { Github } from "./components/Icons";
import { H1, H2, H3, Paragraph } from "./components/Typography";
// importing services
import { getPlantDetails } from "./services/gyan";
import { floatToPercentage } from "./services/math";
import {
  isServiceAvailable,
  getFlowerImagePrediction,
} from "./services/plantRecog";

const { width } = Dimensions.get("screen");

export default function App() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["48%", "100%"], []);

  const [appIsReady, setAppIsReady] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [allPredicted, setAllPredicted] = useState<Predictions>([
    {
      name: "",
      score: 0,
    },
  ]);
  const [details, setDetails] = useState<PlantDetails>({
    images: [],
    description: "",
    link: "",
    loaded: false,
  });
  const [recognized, setRecognized] = useState<string[]>([]);

  // do all permission tasks and initial server requests
  useEffect(() => {
    (async () => {
      // await SplashScreen.preventAutoHideAsync();
      const [cameraPer] = await Promise.all([
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: "Permission to use camera",
          message: "We need your permission to use your camera",
          buttonPositive: "Ok",
          buttonNegative: "Cancel",
          buttonNeutral: "Ask Me Later",
        }),
      ]);
      setAppIsReady(true);
      await analytics().logEvent("app_open", {
        time: Date.now(),
      });
      // Calling the service last to make sure it's not blocking app startup due to Heroku server sleep
      const isPlantServiceUp = await isServiceAvailable();
      if (!isPlantServiceUp) {
        Alert.alert(
          "Oh! Snap",
          "The service is currently unavailable, please check later!",
          [{ text: "Close App", onPress: () => BackHandler.exitApp() }]
        );
      }
      setRecognized(isPlantServiceUp.recognized);
    })();
  }, []);

  // to avoid flicker remove the splash, when actual app renders after appIsReady changes to "true"
  const onLayout = useCallback(async () => {
    if (appIsReady) {
      // await SplashScreen.hideAsync();
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
          link: "",
          loaded: false,
        }),
      ]);
      // animate bottom sheet to cover whole screen
      bottomSheetRef.current?.snapToIndex(1);
      // call prediction service with image
      const predictPayload = await getFlowerImagePrediction(image);
      if (predictPayload !== null) {
        setAllPredicted(predictPayload.predictions);
      } else {
        return Alert.alert(
          "Ops",
          "Looks like something bad happened, please try again!"
        );
      }
      const details = await getPlantDetails(predictPayload.predictions[0].name);
      details.loaded = true;
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
        {!details.loaded ? (
          <Paragraph text="Loading..." />
        ) : (
          <>
            <Paragraph
              text={
                details.description.length === 0
                  ? "Can't find Wiki details"
                  : details.description
              }
            />
            {details.description.length === 0 ? null : (
              <TouchableOpacity
                onPress={() => {
                  if (details.link !== "") {
                    Linking.openURL(details.link);
                  }
                }}
              >
                <H3
                  style={{ color: "blue", marginTop: 0 }}
                  text="Open in Wikipedia"
                />
              </TouchableOpacity>
            )}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} onLayout={onLayout}>
        <StatusBar hidden />
        <CusCamera recognizeImage={recognizeImage} />
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
              text={`PlantRecog is an Open Source project, which allows you to know plants with just a click. All the components (service + app + research) used in the project are available on Github. The app can currently recognize ${recognized.length} plants from there flowers.`}
            />
            <TouchableOpacity
              style={styles.github}
              onPress={async () => {
                await analytics().logEvent("github_open");
                Linking.openURL("https://github.com/sarthakpranesh/PlantRecog");
              }}
            >
              <Github />
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
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
