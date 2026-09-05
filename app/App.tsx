import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import analytics from '@react-native-firebase/analytics';
import remoteConfig from '@react-native-firebase/remote-config';
import {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  BackHandler,
  Image,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
  ActivityIndicator,
  Text,
} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {GestureHandlerRootView, FlatList} from 'react-native-gesture-handler';
import {SystemBars} from 'react-native-edge-to-edge';

import CusCamera from './components/Camera';
import {Github, Leaf} from './components/Icons';
import {H1, H2, H3, Paragraph} from './components/Typography';
import {floatToPercentage} from './services/math';
import {isServiceAvailable, getFlowerImagePrediction} from './services/plantRecog';
import type {Predictions, PlantDetails} from './types';
import {colors, radius, SHEET_COLLAPSED, SHEET_EXPANDED} from './theme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [SHEET_COLLAPSED, SHEET_EXPANDED], []);
  const insets = useSafeAreaInsets();

  const [appIsReady, setAppIsReady] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [allPredicted, setAllPredicted] = useState<Predictions>([
    {
      name: '',
      score: 0,
    },
  ]);
  const [details, setDetails] = useState<PlantDetails>({
    images: [],
    description: '',
    link: '',
    loaded: false,
  });
  const [recognized, setRecognized] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      await Promise.all([
        remoteConfig().setDefaults({
          server: '[]',
        }),
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
          buttonNeutral: 'Ask Me Later',
        }),
      ]);
      await remoteConfig().fetchAndActivate();
      setAppIsReady(true);
      await analytics().logEvent('app_open', {
        time: Date.now(),
      });
      const isPlantServiceUp = await isServiceAvailable();
      if (!isPlantServiceUp) {
        Alert.alert(
          'Oh! Snap',
          'The service is currently unavailable, please check later!',
          [{text: 'Close App', onPress: () => BackHandler.exitApp()}],
        );
      }
      setRecognized(isPlantServiceUp.recognized);
    })();
  }, []);

  const recognizeImage = async (nextImage: string) => {
    try {
      await Promise.all([
        analytics().logEvent('predict_image'),
        setAllPredicted([
          {
            name: 'Processing',
            score: 0,
          },
        ]),
        setImage(`file://${nextImage}`),
        setDetails({
          images: [],
          description: '',
          link: '',
          loaded: false,
        }),
      ]);
      bottomSheetRef.current?.snapToIndex(1);
      const predictPayload = await getFlowerImagePrediction(`file://${nextImage}`);
      if (predictPayload !== null) {
        setAllPredicted(predictPayload.predictions);
        setDetails({
          images: predictPayload.gyanData.images ?? [],
          description: predictPayload.gyanData.description ?? '',
          link: predictPayload.gyanData.link ?? '',
          loaded: true,
        });
      } else {
        return Alert.alert(
          'Ops',
          'Looks like something bad happened, please try again!',
        );
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const resetResult = useCallback(() => {
    setImage(null);
    setAllPredicted([{name: '', score: 0}]);
    setDetails({
      images: [],
      description: '',
      link: '',
      loaded: false,
    });
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const isProcessing = allPredicted[0]?.name === 'Processing';

  const renderImages = () => {
    return (
      <View style={styles.section}>
        <H3 text="Plant Images" />
        {!details.loaded ? (
          <View style={styles.inlineLoad}>
            <ActivityIndicator size="small" color={colors.moss} />
            <Paragraph text="Gathering photos…" style={styles.inlineLoadText} />
          </View>
        ) : (
          <FlatList
            style={styles.imageRail}
            contentContainerStyle={styles.imageRailContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={details.images}
            keyExtractor={(_, i) => `${i}`}
            renderItem={({item}) => {
              return <Image style={styles.railImage} source={{uri: item}} />;
            }}
            ListEmptyComponent={
              <Paragraph
                text="No reference photos found for this plant."
                style={styles.emptyCopy}
              />
            }
          />
        )}
      </View>
    );
  };

  const renderWiki = () => {
    const emptyDesc =
      !details?.description || details.description.length === 0;
    return (
      <View style={styles.section}>
        <H3 text="Description" />
        {!details.loaded ? (
          <View style={styles.inlineLoad}>
            <ActivityIndicator size="small" color={colors.moss} />
            <Paragraph text="Reading Wikipedia…" style={styles.inlineLoadText} />
          </View>
        ) : (
          <View style={styles.wikiCard}>
            <Paragraph
              text={
                emptyDesc
                  ? 'Unable to extract details from Wikipedia.'
                  : details.description
              }
            />
            {details?.link ? (
              <TouchableOpacity
                style={styles.wikiBtn}
                onPress={() => Linking.openURL(details.link)}
                activeOpacity={0.85}
              >
                <Text style={styles.wikiBtnText}>Open in Wikipedia</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const renderOtherPrediction = () => {
    if (!allPredicted || allPredicted.length <= 1) {
      return null;
    }
    const others = allPredicted.slice(1).filter(d => d.score !== 0);
    if (others.length === 0) {
      return null;
    }
    return (
      <View style={styles.section}>
        <H3 text="Other Predictions" />
        {others.map(d => (
          <View style={styles.predRow} key={d.name}>
            <View style={styles.predMeta}>
              <Text style={styles.predName}>{prettyName(d.name)}</Text>
              <Text style={styles.predScore}>{floatToPercentage(d.score)}</Text>
            </View>
            <View style={styles.predTrack}>
              <View
                style={[
                  styles.predFill,
                  {
                    width: `${Math.max(6, Math.round(d.score * 100))}%`,
                    backgroundColor: barColor(d.score),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWelcome = () => {
    return (
      <View>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Leaf color={colors.cream} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandEyebrow}>Open source</Text>
            <H1 text="PlantRecog" />
          </View>
        </View>
        <Paragraph
          text="Identify flowers with a single photo. Point the lens, snap, and learn the name plus a short botanical note."
        />
        <View style={styles.section}>
          <H3 text="Get Started" />
          <View style={styles.stepCard}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>1</Text>
            </View>
            <View style={styles.stepBody}>
              <H2 text="Snap a bloom" />
              <Paragraph text="Center a flower in the frame and tap the shutter." />
            </View>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>2</Text>
            </View>
            <View style={styles.stepBody}>
              <H2 text="Or pick from gallery" />
              <Paragraph text="Already have a photo? Open the folder button to choose it." />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <H3 text="About" />
          <Paragraph
            text="PlantRecog is free and open. App, API, and research live on GitHub so anyone can host or extend the project."
          />
          <TouchableOpacity
            style={styles.github}
            onPress={async () => {
              await analytics().logEvent('github_open');
              Linking.openURL('https://github.com/sarthakpranesh/PlantRecog');
            }}
            activeOpacity={0.85}
          >
            <Github color={colors.forest} />
            <Text style={styles.githubText}>View on GitHub</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResult = () => {
    if (image === null) {
      return null;
    }
    return (
      <View>
        <View style={styles.heroWrap}>
          <Image style={styles.plantImage} source={{uri: image}} />
          <View style={styles.heroScrim} />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={resetResult}
            activeOpacity={0.8}
            accessibilityLabel="Clear result"
            hitSlop={8}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        {isProcessing ? (
          <View style={styles.processing}>
            <ActivityIndicator size="small" color={colors.moss} />
            <H2 text="Reading the bloom…" />
            <Paragraph text="Matching petals against the flower model." />
          </View>
        ) : (
          <>
            <View style={styles.resultHead}>
              <H1 text={allPredicted[0].name} style={styles.resultTitle} />
              {allPredicted[0].score > 0 ? (
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillText}>
                    {floatToPercentage(allPredicted[0].score)} match
                  </Text>
                </View>
              ) : null}
            </View>
            {renderImages()}
            {renderWiki()}
            {renderOtherPrediction()}
          </>
        )}
      </View>
    );
  };

  const onLayout = useCallback(async () => {
    if (appIsReady) {
      // hide the splash screen
      // TODO: Implement this
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <SystemBars style="light" />
      <CusCamera recognizeImage={recognizeImage} />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        topInset={insets.top}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.scrollViewContainer,
            {paddingBottom: 28 + insets.bottom},
          ]}
          showsVerticalScrollIndicator={false}
        >
          {image ? renderResult() : renderWelcome()}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function prettyName(name: string) {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function barColor(score: number) {
  if (score >= 0.45) {
    return colors.moss;
  }
  if (score >= 0.2) {
    return colors.gold;
  }
  return colors.muted;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  sheetBg: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetHandle: {
    backgroundColor: colors.sage,
    width: 42,
    height: 5,
  },
  scrollViewContainer: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCopy: {
    flex: 1,
  },
  brandEyebrow: {
    color: colors.moss,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginBottom: 22,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  section: {
    marginTop: 18,
    gap: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepIndexText: {
    color: colors.cream,
    fontWeight: '700',
    fontSize: 13,
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  github: {
    marginTop: 6,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  githubText: {
    color: colors.forest,
    fontWeight: '700',
    fontSize: 15,
  },
  heroWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  plantImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    top: '60%',
    backgroundColor: 'rgba(12, 22, 16, 0.18)',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(12, 22, 16, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  processing: {
    marginTop: 16,
    alignItems: 'flex-start',
    gap: 6,
  },
  resultHead: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultTitle: {
    flex: 1,
  },
  scorePill: {
    backgroundColor: colors.forest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  scorePillText: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  inlineLoad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  inlineLoadText: {
    color: colors.muted,
  },
  imageRail: {
    borderRadius: radius.md,
    backgroundColor: colors.paper,
  },
  imageRailContent: {
    padding: 8,
    gap: 8,
  },
  railImage: {
    width: 124,
    height: 168,
    resizeMode: 'cover',
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  emptyCopy: {
    color: colors.muted,
    padding: 12,
  },
  wikiCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  wikiBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.leaf,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  wikiBtnText: {
    color: colors.cream,
    fontWeight: '700',
    fontSize: 13,
  },
  predRow: {
    gap: 6,
  },
  predMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predName: {
    color: colors.forest,
    fontWeight: '600',
    fontSize: 14,
  },
  predScore: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 13,
  },
  predTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  predFill: {
    height: '100%',
    borderRadius: 4,
  },
});
