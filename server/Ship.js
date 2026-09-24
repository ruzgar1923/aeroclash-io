const AIRCRAFT_ROSTER = {
  // --- TIER 1 (Starter - Level 1) ---
  i16: {
    key: 'i16',
    tier: 1,
    name: 'Polikarpov I-16',
    role: 'Starter Scout',
    sprite: 'plane_i16.png',
    minLevel: 1,
    baseMaxHp: 100,
    baseSpeed: 250,
    baseTurnSpeed: 3.9,
    radius: 19,
    cannonDamage: 15,
    cannonCooldown: 0.28,
    secondaryType: 'rocket',
    secondaryCount: 2,
    secondaryCooldown: 3.8,
    secondaryName: 'RS-82 Rockets',
    radarRadius: 850,
    weaponLayout: 'nose',
    color: '#00d2ff'
  },

  // --- TIER 2 (Branching at Level 5) ---
  spitfire: {
    key: 'spitfire',
    tier: 2,
    name: 'Spitfire Mk.V',
    role: 'Agile Fighter',
    sprite: 'plane_spitfire.png',
    minLevel: 5,
    baseMaxHp: 190,
    baseSpeed: 235,
    baseTurnSpeed: 3.4,
    radius: 25,
    cannonDamage: 20,
    cannonCooldown: 0.25,
    secondaryType: 'super_burst',
    secondaryCount: 1,
    secondaryCooldown: 3.2,
    secondaryName: 'Hispano Super-Burst',
    radarRadius: 950,
    weaponLayout: 'dual_wing',
    color: '#2ed573'
  },
  p51: {
    key: 'p51',
    tier: 2,
    name: 'P-51D Mustang',
    role: 'High Speed Escort',
    sprite: 'plane_p51.png',
    minLevel: 5,
    baseMaxHp: 210,
    baseSpeed: 250,
    baseTurnSpeed: 3.2,
    radius: 25,
    cannonDamage: 22,
    cannonCooldown: 0.22,
    secondaryType: 'homing_rocket',
    secondaryCount: 4,
    secondaryCooldown: 3.5,
    secondaryName: 'HVAR Homing Guided Rockets (4x)',
    radarRadius: 1000,
    weaponLayout: 'dual_wing',
    color: '#38ef7d'
  },
  stuka: {
    key: 'stuka',
    tier: 2,
    name: 'Junkers Ju 87 Stuka',
    role: 'Dive Bomber',
    sprite: 'plane_stuka.png',
    minLevel: 5,
    baseMaxHp: 230,
    baseSpeed: 205,
    baseTurnSpeed: 2.8,
    radius: 26,
    cannonDamage: 22,
    cannonCooldown: 0.30,
    secondaryType: 'heavy_bomb',
    secondaryCount: 1,
    secondaryCooldown: 4.2,
    secondaryName: 'SC500 Heavy Bomb',
    radarRadius: 1050,
    weaponLayout: 'wing_and_rear',
    hasRearGunner: true,
    color: '#3498db'
  },
  bf110: {
    key: 'bf110',
    tier: 2,
    name: 'Messerschmitt Bf 110',
    role: 'Heavy Interceptor',
    sprite: 'plane_bf110.png',
    minLevel: 5,
    baseMaxHp: 240,
    baseSpeed: 215,
    baseTurnSpeed: 2.9,
    radius: 27,
    cannonDamage: 24,
    cannonCooldown: 0.28,
    secondaryType: 'rocket',
    secondaryCount: 2,
    secondaryCooldown: 3.8,
    secondaryName: 'Wfr.Gr. 21 Rockets',
    radarRadius: 1100,
    weaponLayout: 'quad_nose',
    color: '#9b59b6'
  },

  // --- TIER 3 (Branching at Level 11) ---
  bf109: {
    key: 'bf109',
    tier: 3,
    name: 'Messerschmitt Bf 109G',
    role: 'Air Superiority',
    sprite: 'plane_tier1.png',
    minLevel: 11,
    baseMaxHp: 340,
    baseSpeed: 225,
    baseTurnSpeed: 2.8,
    radius: 32,
    cannonDamage: 32,
    cannonCooldown: 0.25,
    secondaryType: 'heavy_bomb',
    secondaryCount: 1,
    secondaryCooldown: 3.6,
    secondaryName: 'ETC 500 Bomb',
    radarRadius: 1200,
    weaponLayout: 'nose_and_wing',
    color: '#f1c40f'
  },
  f4u: {
    key: 'f4u',
    tier: 3,
    name: 'F4U Corsair',
    role: 'Naval Fighter-Bomber',
    sprite: 'plane_f4u.png',
    minLevel: 11,
    baseMaxHp: 380,
    baseSpeed: 235,
    baseTurnSpeed: 2.7,
    radius: 33,
    cannonDamage: 35,
    cannonCooldown: 0.23,
    secondaryType: 'heavy_bomb',
    secondaryCount: 2,
    secondaryCooldown: 4.0,
    secondaryName: 'Twin 1000lb Bombs',
    radarRadius: 1250,
    weaponLayout: 'dual_wing',
    color: '#1e3799'
  },
  he111: {
    key: 'he111',
    tier: 3,
    name: 'Heinkel He 111',
    role: 'Medium Bomber',
    sprite: 'plane_he111.png',
    minLevel: 11,
    baseMaxHp: 440,
    baseSpeed: 185,
    baseTurnSpeed: 2.1,
    radius: 35,
    cannonDamage: 28,
    cannonCooldown: 0.32,
    secondaryType: 'carpet_bomb',
    secondaryCount: 4,
    secondaryCooldown: 4.5,
    secondaryName: 'Carpet Bombing',
    radarRadius: 1450,
    weaponLayout: 'bomber_turret',
    hasDorsalTurret: true,
    color: '#e67e22'
  },

  // --- TIER 4 (Apex Classes at Level 18) ---
  me262: {
    key: 'me262',
    tier: 4,
    name: 'Messerschmitt Me 262',
    role: 'Turbojet Interceptor',
    sprite: 'plane_me262.png',
    minLevel: 18,
    baseMaxHp: 520,
    baseSpeed: 260,
    baseTurnSpeed: 2.1,
    radius: 40,
    cannonDamage: 40,
    cannonCooldown: 0.22,
    secondaryType: 'rocket_salvo',
    secondaryCount: 4,
    secondaryCooldown: 7.0,
    secondaryName: 'R4M Orkan Salvo (4x)',
    radarRadius: 1350,
    weaponLayout: 'jet_quad',
    color: '#e74c3c'
  },
  ho229: {
    key: 'ho229',
    tier: 4,
    name: 'Horten Ho 229',
    role: 'Stealth Flying Wing',
    sprite: 'plane_ho229.png',
    minLevel: 18,
    baseMaxHp: 560,
    baseSpeed: 275,
    baseTurnSpeed: 2.5,
    radius: 38,
    cannonDamage: 44,
    cannonCooldown: 0.20,
    secondaryType: 'super_burst',
    secondaryCount: 1,
    secondaryCooldown: 4.5,
    secondaryName: 'Twin MK 108 30mm Turbo Burst',
    radarRadius: 1500,
    weaponLayout: 'jet_quad',
    color: '#a55eea'
  },
  a10: {
    key: 'a10',
    tier: 4,
    name: 'A-10 Warthog',
    role: 'Tank Killer & CAS',
    sprite: 'plane_a10.png',
    minLevel: 18,
    baseMaxHp: 750,
    baseSpeed: 185,
    baseTurnSpeed: 2.2,
    radius: 44,
    cannonDamage: 55,
    cannonCooldown: 0.12,
    secondaryType: 'homing_rocket_salvo',
    secondaryCount: 4,
    secondaryCooldown: 5.0,
    secondaryName: 'AGM-65 Maverick Guided Missiles (4x)',
    radarRadius: 1600,
    weaponLayout: 'quad_nose',
    color: '#4b6584'
  },
  b17: {
    key: 'b17',
    tier: 4,
    name: 'B-17 Flying Fortress',
    role: 'Heavy Sky Fortress',
    sprite: 'plane_b17.png',
    minLevel: 18,
    baseMaxHp: 940,
    baseSpeed: 120,
    baseTurnSpeed: 1.15,
    radius: 52,
    cannonDamage: 45,
    cannonCooldown: 0.30,
    secondaryType: 'blockbuster_bomb',
    secondaryCount: 1,
    secondaryCooldown: 5.5,
    secondaryName: '4000lb Blockbuster Bomb',
    radarRadius: 1850,
    weaponLayout: 'fortress_turrets',
    hasDorsalTurret: true,
    hasTailGun: true,
    color: '#fc5c65'
  },

  // --- TIER 5 (Ultimate Apex at Level 25) ---
  b2: {
    key: 'b2',
    tier: 5,
    name: 'B-2 Spirit Stealth Bomber',
    role: 'Apex Stealth Flying-Wing Bomber',
    sprite: 'plane_b2.png',
    minLevel: 25,
    baseMaxHp: 890,
    baseSpeed: 300,
    baseTurnSpeed: 2.8,
    radius: 46,
    cannonDamage: 52,
    cannonCooldown: 0.15,
    secondaryType: 'airburst_missile',
    secondaryCount: 1,
    secondaryCooldown: 5.0,
    secondaryName: 'B83 Airburst Cluster Missile',
    radarRadius: 2100,
    weaponLayout: 'jet_quad',
    color: '#2c3e50'
  }
};

