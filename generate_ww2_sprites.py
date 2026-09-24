import os
from PIL import Image, ImageDraw

ASSETS_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\public\assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

def draw_roundel(draw, cx, cy, radius):
    # RAF Roundel (Blue, White, Red)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(0, 36, 125, 255))
    draw.ellipse([cx - radius*0.65, cy - radius*0.65, cx + radius*0.65, cy + radius*0.65], fill=(255, 255, 255, 255))
    draw.ellipse([cx - radius*0.32, cy - radius*0.32, cx + radius*0.32, cy + radius*0.32], fill=(200, 30, 30, 255))

def draw_balkenkreuz(draw, cx, cy, size):
    # German Cross
    s = size
    # White border cross
    draw.rectangle([cx - s//4, cy - s, cx + s//4, cy + s], fill=(255, 255, 255, 255))
    draw.rectangle([cx - s, cy - s//4, cx + s, cy + s//4], fill=(255, 255, 255, 255))
    # Black inner cross
    draw.rectangle([cx - s//8, cy - s + s//8, cx + s//8, cy + s - s//8], fill=(20, 20, 20, 255))
    draw.rectangle([cx - s + s//8, cy - s//8, cx + s - s//8, cy + s//8], fill=(20, 20, 20, 255))

def create_i16():
    # Starter Tier 1: Polikarpov I-16 "Ishak" (Stubby, agile radial monoplane)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Elliptical stubby wings
    draw.ellipse([80, 210, 432, 330], fill=(46, 117, 89, 255), outline=(20, 50, 35, 255), width=2)
    # Red stars on wings
    draw.ellipse([140, 250, 175, 285], fill=(220, 20, 60, 255))
    draw.ellipse([337, 250, 372, 285], fill=(220, 20, 60, 255))
    
    # Horizontal tail
    draw.ellipse([180, 390, 332, 450], fill=(46, 117, 89, 255), outline=(20, 50, 35, 255))
    
    # Wide radial engine cowl & short fuselage
    draw.polygon([(256, 100), (286, 150), (280, 330), (266, 440), (256, 460), (246, 440), (232, 330), (226, 150)],
                 fill=(38, 90, 65, 255), outline=(20, 50, 35, 255), width=2)
    # Radial cowl front
    draw.ellipse([230, 95, 282, 140], fill=(30, 30, 30, 255))
    # Open cockpit
    draw.ellipse([244, 230, 268, 290], fill=(116, 185, 255, 255), outline=(20, 20, 20, 255))
    # Propeller blur
    draw.ellipse([256-70, 100-70, 256+70, 100+70], outline=(255, 255, 255, 50), width=2)
    draw.ellipse([250, 90, 262, 106], fill=(241, 196, 15, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_i16.png"))

def create_spitfire():
    # Supermarine Spitfire Mk.V (Graceful elliptical wings, British camouflage)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Elliptical wings
    draw.ellipse([40, 200, 472, 330], fill=(60, 99, 130, 255), outline=(25, 42, 86, 255), width=2)
    # Camouflage patches
    draw.polygon([(256, 220), (380, 210), (360, 310), (256, 280)], fill=(74, 105, 80, 255))
    draw.polygon([(256, 220), (132, 210), (152, 310), (256, 280)], fill=(74, 105, 80, 255))
    
    # RAF Roundels
    draw_roundel(draw, 110, 265, 22)
    draw_roundel(draw, 402, 265, 22)
    
    # Wing cannons
    draw.rectangle([130, 170, 134, 215], fill=(30, 30, 30, 255))
    draw.rectangle([378, 170, 382, 215], fill=(30, 30, 30, 255))
    
    # Tailplane
    draw.ellipse([180, 400, 332, 455], fill=(60, 99, 130, 255), outline=(25, 42, 86, 255))
    
    # Slender fuselage
    draw.polygon([(256, 90), (272, 130), (272, 320), (263, 440), (256, 470), (249, 440), (240, 320), (240, 130)],
                 fill=(74, 105, 80, 255), outline=(25, 42, 86, 255), width=2)
    # Glazed canopy
    draw.polygon([(256, 200), (266, 225), (265, 285), (247, 285), (246, 225)], fill=(116, 185, 255, 240), outline=(20, 30, 45, 255))
    # Propeller
    draw.ellipse([256-75, 90-75, 256+75, 90+75], outline=(255, 255, 255, 50), width=2)
    draw.polygon([(256, 75), (262, 95), (250, 95)], fill=(241, 196, 15, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_spitfire.png"))

def create_stuka():
    # Junkers Ju 87 "Stuka" (Inverted gull wings, fixed landing gear spats, dive brakes)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Inverted gull wings (kinked wings)
    wing_pts = [
        (256, 220), (330, 245), (460, 220), (450, 290), (340, 310), (256, 290),
        (172, 310), (62, 290), (52, 220), (182, 245)
    ]
    draw.polygon(wing_pts, fill=(44, 62, 80, 255), outline=(20, 30, 40, 255), width=2)
    
    # German Crosses on wings
    draw_balkenkreuz(draw, 110, 260, 16)
    draw_balkenkreuz(draw, 402, 260, 16)
    
    # Fixed undercarriage spats (Stuka's iconic wheel fairings visible from above)
    draw.ellipse([170, 210, 194, 275], fill=(30, 39, 46, 255), outline=(15, 15, 15, 255))
    draw.ellipse([318, 210, 342, 275], fill=(30, 39, 46, 255), outline=(15, 15, 15, 255))
    
    # Angular tail
    draw.polygon([(256, 410), (330, 415), (325, 455), (256, 450), (187, 455), (182, 415)],
                 fill=(44, 62, 80, 255), outline=(20, 30, 40, 255))
    
    # Fuselage
    draw.polygon([(256, 100), (274, 140), (274, 320), (264, 440), (256, 465), (248, 440), (238, 320), (238, 140)],
                 fill=(52, 73, 94, 255), outline=(20, 30, 40, 255), width=2)
    
    # Long greenhouse canopy with rear gunner
    draw.rectangle([248, 205, 264, 310], fill=(116, 185, 255, 240), outline=(20, 20, 20, 255))
    # Rear defense machine gun barrel pointing backwards!
    draw.rectangle([254, 310, 258, 335], fill=(20, 20, 20, 255))
    
    # Propeller
    draw.ellipse([256-75, 100-75, 256+75, 100+75], outline=(255, 255, 255, 50), width=2)
    draw.polygon([(256, 85), (262, 105), (250, 105)], fill=(40, 40, 40, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_stuka.png"))

def create_bf110():
    # Messerschmitt Bf 110 (Heavy twin-engine destroyer, twin tail fins)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Broad tapered wings
    wing_pts = [(256, 230), (470, 260), (460, 315), (256, 300), (52, 315), (42, 260)]
    draw.polygon(wing_pts, fill=(53, 59, 72, 255), outline=(20, 25, 35, 255), width=2)
    
    # Twin Engine Nacelles
    for ex in [160, 352]:
        draw.polygon([(ex - 18, 160), (ex + 18, 160), (ex + 20, 325), (ex, 350), (ex - 20, 325)],
                     fill=(47, 53, 66, 255), outline=(20, 20, 20, 255))
        draw.ellipse([ex - 40, 160 - 40, ex + 40, 160 + 40], outline=(255, 255, 255, 45), width=2)
        draw.ellipse([ex - 10, 150, ex + 10, 170], fill=(241, 196, 15, 255))
    
    # Tailplane with twin endplate fins
    draw.rectangle([170, 420, 342, 442], fill=(53, 59, 72, 255), outline=(20, 25, 35, 255))
    draw.ellipse([160, 410, 180, 452], fill=(47, 53, 66, 255))
    draw.ellipse([332, 410, 352, 452], fill=(47, 53, 66, 255))
    
    # Central fuselage pod
    draw.polygon([(256, 140), (272, 170), (272, 330), (264, 430), (256, 450), (248, 430), (240, 330), (240, 170)],
                 fill=(47, 53, 66, 255), outline=(20, 25, 35, 255), width=2)
    # 4 Nose cannons
    for qx in [248, 253, 259, 264]:
        draw.rectangle([qx, 125, qx + 2, 145], fill=(20, 20, 20, 255))
    # Long tandem canopy
    draw.rectangle([248, 200, 264, 305], fill=(116, 185, 255, 240), outline=(20, 20, 20, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_bf110.png"))

def create_he111():
    # Heinkel He 111 (Iconic medium bomber with glazed bubble nose & broad elliptical wings)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Broad elliptical wings
    draw.ellipse([20, 190, 492, 335], fill=(53, 73, 94, 255), outline=(25, 35, 45, 255), width=2)
    draw_balkenkreuz(draw, 100, 260, 20)
    draw_balkenkreuz(draw, 412, 260, 20)
    
    # Twin engines on wings
    for ex in [170, 342]:
        draw.polygon([(ex - 22, 160), (ex + 22, 160), (ex + 24, 330), (ex, 360), (ex - 24, 330)],
                     fill=(44, 62, 80, 255), outline=(20, 20, 20, 255))
        draw.ellipse([ex - 45, 160 - 45, ex + 45, 160 + 45], outline=(255, 255, 255, 45), width=2)
        draw.ellipse([ex - 12, 150, ex + 12, 172], fill=(241, 196, 15, 255))
    
    # Tailplane
    draw.ellipse([170, 410, 342, 460], fill=(53, 73, 94, 255), outline=(25, 35, 45, 255))
    
    # Fuselage
    draw.polygon([(256, 120), (280, 180), (280, 350), (266, 450), (256, 475), (246, 450), (232, 350), (232, 180)],
                 fill=(44, 62, 80, 255), outline=(20, 20, 20, 255), width=2)
    # Fully Glazed Asymmetrical Greenhouse Nose
    draw.ellipse([238, 120, 274, 180], fill=(116, 185, 255, 230), outline=(20, 20, 20, 255))
    # Dorsal Defense Turret (Mid-fuselage glass bubble)
    draw.ellipse([246, 270, 266, 290], fill=(47, 53, 66, 255), outline=(255, 255, 255, 200))
    draw.rectangle([254, 285, 258, 305], fill=(20, 20, 20, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_he111.png"))

def create_me262():
    # Messerschmitt Me 262 "Schwalbe" (First operational jet fighter, swept wings, shark fuselage)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Swept wings
    wing_pts = [(256, 230), (470, 280), (455, 335), (256, 310), (57, 335), (42, 280)]
    draw.polygon(wing_pts, fill=(53, 59, 72, 255), outline=(20, 25, 35, 255), width=2)
    
    # Twin Jet Pods (Junkers Jumo 004 under-wing turbojets)
    for ex in [170, 342]:
        draw.polygon([(ex - 16, 210), (ex + 16, 210), (ex + 18, 335), (ex + 14, 355), (ex - 14, 355), (ex - 18, 335)],
                     fill=(30, 39, 46, 255), outline=(15, 15, 15, 255))
        # Jet intake & exhaust rings
        draw.ellipse([ex - 12, 205, ex + 12, 218], fill=(15, 15, 15, 255))
        draw.ellipse([ex - 10, 348, ex + 10, 360], fill=(255, 107, 129, 255)) # Hot jet glow
    
    # Triangular Cross-section Fuselage (Shark nose)
    draw.polygon([(256, 110), (274, 150), (272, 330), (262, 440), (256, 470), (250, 440), (240, 330), (238, 150)],
                 fill=(47, 53, 66, 255), outline=(20, 20, 20, 255), width=2)
    # Swept tailplane
    draw.polygon([(256, 420), (320, 435), (315, 465), (256, 455), (197, 465), (192, 435)],
                 fill=(53, 59, 72, 255), outline=(20, 25, 35, 255))
    
    # 4 Heavy MK 108 30mm nose gun ports
    for qx in [250, 254, 258, 262]:
        draw.rectangle([qx, 125, qx + 2, 138], fill=(15, 15, 15, 255))
    # Teardrop Cockpit Canopy
    draw.polygon([(256, 210), (267, 240), (266, 295), (246, 295), (245, 240)],
                 fill=(116, 185, 255, 240), outline=(20, 20, 20, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_me262.png"))

def create_b17():
    # Boeing B-17 Flying Fortress (4-engine heavy bomber with multiple gun turrets)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Massive wingspan
    wing_pts = [(256, 200), (496, 245), (486, 315), (256, 295), (26, 315), (16, 245)]
    draw.polygon(wing_pts, fill=(58, 70, 82, 255), outline=(25, 30, 35, 255), width=2)
    
    # 4 Heavy Radial Engines
    for ex in [110, 185, 327, 402]:
        draw.polygon([(ex - 14, 175), (ex + 14, 175), (ex + 16, 300), (ex, 320), (ex - 16, 300)],
                     fill=(47, 53, 66, 255), outline=(20, 20, 20, 255))
        draw.ellipse([ex - 32, 175 - 32, ex + 32, 175 + 32], outline=(255, 255, 255, 40), width=1)
        draw.ellipse([ex - 7, 168, ex + 7, 182], fill=(241, 196, 15, 255))
    
    # Broad tailplane
    draw.polygon([(256, 400), (370, 420), (360, 455), (256, 445), (152, 455), (142, 420)],
                 fill=(58, 70, 82, 255), outline=(25, 30, 35, 255))
    
    # Heavy Fuselage
    draw.polygon([(256, 95), (278, 140), (282, 340), (266, 455), (256, 480), (246, 455), (230, 340), (234, 140)],
                 fill=(50, 60, 70, 255), outline=(20, 20, 20, 255), width=2)
    # Nose bubble
    draw.ellipse([246, 95, 266, 125], fill=(116, 185, 255, 230), outline=(20, 20, 20, 255))
    # Pilot cockpit
    draw.polygon([(256, 145), (272, 170), (270, 205), (242, 205), (240, 170)],
                 fill=(116, 185, 255, 240), outline=(20, 20, 20, 255))
    # Dorsal Turret (Rotating Sperry twin .50-cal machine guns)
    draw.ellipse([246, 230, 266, 250], fill=(20, 20, 20, 255), outline=(255, 255, 255, 200))
    draw.rectangle([253, 215, 255, 235], fill=(220, 220, 220, 255))
    draw.rectangle([257, 215, 259, 235], fill=(220, 220, 220, 255))
    # Tail gunner
    draw.rectangle([255, 475, 257, 495], fill=(20, 20, 20, 255))
    
    img.save(os.path.join(ASSETS_DIR, "plane_b17.png"))

if __name__ == "__main__":
    create_i16()
    create_spitfire()
    create_stuka()
    create_bf110()
    create_he111()
    create_me262()
    create_b17()
    print("ALL WW2 SPRITES GENERATED")
