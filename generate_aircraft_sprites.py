import os
from PIL import Image, ImageDraw

ASSETS_DIR = r"C:\Users\hp\.gemini\antigravity\scratch\torpedoclash-io\public\assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

def create_tier1_bf109():
  # Supersampled 1024x1024 down to 256x256 for ultra crisp antialiasing
  size = 1024
  img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  draw = ImageDraw.Draw(img)

  cx, cy = 512, 512

  # 1. Main Wings (Trapezoidal with rounded tips)
  # Wingspan: from x=120 to x=904, y roughly 460 to 600
  wing_pts = [
      (512, 450),
      (920, 520),
      (900, 600),
      (540, 570),
      (512, 580),
      (484, 570),
      (124, 600),
      (104, 520),
  ]
  draw.polygon(wing_pts, fill=(75, 101, 132, 255), outline=(30, 45, 65, 255))

  # Wing camo splinter patches
  draw.polygon(
      [(512, 450), (750, 485), (700, 585), (512, 560)], fill=(47, 65, 85, 255)
  )
  draw.polygon(
      [(512, 450), (280, 490), (320, 585), (512, 560)], fill=(55, 75, 95, 255)
  )

  # Wing cross markings (Balkenkreuz style)
  for wx in [260, 764]:
    draw.rectangle([wx - 6, 520, wx + 6, 560], fill=(240, 240, 240, 255))
    draw.rectangle([wx - 20, 534, wx + 20, 546], fill=(240, 240, 240, 255))
    draw.rectangle([wx - 3, 523, wx + 3, 557], fill=(20, 20, 20, 255))
    draw.rectangle([wx - 17, 537, wx + 17, 543], fill=(20, 20, 20, 255))

  # Wing guns
  draw.rectangle([210, 460, 218, 525], fill=(30, 30, 30, 255))
  draw.rectangle([806, 460, 814, 525], fill=(30, 30, 30, 255))

  # 2. Horizontal Tailplane (Elevators)
  tail_pts = [
      (512, 820),
      (680, 840),
      (670, 890),
      (512, 875),
      (354, 890),
      (344, 840),
  ]
  draw.polygon(tail_pts, fill=(75, 101, 132, 255), outline=(30, 45, 65, 255))
  # Yellow elevator tips
  draw.polygon(
      [(650, 840), (680, 840), (670, 890), (645, 890)], fill=(241, 196, 15, 255)
  )
  draw.polygon(
      [(374, 840), (344, 840), (354, 890), (379, 890)], fill=(241, 196, 15, 255)
  )

  # 3. Fuselage (Pointed nose to sleek tail)
  fuse_pts = [
      (512, 180),  # Prop tip
      (542, 240),  # Cowl
      (546, 400),  # Cockpit front
      (540, 620),  # Mid
      (524, 880),  # Tail end
      (512, 920),  # Rudder tip
      (500, 880),
      (484, 620),
      (478, 400),
      (482, 240),
  ]
  draw.polygon(fuse_pts, fill=(65, 85, 110, 255), outline=(25, 35, 50, 255))

  # 4. Signature Yellow Nose Cowling (Bf 109 Gelbnase)
  cowl_pts = [(512, 180), (542, 240), (544, 340), (480, 340), (482, 240)]
  draw.polygon(cowl_pts, fill=(241, 196, 15, 255), outline=(211, 84, 0, 255))

  # Exhaust stacks on cowl sides
  for ey in range(250, 320, 16):
    draw.rectangle([542, ey, 552, ey + 8], fill=(30, 30, 30, 255))
    draw.rectangle([472, ey, 482, ey + 8], fill=(30, 30, 30, 255))

  # 5. Glazed Cockpit Canopy
  canopy_pts = [(512, 380), (534, 420), (532, 530), (492, 530), (490, 420)]
  draw.polygon(
      canopy_pts, fill=(116, 185, 255, 240), outline=(20, 30, 45, 255)
  )
  # Glass glare line
  draw.line([(502, 420), (518, 510)], fill=(255, 255, 255, 200), width=4)

  # 6. Propeller Spinner & Spinning Blur Disc
  draw.ellipse(
      [512 - 130, 180 - 130, 512 + 130, 180 + 130],
      outline=(255, 255, 255, 60),
      width=3,
  )
  draw.ellipse([498, 165, 526, 205], fill=(30, 30, 30, 255))
  draw.polygon([(512, 160), (524, 185), (500, 185)], fill=(241, 196, 15, 255))

  out = img.resize((256, 256), Image.Resampling.LANCZOS)
  out.save(os.path.join(ASSETS_DIR, "plane_tier1.png"))
  print("[+] plane_tier1.png created successfully.")


