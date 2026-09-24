import os
from PIL import Image, ImageDraw

ASSETS_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\public\assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

def generate_p51():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # P-51 Mustang: Silver body, yellow/blue nose, square wings
    # Main Wings
    wing_pts = [(512, 430), (950, 520), (910, 610), (512, 570), (114, 610), (74, 520)]
    draw.polygon(wing_pts, fill=(200, 207, 216, 255), outline=(100, 110, 125, 255))
    
    # Blue nose camo & yellow nose stripes
    draw.polygon([(512, 120), (540, 320), (484, 320)], fill=(41, 128, 185, 255))
    draw.rectangle([485, 220, 539, 250], fill=(241, 196, 15, 255))
    
    # Fuselage
    fuse_pts = [(512, 120), (548, 380), (535, 780), (512, 890), (489, 780), (476, 380)]
    draw.polygon(fuse_pts, fill=(180, 188, 198, 255), outline=(80, 90, 105, 255))
    
    # Cockpit bubble
    draw.ellipse([484, 400, 540, 540], fill=(30, 144, 255, 200), outline=(255, 255, 255, 255))
    
    # Tail plane
    tail_pts = [(512, 780), (680, 820), (670, 870), (512, 850), (354, 870), (344, 820)]
    draw.polygon(tail_pts, fill=(200, 207, 216, 255), outline=(100, 110, 125, 255))
    
    # US Stars & Bars
    for wx in [260, 764]:
        draw.rectangle([wx-30, 530, wx+30, 560], fill=(255, 255, 255, 255), outline=(41, 128, 185, 255))
        draw.ellipse([wx-15, 530, wx+15, 560], fill=(41, 128, 185, 255))
        
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_p51.png"))
    print("Saved plane_p51.png")

def generate_f4u():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # F4U Corsair: Inverted gull-wing, deep navy blue
    # Wings (Inverted Gull shape)
    wing_pts = [(512, 450), (640, 530), (960, 510), (920, 610), (640, 590), (512, 580),
                (384, 590), (104, 610), (64, 510), (384, 530)]
    draw.polygon(wing_pts, fill=(25, 42, 86, 255), outline=(15, 25, 55, 255))
    
    # Fuselage
    fuse_pts = [(512, 140), (552, 380), (538, 790), (512, 890), (486, 790), (472, 380)]
    draw.polygon(fuse_pts, fill=(35, 55, 110, 255), outline=(15, 25, 55, 255))
    
    # Cockpit
    draw.ellipse([482, 420, 542, 540], fill=(50, 160, 230, 210), outline=(255, 255, 255, 255))
    
    # Tail plane
    tail_pts = [(512, 790), (670, 830), (660, 875), (512, 855), (364, 875), (354, 830)]
    draw.polygon(tail_pts, fill=(25, 42, 86, 255), outline=(15, 25, 55, 255))
    
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_f4u.png"))
    print("Saved plane_f4u.png")

def generate_a10():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # A-10 Warthog: Straight wings, dual high engines, twin vertical tails, massive nose cannon
    # Wings
    wing_pts = [(512, 460), (970, 480), (960, 590), (512, 580), (64, 590), (54, 480)]
    draw.polygon(wing_pts, fill=(87, 101, 116, 255), outline=(44, 62, 80, 255))
    
    # Twin rear turbofan engine pods mounted high on fuselage
    draw.ellipse([410, 630, 470, 750], fill=(50, 50, 50, 255), outline=(200, 200, 200, 255))
    draw.ellipse([554, 630, 614, 750], fill=(50, 50, 50, 255), outline=(200, 200, 200, 255))
    
    # Fuselage
    fuse_pts = [(512, 100), (548, 320), (536, 840), (512, 920), (488, 840), (476, 320)]
    draw.polygon(fuse_pts, fill=(112, 128, 144, 255), outline=(44, 62, 80, 255))
    
    # Massive GAU-8 30mm Gatling Nose
    draw.rectangle([506, 60, 518, 120], fill=(20, 20, 20, 255))
    
    # Cockpit
    draw.ellipse([484, 260, 540, 420], fill=(255, 215, 0, 190), outline=(255, 255, 255, 255))
    
    # Twin Tail Fins (H-Tail layout)
    draw.rectangle([320, 830, 345, 920], fill=(70, 80, 95, 255), outline=(30, 30, 30, 255))
    draw.rectangle([679, 830, 704, 920], fill=(70, 80, 95, 255), outline=(30, 30, 30, 255))
    draw.rectangle([345, 860, 679, 890], fill=(87, 101, 116, 255))
    
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_a10.png"))
    print("Saved plane_a10.png")

def generate_ho229():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Horten Ho 229: Pure stealth flying wing (no tail), dark camo pattern
    wing_pts = [(512, 180), (980, 620), (940, 720), (512, 650), (84, 720), (44, 620)]
    draw.polygon(wing_pts, fill=(45, 52, 54, 255), outline=(100, 110, 120, 255))
    
    # Camo patches
    draw.polygon([(512, 180), (750, 420), (680, 660), (512, 630)], fill=(75, 101, 132, 255))
    draw.polygon([(512, 180), (270, 420), (340, 660), (512, 630)], fill=(30, 39, 46, 255))
    
    # Dual Engine Nozzles
    draw.ellipse([450, 580, 490, 660], fill=(15, 15, 15, 255), outline=(255, 100, 0, 255))
    draw.ellipse([534, 580, 574, 660], fill=(15, 15, 15, 255), outline=(255, 100, 0, 255))
    
    # Cockpit glass center
    draw.ellipse([484, 330, 540, 450], fill=(0, 206, 201, 200), outline=(255, 255, 255, 255))
    
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_ho229.png"))
    print("Saved plane_ho229.png")

def generate_f22():
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # F-22 Raptor: Diamond stealth wings, twin vectoring nozzles, charcoal radar-absorbent coating
    # Main Diamond Wings
    wing_pts = [(512, 100), (960, 550), (880, 720), (512, 680), (144, 720), (64, 550)]
    draw.polygon(wing_pts, fill=(60, 64, 72, 255), outline=(160, 175, 190, 255))
    
    # Fuselage body stealth facets
    fuse_pts = [(512, 100), (555, 340), (540, 840), (512, 910), (484, 840), (469, 340)]
    draw.polygon(fuse_pts, fill=(45, 49, 57, 255), outline=(120, 130, 140, 255))
    
    # Gold-tinted stealth canopy
    draw.ellipse([482, 250, 542, 430], fill=(218, 165, 32, 210), outline=(255, 255, 255, 255))
    
    # Twin Vectoring Thrust Nozzles
    draw.rectangle([455, 840, 495, 910], fill=(10, 10, 10, 255), outline=(0, 210, 255, 255))
    draw.rectangle([529, 840, 569, 910], fill=(10, 10, 10, 255), outline=(0, 210, 255, 255))
    
    # Canted Tail Stabilizers
    tail_left = [(380, 720), (320, 890), (380, 920), (420, 750)]
    tail_right = [(644, 720), (704, 890), (644, 920), (604, 750)]
    draw.polygon(tail_left, fill=(40, 44, 50, 255), outline=(100, 110, 120, 255))
    draw.polygon(tail_right, fill=(40, 44, 50, 255), outline=(100, 110, 120, 255))
    
    img = img.resize((256, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(ASSETS_DIR, "plane_f22.png"))
    print("Saved plane_f22.png")

if __name__ == "__main__":
    generate_p51()
    generate_f4u()
    generate_a10()
    generate_ho229()
    generate_f22()