function getXpForLevel(lvl) {
  return Math.floor(60 * Math.pow(lvl, 1.45));
}

class Ship {
  constructor(id, name, isBot = false, spawnX = 0, spawnY = 0, options = {}) {
    this.id = id;
    this.name = name || 'Pilot';
    this.isBot = isBot;
    this.team = options.team || 'ffa'; // 'ffa' | 'allies' | 'axis'
    this.x = spawnX;
    this.y = spawnY;
    this.angle = Math.random() * Math.PI * 2;
    this.turretAngle = this.angle;

    // Strict flight velocity (No drift / slide)
    this.forwardSpeed = 220;
    this.vx = Math.cos(this.angle) * this.forwardSpeed;
    this.vy = Math.sin(this.angle) * this.forwardSpeed;

    // Progression
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 0;
    this.statLevels = {
      maxHp: 0,
      speed: 0,
      cannonDmg: 0,
      missileCd: 0,
      regen: 0
    };

    this.kills = 0;
    this.killStreak = 0; // Call of Duty style streak counter
    this.reconTimer = 0; // Recon UAV active countdown
    this.wingmanId = null; // Companion AI escort fighter
    this.wingmanDuration = 0; // Remaining fuel/mission time in seconds
    this.score = 0;
    this.classKey = 'i16';
    this.applyClassStats();
    this.hp = this.maxHp;

    // Cooldowns
    this.cannonTimer = 0;
    this.secondaryTimer = 0;
    this.turretTimer = 0;
    this.burstTimer = 0; // For Spitfire super-burst
    this.isBoosting = false;
    this.isBraking = false;

    // Afterburner Stamina / Overheat System
    this.boostFuel = 100; // 0 to 100
    this.isOverheated = false;

    // Lock-on Tracking (for planes that support lock)
    this.lockTargetId = null;
    this.lockProgress = 0;
    this.isLockedOn = false;

    // Inputs
    this.targetAngle = this.angle;
    this.targetTurretAngle = this.angle;
    this.firingCannon = false;
    this.firingTorpedo = false; // Secondary weapon fire key

    this.keyLeft = false;
    this.keyRight = false;
    this.keyUp = false;
    this.keyDown = false;
  }

