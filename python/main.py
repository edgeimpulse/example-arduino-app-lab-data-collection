# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Edge Impulse data collection app: streams the live camera feed to the Web UI and
# uploads the current frame to an Edge Impulse project's dataset on demand.
import io
import time

import requests

from arduino.app_utils import App, Logger
from arduino.app_bricks.web_ui import WebUI
from arduino.app_peripherals.camera import Camera
from arduino.app_utils.image import compress_to_jpeg

logger = Logger("EdgeImpulseDataCollection")

EI_INGEST_URL = "https://ingestion.edgeimpulse.com/api"
VALID_CATEGORIES = {"training", "testing", "split"}

camera = Camera(resolution=(640, 480), fps=15)
ui = WebUI()

camera.start()
ui.expose_camera("/camera", camera)  # live preview at <img src="/camera">


def upload_to_edge_impulse(payload: dict):
    """Capture the current frame and upload it to the selected Edge Impulse dataset split."""
    payload = payload or {}
    api_key = str(payload.get("apiKey") or "").strip()
    category = str(payload.get("category") or "training").strip()
    label = str(payload.get("label") or "").strip()

    if not api_key:
        return {"status": "error", "message": "Missing Edge Impulse API key"}
    if category not in VALID_CATEGORIES:
        return {"status": "error", "message": "Invalid category"}

    frame = camera.capture()
    if frame is None:
        return {"status": "error", "message": "No frame available from camera yet"}

    jpeg = compress_to_jpeg(frame=frame, quality=90)
    if jpeg is None:
        return {"status": "error", "message": "Failed to encode frame as JPEG"}

    filename = f"capture-{int(time.time() * 1000)}.jpg"
    headers = {"x-api-key": api_key}
    if label:
        headers["x-label"] = label
    else:
        headers["x-no-label"] = "1"  # avoid EI inferring a label from the timestamp filename

    try:
        resp = requests.post(
            f"{EI_INGEST_URL}/{category}/files",
            headers=headers,
            files={"data": (filename, io.BytesIO(jpeg.tobytes()), "image/jpeg")},
            timeout=30,
        )
    except requests.RequestException as e:
        logger.error(f"Upload to Edge Impulse failed: {e}")
        return {"status": "error", "message": str(e)}

    if 200 <= resp.status_code < 300:
        logger.info(f"Uploaded {filename} to the '{category}' set")
        return {"status": "success", "filename": filename}

    logger.error(f"Edge Impulse upload rejected ({resp.status_code}): {resp.text}")
    return {"status": "error", "message": resp.text, "status_code": resp.status_code}


ui.expose_api("POST", "/upload", upload_to_edge_impulse)

App.run()
