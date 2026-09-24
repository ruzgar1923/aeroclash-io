class Projectile {
  constructor(ownerId, ownerName, type, x, y, angle, options = {}) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.ownerId = ownerId;
    this.ownerName = ownerName;
    this.type = type; // 'tracer' | 'rocket' | 'bomb'
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.targetId = options.targetId || null;
    this.team = options.team || null;
    
    if (this.type === 'blockbuster' || this.type === 'mega_bomb') {
      // 4000lb Colossal Blockbuster Bomb (Single Massive Blast)
      this.speed = options.speed || 125;
      this.radius = 18;
      this.maxLifetime = 1.6;
      this.flatDamage = 175;
      this.percentDamage = 0.65; // 65% max HP damage
      this.splashRadius = 180;
      this.isBomb = true;
      this.isBlockbuster = true;
    } else if (this.type === 'bomb') {
      // Free-falling heavy bomb carrying aircraft momentum
      this.speed = options.speed || 180;
      this.radius = 12;
      this.maxLifetime = 1.35; // Detonates on timer or impact
      this.flatDamage = 90;
      this.percentDamage = 0.45; // 45% max HP splash
      this.splashRadius = 95;
      this.isBomb = true;
    } else if (this.type === 'nuke_airburst' || this.type === 'airburst') {
      // B-2 Spirit Grand Nuke Airburst Missile: Detonates mid-air after 1.25s releasing a colossal shockwave & 220px blast radius
      this.speed = options.speed || 520;
      this.radius = 14;
      this.maxLifetime = 1.25;
      this.flatDamage = 180;
      this.percentDamage = 0.55;
      this.splashRadius = 220;
      this.isBomb = true;
      this.isAirburst = true;
      this.isNuke = true;
    } else if (this.type === 'rocket') {
      // Rebalanced Aerial Rocket: fair dodgeable speed and non-one-shot damage
      this.speed = options.speed || 420;
      this.radius = 6;
      this.maxLifetime = 3.2;
      this.turnRate = options.isHoming ? (options.turnRate || 1.8) : 0;
      this.flatDamage = 25;
      this.percentDamage = 0.12;
      this.splashRadius = 28;
    } else {
      // Tok High-Velocity Tracer Bullet (Punchy yet evasive/dodgeable with maneuvers)
      this.speed = options.speed || 780;
      this.radius = 4.5;
      this.maxLifetime = 1.25;
      this.damage = options.damage || 20;
    }
    
    this.lifetime = 0;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(dt, shipsMap) {
    if (this.type === 'bomb' || this.type === 'blockbuster' || this.type === 'mega_bomb') {
      // Bombs decelerate due to air friction before hitting ground/blast height
      this.vx *= (1 - 0.5 * dt);
      this.vy *= (1 - 0.5 * dt);
    } else if (this.type === 'rocket' && this.turnRate > 0 && this.targetId && shipsMap) {
      // Homing guidance (if enabled for rocket)
      const target = shipsMap.get(this.targetId);
      if (target && target.hp > 0) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        
        let diff = targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        const maxTurn = this.turnRate * dt;
        if (Math.abs(diff) < maxTurn) {
          this.angle = targetAngle;
        } else {
          this.angle += Math.sign(diff) * maxTurn;
        }
        
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime += dt;
    return this.lifetime < this.maxLifetime;
  }

  getDamage(targetMaxHp) {
    if (this.type === 'bomb' || this.type === 'blockbuster' || this.type === 'mega_bomb' || this.type === 'airburst' || this.type === 'nuke_airburst' || this.type === 'rocket') {
      return this.flatDamage + (targetMaxHp * this.percentDamage);
    }
    return this.damage;
  }
}

module.exports = Projectile;
