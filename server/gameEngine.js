const { Ship, AIRCRAFT_ROSTER, getXpForLevel } = require('./Ship');
const Bot = require('./Bot');
const Projectile = require('./Projectile');

class GameEngine {
  constructor(io) {
    this.io = io;
    this.mapSize = 4000;
    this.targetBotCount = 9;
    this.targetCrateCount = 110;
    
    this.ships = new Map();
    this.projectiles = [];
    this.crates = [];
    this.events = [];
    this.crateIdCounter = 0;
    this.teamScores = { allies: 0, axis: 0 };

    this.generateBiomeLandmarks();
    this.initCrates();
    this.lastTick = Date.now();
    this.tickInterval = 1000 / 30; // 30 ticks per second

    setInterval(() => this.loop(), this.tickInterval);
  }

  generateBiomeLandmarks() {
    this.landmarks = [];

    // 1. Ocean & Archipelago
    const islandPositions = [
      { x: 500, y: 500, r: 130 }, { x: 1200, y: 400, r: 170 }, { x: 800, y: 1300, r: 150 },
      { x: 1500, y: 1200, r: 190 }, { x: 300, y: 1500, r: 110 }, { x: 1700, y: 600, r: 120 }
    ];
    for (const isl of islandPositions) {
      this.landmarks.push({ type: 'island', biome: 'ocean', x: isl.x, y: isl.y, radius: isl.r });
    }

    // 2. Alpine Snow & Tundra
    const mountainPositions = [
      { x: 2500, y: 450, r: 140 }, { x: 3300, y: 400, r: 180 }, { x: 2800, y: 1200, r: 160 },
      { x: 3600, y: 1100, r: 210 }, { x: 2400, y: 1600, r: 130 }, { x: 3500, y: 1700, r: 150 }
    ];
    for (const m of mountainPositions) {
      this.landmarks.push({ type: 'mountain', biome: 'snow', x: m.x, y: m.y, radius: m.r });
    }

    // 3. Pine Forest & Airfield
    this.landmarks.push({
      type: 'airfield', biome: 'forest', x: 1000, y: 3000, width: 460, height: 90, angle: -0.2
    });
    const forestGroves = [
      { x: 400, y: 2400, r: 130 }, { x: 1500, y: 2300, r: 160 }, { x: 500, y: 3500, r: 180 },
      { x: 1600, y: 3400, r: 150 }, { x: 1200, y: 3700, r: 140 }
    ];
    for (const f of forestGroves) {
      this.landmarks.push({ type: 'forest_grove', biome: 'forest', x: f.x, y: f.y, radius: f.r });
    }

    // 4. Desert Canyons & Oasis
    this.landmarks.push({ type: 'oasis', biome: 'desert', x: 3000, y: 3000, radius: 120 });
    const canyonPositions = [
      { x: 2500, y: 2500, r: 140 }, { x: 3500, y: 2400, r: 160 }, { x: 2700, y: 3500, r: 170 },
      { x: 3600, y: 3400, r: 190 }, { x: 3200, y: 3700, r: 130 }
    ];
    for (const c of canyonPositions) {
      this.landmarks.push({ type: 'canyon_mesa', biome: 'desert', x: c.x, y: c.y, radius: c.r });
    }
  }

  initCrates() {
    while (this.crates.length < this.targetCrateCount) {
      this.spawnCrate();
    }
  }

  spawnCrate(x, y, xpValue) {
    const types = [
      { type: 'fuel', xp: 20, color: '#e74c3c', radius: 10 },
      { type: 'ammo', xp: 35, color: '#f1c40f', radius: 12 },
      { type: 'tech', xp: 55, color: '#00d2d3', radius: 14 }
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];
    
    this.crates.push({
      id: ++this.crateIdCounter,
      x: x !== undefined ? x : 100 + Math.random() * (this.mapSize - 200),
      y: y !== undefined ? y : 100 + Math.random() * (this.mapSize - 200),
      radius: chosen.radius,
      xp: xpValue || chosen.xp,
      color: chosen.color,
      type: chosen.type
    });
  }

  addPlayer(socketId, name, options = {}) {
    const spawnX = 200 + Math.random() * (this.mapSize - 400);
    const spawnY = 200 + Math.random() * (this.mapSize - 400);
    const team = options.team || 'ffa';
    const ship = new Ship(socketId, name, false, spawnX, spawnY, { team: team });
    this.ships.set(socketId, ship);
    return ship;
  }

