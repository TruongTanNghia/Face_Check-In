import face_recognition
import numpy as np
import cv2
import base64
import os

def get_face_encodings(image_data):
    """
    Decodes base64 image data and returns face encodings.
    """
    try:
        # Decode base64 if necessary
        if isinstance(image_data, str) and "," in image_data:
            image_data = image_data.split(",")[1]
        
        nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        encodings = face_recognition.face_encodings(rgb_img)
        return encodings, img
    except Exception as e:
        print(f"Error processing image: {e}")
        return [], None

def compare_faces(known_encodings, face_encoding_to_check, tolerance=0.6):
    """
    Compares a face encoding against a list of known encodings.
    Returns the index of the best match or None.
    """
    if not known_encodings:
        return None
    
    matches = face_recognition.compare_faces(known_encodings, face_encoding_to_check, tolerance=tolerance)
    if True in matches:
        face_distances = face_recognition.face_distance(known_encodings, face_encoding_to_check)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            return best_match_index
            
    return None

def save_snapshot(image, user_id, status):
    """
    Saves a snapshot of the recognition event.
    """
    if image is None:
        return None
        
    folder = "data/snapshots"
    if not os.path.exists(folder):
        os.makedirs(folder)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{user_id}_{status}_{timestamp}.jpg"
    filepath = os.path.join(folder, filename)
    cv2.imwrite(filepath, image)
    return filepath
from datetime import datetime