def create_tier2_twin_interceptor():
  size = 1024
  img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  draw = ImageDraw.Draw(img)

  # 1. Broad Wings
  wing_pts = [
      (512, 460),
      (940, 510),
      (920, 620),
      (512, 590),
      (104, 620),
      (84, 510),
  ]
  draw.polygon(wing_pts, fill=(38, 222, 129, 255), outline=(20, 100, 55, 255))
  # Camo stripe
  draw.polygon(
      [(512, 460), (760, 490), (720, 610), (512, 580)], fill=(33, 140, 116, 255)
  )
  draw.polygon(
      [(512, 460), (264, 490), (304, 610), (512, 580)], fill=(33, 140, 116, 255)
  )

  # 2. Twin Engine Nacelles (Left & Right)
  for ex in [320, 704]:
    draw.polygon(
        [
            (ex - 36, 320),
            (ex + 36, 320),
            (ex + 42, 640),
            (ex, 700),
            (ex - 42, 640),
        ],
        fill=(47, 53, 66, 255),
        outline=(20, 25, 35, 255),
    )
    # Propeller blur
    draw.ellipse(
        [ex - 80, 320 - 80, ex + 80, 320 + 80],
        outline=(255, 255, 255, 50),
        width=2,
    )
    # Spinners
    draw.ellipse(
        [ex - 18, 305, ex + 18, 345],
        fill=(255, 71, 87, 255),
        outline=(30, 30, 30, 255),
    )
    # Twin Tail Booms connecting back
    draw.rectangle([ex - 16, 640, ex + 16, 860], fill=(47, 53, 66, 255))
    draw.ellipse([ex - 22, 850, ex + 22, 895], fill=(38, 222, 129, 255))

  # Horizontal Stabilizer connecting twin booms
  draw.rectangle(
      [320, 845, 704, 885],
      fill=(38, 222, 129, 255),
      outline=(20, 100, 55, 255),
  )

  # 3. Central Cockpit Pod
  pod_pts = [
      (512, 280),
      (546, 360),
      (544, 600),
      (512, 660),
      (480, 600),
      (478, 360),
  ]
  draw.polygon(pod_pts, fill=(33, 140, 116, 255), outline=(20, 25, 35, 255))

  # Nose Quad Cannons
  for qx in [496, 506, 518, 528]:
    draw.rectangle([qx, 250, qx + 4, 290], fill=(20, 20, 20, 255))

  # Cockpit Glass
  draw.polygon(
      [(512, 360), (536, 420), (534, 530), (490, 530), (488, 420)],
      fill=(112, 161, 255, 240),
      outline=(20, 30, 45, 255),
  )

  out = img.resize((256, 256), Image.Resampling.LANCZOS)
  out.save(os.path.join(ASSETS_DIR, "plane_tier2.png"))
  print("[+] plane_tier2.png created successfully.")


def create_tier3_strike_jet():
  size = 1024
  img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  draw = ImageDraw.Draw(img)

  # Swept Delta Wings (Supersonic Fighter Jet)
  wing_pts = [
      (512, 180),  # Nose probe
      (542, 340),  # Cockpit side
      (910, 680),  # Right wingtip
      (890, 740),
      (560, 680),  # Trailing edge
      (540, 840),  # Right engine nozzle
      (512, 850),
      (484, 840),  # Left engine nozzle
      (464, 680),
      (134, 740),  # Left wingtip
      (114, 680),
      (482, 340),
  ]
  draw.polygon(wing_pts, fill=(254, 211, 48, 255), outline=(30, 35, 45, 255))

  # Contrast Camo Panels
  draw.polygon(
      [(512, 280), (740, 620), (620, 680), (512, 620)], fill=(225, 177, 44, 255)
  )
  draw.polygon(
      [(512, 280), (284, 620), (404, 680), (512, 620)], fill=(225, 177, 44, 255)
  )

  # Wingtip Guided Missiles
  for mx in [116, 898]:
    draw.rectangle([mx - 6, 610, mx + 6, 730], fill=(245, 246, 250, 255))
    draw.polygon(
        [(mx, 585), (mx + 8, 615), (mx - 8, 615)], fill=(255, 71, 87, 255)
    )  # Red seeker head
    draw.polygon(
        [(mx - 14, 730), (mx + 14, 730), (mx, 710)], fill=(47, 53, 66, 255)
    )

  # Twin Jet Intakes
  draw.rectangle([460, 480, 484, 580], fill=(47, 53, 66, 255))
  draw.rectangle([540, 480, 564, 580], fill=(47, 53, 66, 255))

  # Afterburner Exhaust Nozzles
  draw.ellipse([486, 825, 510, 855], fill=(30, 30, 30, 255))
  draw.ellipse([514, 825, 538, 855], fill=(30, 30, 30, 255))

  # Supersonic Cockpit Canopy (Gold tint)
  canopy_pts = [(512, 290), (532, 360), (530, 500), (494, 500), (492, 360)]
  draw.polygon(
      canopy_pts, fill=(255, 234, 167, 245), outline=(20, 25, 35, 255)
  )
  draw.line([(502, 340), (518, 480)], fill=(255, 255, 255, 220), width=3)

  # Needle Nose Pitot Tube
  draw.line([(512, 110), (512, 180)], fill=(255, 71, 87, 255), width=5)

  out = img.resize((256, 256), Image.Resampling.LANCZOS)
  out.save(os.path.join(ASSETS_DIR, "plane_tier3.png"))
  print("[+] plane_tier3.png created successfully.")