  removePlayer(socketId) {
    this.ships.delete(socketId);
  }

  handleUpgradeStat(socketId, statKey) {
    const ship = this.ships.get(socketId);
    if (!ship || ship.isBot) return;
    ship.upgradeStat(statKey);
  }

  handleChooseEvolution(socketId, classKey) {
    const ship = this.ships.get(socketId);
    if (!ship || ship.isBot) return;
    const success = ship.evolveTo(classKey);
    if (success) {
      this.io.to(socketId).emit('evolutionCompleted', {
        classKey: ship.classKey,
        name: ship.tierName,
        tier: ship.tier,
        role: ship.role,
        sprite: ship.sprite,
        secondaryName: ship.secondaryName
      });
    }
  }

  handleInput(socketId, input) {
    const ship = this.ships.get(socketId);
    if (!ship || ship.isBot) return;

    if (typeof input.targetAngle === 'number') ship.targetAngle = input.targetAngle;
    if (typeof input.turretAngle === 'number') ship.targetTurretAngle = input.turretAngle;
    if (typeof input.firingCannon === 'boolean') ship.firingCannon = input.firingCannon;
    if (typeof input.firingTorpedo === 'boolean') ship.firingTorpedo = input.firingTorpedo;
    if (typeof input.isBoosting === 'boolean') ship.isBoosting = input.isBoosting;
    if (typeof input.isBraking === 'boolean') ship.isBraking = input.isBraking;

    if (typeof input.keyLeft === 'boolean') ship.keyLeft = input.keyLeft;
    if (typeof input.keyRight === 'boolean') ship.keyRight = input.keyRight;
    if (typeof input.keyUp === 'boolean') ship.keyUp = input.keyUp;
    if (typeof input.keyDown === 'boolean') ship.keyDown = input.keyDown;
  }

  maintainBots() {
    let botCount = 0;
    let alliesCount = 0;
    let axisCount = 0;
    for (const ship of this.ships.values()) {
      if (ship.isBot) botCount++;
      if (ship.team === 'allies') alliesCount++;
      else if (ship.team === 'axis') axisCount++;
    }

    if (botCount < this.targetBotCount) {
      const id = 'bot_' + Math.random().toString(36).substring(2, 9);
      const spawnX = 300 + Math.random() * (this.mapSize - 600);
      const spawnY = 300 + Math.random() * (this.mapSize - 600);
      const botTeam = alliesCount <= axisCount ? 'allies' : 'axis';
      const bot = new Bot(id, spawnX, spawnY, { team: botTeam });
      if (Math.random() < 0.5) {
        bot.addXp(Math.floor(Math.random() * 950));
      }
      this.ships.set(id, bot);
    }
  }

