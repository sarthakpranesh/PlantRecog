import analytics from '@react-native-firebase/analytics';
import {useEffect, useRef} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  ToastAndroid,
  Text,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Camera as RNCamera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  PhotoQuality,
} from 'react-native-image-picker';

import {Camera as CameraIcon, Folder} from '../Icons';
import {H2, Paragraph} from '../Typography';
import {colors, radius, SHEET_COLLAPSED} from '../../theme';

const {width, height} = Dimensions.get('window');

export type CameraProps = {
  recognizeImage: (image: string) => void;
};

const imageDimensions = {
  width: 500,
  height: 500,
  quality: 0.7,
};

const sheetPeek = height * (parseFloat(SHEET_COLLAPSED) / 100);

const Camera = ({recognizeImage}: CameraProps) => {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {
      photoResolution: {
        width: imageDimensions.width,
        height: imageDimensions.height,
      },
    },
  ]);
  const {hasPermission, requestPermission} = useCameraPermission();

  useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const camera = useRef<RNCamera>(null);

  const takePictureAsync = async () => {
    analytics().logEvent('click_image');
    const photo = await camera.current?.takePhoto();
    if (photo === undefined) {
      analytics().logEvent('errorTakingPhoto', {photo});
      return ToastAndroid.showWithGravity(
        'Unable to capture image!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
    recognizeImage(photo.path);
  };

  const pickImage = async () => {
    analytics().logEvent('pick_image');

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: imageDimensions.quality as PhotoQuality,
      maxHeight: imageDimensions.height,
      maxWidth: imageDimensions.width,
    };
    const result = await launchImageLibrary(options);

    if (!result.didCancel && result.assets?.[0]?.uri) {
      recognizeImage(result.assets[0].uri);
    }
  };

  if (hasPermission === false) {
    return (
      <View style={styles.permission}>
        <H2 text="Camera access needed" style={{color: colors.cream}} />
        <Paragraph
          text="Allow camera permission to identify plants from a live photo."
          style={styles.permissionCopy}
        />
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant access</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!device) {
    return null;
  }

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
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View
        style={[styles.hintWrap, {top: insets.top + 12}]}
        pointerEvents="none"
      >
        <View style={styles.hintChip}>
          <Text style={styles.hintText}>Point at a flower</Text>
        </View>
      </View>
      <View style={styles.viewfinder} pointerEvents="none">
        <View style={[styles.corner, styles.cornerTl]} />
        <View style={[styles.corner, styles.cornerTr]} />
        <View style={[styles.corner, styles.cornerBl]} />
        <View style={[styles.corner, styles.cornerBr]} />
      </View>
      <View style={[styles.controls, {bottom: sheetPeek + 8}]}>
        <View style={styles.sideSlot} />
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={takePictureAsync}
          activeOpacity={0.85}
          accessibilityLabel="Capture photo"
        >
          <View style={styles.shutterInner}>
            <CameraIcon color={colors.forest} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={pickImage}
          activeOpacity={0.85}
          accessibilityLabel="Open gallery"
        >
          <Folder color={colors.cream} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CORNER = 28;
const FRAME = Math.min(width * 0.72, 280);
const VIEWFINDER_TOP = Math.max(72, (height * 0.58 - FRAME) / 2);

const styles = StyleSheet.create({
  camera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.ink,
  },
  permission: {
    flex: 1,
    width,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionCopy: {
    color: colors.sage,
    textAlign: 'center',
    marginTop: 8,
  },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: colors.moss,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  permissionBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(8, 16, 10, 0.28)',
  },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintChip: {
    backgroundColor: colors.frostDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(244, 240, 230, 0.18)',
  },
  hintText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  viewfinder: {
    position: 'absolute',
    top: VIEWFINDER_TOP,
    alignSelf: 'center',
    width: FRAME,
    height: FRAME,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.cream,
  },
  cornerTl: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  cornerTr: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  cornerBl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  cornerBr: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  controls: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: {
    width: 56,
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 240, 230, 0.16)',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.frostDark,
    borderWidth: 1,
    borderColor: 'rgba(244, 240, 230, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Camera;