def create_tier4_flying_fortress():
  size = 1024
  img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
  draw = ImageDraw.Draw(img)

  # 1. Massive Bomber Wings
  wing_pts = [
      (512, 420),
      (980, 490),
      (960, 620),
      (550, 580),
      (512, 600),
      (474, 580),
      (64, 620),
      (44, 490),
  ]
  draw.polygon(wing_pts, fill=(252, 92, 101, 255), outline=(40, 20, 25, 255))

  # Splinter Camo
  draw.polygon(
      [(512, 420), (820, 460), (760, 600), (512, 570)], fill=(235, 59, 90, 255)
  )
  draw.polygon(
      [(512, 420), (204, 460), (264, 600), (512, 570)], fill=(235, 59, 90, 255)
  )

  # 2. Four Heavy Radial Engines with Propellers
  engine_x = [230, 390, 634, 794]
  for ex in engine_x:
    draw.polygon(
        [
            (ex - 28, 360),
            (ex + 28, 360),
            (ex + 32, 580),
            (ex, 620),
            (ex - 32, 580),
        ],
        fill=(47, 53, 66, 255),
        outline=(20, 25, 35, 255),
    )
    # Propeller blur
    draw.ellipse(
        [ex - 70, 360 - 70, ex + 70, 360 + 70],
        outline=(255, 255, 255, 45),
        width=2,
    )
    # Spinner
    draw.ellipse([ex - 14, 345, ex + 14, 375], fill=(241, 196, 15, 255))

  # 3. Tailplane
  tail_pts = [
      (512, 800),
      (760, 830),
      (740, 890),
      (512, 870),
      (284, 890),
      (264, 830),
  ]
  draw.polygon(tail_pts, fill=(252, 92, 101, 255), outline=(40, 20, 25, 255))

  # 4. Giant Armored Fuselage
  fuse_pts = [
      (512, 190),  # Nose bubble
      (560, 300),
      (568, 650),
      (534, 880),
      (512, 940),  # Tail gunner
      (490, 880),
      (456, 650),
      (464, 300),
  ]
  draw.polygon(fuse_pts, fill=(235, 59, 90, 255), outline=(40, 20, 25, 255))

  # Nose Glass (Bombardier observation deck)
  draw.polygon(
      [(512, 190), (540, 250), (484, 250)],
      fill=(112, 161, 255, 230),
      outline=(20, 30, 45, 255),
  )

  # Cockpit Glass
  draw.polygon(
      [(512, 280), (544, 330), (540, 400), (484, 400), (480, 330)],
      fill=(112, 161, 255, 240),
      outline=(20, 30, 45, 255),
  )

  # Dorsal Rotating Machine Gun Turret (Independent bubble)
  draw.ellipse(
      [512 - 40, 520 - 40, 512 + 40, 520 + 40],
      fill=(47, 53, 66, 255),
      outline=(240, 240, 240, 255),
      width=2,
  )
  draw.rectangle([506, 450, 511, 520], fill=(20, 20, 20, 255))
  draw.rectangle([513, 450, 518, 520], fill=(20, 20, 20, 255))

  # Tail Gunner Stinger
  draw.rectangle([510, 930, 514, 960], fill=(20, 20, 20, 255))

  out = img.resize((256, 256), Image.Resampling.LANCZOS)
  out.save(os.path.join(ASSETS_DIR, "plane_tier4.png"))
  print("[+] plane_tier4.png created successfully.")


if __name__ == "__main__":
  create_tier1_bf109()
  create_tier2_twin_interceptor()
  create_tier3_strike_jet()
  create_tier4_flying_fortress()
  print("\n🎉 All 4 commercial-safe aircraft sprites generated successfully!")
