import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\crazygames_covers"
os.makedirs(OUT_DIR, exist_ok=True)

def generate_mp4(width, height, filename, fps=30, duration_sec=5):
    import cv2
    
    total_frames = fps * duration_sec
    filepath = os.path.join(OUT_DIR, filename)
    
    # H264 / mp4v codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))
    
    for frame_idx in range(total_frames):
        t = frame_idx / total_frames
        
        # Create PIL Canvas
        img = Image.new("RGB", (width, height), (15, 25, 42))
        draw = ImageDraw.Draw(img)
        
        # Grid lines
        for x in range(0, width, 50):
            draw.line([(x, 0), (x, height)], fill=(25, 40, 65), width=1)
        for y in range(0, height, 50):
            draw.line([(0, y), (width, y)], fill=(25, 40, 65), width=1)
            
        # Animated Jet Trails & Jet Movement
        jet1_x = int(t * width * 1.2 - width * 0.1)
        jet1_y = int(height * 0.4 + np.sin(t * np.pi * 4) * (height * 0.15))
        
        jet2_x = int((1 - t) * width * 1.2 - width * 0.1)
        jet2_y = int(height * 0.6 + np.cos(t * np.pi * 4) * (height * 0.15))
        
        # Trails
        draw.line([(jet1_x - int(width*0.2), jet1_y), (jet1_x, jet1_y)], fill=(0, 210, 255), width=6)
        draw.line([(jet2_x + int(width*0.2), jet2_y), (jet2_x, jet2_y)], fill=(255, 75, 75), width=6)
        
        # Jet Icons (Triangle shapes)
        draw.polygon([(jet1_x+15, jet1_y), (jet1_x-15, jet1_y-10), (jet1_x-15, jet1_y+10)], fill=(0, 210, 255))
        draw.polygon([(jet2_x-15, jet2_y), (jet2_x+15, jet2_y-10), (jet2_x+15, jet2_y+10)], fill=(255, 75, 75))
        
        # Center Title
        cx, cy = width // 2, height // 2
        try:
            font_title = ImageFont.truetype("arial.ttf", int(height * 0.08))
            font_sub = ImageFont.truetype("arial.ttf", int(height * 0.04))
        except:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()
            
        draw.text((cx, cy - int(height*0.04)), "AEROCLASH.IO", fill=(255, 255, 255), font=font_title, anchor="mm")
        draw.text((cx, cy + int(height*0.05)), "TACTICAL DOGFIGHT", fill=(241, 196, 15), font=font_sub, anchor="mm")
        
        # Convert RGB PIL to BGR OpenCV Frame
        frame_np = np.array(img)
        frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
        out.write(frame_bgr)
        
    out.release()
    print(f"Generated {filename} successfully ({width}x{height})!")

if __name__ == "__main__":
    generate_mp4(1280, 720, "video_landscape.mp4")
    generate_mp4(720, 1280, "video_portrait.mp4")
