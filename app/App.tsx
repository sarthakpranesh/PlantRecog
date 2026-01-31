import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import analytics from "@react-native-firebase/analytics";
import remoteConfig from "@react-native-firebase/remote-config";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Alert,
  BackHandler,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView, FlatList } from "react-native-gesture-handler";

// importing components
import CusCamera from "./components/Camera";
import { Github } from "./components/Icons";
import { H1, H2, H3, Paragraph } from "./components/Typography";
// importing services
import { floatToPercentage } from "./services/math";
import {
  isServiceAvailable,
  getFlowerImagePrediction,
} from "./services/plantRecog";
import type { Predictions, PlantDetails } from "./types";

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
      await Promise.all([
        remoteConfig().setDefaults({
          server: "[]",
        }),
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: "Permission to use camera",
          message: "We need your permission to use your camera",
          buttonPositive: "Ok",
          buttonNegative: "Cancel",
          buttonNeutral: "Ask Me Later",
        }),
      ]);
      await remoteConfig().fetchAndActivate();
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
        setImage(`file://${image}`),
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
      const predictPayload = await getFlowerImagePrediction(`file://${image}`);
      if (predictPayload !== null) {
        setAllPredicted(predictPayload.predictions);
        setDetails({
          images: [],
          description: "",
          link: "",
          ...predictPayload.gyanData,
          loaded: true,
        });
      } else {
        return Alert.alert(
          "Ops",
          "Looks like something bad happened, please try again!"
        );
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const renderImages = () => {
    return (
      <>
        <H3 text="Plant Images" />
        {!details.loaded ? (
          <Paragraph text="Loading..." />
        ) : (
          <FlatList
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
            ListEmptyComponent={
              <Paragraph text="Unable to extract images from net!" />
            }
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
                details?.description && details?.description?.length === 0
                  ? "Unable to extract details from Wikipedia!"
                  : details.description
              }
            />
            {details?.link && details?.link?.length !== 0 && (
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
    if (!allPredicted || allPredicted.length <= 1) {
      return null;
    }
    return (
      <>
        <H3 text="Other Predictions" />
        {allPredicted.slice(1).map((d) => {
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

  // to avoid flicker remove the splash, when actual app renders after appIsReady changes to "true"
  const onLayout = useCallback(async () => {
    if (appIsReady) {
      // hide the splash screen
      // TODO: Implement this
    }
  }, [appIsReady]);

  // if app is not ready then render nothing
  if (!appIsReady) {
    return null;
  }

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
              text={`PlantRecog is an Open Source project, which allows you to know plants with just a click. All the components (service + app + research) used in the project are available on Github. The app can currently recognize ${recognized?.length} plants from there flowers.`}
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
