import os
from PIL import Image, ImageDraw

ASSETS_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\public\assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

def generate_b2():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # B-2 Spirit Stealth Bomber: Iconic sawtooth trailing edge, dark charcoal radar-absorbent coating
    # Flying Wing Polygon (Front nose peak -> outer wingtips -> sawtooth trailing edge)
    wing_pts = [
        (512, 160),   # Nose peak
        (980, 580),   # Right wingtip
        (920, 670),   # Right outer edge
        (760, 600),   # Sawtooth notch 1
        (680, 660),   # Sawtooth peak 1
        (512, 590),   # Center tail notch
        (344, 660),   # Sawtooth peak 2
        (264, 600),   # Sawtooth notch 2
        (104, 670),   # Left outer edge
        (44, 580)     # Left wingtip
    ]
    draw.polygon(wing_pts, fill=(28, 32, 38, 255), outline=(70, 80, 95, 255))
    
    # Center stealth body panel facets
    center_pts = [(512, 160), (620, 420), (512, 590), (404, 420)]
    draw.polygon(center_pts, fill=(18, 22, 28, 255), outline=(90, 105, 120, 255))
    
    # Dual Engine Intake Windows (Flush stealth intakes)
    draw.polygon([(410, 310), (460, 310), (450, 440), (400, 440)], fill=(10, 10, 10, 255), outline=(0, 210, 255, 180))
    draw.polygon([(564, 310), (614, 310), (624, 440), (574, 440)], fill=(10, 10, 10, 255), outline=(0, 210, 255, 180))
    
    # Stealth Cockpit Window (Narrow gold/cyan tinted band)
    draw.polygon([(482, 270), (542, 270), (532, 310), (492, 310)], fill=(0, 210, 255, 220), outline=(255, 255, 255, 255))
    
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_b2.png"))
    print("Saved plane_b2.png successfully!")

if __name__ == "__main__":
    generate_b2()