  fireWeapons(ship) {
    const r = ship.radius;
    const fwdX = Math.cos(ship.angle);
    const fwdY = Math.sin(ship.angle);
    const rightX = Math.cos(ship.angle + Math.PI / 2);
    const rightY = Math.sin(ship.angle + Math.PI / 2);

    const spawnTracer = (ox, oy, angle, dmg) => {
      const proj = new Projectile(ship.id, ship.name, 'tracer', ox, oy, angle, {
        damage: dmg || ship.cannonDamage,
        team: ship.team
      });
      this.projectiles.push(proj);
    };

    // 1. Primary Cannon / Tracer Fire (Strictly forward along aircraft nose angle!)
    if (ship.firingCannon && ship.cannonTimer <= 0) {
      ship.cannonTimer = ship.cannonCooldown;
      const layout = ship.weaponLayout;

      if (layout === 'dual_wing') {
        const wingDist = r * 0.8;
        spawnTracer(ship.x + fwdX * r + rightX * wingDist, ship.y + fwdY * r + rightY * wingDist, ship.angle);
        spawnTracer(ship.x + fwdX * r - rightX * wingDist, ship.y + fwdY * r - rightY * wingDist, ship.angle);
      } else if (layout === 'quad_nose' || layout === 'jet_quad') {
        spawnTracer(ship.x + fwdX * (r + 10) + rightX * 3, ship.y + fwdY * (r + 10) + rightY * 3, ship.angle, ship.cannonDamage * 0.7);
        spawnTracer(ship.x + fwdX * (r + 10) - rightX * 3, ship.y + fwdY * (r + 10) - rightY * 3, ship.angle, ship.cannonDamage * 0.7);
      } else if (layout === 'wing_and_rear' || layout === 'nose_and_wing') {
        const wingDist = r * 0.75;
        spawnTracer(ship.x + fwdX * r + rightX * wingDist, ship.y + fwdY * r + rightY * wingDist, ship.angle);
        spawnTracer(ship.x + fwdX * r - rightX * wingDist, ship.y + fwdY * r - rightY * wingDist, ship.angle);
      } else if (layout === 'bomber_turret' || layout === 'fortress_turrets') {
        // Nose machine guns fire strictly straight ahead along ship.angle!
        spawnTracer(ship.x + fwdX * (r + 8), ship.y + fwdY * (r + 8), ship.angle);
        // Only dorsal defensive turret swivels towards targetTurretAngle
        spawnTracer(ship.x + Math.cos(ship.turretAngle) * 12, ship.y + Math.sin(ship.turretAngle) * 12, ship.turretAngle, ship.cannonDamage * 0.85);
      } else {
        // Starter Polikarpov I-16 / Standard Nose: Twin forward synchronized ShKAS guns strictly forward!
        spawnTracer(ship.x + fwdX * (r + 10) + rightX * 4, ship.y + fwdY * (r + 10) + rightY * 4, ship.angle);
        spawnTracer(ship.x + fwdX * (r + 10) - rightX * 4, ship.y + fwdY * (r + 10) - rightY * 4, ship.angle);
      }

      this.events.push({
        type: 'fire',
        projType: 'tracer',
        ownerId: ship.id,
        x: ship.x,
        y: ship.y
      });
    }

    // 2. Historical Secondary Weapons
    if (ship.firingTorpedo && ship.secondaryTimer <= 0) {
      ship.secondaryTimer = ship.secondaryCooldown;
      const secType = ship.secondaryType;

      if (secType === 'super_burst') {
        // Spitfire: 6-tracer rapid overcharge salvo
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const curShip = this.ships.get(ship.id);
            if (curShip) {
              const curFwdX = Math.cos(curShip.angle);
              const curFwdY = Math.sin(curShip.angle);
              const curRightX = Math.cos(curShip.angle + Math.PI / 2);
              const curRightY = Math.sin(curShip.angle + Math.PI / 2);
              spawnTracer(curShip.x + curFwdX * curShip.radius + curRightX * 16, curShip.y + curFwdY * curShip.radius + curRightY * 16, curShip.angle, 26);
              spawnTracer(curShip.x + curFwdX * curShip.radius - curRightX * 16, curShip.y + curFwdY * curShip.radius - curRightX * 16, curShip.angle, 26);
            }
          }, i * 65);
        }
        this.events.push({ type: 'fire', projType: 'tracer', ownerId: ship.id, x: ship.x, y: ship.y });

      } else if (secType === 'blockbuster_bomb') {
        // B-17 Flying Fortress: Single 4000lb Colossal Blockbuster Bomb
        const blockbuster = new Projectile(
          ship.id, ship.name, 'blockbuster',
          ship.x - fwdX * 15, ship.y - fwdY * 15,
          ship.angle, { speed: ship.forwardSpeed * 0.9, team: ship.team }
        );
        this.projectiles.push(blockbuster);
        this.events.push({ type: 'fire', projType: 'bomb', isBlockbuster: true, ownerId: ship.id, x: ship.x, y: ship.y });

      } else if (secType === 'heavy_bomb') {
        // Stuka / Bf 109: Drop 500kg Heavy Bomb carrying forward speed
        const bomb = new Projectile(
          ship.id, ship.name, 'bomb',
          ship.x - fwdX * 10, ship.y - fwdY * 10,
          ship.angle, { speed: ship.forwardSpeed * 0.95, team: ship.team }
        );
        this.projectiles.push(bomb);
        this.events.push({ type: 'fire', projType: 'bomb', ownerId: ship.id, x: ship.x, y: ship.y });

      } else if (secType === 'carpet_bomb') {
        // He 111: Drop trailing carpet bombs
        const count = ship.secondaryCount || 4;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const curShip = this.ships.get(ship.id);
            if (curShip) {
              const curFwdX = Math.cos(curShip.angle);
              const curFwdY = Math.sin(curShip.angle);
              const bomb = new Projectile(
                curShip.id, curShip.name, 'bomb',
                curShip.x - curFwdX * 15, curShip.y - curFwdY * 15,
                curShip.angle, { speed: curShip.forwardSpeed * 0.85, team: curShip.team }
              );
              this.projectiles.push(bomb);
            }
          }, i * 140);
        }
        this.events.push({ type: 'fire', projType: 'bomb', ownerId: ship.id, x: ship.x, y: ship.y });

      } else if (secType === 'rocket_salvo') {
        // Me 262: Rebalanced 4 R4M unguided rockets (reduced from 8)
        const angles = [-0.09, -0.03, 0.03, 0.09];
        for (const off of angles) {
          const rocket = new Projectile(
            ship.id, ship.name, 'rocket',
            ship.x + fwdX * (r + 8), ship.y + fwdY * (r + 8),
            ship.angle + off,
            { team: ship.team }
          );
          this.projectiles.push(rocket);
        }
        this.events.push({ type: 'fire', projType: 'rocket', ownerId: ship.id, x: ship.x, y: ship.y });

      } else {
        // Standard Rockets (I-16, Bf 110)
        const targetId = (ship.isLockedOn && ship.lockTargetId) ? ship.lockTargetId : null;
        const count = ship.secondaryCount || 2;
        const angles = count === 2 ? [-0.08, 0.08] : [0];

        for (const off of angles) {
          const rocket = new Projectile(
            ship.id, ship.name, 'rocket',
            ship.x + fwdX * (r + 8), ship.y + fwdY * (r + 8),
            ship.angle + off,
            { targetId: targetId, isHoming: !!targetId, team: ship.team }
          );
          this.projectiles.push(rocket);
        }
        this.events.push({ type: 'fire', projType: 'rocket', ownerId: ship.id, x: ship.x, y: ship.y });
      }
    }
  }

  loop() {
    const now = Date.now();
    const dt = Math.min((now - this.lastTick) / 1000, 0.1);
    this.lastTick = now;

    this.maintainBots();

    // 1. Update aircraft
    for (const ship of this.ships.values()) {
      if (ship.isBot) {
        ship.think(dt, { ships: this.ships, crates: this.crates, mapSize: this.mapSize });
      }
      ship.update(dt, this.mapSize, this.ships);
      this.fireWeapons(ship);

      // Recon UAV active countdown
      if (ship.reconTimer > 0) {
        ship.reconTimer = Math.max(0, ship.reconTimer - dt);
      }

      // Escort wingman duration timer decay & RTB (Bingo Fuel)
      if (ship.wingmanDuration > 0) {
        ship.wingmanDuration -= dt;
        if (ship.wingmanDuration <= 0) {
          ship.wingmanDuration = 0;
          if (ship.wingmanId && this.ships.has(ship.wingmanId)) {
            this.ships.delete(ship.wingmanId);
            ship.wingmanId = null;
            if (this.io) this.io.to(ship.id).emit('streakFeedback', { type: 'escort_rtb', message: 'WINGMAN RTB - BINGO FUEL!' });
          }
        }
      }

      // Crate collection
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const crate = this.crates[i];
        const dist = Math.hypot(ship.x - crate.x, ship.y - crate.y);
        if (dist < ship.radius + crate.radius) {
          const { leveledUp, availableEvolutions } = ship.addXp(crate.xp);
          if (leveledUp && !ship.isBot) {
            this.io.to(ship.id).emit('leveledUp', {
              level: ship.level,
              skillPoints: ship.skillPoints
            });
            if (availableEvolutions.length > 0) {
              const cards = availableEvolutions.map(k => AIRCRAFT_ROSTER[k]);
              this.io.to(ship.id).emit('evolutionChoices', cards);
            }
          }
          this.crates.splice(i, 1);
        }
      }
    }

    while (this.crates.length < this.targetCrateCount) {
      this.spawnCrate();
    }

    // 2. Update projectiles & collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const alive = p.update(dt, this.ships);

      // Bomb detonation timer expiry -> creates blast
      if (!alive && p.isBomb) {
        this.detonateBomb(p);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (!alive || p.x < 0 || p.x > this.mapSize || p.y < 0 || p.y > this.mapSize) {
        this.projectiles.splice(i, 1);
        continue;
      }

      let hit = false;
      for (const ship of this.ships.values()) {
        if (ship.id === p.ownerId) continue;
        // Friendly fire protection (team mode & escort wingman)
        if (p.team && ship.team && p.team !== 'ffa' && p.team === ship.team) continue;
        if (ship.isWingman && ship.escortOwnerId === p.ownerId) continue;

        const dist = Math.hypot(p.x - ship.x, p.y - ship.y);
        if (dist < ship.radius + p.radius) {
          hit = true;
          
          if (p.isBomb) {
            this.detonateBomb(p);
          } else {
            // Locational / Directional Hit Damage
            const impactAngle = Math.atan2(p.y - ship.y, p.x - ship.x);
            let relAngle = impactAngle - ship.angle;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;
            const absRel = Math.abs(relAngle);

            let multiplier = 1.0;
            let hitZone = 'body';

            if (absRel > 2.35) {
              // 135 deg to 180 deg: Rear Tail & Engine Exhaust Strike (Critical Dogfight Hit)
              hitZone = 'tail';
              multiplier = 1.45; // 45% critical bonus
            } else if (absRel > 0.78) {
              // 45 deg to 135 deg: Wings / Fuel Tanks
              hitZone = 'wing';
              multiplier = 1.10; // 10% wing bonus
            } else {
              // 0 deg to 45 deg: Heavy Armored Nose / Propeller Cowling Deflection
              hitZone = 'nose';
              multiplier = 0.80; // 20% armor reduction
            }

            const baseDamage = p.getDamage(ship.maxHp);
            const damage = Math.round(baseDamage * multiplier);
            const destroyed = ship.takeDamage(damage);

            this.events.push({
              type: 'hit',
              projType: p.type,
              attackerId: p.ownerId,
              victimId: ship.id,
              x: p.x,
              y: p.y,
              hitZone: hitZone,
              isCrit: hitZone === 'tail',
              damage: damage
            });

            if (destroyed) {
              this.handleShipCrash(ship, p.ownerId, p.ownerName, p.type);
            }
          }
          break;
        }
      }

      if (hit) {
        this.projectiles.splice(i, 1);
      }
    }

    // 3. Broadcast state
    this.broadcastState();
  }

  detonateBomb(bomb) {
    this.events.push({
      type: 'bomb_blast',
      x: bomb.x,
      y: bomb.y,
      radius: bomb.splashRadius,
      isBlockbuster: !!bomb.isBlockbuster
    });

    // Splash damage to all nearby aircraft
    for (const ship of this.ships.values()) {
      if (ship.id === bomb.ownerId) continue;
      // Friendly fire protection
      if (bomb.team && ship.team && bomb.team !== 'ffa' && bomb.team === ship.team) continue;
      if (ship.isWingman && ship.escortOwnerId === bomb.ownerId) continue;

      const d = Math.hypot(ship.x - bomb.x, ship.y - bomb.y);
      if (d < bomb.splashRadius + ship.radius) {
        const falloff = 1 - (d / (bomb.splashRadius + ship.radius));
        const dmg = Math.round(bomb.getDamage(ship.maxHp) * Math.max(0.4, falloff));
        const killed = ship.takeDamage(dmg);

        this.events.push({
          type: 'hit',
          projType: bomb.isBlockbuster ? 'bomb' : 'bomb',
          attackerId: bomb.ownerId,
          victimId: ship.id,
          x: ship.x,
          y: ship.y,
          damage: dmg
        });

        if (killed) {
          this.handleShipCrash(ship, bomb.ownerId, bomb.ownerName, bomb.isBlockbuster ? 'Blockbuster Bomb' : 'bomb');
        }
      }
    }
  }

  handleShipCrash(victim, killerId, killerName, weaponType) {
    const killer = this.ships.get(killerId);
    if (killer) {
      killer.kills += 1;
      killer.killStreak = (killer.killStreak || 0) + 1;
      const stolenXp = Math.max(90, Math.floor(victim.xp * 0.45));
      const { leveledUp, availableEvolutions } = killer.addXp(stolenXp);

      // Team scores
      if (killer.team && victim.team && killer.team !== 'ffa' && killer.team !== victim.team) {
        if (killer.team === 'allies') {
          this.teamScores.allies = (this.teamScores.allies || 0) + 1;
        } else if (killer.team === 'axis') {
          this.teamScores.axis = (this.teamScores.axis || 0) + 1;
        }
      }
      if (leveledUp && !killer.isBot) {
        if (this.io) {
          this.io.to(killer.id).emit('leveledUp', { level: killer.level, skillPoints: killer.skillPoints });
          if (availableEvolutions.length > 0) {
            const cards = availableEvolutions.map(k => AIRCRAFT_ROSTER[k]);
            this.io.to(killer.id).emit('evolutionChoices', cards);
          }
        }
      }
    }

    victim.killStreak = 0;
    victim.wingmanDuration = 0;
    if (victim.wingmanId && this.ships.has(victim.wingmanId)) {
      this.ships.delete(victim.wingmanId);
      victim.wingmanId = null;
    }

    const dropCount = Math.min(10, 3 + victim.tier * 2);
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (victim.radius + 35);
      this.spawnCrate(victim.x + Math.cos(angle) * r, victim.y + Math.sin(angle) * r, 35 + victim.tier * 18);
    }

    this.events.push({
      type: 'crash',
      x: victim.x,
      y: victim.y,
      tier: victim.tier,
      victimName: victim.name,
      killerName: killerName || 'Flak Hazard',
      weaponType: weaponType
    });

    if (victim.isBot) {
      this.ships.delete(victim.id);
    } else {
      if (this.io) {
        this.io.to(victim.id).emit('playerDied', {
          killerName: killerName || 'Airspace Hazard',
          weaponType: weaponType,
          score: victim.score,
          tier: victim.tierName,
          level: victim.level
        });
      }
      this.ships.delete(victim.id);
    }
  }

  // --- Call of Duty Style Killstreak Activation ---
  handleActivateKillstreak(socketId, streakKey, options = {}) {
    const ship = this.ships.get(socketId);
    if (!ship || ship.isBot || ship.hp <= 0) return;

    if (streakKey === 'recon') {
      if ((ship.killStreak || 0) < 2) return;
      ship.killStreak -= 2; // Deduct 2 kills
      ship.reconTimer = 18; // 18 seconds of global map recon
      this.events.push({
        type: 'killstreak_activated',
        streakKey: 'recon',
        ownerId: ship.id,
        ownerName: ship.name
      });
      if (this.io) this.io.to(socketId).emit('streakFeedback', { type: 'recon', message: 'RECON AIR PATROL ACTIVE (18s)!' });

    } else if (streakKey === 'escort') {
      if ((ship.killStreak || 0) < 3) return;
      ship.killStreak -= 3; // Deduct 3 kills
      ship.wingmanDuration = 40; // 40 seconds duration before RTB

      if (ship.wingmanId && this.ships.has(ship.wingmanId)) {
        const existing = this.ships.get(ship.wingmanId);
        existing.hp = existing.maxHp;
        if (this.io) this.io.to(socketId).emit('streakFeedback', { type: 'escort', message: 'ESCORT WINGMAN REPAIRED & REFUELED (40s)!' });
        return;
      }

      const wingmanId = 'wingman_' + Math.random().toString(36).substring(2, 8);
      const wingman = new Bot(wingmanId, ship.x - 70, ship.y - 70);
      wingman.name = `[ESCORT] ${ship.name}`;
      wingman.isWingman = true;
      wingman.escortOwnerId = ship.id;
      wingman.team = ship.team || 'ffa';
      wingman.tier = 2;
      wingman.sprite = 'plane_spitfire.png';
      wingman.color = '#2ed573';
      wingman.classKey = 'spitfire';
      wingman.applyClassStats();
      wingman.maxHp = 280;
      wingman.hp = 280;
      wingman.cannonDamage = 22;

      this.ships.set(wingmanId, wingman);
      ship.wingmanId = wingmanId;

      this.events.push({
        type: 'killstreak_activated',
        streakKey: 'escort',
        ownerId: ship.id,
        ownerName: ship.name
      });
      if (this.io) this.io.to(socketId).emit('streakFeedback', { type: 'escort', message: 'ESCORT WINGMAN IN FORMATION (40s)!' });

    } else if (streakKey === 'flak') {
      if ((ship.killStreak || 0) < 5) return;
      ship.killStreak -= 5; // Deduct 5 kills - CONSUMES KILLSTREAK SO CANNOT BE SPAMMED!
      const targetX = options.targetX || (ship.x + Math.cos(ship.angle) * 350);
      const targetY = options.targetY || (ship.y + Math.sin(ship.angle) * 350);

      // 8 consecutive heavy 88mm Flak airbursts in target area
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 240;
          const offsetY = (Math.random() - 0.5) * 240;
          const fx = targetX + offsetX;
          const fy = targetY + offsetY;

          this.events.push({
            type: 'bomb_blast',
            x: fx,
            y: fy,
            radius: 85,
            isFlak: true
          });

          for (const s of this.ships.values()) {
            if (s.id === ship.id || s.escortOwnerId === ship.id) continue;
            if (ship.team && ship.team !== 'ffa' && s.team === ship.team) continue;
            const dist = Math.hypot(s.x - fx, s.y - fy);
            if (dist < 85 + s.radius) {
              const killed = s.takeDamage(60);
              this.events.push({
                type: 'hit',
                projType: 'flak',
                attackerId: ship.id,
                victimId: s.id,
                x: s.x,
                y: s.y,
                damage: 60
              });
              if (killed) {
                this.handleShipCrash(s, ship.id, ship.name, 'Flak Strike');
              }
            }
          }
        }, i * 180);
      }

      this.events.push({
        type: 'killstreak_activated',
        streakKey: 'flak',
        ownerId: ship.id,
        ownerName: ship.name
      });
      if (this.io) this.io.to(socketId).emit('streakFeedback', { type: 'flak', message: 'FLAK BARRAGE CALLED IN!' });
    }
  }

  broadcastState() {
    const shipsData = [];
    for (const s of this.ships.values()) {
      const nextXp = getXpForLevel(s.level);
      const prevXp = s.level > 1 ? getXpForLevel(s.level - 1) : 0;

      shipsData.push({
        id: s.id,
        name: s.name,
        team: s.team || 'ffa',
        isBot: s.isBot,
        isWingman: !!s.isWingman,
        escortOwnerId: s.escortOwnerId || null,
        killStreak: s.killStreak || 0,
        reconTimer: s.reconTimer > 0 ? +s.reconTimer.toFixed(1) : 0,
        wingmanDuration: s.wingmanDuration > 0 ? Math.ceil(s.wingmanDuration) : 0,
        x: Math.round(s.x),
        y: Math.round(s.y),
        angle: +s.angle.toFixed(3),
        turretAngle: +s.turretAngle.toFixed(3),
        hp: Math.round(s.hp),
        maxHp: s.maxHp,
        score: s.score,
        level: s.level,
        skillPoints: s.skillPoints,
        statLevels: s.statLevels,
        xp: s.xp,
        prevXp: prevXp,
        nextXp: nextXp,
        tier: s.tier,
        classKey: s.classKey,
        tierName: s.tierName,
        role: s.role,
        sprite: s.sprite,
        radius: s.radius,
        radarRadius: s.reconTimer > 0 ? 9999 : s.radarRadius,
        lockTargetId: s.lockTargetId,
        isLockedOn: s.isLockedOn,
        lockProgress: +s.lockProgress.toFixed(2),
        hasDorsalTurret: s.hasDorsalTurret,
        color: s.color,
        boostFuel: Math.round(s.boostFuel),
        isOverheated: s.isOverheated,
        isBoosting: s.isBoosting || s.keyUp,
        isBraking: s.isBraking || s.keyDown,
        secondaryType: s.secondaryType,
        secondaryName: s.secondaryName,
        cannonCooldownRatio: s.cannonCooldown ? Math.max(0, s.cannonTimer / s.cannonCooldown) : 0,
        secondaryCooldownRatio: s.secondaryCooldown ? Math.max(0, s.secondaryTimer / s.secondaryCooldown) : 0
      });
    }

    const leaderboard = [...shipsData]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => ({ name: s.name, score: s.score, tier: s.tier, level: s.level, team: s.team }));

    const projectilesData = this.projectiles.map(p => ({
      id: p.id,
      type: p.type,
      x: Math.round(p.x),
      y: Math.round(p.y),
      angle: +p.angle.toFixed(3),
      lifetime: +p.lifetime.toFixed(2),
      maxLifetime: p.maxLifetime || 1.35
    }));

    const payload = {
      ships: shipsData,
      projectiles: projectilesData,
      crates: this.crates,
      events: this.events,
      leaderboard,
      teamScores: this.teamScores
    };

    if (this.io) this.io.emit('tick', payload);
    this.events = [];
  }
}

module.exports = GameEngine;
