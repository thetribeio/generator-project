# <%= applicationDisplayName %>

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application that follows the
[simple app state management
tutorial](https://flutter.dev/docs/development/data-and-backend/state-mgmt/simple).

For help getting started with Flutter, view our
[online documentation](https://flutter.dev/docs), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Assets

The `assets` directory houses images, fonts, and any other files you want to
include with your application.

The `assets/images` directory contains [resolution-aware
images](https://flutter.dev/docs/development/ui/assets-and-images#resolution-aware).

## Localization

This project generates localized messages based on arb files found in
the `lib/src/localization` directory.

To support additional languages, please visit the tutorial on
[Internationalizing Flutter
apps](https://flutter.dev/docs/development/accessibility-and-localization/internationalization)

## CI/CD Codemagic

Codemagic base setup contains two workflows :
  - `Analyze & Test` : runs **Lint analyzer** and **Automated Tests** on every PR update
  - `Build & Deploy` : Builds **release** `aab` (Android) and `ipa` (iOS) and deploys on **Google Play - Internal Tests** (Android) and **TestFlight** (iOS)

To enable them, follow those steps.

> ⛔️ About **Secured Environment Variables** ⛔️
> 
> Some **variables** need to be **Secured** : When defining an **Environment Variable** in Codemagic UI, click **Secure** to encrypt the value. 
>
> Note that binary files (i.e. **provisioning profiles** & **.p12 certificate**) have to be [base64 encoded](https://docs.codemagic.io/variables/environment-variable-groups/#storing-sensitive-valuesfiles) locally before they can be saved to **Environment variables** and decoded during the build.

1. [Link your GitHub project to Codemagic](https://docs.codemagic.io/getting-started/github/)
2. [In Codemagic UI](https://codemagic.io/apps), add the following **Environment variables** in the `certificate_credentials` group :
    - [iOS code signing](https://docs.codemagic.io/flutter-code-signing/ios-code-signing/)
        - `FCI_PROVISIONING_PROFILE` : Base64 encoded `*.mobileprovision` file [🔐 Check **Secure**]
        - `FCI_CERTIFICATE` : Base64 encoded `*.p12` file [🔐 Check **Secure**]
        - [Optional] `FCI_CERTIFICATE_PASSWORD` :  password used on `*.p12` export [🔐 Check **Secure**]
    - [Testflight deployment](https://docs.codemagic.io/yaml-publishing/distribution/#app-store-connect)
      - `APP_STORE_CONNECT_PRIVATE_KEY` : [content of `*.p8` file](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api) [🔐 Check **Secure**]
      - `APP_STORE_CONNECT_KEY_IDENTIFIER` : [`*.p8` key ID](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)
      - `APP_STORE_CONNECT_ISSUER_ID` : [Key issuer ID](https://appstoreconnect.apple.com/access/api)
    - [Android code signing](https://docs.codemagic.io/yaml-code-signing/signing-android/)
      - `FCI_KEYSTORE` : Base64 encoded `*.keystore` file [🔐 Check **Secure**]
      - `FCI_KEYSTORE_PASSWORD` : Keystore password [🔐 Check **Secure**]
      - `FCI_KEY_ALIAS` : Key alias
      - `FCI_KEY_PASSWORD` : Key password [🔐 Check **Secure**]
    - [Android deployment](https://docs.codemagic.io/yaml-publishing/distribution/#google-play)
      - `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` : Base64 encoded `*.keystore` file [🔐 Check **Secure**]
