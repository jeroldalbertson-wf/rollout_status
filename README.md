# rollout_status

To run this tool locally:

```bash
$ pub get
$ pub serve
```

Navigate to `https://localhost:8080` in your browser.

![screenshot](https://dl.dropbox.com/s/96usbmbmo1hxa36/Screenshot%202017-01-24%2022.16.09.png)

## Deploying the Server
The server portion of this project is a very small node JS application.
It is currently deployed via Google AppEngine.

All you need to perform the deploy is the Google Cloud Platform SDK:

```bash
$ cd server/
$ gcloud config set project rollout-status
$ gcloud app deploy
```

## Running the Server Locally
You'll need to modify the `baseUri` in `store.dart` to point to localhost instead of the deployed URI.

Then run the server like so:

```bash
$ cd server/
$ npm install
$ npm start
```

## Using the Chrome Extension

First build it with `pub build extension`. Then, navigate to
`chrome://extensions` in Chrome. Check "Developer Mode", click
"Load unpacked extension..." and select the `build/extension`
folder.

Click the button to display the app.

![extension](https://s3.amazonaws.com/uploads.hipchat.com/12595/935918/M2QybPK4DAQ3nQu/upload.png)
