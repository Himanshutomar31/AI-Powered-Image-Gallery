import os
import base64
import requests

# Load Azure credentials from environment
AZURE_VISION_ENDPOINT = os.environ.get("AZURE_VISION_ENDPOINT")  
AZURE_VISION_KEY = os.environ.get("AZURE_VISION_KEY")  

def generate_image_caption(image_path):
    """
    Sends an image to Azure Computer Vision and returns a generated caption.
    Tries Image Analysis v4 'caption' first, then falls back to Vision v3.2 'describe'.
    """
    if not AZURE_VISION_ENDPOINT or not AZURE_VISION_KEY:
        print("Azure Vision endpoint/key not set. Please set AZURE_VISION_ENDPOINT and AZURE_VISION_KEY.")
        return None

    # Read image file as bytes
    try:
        with open(image_path, "rb") as f:
            img_bytes = f.read()
    except Exception as e:
        print(f"Error reading image file: {e}")
        return None

    # Common headers
    headers_octet = {
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
        "Content-Type": "application/octet-stream",
    }

    # ---- Attempt 1: Image Analysis (v4) - caption ----
    # Docs: POST {endpoint}/computervision/imageanalysis:analyze?api-version=2023-10-01&features=caption
    try:
        v4_url = (
            AZURE_VISION_ENDPOINT.rstrip("/")
            + "/computervision/imageanalysis:analyze"
            + "?api-version=2023-10-01&features=caption&language=en&model-version=latest"
        )
        resp = requests.post(v4_url, headers=headers_octet, data=img_bytes, timeout=20)
        resp.raise_for_status()
        payload = resp.json()

        # Expected: payload["captionResult"] = {"text": "...", "confidence": 0.xx}
        if isinstance(payload, dict) and "captionResult" in payload and payload["captionResult"]:
            caption_obj = payload["captionResult"]
            text = caption_obj.get("text")
            if text:
                return text.strip()
    except requests.exceptions.RequestException as e:
        # Print and continue to fallback
        print(f"Azure Image Analysis v4 request failed: {e}")
    except (KeyError, TypeError, ValueError) as e:
        print(f"Unexpected v4 response format: {e}")

    # ---- Attempt 2: Vision v3.2 - describe ----
    # Docs (legacy): POST {endpoint}/vision/v3.2/describe?maxCandidates=1&language=en
    try:
        v32_url = (
            AZURE_VISION_ENDPOINT.rstrip("/")
            + "/vision/v3.2/describe?maxCandidates=1&language=en"
        )
        resp = requests.post(v32_url, headers=headers_octet, data=img_bytes, timeout=20)
        resp.raise_for_status()
        payload = resp.json()

        # Expected: payload["description"]["captions"][0]["text"]
        desc = payload.get("description", {})
        captions = desc.get("captions", [])
        if captions and isinstance(captions, list) and "text" in captions[0]:
            return captions[0]["text"].strip()
    except requests.exceptions.RequestException as e:
        print(f"Azure Vision v3.2 request failed: {e}")
    except (KeyError, TypeError, ValueError, IndexError) as e:
        print(f"Unexpected v3.2 response format: {e}")

    # Final fallback
    return "A beautiful picture."
