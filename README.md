<img src="./images/banner.png" />

<br />

PlantRecog aims to become or lead to the goto "Free Plant Recognition" solution. Why? As of today, 30th August 2021, there aren't many online free services or apps available to solve this problem. The existing solutions are mostly paid and have high subscription amounts per year. I want to create a fairly basic but usable set of services (app + api + models) for people who want to develop tools that recognize plants.

The current version of the project is able to recognize 299 plants using their flowers. This flower recognition model and API developed under this project are available freely in the repository. They can be self hosted by anyone who wants to use these services for building their own apps.

<br />

## App
PlantRecog is now available on Google Play Store

<a href="https://play.google.com/store/apps/details?id=com.plantrecog"><img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png" height=60px /></a>

Or get the latest release from [GitHub Release Page](https://github.com/sarthakpranesh/PlantRecog/releases)

<br />

## Recognition Service
This is the documentation for the server API that is used in PlantRecog. This server can be hosted online to develop apps that require such a service.

| Request | Payload | Description |
| --- | --- | --- |
| `get "/"` | `{"message":"Server Up and Fine"}` | Index route to make sure server is running, Heroku puts the server to sleep so it'll be great to call this in start of your app to wake the server up |
| `get "/details"` | `{"message":"Success","payload":{"recognized":["Abutilon","Acacia",...,"Zenobia","Zinnia"]}}` | Get all the recognized classes for the latest model available on the server |
| `post "/predict" content-type="multipart/form-data" parameter="image"` | `{"messages":"Success","payload":{"predictions":[{"name":"MorningGlory","score":0.38581109046936035},{"name":"Acacia","score":0.14158271253108978},{"name":"MoonflowerVine","score":0.12431787699460983},{"name":"LilyoftheValley","score":0.06644751876592636},{"name":"FrangipaniFlower","score":0.062477629631757736}]}}` | Post plant image using `multipart/form-data`, parameter name should be `image` and the route will provide the top 5 prediction for the plant image |

### Services used
These are self hosted by me, you can use them in personal projects if you like, but for anything production
ready please consider self hosting.

PlantRecog API - https://plantrecog.sarthak.work
Gyan API - https://gyan.sarthak.work

<br />

## Issues
If you come across any issues or have feature requests please open them [here](https://github.com/sarthakpranesh/PlantRecog/issues)

<br />

<h3>Made with ♥</h3>




This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