  applyClassStats() {
    const config = AIRCRAFT_ROSTER[this.classKey] || AIRCRAFT_ROSTER.i16;
    this.tier = config.tier;
    this.tierName = config.name;
    this.role = config.role;
    this.sprite = config.sprite;
    this.radius = config.radius;
    this.secondaryType = config.secondaryType;
    this.secondaryCount = config.secondaryCount;
    this.secondaryName = config.secondaryName;
    this.radarRadius = config.radarRadius;
    this.weaponLayout = config.weaponLayout;
    this.hasRearGunner = !!config.hasRearGunner;
    this.hasDorsalTurret = !!config.hasDorsalTurret;
    this.hasTailGun = !!config.hasTailGun;
    this.color = config.color;

    this.recalculateStats();
  }

  recalculateStats() {
    const config = AIRCRAFT_ROSTER[this.classKey] || AIRCRAFT_ROSTER.i16;

    const hpMult = 1 + (this.statLevels.maxHp * 0.16);
    const oldMaxHp = this.maxHp || config.baseMaxHp;
    this.maxHp = Math.round(config.baseMaxHp * hpMult);
    if (this.hp === undefined) {
      this.hp = this.maxHp;
    } else {
      this.hp = Math.min(this.maxHp, Math.round(this.hp * (this.maxHp / oldMaxHp)));
    }

    const speedMult = 1 + (this.statLevels.speed * 0.07);
    this.baseSpeed = config.baseSpeed * speedMult;
    this.turnSpeed = config.baseTurnSpeed * (1 + this.statLevels.speed * 0.06);

    const dmgMult = 1 + (this.statLevels.cannonDmg * 0.18);
    this.cannonDamage = Math.round(config.cannonDamage * dmgMult);
    this.cannonCooldown = config.cannonCooldown * (1 - this.statLevels.cannonDmg * 0.03);

    const cdReduc = 1 - (this.statLevels.missileCd * 0.10);
    this.secondaryCooldown = config.secondaryCooldown * cdReduc;

    this.regenRate = 2.5 + (this.statLevels.regen * 1.8);
  }

