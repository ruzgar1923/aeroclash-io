const { Ship } = require('./Ship');

const ACE_CALLSIGNS = [
  'RedBaron', 'Marseille', 'Galland', 'Hartmann',
  'Bader', 'Boyington', 'Johnson', 'Mölders',
  'Nowotny', 'Pokryshkin', 'Kozhedub', 'Sakai'
];

class Bot extends Ship {
  constructor(id, spawnX, spawnY, options = {}) {
    const callsign = ACE_CALLSIGNS[Math.floor(Math.random() * ACE_CALLSIGNS.length)] + ' [AI]';
    super(id, callsign, true, spawnX, spawnY, options);
    this.decisionTimer = 0;
    this.targetCrate = null;
    this.targetEnemy = null;
    this.behaviorMode = 'roam';
  }

  spendBotSkillPoints() {
    const keys = ['maxHp', 'speed', 'cannonDmg', 'missileCd', 'regen'];
    while (this.skillPoints > 0) {
      const chosen = keys[Math.floor(Math.random() * keys.length)];
      if (!this.upgradeStat(chosen)) break;
    }
  }

  checkBotEvolution() {
    const evols = this.getAvailableEvolutions();
    if (evols.length > 0) {
      const chosen = evols[Math.floor(Math.random() * evols.length)];
      this.evolveTo(chosen);
    }
  }

  think(dt, gameState) {
    if (this.skillPoints > 0) {
      this.spendBotSkillPoints();
    }
    this.checkBotEvolution();

    // --- Müttefik Refakatçi / Koruyucu Uçak (Escort Wingman Drone AI) ---
    if (this.isWingman && this.escortOwnerId) {
      const owner = gameState.ships.get(this.escortOwnerId);
      if (!owner || owner.hp <= 0) {
        this.isWingman = false;
        this.escortOwnerId = null;
        this.name = this.name.replace('[ESCORT] ', '') + ' (Solo)';
        return;
      }

      // Owner formation position (trailing 75px to left-rear)
      const formDist = 75;
      const formAngle = owner.angle + Math.PI * 0.82;
      const formX = owner.x + Math.cos(formAngle) * formDist;
      const formY = owner.y + Math.sin(formAngle) * formDist;

      // Find nearest hostile targeting owner or near wingman
      let targetEnemy = null;
      let closestDist = 750;
      for (const other of gameState.ships.values()) {
        if (other.id === this.id || other.id === owner.id || other.escortOwnerId === owner.id) continue;
        if (owner.team && owner.team !== 'ffa' && other.team === owner.team) continue;
        const d = Math.hypot(other.x - owner.x, other.y - owner.y);
        if (d < closestDist) {
          closestDist = d;
          targetEnemy = other;
        }
      }

      if (targetEnemy) {
        const dx = targetEnemy.x - this.x;
        const dy = targetEnemy.y - this.y;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        this.targetAngle = ang;
        this.targetTurretAngle = ang;

        let angleDiff = Math.abs(this.angle - ang);
        while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

        this.firingCannon = (dist < 650 && angleDiff < 0.45);
        this.isBoosting = dist > 450 || Math.hypot(this.x - owner.x, this.y - owner.y) > 280;
      } else {
        // Tight formation flight with owner
        const distToForm = Math.hypot(formX - this.x, formY - this.y);
        if (distToForm > 45) {
          this.targetAngle = Math.atan2(formY - this.y, formX - this.x);
          this.isBoosting = distToForm > 140;
        } else {
          this.targetAngle = owner.angle;
          this.isBoosting = owner.isBoosting;
        }
        this.firingCannon = false;
      }
      return;
    }

    this.decisionTimer -= dt;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 0.35 + Math.random() * 0.3;
      this.evaluateTarget(gameState);
    }

    if (this.behaviorMode === 'attack' && this.targetEnemy) {
      const dx = this.targetEnemy.x - this.x;
      const dy = this.targetEnemy.y - this.y;
      const dist = Math.hypot(dx, dy);
      const angleToEnemy = Math.atan2(dy, dx);

      this.targetTurretAngle = angleToEnemy;
      this.firingCannon = dist < 750;

      let angleDiff = Math.abs(this.angle - angleToEnemy);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
      this.firingTorpedo = (dist < 600 && (this.isLockedOn || angleDiff < 0.35));

      if (this.hp < this.maxHp * 0.35 && dist < 380) {
        this.targetAngle = angleToEnemy + Math.PI;
        this.isBoosting = true;
        this.isBraking = false;
      } else if (dist > 400) {
        this.targetAngle = angleToEnemy;
        this.isBoosting = dist > 600;
        this.isBraking = false;
      } else {
        this.targetAngle = angleToEnemy + (Math.PI / 2.2);
        this.isBoosting = false;
        this.isBraking = Math.random() < 0.25;
      }
    } else if (this.targetCrate) {
      const dx = this.targetCrate.x - this.x;
      const dy = this.targetCrate.y - this.y;
      this.targetAngle = Math.atan2(dy, dx);
      this.targetTurretAngle = this.targetAngle;
      this.firingCannon = false;
      this.firingTorpedo = false;
      this.isBoosting = false;
      this.isBraking = false;
    } else {
      this.firingCannon = false;
      this.firingTorpedo = false;
      this.isBoosting = false;
      this.isBraking = false;
      if (Math.random() < 0.05) {
        this.targetAngle += (Math.random() - 0.5) * 1.5;
      }
    }

    const margin = 250;
    const mapSize = gameState.mapSize;
    if (this.x < margin) this.targetAngle = 0;
    else if (this.x > mapSize - margin) this.targetAngle = Math.PI;
    else if (this.y < margin) this.targetAngle = Math.PI / 2;
    else if (this.y > mapSize - margin) this.targetAngle = -Math.PI / 2;
  }

  evaluateTarget(gameState) {
    let nearestEnemy = null;
    let minDist = this.radarRadius || 800;

    for (const ship of gameState.ships.values()) {
      if (ship.id === this.id) continue;
      if (this.team && this.team !== 'ffa' && ship.team === this.team) continue;
      if (ship.isWingman && ship.escortOwnerId === this.id) continue;
      const d = Math.hypot(ship.x - this.x, ship.y - this.y);
      if (d < minDist) {
        minDist = d;
        nearestEnemy = ship;
      }
    }

    if (nearestEnemy) {
      this.targetEnemy = nearestEnemy;
      this.behaviorMode = 'attack';
      return;
    }

    this.targetEnemy = null;
    this.behaviorMode = 'roam';

    let nearestCrate = null;
    let minCrateDist = 1400;
    for (const crate of gameState.crates) {
      const d = Math.hypot(crate.x - this.x, crate.y - this.y);
      if (d < minCrateDist) {
        minCrateDist = d;
        nearestCrate = crate;
      }
    }
    this.targetCrate = nearestCrate;
  }
}

module.exports = Bot;
