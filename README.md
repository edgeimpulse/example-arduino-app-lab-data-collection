# Edge Impulse Data Collection

An Arduino App that streams the board's live camera feed to a browser and lets you capture and
upload frames straight into an Edge Impulse project's dataset — everything is
served by the built-in `arduino:web_ui` Brick.

## Features

- Live camera preview in the browser (`arduino.app_peripherals.camera.Camera` + `WebUI.expose_camera`)
- One-click "Capture & Upload" of the current frame to Edge Impulse's Ingestion API
- Choose the target dataset split: training, testing, or automatic split
- Optional label attached to the uploaded sample
- API key and last-used settings are remembered in the browser (never stored on the device)

## Requirements

- An Arduino board with a supported camera (USB or CSI)
- An [Edge Impulse](https://edgeimpulse.com/) account and project
- Your project's **API key** (Studio → your project → **Dashboard/Keys** → API Keys)

## Running the app

Download as a ZIP file from the Github repository.

Then use the Arduino App Lab `Create new App button` in the My Apps section and import the ZIP file.

Click on newly appeared Edge Impulse Data Collection App and then on Run button.


## Usage

1. Paste your Edge Impulse API key into the **Edge Impulse API key** field.
2. Pick the dataset split (**Training**, **Testing**, or **Split automatically**).
3. Optionally set a **Label** for the sample.
4. Point the camera at your subject and click **Capture & Upload**.
5. Check the Data Acquisition page of your Edge Impulse project — the new sample should appear
   there within a few seconds.

## Notes

- The API key is only kept in the browser (`localStorage`) and forwarded directly to Edge
  Impulse's ingestion API over HTTPS; it is never written to the app's source or configuration.