  upgradeStat(statKey) {
    if (this.skillPoints <= 0) return false;
    if (this.statLevels[statKey] === undefined) return false;
    if (this.statLevels[statKey] >= 7) return false;

    this.statLevels[statKey]++;
    this.skillPoints--;
    this.recalculateStats();
    return true;
  }

  getAvailableEvolutions() {
    if (this.level >= 25 && this.tier < 5) {
      return ['b2'];
    }
    if (this.level >= 18 && this.tier < 4) {
      return ['me262', 'b17', 'a10', 'ho229'];
    }
    if (this.level >= 11 && this.tier < 3) {
      return ['bf109', 'he111', 'f4u'];
    }
    if (this.level >= 5 && this.tier < 2) {
      return ['spitfire', 'stuka', 'bf110', 'p51'];
    }
    return [];
  }

  evolveTo(newClassKey) {
    const available = this.getAvailableEvolutions();
    if (!available.includes(newClassKey)) return false;

    this.classKey = newClassKey;
    this.applyClassStats();
    this.hp = Math.min(this.maxHp, this.hp + 150);
    return true;
  }

  addXp(amount) {
    this.xp += amount;
    this.score += amount;
    
    let leveledUp = false;
    while (this.level < 30 && this.xp >= getXpForLevel(this.level)) {
      this.level++;
      this.skillPoints++;
      leveledUp = true;
    }

    const availableEvolutions = this.getAvailableEvolutions();
    return { leveledUp, availableEvolutions };
  }

