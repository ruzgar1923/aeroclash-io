import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\crazygames_covers"
os.makedirs(OUT_DIR, exist_ok=True)

def create_cover(width, height, filename):
    img = Image.new("RGBA", (width, height), (15, 25, 42, 255))
    draw = ImageDraw.Draw(img)
    
    # Background Grid / Stars
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=(30, 45, 70, 150), width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=(30, 45, 70, 150), width=1)
        
    # Diagonal Jet Trail Graphics
    draw.line([(0, height), (width*0.8, 0)], fill=(0, 210, 255, 100), width=12)
    draw.line([(width*0.2, height), (width, 0)], fill=(255, 107, 107, 100), width=12)
    
    # Central Title Glow Box
    cx, cy = width // 2, height // 2
    box_w, box_h = int(width * 0.8), int(height * 0.35)
    draw.rectangle([cx - box_w//2, cy - box_h//2, cx + box_w//2, cy + box_h//2],
                   fill=(10, 15, 28, 230), outline=(0, 210, 255, 255), width=4)
    
    # Title Text (drawn using basic PIL shapes & text fallback)
    try:
        font_large = ImageFont.truetype("arial.ttf", int(height * 0.09))
        font_sub = ImageFont.truetype("arial.ttf", int(height * 0.04))
    except:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    draw.text((cx, cy - int(height*0.06)), "AEROCLASH.IO", fill=(255, 255, 255, 255), font=font_large, anchor="mm")
    draw.text((cx, cy + int(height*0.06)), "TACTICAL DOGFIGHT & AIR SUPERIORITY", fill=(0, 210, 255, 255), font=font_sub, anchor="mm")
    
    img.save(os.path.join(OUT_DIR, filename))
    print(f"Generated {filename} ({width}x{height})")

if __name__ == "__main__":
    create_cover(1920, 1080, "cover_landscape_1920x1080.png")
    create_cover(800, 1200, "cover_portrait_800x1200.png")
    create_cover(800, 800, "cover_square_800x800.png")