  updateLockOn(dt, shipsMap) {
    // Only lock on if class has guided capability or long range radar
    if (this.secondaryType !== 'rocket_salvo' && this.tier < 3) {
      this.lockTargetId = null;
      this.lockProgress = 0;
      this.isLockedOn = false;
      return;
    }

    let bestTarget = null;
    let bestAngleDiff = 0.35;

    for (const other of shipsMap.values()) {
      if (other.id === this.id) continue;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 750) {
        const aimAngle = this.turretAngle;
        const angleToTarget = Math.atan2(dy, dx);
        let diff = Math.abs(aimAngle - angleToTarget);
        while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

        if (diff < bestAngleDiff) {
          bestAngleDiff = diff;
          bestTarget = other;
        }
      }
    }

    if (bestTarget) {
      if (this.lockTargetId === bestTarget.id) {
        this.lockProgress = Math.min(1.0, this.lockProgress + dt / 0.85);
      } else {
        this.lockTargetId = bestTarget.id;
        this.lockProgress = 0.2;
      }
    } else {
      this.lockProgress = Math.max(0, this.lockProgress - dt * 2.0);
      if (this.lockProgress <= 0) {
        this.lockTargetId = null;
      }
    }

    this.isLockedOn = (this.lockProgress >= 1.0);
  }

  update(dt, mapSize, shipsMap) {
    if (this.cannonTimer > 0) this.cannonTimer -= dt;
    if (this.secondaryTimer > 0) this.secondaryTimer -= dt;
    if (this.turretTimer > 0) this.turretTimer -= dt;
    if (this.burstTimer > 0) this.burstTimer -= dt;
    if (this.reconTimer > 0) this.reconTimer -= dt;

    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.regenRate * dt);
    }

    this.updateLockOn(dt, shipsMap);

    // --- Heading Steering (Bank & Turn) ---
    if (this.keyLeft) {
      this.angle -= this.turnSpeed * dt;
    } else if (this.keyRight) {
      this.angle += this.turnSpeed * dt;
    } else {
      let diff = this.targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      const maxTurn = this.turnSpeed * dt;
      if (Math.abs(diff) < maxTurn) {
        this.angle = this.targetAngle;
      } else {
        this.angle += Math.sign(diff) * maxTurn;
      }
    }

    this.turretAngle = this.targetTurretAngle;

    // --- Afterburner Fuel & Overheat Logic ---
    const wantsBoost = (this.isBoosting || this.keyUp);
    let canBoost = false;

    if (wantsBoost && !this.isOverheated && this.boostFuel > 0) {
      canBoost = true;
      this.boostFuel = Math.max(0, this.boostFuel - 24 * dt); // ~4.2s continuous boost
      if (this.boostFuel <= 0) {
        this.isOverheated = true;
      }
    } else {
      // Recharging fuel
      const rechargeRate = (this.isBraking || this.keyDown) ? 32 : 18;
      this.boostFuel = Math.min(100, this.boostFuel + rechargeRate * dt);
      if (this.isOverheated && this.boostFuel >= 35) {
        this.isOverheated = false; // Cooled down!
      }
    }

    // --- Aerodynamic Flight Speed (NO DRIFTING) ---
    let targetSpeed = this.baseSpeed;
    if (canBoost) {
      targetSpeed *= 1.45;
    } else if (this.isBraking || this.keyDown) {
      targetSpeed *= 0.65;
    }

    // High directional stability: velocity is locked to heading vector
    this.forwardSpeed += (targetSpeed - this.forwardSpeed) * 8.0 * dt;
    this.vx = Math.cos(this.angle) * this.forwardSpeed;
    this.vy = Math.sin(this.angle) * this.forwardSpeed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundary bounces
    const pad = this.radius;
    if (this.x < pad) { this.x = pad; this.angle = Math.PI - this.angle; }
    if (this.x > mapSize - pad) { this.x = mapSize - pad; this.angle = Math.PI - this.angle; }
    if (this.y < pad) { this.y = pad; this.angle = -this.angle; }
    if (this.y > mapSize - pad) { this.y = mapSize - pad; this.angle = -this.angle; }
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }
}

module.exports = { Ship, AIRCRAFT_ROSTER, getXpForLevel };
