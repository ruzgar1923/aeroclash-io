// AeroClash.io Multi-Biome & Tactical Dogfight Client
const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const mCtx = minimapCanvas.getContext('2d');

// UI Elements
const startModal = document.getElementById('startModal');
const deathModal = document.getElementById('deathModal');
const nicknameInput = document.getElementById('nicknameInput');
const startBtn = document.getElementById('startBtn');
const respawnBtn = document.getElementById('respawnBtn');

const hudPilotName = document.getElementById('hudPilotName');
const hudLevelBadge = document.getElementById('hudLevelBadge');
const hudAircraftTier = document.getElementById('hudAircraftTier');
const xpBarFill = document.getElementById('xpBarFill');
const currentBiomeIndicator = document.getElementById('currentBiomeIndicator');

const hpFill = document.getElementById('hpFill');
const hpLabel = document.getElementById('hpLabel');
const boostFill = document.getElementById('boostFill');
const boostLabel = document.getElementById('boostLabel');
const secondaryWeaponName = document.getElementById('secondaryWeaponName');
const cannonCooldownFill = document.getElementById('cannonCooldownFill');
const torpedoCooldownFill = document.getElementById('torpedoCooldownFill');
const flightThrottleText = document.getElementById('flightThrottleText');

const leaderboardList = document.getElementById('leaderboardList');
const killFeed = document.getElementById('killFeed');
const deathReason = document.getElementById('deathReason');
const deathLevel = document.getElementById('deathLevel');
const deathScore = document.getElementById('deathScore');
const deathTier = document.getElementById('deathTier');
const promotionBanner = document.getElementById('promotionBanner');
const promoText = document.getElementById('promoText');

const statUpgradePanel = document.getElementById('statUpgradePanel');
const skillPointsIndicator = document.getElementById('skillPointsIndicator');
const skillPointsText = document.getElementById('skillPointsText');

// Game State
let myId = null;
let mapSize = 4000;
let isPlaying = false;
let camera = { x: 2000, y: 2000 };
let mouse = { x: 0, y: 0, worldX: 0, worldY: 0 };
let currentZoom = 1.0;
let targetZoom = 1.0;

// Interpolated Entities & Visual Effects
const shipInterpolationMap = new Map();
let ships = [];
let projectiles = [];
let crates = [];
let particles = [];
let hitMarkers = [];
let landmarks = [];
let clouds = [];
let cloudShadows = [];
let craters = [];
let shockwaves = [];
let knownBombIds = new Set();
let screenShake = 0;

// High-altitude volumetric clouds & ground shadows
for (let i = 0; i < 35; i++) {
  clouds.push({
    x: Math.random() * 4600 - 300,
    y: Math.random() * 4600 - 300,
    radius: 110 + Math.random() * 160,
    opacity: 0.12 + Math.random() * 0.14,
    speedX: 12 + Math.random() * 16
  });
}
for (let i = 0; i < 20; i++) {
  cloudShadows.push({
    x: Math.random() * 4600 - 300,
    y: Math.random() * 4600 - 300,
    radius: 140 + Math.random() * 200,
    opacity: 0.08 + Math.random() * 0.08,
    speedX: 12 + Math.random() * 16
  });
}

// Controls & Inputs
const inputState = {
  targetAngle: 0,
  turretAngle: 0,
  firingCannon: false,
  firingTorpedo: false,
  isBoosting: false,
  isBraking: false,
  keyLeft: false,
  keyRight: false,
  keyUp: false,
  keyDown: false
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Upgrade Stat Function ---
window.upgradeStat = function(statKey) {
  if (!isPlaying) return;
  socket.emit('upgradeStat', statKey);
  window.soundManager.init();
};

// --- Call of Duty Style Killstreak Activation ---
window.activateKillstreak = function(streakKey) {
  if (!isPlaying) return;
  window.soundManager.init();
  socket.emit('activateKillstreak', {
    streakKey,
    targetX: mouse.worldX,
    targetY: mouse.worldY
  });
};

// --- Input Event Handlers (With Dynamic Zoom Compensation) ---
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.worldX = (e.clientX - canvas.width / 2) / currentZoom + camera.x;
  mouse.worldY = (e.clientY - canvas.height / 2) / currentZoom + camera.y;

  const myPlane = shipInterpolationMap.get(myId);
  if (myPlane) {
    const dx = mouse.worldX - myPlane.renderX;
    const dy = mouse.worldY - myPlane.renderY;
    const angle = Math.atan2(dy, dx);
    inputState.targetAngle = angle;
    inputState.turretAngle = angle;
    sendInputs();
  }
});

window.addEventListener('mousedown', (e) => {
  if (!isPlaying) return;
  window.soundManager.init();

  if (e.button === 0) {
    inputState.firingCannon = true;
  } else if (e.button === 2) {
    inputState.firingTorpedo = true;
  }
  sendInputs();
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) {
    if (!autoFire) inputState.firingCannon = false;
  } else if (e.button === 2) {
    inputState.firingTorpedo = false;
  }
  sendInputs();
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  if (!isPlaying) return;
  const key = e.key.toLowerCase();

  // Stat Upgrade Hotkeys [1] - [5]
  if (e.key === '1') upgradeStat('maxHp');
  if (e.key === '2') upgradeStat('speed');
  if (e.key === '3') upgradeStat('cannonDmg');
  if (e.key === '4') upgradeStat('missileCd');
  if (e.key === '5') upgradeStat('regen');

  // Killstreak Hotkeys [6] - [8]
  if (e.key === '6') activateKillstreak('recon');
  if (e.key === '7') activateKillstreak('escort');
  if (e.key === '8') activateKillstreak('flak');

  // Auto-Fire Toggle [C]
  if (key === 'c') {
    toggleAutoFire();
  }

  // Flight Steering (A/D or Arrows)
  if (key === 'a' || e.code === 'ArrowLeft') { inputState.keyLeft = true; sendInputs(); }
  if (key === 'd' || e.code === 'ArrowRight') { inputState.keyRight = true; sendInputs(); }

  // Throttle (W/Shift/Up) and Airbrake (S/Down)
  if (key === 'w' || key === 'shift' || e.code === 'ArrowUp') {
    inputState.keyUp = true;
    inputState.isBoosting = true;
    sendInputs();
  }
  if (key === 's' || e.code === 'ArrowDown') {
    inputState.keyDown = true;
    inputState.isBraking = true;
    sendInputs();
  }

  // Keyboard Cannon Fire (Space or J)
  if (e.code === 'Space' || key === 'j') {
    inputState.firingCannon = true;
    sendInputs();
  }

  // Keyboard Missile Fire (K or E)
  if (key === 'k' || key === 'e') {
    inputState.firingTorpedo = true;
    sendInputs();
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();

  if (key === 'a' || e.code === 'ArrowLeft') { inputState.keyLeft = false; sendInputs(); }
  if (key === 'd' || e.code === 'ArrowRight') { inputState.keyRight = false; sendInputs(); }

  if (key === 'w' || key === 'shift' || e.code === 'ArrowUp') {
    inputState.keyUp = false;
    inputState.isBoosting = false;
    sendInputs();
  }
  if (key === 's' || e.code === 'ArrowDown') {
    inputState.keyDown = false;
    inputState.isBraking = false;
    sendInputs();
  }

  if (e.code === 'Space' || key === 'j') {
    if (!autoFire) inputState.firingCannon = false;
    sendInputs();
  }
  if (key === 'k' || key === 'e') {
    inputState.firingTorpedo = false;
    sendInputs();
  }
});

let selectedTeam = 'ffa';
const RANDOM_CALLSIGNS = [
  'Ace-704', 'SkyFalcon', 'RedBaron', 'GhostRider', 'NightHawk',
  'Viper-9', 'IronWing', 'Thunderbolt', 'Warhawk', 'Tempest',
  'Avenger', 'SkyHunter', 'EagleEye', 'Starling', 'Stormbringer'
];

function generateRandomCallsign() {
  const chosen = RANDOM_CALLSIGNS[Math.floor(Math.random() * RANDOM_CALLSIGNS.length)];
  if (nicknameInput) nicknameInput.value = chosen;
}
window.generateRandomCallsign = generateRandomCallsign;

function selectTeam(team) {
  selectedTeam = team;
  const ffaBtn = document.getElementById('modeBtnFfa');
  const alliesBtn = document.getElementById('modeBtnAllies');
  const axisBtn = document.getElementById('modeBtnAxis');
  if (ffaBtn) ffaBtn.classList.toggle('active', team === 'ffa');
  if (alliesBtn) alliesBtn.classList.toggle('active', team === 'allies');
  if (axisBtn) axisBtn.classList.toggle('active', team === 'axis');
}
window.selectTeam = selectTeam;

let autoFire = false;
function toggleAutoFire() {
  autoFire = !autoFire;
  const btn = document.getElementById('autoFireToggleBtn');
  if (btn) {
    if (autoFire) {
      btn.classList.add('active');
      btn.textContent = '🔥 AUTO-FIRE: ON [C]';
    } else {
      btn.classList.remove('active');
      btn.textContent = '🔥 AUTO-FIRE: OFF [C]';
    }
  }
  inputState.firingCannon = autoFire;
  sendInputs();
}
window.toggleAutoFire = toggleAutoFire;

function sendInputs() {
  if (!isPlaying) return;
  if (autoFire) inputState.firingCannon = true;
  if (inputState.firingCannon) {
    screenShake = Math.max(screenShake, 1.4);
  }
  socket.emit('playerInput', inputState);
}

// --- CrazyGames SDK Entegrasyonu ---
let crazyGamesSDK = null;
if (window.CrazyGames && window.CrazyGames.SDK) {
  window.CrazyGames.SDK.init().then((sdk) => {
    crazyGamesSDK = sdk;
    console.log('🚀 CrazyGames SDK initialized successfully!');
  }).catch((err) => {
    console.log('CrazyGames SDK init info:', err);
  });
}

// --- Start & Respawn ---
function joinGame() {
  const nick = nicknameInput.value.trim() || 'Ace-704';
  window.soundManager.init();
  socket.emit('joinGame', { nickname: nick, team: selectedTeam });
  startModal.classList.add('hidden');
  deathModal.classList.add('hidden');
  isPlaying = true;

  if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
    try { window.CrazyGames.SDK.game.gameplayStart(); } catch(e) {}
  }
}

startBtn.addEventListener('click', joinGame);
respawnBtn.addEventListener('click', joinGame);
nicknameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinGame();
});

const modeFfaBtn = document.getElementById('modeBtnFfa');
const modeAlliesBtn = document.getElementById('modeBtnAllies');
const modeAxisBtn = document.getElementById('modeBtnAxis');
const randomizeNickBtn = document.getElementById('randomizeNickBtn');
if (modeFfaBtn) modeFfaBtn.addEventListener('click', () => selectTeam('ffa'));
if (modeAlliesBtn) modeAlliesBtn.addEventListener('click', () => selectTeam('allies'));
if (modeAxisBtn) modeAxisBtn.addEventListener('click', () => selectTeam('axis'));
if (randomizeNickBtn) randomizeNickBtn.addEventListener('click', () => generateRandomCallsign());

// Auto pre-fill random callsign on load
generateRandomCallsign();

// --- Socket Events ---
socket.on('gameJoined', (data) => {
  myId = data.id;
  mapSize = data.mapSize;
  landmarks = data.landmarks || [];
  camera.x = data.ship.x;
  camera.y = data.ship.y;
});

socket.on('promoted', (data) => {
  window.soundManager.playLevelUp();
  promoText.textContent = `PROMOTED TO TIER ${data.tier}: ${data.tierName.toUpperCase()}!`;
  promotionBanner.classList.remove('hidden');
  setTimeout(() => promotionBanner.classList.add('hidden'), 2800);
});

socket.on('leveledUp', (data) => {
  window.soundManager.playLevelUp();
});

socket.on('playerDied', (data) => {
  isPlaying = false;
  window.soundManager.playExplosion(true);
  deathReason.textContent = `Shot down by ${data.killerName} with ${data.weaponType === 'missile' ? '🚀 Heavy Missile' : '💥 Autocannons'}!`;
  deathLevel.textContent = data.level;
  deathScore.textContent = data.score;
  deathTier.textContent = data.tier;
  deathModal.classList.remove('hidden');

  // Notify CrazyGames gameplay stop & trigger Midgame Ad
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try { window.CrazyGames.SDK.game.gameplayStop(); } catch(e) {}
    try {
      window.CrazyGames.SDK.ad.requestAd('midgame', {
        adStarted: () => {
          if (window.soundManager && window.soundManager.muteAll) window.soundManager.muteAll();
        },
        adFinished: () => {
          if (window.soundManager && window.soundManager.unmuteAll) window.soundManager.unmuteAll();
        },
        adError: (err) => console.log('CrazyGames ad error:', err)
      });
    } catch(e) {}
  }
});

// --- Server Tick Processing with Smooth Interpolation ---
socket.on('tick', (data) => {
  // Update Ship Interpolation Registry
  const currentIds = new Set();
  for (const s of data.ships) {
    currentIds.add(s.id);
    let cached = shipInterpolationMap.get(s.id);
    if (!cached) {
      cached = {
        ...s,
        renderX: s.x,
        renderY: s.y,
        renderAngle: s.angle,
        renderTurretAngle: s.turretAngle || 0,
        targetX: s.x,
        targetY: s.y,
        targetAngle: s.angle,
        targetTurretAngle: s.turretAngle || 0
      };
      shipInterpolationMap.set(s.id, cached);
    } else {
      // Update target state for smooth 60fps lerp
      cached.targetX = s.x;
      cached.targetY = s.y;
      cached.targetAngle = s.angle;
      cached.targetTurretAngle = s.turretAngle !== undefined ? s.turretAngle : cached.renderTurretAngle;

      // Copy volatile properties
      cached.hp = s.hp;
      cached.maxHp = s.maxHp;
      cached.score = s.score;
      cached.level = s.level;
      cached.skillPoints = s.skillPoints;
      cached.statLevels = s.statLevels;
      cached.xp = s.xp;
      cached.prevXp = s.prevXp;
      cached.nextXp = s.nextXp;
      cached.tier = s.tier;
      cached.classKey = s.classKey;
      cached.tierName = s.tierName;
      cached.role = s.role;
      cached.sprite = s.sprite;
      cached.radius = s.radius;
      cached.radarRadius = s.radarRadius;
      cached.lockTargetId = s.lockTargetId;
      cached.isLockedOn = s.isLockedOn;
      cached.lockProgress = s.lockProgress;
      cached.hasDorsalTurret = s.hasDorsalTurret;
      cached.color = s.color;
      cached.boostFuel = s.boostFuel;
      cached.isOverheated = s.isOverheated;
      cached.isBoosting = s.isBoosting;
      cached.isBraking = s.isBraking;
      cached.secondaryType = s.secondaryType;
      cached.secondaryName = s.secondaryName;
      cached.cannonCooldownRatio = s.cannonCooldownRatio;
      cached.secondaryCooldownRatio = s.secondaryCooldownRatio;
      cached.killStreak = s.killStreak || 0;
      cached.reconTimer = s.reconTimer || 0;
      cached.isWingman = s.isWingman;
      cached.escortOwnerId = s.escortOwnerId;
      cached.team = s.team || 'ffa';
      cached.wingmanDuration = s.wingmanDuration || 0;
    }
  }

  // Remove vanished aircraft
  for (const id of shipInterpolationMap.keys()) {
    if (!currentIds.has(id)) {
      shipInterpolationMap.delete(id);
    }
  }
  ships = Array.from(shipInterpolationMap.values());

  // Update Team Scores & Badges
  const myPlane = shipInterpolationMap.get(myId);
  const teamBadge = document.getElementById('hudTeamBadge');
  const teamBanner = document.getElementById('teamScoreBanner');

  if (data.teamScores && (selectedTeam !== 'ffa' || (myPlane && myPlane.team !== 'ffa'))) {
    if (teamBanner) teamBanner.classList.remove('hidden');
    const alliesSpan = document.getElementById('alliesScore');
    const axisSpan = document.getElementById('axisScore');
    if (alliesSpan) alliesSpan.textContent = data.teamScores.allies || 0;
    if (axisSpan) axisSpan.textContent = data.teamScores.axis || 0;
  } else if (teamBanner) {
    teamBanner.classList.add('hidden');
  }

  if (myPlane && myPlane.team && myPlane.team !== 'ffa') {
    if (teamBadge) {
      teamBadge.classList.remove('hidden');
      teamBadge.className = `team-badge ${myPlane.team}`;
      teamBadge.textContent = myPlane.team.toUpperCase();
    }
  } else if (teamBadge) {
    teamBadge.classList.add('hidden');
  }

  // Bomb Audio Whistle Detection
  const activeIds = new Set();
  for (const p of data.projectiles) {
    activeIds.add(p.id);
    if ((p.type === 'bomb' || p.type === 'blockbuster') && !knownBombIds.has(p.id)) {
      knownBombIds.add(p.id);
      const dist = Math.hypot(p.x - camera.x, p.y - camera.y);
      if (dist < 2200) {
        window.soundManager.playBombWhistle();
      }
    }
  }
  for (const id of knownBombIds) {
    if (!activeIds.has(id)) knownBombIds.delete(id);
  }

  projectiles = data.projectiles;
  crates = data.crates;

  // Process Combat Events
  for (const ev of data.events) {
    const distToCam = Math.hypot(ev.x - camera.x, ev.y - camera.y);

    if (ev.type === 'fire') {
      const isSelf = ev.ownerId === myId;
      if (distToCam < 1600) {
        if (ev.projType === 'missile' || ev.projType === 'rocket') {
          window.soundManager.playMissileLaunch(isSelf);
        } else if (ev.projType === 'bomb') {
          window.soundManager.playBombWhistle();
        } else {
          window.soundManager.playCannon(isSelf);
        }
      }
    } else if (ev.type === 'hit') {
      const isHeavy = ev.projType === 'missile' || ev.projType === 'rocket' || ev.projType === 'bomb';
      createExplosion(ev.x, ev.y, isHeavy ? 35 : 12, isHeavy);

      if (isHeavy && distToCam < 1200) {
        screenShake = Math.max(screenShake, 14);
      }

      if (ev.attackerId === myId) {
        window.soundManager.playHitMarker(isHeavy);
        hitMarkers.push({
          x: ev.x,
          y: ev.y,
          size: isHeavy ? 24 : 14,
          life: 0.28,
          isHeavy,
          isCrit: !!ev.isCrit,
          hitZone: ev.hitZone || 'body',
          damage: ev.damage || 0
        });
      }

      if (ev.victimId === myId) {
        window.soundManager.playTakeDamage();
        screenShake = Math.max(screenShake, isHeavy ? 18 : 6);
      }

      if (distToCam < 1500) {
        window.soundManager.playExplosion(isHeavy);
      }
    } else if (ev.type === 'bomb_blast') {
      const isBlockbuster = !!ev.isBlockbuster;
      const radius = ev.radius || (isBlockbuster ? 180 : 95);
      createExplosion(ev.x, ev.y, radius, true);

      // Create ground scorch crater
      craters.push({
        x: ev.x,
        y: ev.y,
        radius: radius * (isBlockbuster ? 1.05 : 0.85),
        alpha: 1.0,
        createdAt: performance.now()
      });

      // Expanding Shockwave ring
      shockwaves.push({
        x: ev.x,
        y: ev.y,
        radius: 14,
        maxRadius: radius * (isBlockbuster ? 1.8 : 1.6),
        alpha: 0.98,
        speed: isBlockbuster ? 520 : 460
      });

      // Camera shake and sub-bass boom
      if (distToCam < 2200) {
        const proximityRatio = Math.max(0, 1 - distToCam / 2200);
        screenShake = Math.max(screenShake, (isBlockbuster ? 45 : 28) * proximityRatio);
        window.soundManager.playExplosion(true);
      }
    } else if (ev.type === 'crash') {
      createCrashExplosion(ev.x, ev.y, ev.tier);
      craters.push({
        x: ev.x,
        y: ev.y,
        radius: 35 + (ev.tier || 1) * 8,
        alpha: 0.85,
        createdAt: performance.now()
      });
      if (distToCam < 1500) {
        screenShake = Math.max(screenShake, 16);
      }
      addKillFeed(ev.killerName, ev.victimName, ev.weaponType);
    }
  }

  // Update Player HUD & Diep.io Stat Bars
  if (myPlane) {
    hudPilotName.textContent = myPlane.name;
    hudLevelBadge.textContent = `LVL ${myPlane.level}`;
    hudAircraftTier.textContent = `${myPlane.tierName} [${myPlane.role || ''}]`;

    // XP Progress
    const xpSpan = myPlane.nextXp - myPlane.prevXp;
    const currentXpInLevel = myPlane.xp - myPlane.prevXp;
    const xpRatio = Math.max(0, Math.min(1, currentXpInLevel / (xpSpan || 1)));
    xpBarFill.style.width = (xpRatio * 100) + '%';

    // Biome Indicator
    currentBiomeIndicator.textContent = getBiomeName(myPlane.renderX, myPlane.renderY);

    // HP Bar
    const hpPct = Math.max(0, (myPlane.hp / myPlane.maxHp) * 100);
    hpFill.style.width = hpPct + '%';
    hpLabel.textContent = `${myPlane.hp} / ${myPlane.maxHp} HP`;
    if (hpPct < 30) hpFill.style.background = '#ff4757';
    else if (hpPct < 60) hpFill.style.background = '#ffa502';
    else hpFill.style.background = '#2ed573';

    // Afterburner Stamina & Overheat Meter
    if (boostFill) {
      const fuel = myPlane.boostFuel !== undefined ? myPlane.boostFuel : 100;
      boostFill.style.width = fuel + '%';
      if (myPlane.isOverheated) {
        boostFill.classList.add('overheated');
        boostLabel.textContent = 'ENGINE OVERHEATED!';
      } else {
        boostFill.classList.remove('overheated');
        boostLabel.textContent = `AFTERBURNER: ${fuel}%`;
      }
    }

    // Weapon Cooldowns & Historical Names
    const cannonReadyPct = Math.max(0, (1 - (myPlane.cannonCooldownRatio || 0)) * 100);
    const secReadyPct = Math.max(0, (1 - (myPlane.secondaryCooldownRatio || 0)) * 100);
    cannonCooldownFill.style.width = cannonReadyPct + '%';
    torpedoCooldownFill.style.width = secReadyPct + '%';
    if (secondaryWeaponName) {
      secondaryWeaponName.textContent = myPlane.secondaryName || 'Secondary';
    }

    // Throttle status
    if (myPlane.isBoosting && !myPlane.isOverheated) {
      flightThrottleText.textContent = 'AFTERBURNER';
      flightThrottleText.style.color = '#ff9f43';
    } else if (myPlane.isBraking) {
      flightThrottleText.textContent = 'AIRBRAKE';
      flightThrottleText.style.color = '#ff4757';
    } else {
      flightThrottleText.textContent = 'CRUISE';
      flightThrottleText.style.color = '#00d2ff';
    }

    // Call of Duty Style Killstreak Status Cards
    const streak = myPlane.killStreak || 0;
    const streakCounter = document.getElementById('streakCounter');
    if (streakCounter) streakCounter.textContent = `${streak} KILL${streak === 1 ? '' : 'S'}`;

    const cardRecon = document.getElementById('streakCard-recon');
    const cardEscort = document.getElementById('streakCard-escort');
    const cardFlak = document.getElementById('streakCard-flak');

    if (cardRecon) {
      const reconName = cardRecon.querySelector('.streak-name');
      if (myPlane.reconTimer > 0) {
        cardRecon.classList.remove('locked');
        cardRecon.classList.add('active-streak');
        if (reconName) reconName.textContent = `UAV (${Math.ceil(myPlane.reconTimer)}s)`;
      } else {
        cardRecon.classList.remove('active-streak');
        if (reconName) reconName.textContent = 'RECON UAV';
        if (streak >= 2) { cardRecon.classList.remove('locked'); cardRecon.classList.add('ready'); }
        else { cardRecon.classList.remove('ready'); cardRecon.classList.add('locked'); }
      }
    }
    if (cardEscort) {
      const escortName = cardEscort.querySelector('.streak-name');
      if (myPlane.wingmanDuration > 0) {
        cardEscort.classList.remove('locked');
        cardEscort.classList.add('active-streak');
        if (escortName) escortName.textContent = `WINGMAN (${Math.ceil(myPlane.wingmanDuration)}s)`;
      } else {
        cardEscort.classList.remove('active-streak');
        if (escortName) escortName.textContent = 'WINGMAN (40s)';
        if (streak >= 3) { cardEscort.classList.remove('locked'); cardEscort.classList.add('ready'); }
        else { cardEscort.classList.remove('ready'); cardEscort.classList.add('locked'); }
      }
    }
    if (cardFlak) {
      if (streak >= 5) { cardFlak.classList.remove('locked'); cardFlak.classList.add('ready'); }
      else { cardFlak.classList.remove('ready'); cardFlak.classList.add('locked'); }
    }

    // Diep.io Stat Bars & Skill Points
    updateStatPanel(myPlane);
  }

  updateLeaderboard(data.leaderboard);
});

socket.on('streakFeedback', (data) => {
  promoText.textContent = data.message;
  promotionBanner.classList.remove('hidden');
  setTimeout(() => promotionBanner.classList.add('hidden'), 2600);
  window.soundManager.playLevelUp();
});

function getBiomeName(x, y) {
  if (x < 2000 && y < 2000) return 'PACIFIC ARCHIPELAGO';
  if (x >= 2000 && y < 2000) return 'ALPINE SNOW PEAKS';
  if (x < 2000 && y >= 2000) return 'BLACK FOREST & AIRBASE';
  return 'RED CANYON DUNES';
}

function updateStatPanel(plane) {
  const points = plane.skillPoints || 0;
  if (points > 0) {
    statUpgradePanel.classList.add('has-points');
    skillPointsIndicator.classList.remove('hidden');
    skillPointsText.textContent = `${points} SKILL POINT${points > 1 ? 'S' : ''} (PRESS 1-5)`;
  } else {
    statUpgradePanel.classList.remove('has-points');
    skillPointsIndicator.classList.add('hidden');
  }

  // Update pips for each stat (7 pips per stat)
  const stats = plane.statLevels || {};
  for (const [key, lvl] of Object.entries(stats)) {
    const container = document.getElementById(`pips-${key}`);
    if (container) {
      const pips = container.querySelectorAll('.pip');
      pips.forEach((pip, index) => {
        if (index < lvl) {
          pip.classList.add('filled');
        } else {
          pip.classList.remove('filled');
        }
      });
    }
  }
}

function addKillFeed(killer, victim, weapon) {
  const item = document.createElement('div');
  item.className = 'kill-entry';
  const icon = weapon === 'missile' ? '🚀' : '💥';
  item.innerHTML = `<strong>${killer}</strong> ${icon} <strong>${victim}</strong>`;
  killFeed.appendChild(item);
  setTimeout(() => item.remove(), 4200);
}

function updateLeaderboard(list) {
  leaderboardList.innerHTML = '';
  list.forEach((entry, idx) => {
    const li = document.createElement('li');
    const myPlane = ships.find(s => s.id === myId);
    if (myPlane && entry.name === myPlane.name) {
      li.className = 'me';
    }
    li.innerHTML = `<span>${idx + 1}. ${entry.name} [L${entry.level}]</span><span>${entry.score}</span>`;
    leaderboardList.appendChild(li);
  });
}

// --- Particles ---
// --- Particles & Explosions ---
function createExplosion(x, y, radius, isHeavy) {
  const count = isHeavy ? 45 : 14;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * (isHeavy ? 280 : 120);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * (isHeavy ? 9 : 4),
      color: Math.random() < 0.55 ? '#ff4757' : (Math.random() < 0.5 ? '#ffa502' : '#ffffff'),
      alpha: 1,
      life: 0.5 + Math.random() * 0.4
    });
  }
  // Black smoke cloud
  if (isHeavy) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 70;
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 14 + Math.random() * 22,
        color: 'rgba(30, 39, 46, 0.7)',
        alpha: 0.7,
        life: 0.9 + Math.random() * 0.7
      });
    }
  }
}

function createCrashExplosion(x, y, tier) {
  for (let i = 0; i < (tier || 1) * 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 240;
    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 16,
      color: Math.random() < 0.5 ? '#ff4757' : '#1e272e',
      alpha: 1,
      life: 0.8 + Math.random() * 0.7
    });
  }
}

// --- 60 FPS Engine Render Loop ---
let lastFrameTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  // 1. Client-Side Smooth Lerp for All Aircraft (Completely eliminates high-speed jitter/sliding!)
  const lerpRate = 1 - Math.exp(-24 * dt);
  for (const s of shipInterpolationMap.values()) {
    s.renderX += (s.targetX - s.renderX) * lerpRate;
    s.renderY += (s.targetY - s.renderY) * lerpRate;

    let diffAngle = s.targetAngle - s.renderAngle;
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
    s.renderAngle += diffAngle * lerpRate;

    let diffTurret = (s.targetTurretAngle || 0) - (s.renderTurretAngle || 0);
    while (diffTurret < -Math.PI) diffTurret += Math.PI * 2;
    while (diffTurret > Math.PI) diffTurret -= Math.PI * 2;
    s.renderTurretAngle = (s.renderTurretAngle || 0) + diffTurret * lerpRate;
  }

  // 2. Rock-Solid Camera Tracking (Smoothly locks to player's interpolated position)
  const myPlane = shipInterpolationMap.get(myId);
  if (myPlane) {
    const camLerp = 1 - Math.exp(-28 * dt);
    camera.x += (myPlane.renderX - camera.x) * camLerp;
    camera.y += (myPlane.renderY - camera.y) * camLerp;

    // Dynamic Camera Zoom by Tier (Wider tactical FOV for advanced aircraft)
    if (myPlane.tier === 1) targetZoom = 1.0;
    else if (myPlane.tier === 2) targetZoom = 0.90;
    else if (myPlane.tier === 3) targetZoom = 0.80;
    else targetZoom = 0.72;
  }

  currentZoom += (targetZoom - currentZoom) * (1 - Math.exp(-6 * dt));

  // 3. Screen Shake calculation
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;
  if (screenShake > 0.05) {
    shakeOffsetX = (Math.random() - 0.5) * screenShake * 2;
    shakeOffsetY = (Math.random() - 0.5) * screenShake * 2;
    screenShake = Math.max(0, screenShake - 35 * dt);
  }

  // 4. Clear Canvas
  ctx.fillStyle = '#061321';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(currentZoom, currentZoom);
  ctx.translate(-camera.x + shakeOffsetX, -camera.y + shakeOffsetY);

  // 5. Render Rich Topography & Biomes
  drawBiomes(now);
  drawWindingRiver(now);
  drawLandmarks(now);

  // 6. Ground Scorch Craters
  drawCraters(dt);

  // 7. Shockwave Rings
  drawShockwaves(dt);

  // 8. Ground Cloud Shadows (Altitude Parallax)
  drawCloudShadows(dt);

  // 9. Map Boundary Fences
  drawMapBorders();

  // 10. Aircraft Ground Shadows (Depth)
  drawPlaneShadows();

  // 11. Wingtip Contrails & Afterburner Exhaust
  for (const plane of ships) {
    const r = plane.radius;
    const wingSpan = r * 1.1;
    const leftWingX = plane.renderX + Math.cos(plane.renderAngle - Math.PI / 2) * wingSpan;
    const leftWingY = plane.renderY + Math.sin(plane.renderAngle - Math.PI / 2) * wingSpan;
    const rightWingX = plane.renderX + Math.cos(plane.renderAngle + Math.PI / 2) * wingSpan;
    const rightWingY = plane.renderY + Math.sin(plane.renderAngle + Math.PI / 2) * wingSpan;

    if (Math.random() < 0.65) {
      particles.push({
        x: leftWingX, y: leftWingY,
        vx: -Math.cos(plane.renderAngle) * 15,
        vy: -Math.sin(plane.renderAngle) * 15,
        size: 2.5 + Math.random() * 2,
        color: 'rgba(255, 255, 255, 0.35)',
        alpha: 0.45,
        life: 0.35
      });
      particles.push({
        x: rightWingX, y: rightWingY,
        vx: -Math.cos(plane.renderAngle) * 15,
        vy: -Math.sin(plane.renderAngle) * 15,
        size: 2.5 + Math.random() * 2,
        color: 'rgba(255, 255, 255, 0.35)',
        alpha: 0.45,
        life: 0.35
      });
    }

    if (plane.isBoosting) {
      const tailX = plane.renderX - Math.cos(plane.renderAngle) * (r * 1.25);
      const tailY = plane.renderY - Math.sin(plane.renderAngle) * (r * 1.25);
      particles.push({
        x: tailX, y: tailY,
        vx: -Math.cos(plane.renderAngle) * 220 + (Math.random() - 0.5) * 50,
        vy: -Math.sin(plane.renderAngle) * 220 + (Math.random() - 0.5) * 50,
        size: 6 + Math.random() * 6,
        color: Math.random() < 0.6 ? '#ff793f' : '#fffa65',
        alpha: 0.9,
        life: 0.22
      });
    }
  }

  // 12. Missile & Bomb Smoke Trails
  for (const p of projectiles) {
    if (p.type === 'rocket' || p.type === 'missile') {
      particles.push({
        x: p.x - Math.cos(p.angle) * 12,
        y: p.y - Math.sin(p.angle) * 12,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        size: 3.5 + Math.random() * 4.5,
        color: Math.random() < 0.4 ? '#ff9f43' : 'rgba(220, 221, 225, 0.75)',
        alpha: 0.8,
        life: 0.6
      });
    } else if (p.type === 'bomb') {
      if (Math.random() < 0.5) {
        particles.push({
          x: p.x - Math.cos(p.angle) * 8,
          y: p.y - Math.sin(p.angle) * 8,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: 2.5 + Math.random() * 3,
          color: 'rgba(200, 200, 200, 0.35)',
          alpha: 0.5,
          life: 0.4
        });
      }
    }
  }

  // 13. Airdrop Crates
  drawCrates(now);

  // 14. Projectiles (With Altitude Bomb Physics)
  drawProjectiles();

  // 15. Aircraft Models
  drawAircraft(now);

  // 16. Combat Particles
  updateAndDrawParticles(dt);

  // 17. High-Altitude Drifting Clouds
  drawHighClouds(dt);

  // 18. Hit Markers
  drawHitMarkers(dt);

  ctx.restore();

  // 19. Radar Minimap
  drawMinimap(myPlane);

  requestAnimationFrame(gameLoop);
}

// --- Rich Multi-Biome Terrain Rendering ---
function drawBiomes(now) {
  const half = mapSize / 2;

  // 1. PACIFIC ARCHIPELAGO (Top-Left: 0,0 -> 2000,2000)
  const oceanGrad = ctx.createRadialGradient(800, 800, 100, 1000, 1000, 1400);
  oceanGrad.addColorStop(0, '#0f4c81');
  oceanGrad.addColorStop(0.6, '#0a3d62');
  oceanGrad.addColorStop(1, '#062842');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, half, half);

  // Animated Ocean Swell Waves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  const waveSpacing = 90;
  for (let y = 50; y < half; y += waveSpacing) {
    ctx.beginPath();
    for (let x = 0; x < half; x += 40) {
      const waveY = y + Math.sin(x * 0.025 + now * 0.0018 + y * 0.01) * 8;
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }

  // 2. ALPINE SNOW PEAKS (Top-Right: 2000,0 -> 4000,2000)
  const snowGrad = ctx.createLinearGradient(half, 0, mapSize, half);
  snowGrad.addColorStop(0, '#d2dae2');
  snowGrad.addColorStop(0.5, '#e8ecef');
  snowGrad.addColorStop(1, '#ced6e0');
  ctx.fillStyle = snowGrad;
  ctx.fillRect(half, 0, half, half);

  // Snow terrain contour lines
  ctx.strokeStyle = 'rgba(164, 176, 190, 0.28)';
  ctx.lineWidth = 1.5;
  for (let y = 60; y < half; y += 110) {
    ctx.beginPath();
    for (let x = half; x < mapSize; x += 50) {
      const contourY = y + Math.cos((x - half) * 0.018) * 14;
      if (x === half) ctx.moveTo(x, contourY);
      else ctx.lineTo(x, contourY);
    }
    ctx.stroke();
  }

  // 3. BLACK FOREST (Bottom-Left: 0,2000 -> 2000,4000)
  ctx.fillStyle = '#183020';
  ctx.fillRect(0, half, half, half);

  // Varied forest vegetation canopy patches
  ctx.fillStyle = '#13281b';
  for (let x = 80; x < half; x += 180) {
    for (let y = half + 80; y < mapSize; y += 180) {
      ctx.beginPath();
      ctx.arc(x, y, 75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. RED CANYON DUNES (Bottom-Right: 2000,2000 -> 4000,4000)
  const desertGrad = ctx.createLinearGradient(half, half, mapSize, mapSize);
  desertGrad.addColorStop(0, '#c0392b');
  desertGrad.addColorStop(0.5, '#d35400');
  desertGrad.addColorStop(1, '#b33939');
  ctx.fillStyle = desertGrad;
  ctx.fillRect(half, half, half, half);

  // Sinuous sand dune ridges
  ctx.strokeStyle = 'rgba(243, 156, 18, 0.25)';
  ctx.lineWidth = 3;
  for (let y = half + 70; y < mapSize; y += 120) {
    ctx.beginPath();
    for (let x = half; x < mapSize; x += 45) {
      const duneY = y + Math.sin((x - half) * 0.014) * 22;
      if (x === half) ctx.moveTo(x, duneY);
      else ctx.lineTo(x, duneY);
    }
    ctx.stroke();
  }

  // Flight Grid Coordinates
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const step = 250;
  for (let x = 0; x <= mapSize; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, mapSize);
    ctx.stroke();
  }
  for (let y = 0; y <= mapSize; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mapSize, y);
    ctx.stroke();
  }
}

// Winding River with Military Bridge in the Forest Biome
function drawWindingRiver(now) {
  ctx.save();
  ctx.strokeStyle = '#0984e3';
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 2600);
  ctx.bezierCurveTo(450, 2750, 750, 2400, 1150, 2650);
  ctx.bezierCurveTo(1550, 2900, 1750, 2700, 2000, 2800);
  ctx.stroke();

  // Water sheen
  ctx.strokeStyle = 'rgba(116, 185, 255, 0.5)';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Military Wooden/Stone Bridge crossing the river at (1150, 2650)
  ctx.save();
  ctx.translate(1150, 2650);
  ctx.rotate(-0.4);
  ctx.fillStyle = '#636e72';
  ctx.fillRect(-22, -36, 44, 72);
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 3;
  ctx.strokeRect(-22, -36, 44, 72);
  // Planks
  ctx.strokeStyle = '#b2bec3';
  ctx.lineWidth = 1.5;
  for (let p = -30; p < 30; p += 8) {
    ctx.beginPath();
    ctx.moveTo(-20, p);
    ctx.lineTo(20, p);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

// Procedural Biome Landmarks
function drawLandmarks(now) {
  for (const lm of landmarks) {
    if (lm.type === 'island') {
      // 1. Turquoise Coral Reef Outer Fringe
      ctx.fillStyle = 'rgba(0, 206, 201, 0.35)';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius + 38, 0, Math.PI * 2);
      ctx.fill();

      // Animated Coastal White Foam Surf
      const surfOffset = Math.sin(now * 0.0035 + lm.x) * 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius + 12 + surfOffset, 0, Math.PI * 2);
      ctx.stroke();

      // Golden Tropical Beach Sand
      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Dense Island Palm Foliage
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1dd1a1';
      ctx.beginPath();
      ctx.arc(lm.x - 6, lm.y - 6, lm.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();

    } else if (lm.type === 'mountain') {
      // Shaded Mountain Ridge
      ctx.fillStyle = '#718093';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius, 0, Math.PI * 2);
      ctx.fill();

      // South-facing dark mountain shadow
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(lm.x + 12, lm.y + 12, lm.radius * 0.85, 0, Math.PI);
      ctx.fill();

      // Pure White Snowcap Peak
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lm.x - 14, lm.y - 14, lm.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

    } else if (lm.type === 'airfield') {
      // Full Military Airbase Complex
      ctx.save();
      ctx.translate(lm.x, lm.y);
      ctx.rotate(lm.angle);

      // Apron & Ground Foundation
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-lm.width / 2 - 40, -lm.height / 2 - 50, lm.width + 80, lm.height + 100);

      // Main Concrete Runway
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(-lm.width / 2, -lm.height / 2, lm.width, lm.height);

      // Runway Threshold White Bars
      ctx.fillStyle = '#ffffff';
      for (let bar = -lm.height / 2 + 10; bar < lm.height / 2 - 10; bar += 14) {
        ctx.fillRect(-lm.width / 2 + 10, bar, 25, 6);
        ctx.fillRect(lm.width / 2 - 35, bar, 25, 6);
      }

      // Runway Numbers ("09" & "27")
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('09', -lm.width / 2 + 55, 6);
      ctx.fillText('27', lm.width / 2 - 55, 6);

      // Centerline Dashes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([24, 18]);
      ctx.beginPath();
      ctx.moveTo(-lm.width / 2 + 75, 0);
      ctx.lineTo(lm.width / 2 - 75, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // Green & Red Threshold Runway Beacons
      const blink = Math.sin(now * 0.005) > 0 ? 1 : 0.4;
      ctx.fillStyle = `rgba(46, 213, 115, ${blink})`;
      ctx.fillRect(-lm.width / 2 - 2, -lm.height / 2 + 2, 6, lm.height - 4);
      ctx.fillStyle = `rgba(255, 71, 87, ${blink})`;
      ctx.fillRect(lm.width / 2 - 4, -lm.height / 2 + 2, 6, lm.height - 4);

      // Aircraft Hangars (Corrugated roofs)
      ctx.fillStyle = '#57606f';
      ctx.fillRect(-120, -lm.height / 2 - 45, 65, 36);
      ctx.fillRect(-30, -lm.height / 2 - 45, 65, 36);
      ctx.fillRect(60, -lm.height / 2 - 45, 65, 36);
      // Hangar shadows
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-120, -lm.height / 2 - 12, 65, 5);
      ctx.fillRect(-30, -lm.height / 2 - 12, 65, 5);
      ctx.fillRect(60, -lm.height / 2 - 12, 65, 5);

      // Anti-aircraft Flak Emplacement Sandbags
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.arc(lm.width / 2 + 25, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(lm.width / 2 + 25, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

    } else if (lm.type === 'forest_grove') {
      // Clustered 3D Pine Tree Grove
      ctx.fillStyle = '#0f2417';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tree tops with highlights
      ctx.fillStyle = '#1e4d30';
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2;
        const dist = lm.radius * 0.55;
        ctx.beginPath();
        ctx.arc(lm.x + Math.cos(ang) * dist, lm.y + Math.sin(ang) * dist, lm.radius * 0.36, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#2ed573';
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2;
        const dist = lm.radius * 0.55;
        ctx.beginPath();
        ctx.arc(lm.x + Math.cos(ang) * dist - 3, lm.y + Math.sin(ang) * dist - 3, lm.radius * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (lm.type === 'canyon_mesa') {
      // Red Rock Canyon Mesa with Strata Lines
      ctx.fillStyle = '#a73a24';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(lm.x - 14, lm.y - 14, lm.radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#78281f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lm.x - 10, lm.y - 10, lm.radius * 0.45, 0, Math.PI * 2);
      ctx.stroke();

    } else if (lm.type === 'oasis') {
      // Desert Oasis
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling Blue Spring Water
      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, lm.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(lm.x - 8, lm.y - 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- Ground Scorch Craters from Bomb & Missile Impacts ---
function drawCraters(dt) {
  for (let i = craters.length - 1; i >= 0; i--) {
    const c = craters[i];
    c.alpha -= dt * 0.015; // Craters remain on terrain for over a minute!
    if (c.alpha <= 0) {
      craters.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = c.alpha;

    // Outer scorched earth fringe
    ctx.fillStyle = '#2c1810';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();

    // Deep black crater center
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();

    // Jagged debris rim
    ctx.strokeStyle = '#4a2511';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

// --- Expanding Shockwave Rings ---
function drawShockwaves(dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += sw.speed * dt;
    sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

    if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
      shockwaves.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = sw.alpha * 0.75;
    ctx.strokeStyle = '#fffa65';
    ctx.lineWidth = Math.max(1, 5 * sw.alpha);
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// --- Cloud Shadows on Ground (Altitude Parallax) ---
function drawCloudShadows(dt) {
  for (const cs of cloudShadows) {
    cs.x += cs.speedX * dt;
    if (cs.x > mapSize + 400) cs.x = -400;

    ctx.fillStyle = `rgba(0, 0, 0, ${cs.opacity})`;
    ctx.beginPath();
    ctx.arc(cs.x, cs.y, cs.radius, 0, Math.PI * 2);
    ctx.arc(cs.x + cs.radius * 0.5, cs.y - cs.radius * 0.2, cs.radius * 0.7, 0, Math.PI * 2);
    ctx.arc(cs.x - cs.radius * 0.5, cs.y - cs.radius * 0.1, cs.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- High-Altitude Drifting Clouds ---
function drawHighClouds(dt) {
  for (const c of clouds) {
    c.x += c.speedX * dt;
    if (c.x > mapSize + 400) c.x = -400;

    ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.arc(c.x + c.radius * 0.5, c.y - c.radius * 0.2, c.radius * 0.7, 0, Math.PI * 2);
    ctx.arc(c.x - c.radius * 0.5, c.y - c.radius * 0.1, c.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMapBorders() {
  ctx.strokeStyle = 'rgba(255, 71, 87, 0.85)';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, mapSize, mapSize);
}

// Preload Authentic WW2 Aircraft Sprites
const ww2Sprites = {};
const spriteList = [
  'plane_i16.png', 'plane_spitfire.png', 'plane_p51.png', 'plane_stuka.png', 'plane_bf110.png',
  'plane_f4u.png', 'plane_he111.png', 'plane_me262.png', 'plane_ho229.png', 'plane_a10.png',
  'plane_b17.png', 'plane_b2.png', 'plane_f22.png', 'plane_tier1.png', 'plane_tier2.png', 'plane_tier3.png',
  'plane_tier4.png', 'plane_zero.png', 'plane_il2.png', 'plane_mig15.png', 'plane_f86.png', 'plane_b29.png'
];
spriteList.forEach(name => {
  const img = new Image();
  img.src = 'assets/' + name;
  ww2Sprites[name] = img;
});

// Evolution Modal
const evolutionModal = document.getElementById('evolutionModal');
const evolutionCardsContainer = document.getElementById('evolutionCardsContainer');

socket.on('evolutionChoices', (choices) => {
  evolutionCardsContainer.innerHTML = '';
  choices.forEach(c => {
    const card = document.createElement('div');
    card.className = 'evolution-card';
    card.innerHTML = `
      <img src="assets/${c.sprite}" class="evolution-card-img" alt="${c.name}">
      <div class="evolution-card-name">${c.name}</div>
      <div class="evolution-card-role">${c.role}</div>
      <button class="evolution-select-btn">SELECT</button>
    `;
    card.onclick = () => {
      socket.emit('chooseEvolution', c.key);
      evolutionModal.classList.add('hidden');
      window.soundManager.playLevelUp();
    };
    evolutionCardsContainer.appendChild(card);
  });
  evolutionModal.classList.remove('hidden');
});

socket.on('evolutionCompleted', (data) => {
  evolutionModal.classList.add('hidden');
  promoText.textContent = `EVOLVED TO: ${data.name.toUpperCase()} (${data.role})!`;
  promotionBanner.classList.remove('hidden');
  setTimeout(() => promotionBanner.classList.add('hidden'), 3200);
});

// Aircraft Ground Shadows
function drawPlaneShadows() {
  ctx.save();
  const shadowOffsetX = 32;
  const shadowOffsetY = 42;
  for (const plane of ships) {
    const spriteName = plane.sprite || 'plane_tier1.png';
    const sprite = ww2Sprites[spriteName] || ww2Sprites['plane_tier1.png'];
    const size = plane.radius * 3.3;

    ctx.save();
    ctx.translate(plane.renderX + shadowOffsetX, plane.renderY + shadowOffsetY);
    ctx.rotate(plane.renderAngle + Math.PI / 2);
    ctx.globalAlpha = 0.28;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      try {
        ctx.filter = 'brightness(0)';
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      } catch (e) {
        ctx.beginPath();
        ctx.ellipse(0, 0, plane.radius * 1.3, plane.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, 0, plane.radius * 1.3, plane.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawCrates(now) {
  for (const c of crates) {
    const bob = Math.sin((now / 500) + c.id) * 3;

    // Parachute
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(c.x, c.y - 14 + bob, 12, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x - 12, c.y - 14 + bob);
    ctx.lineTo(c.x - c.radius, c.y + bob);
    ctx.moveTo(c.x + 12, c.y - 14 + bob);
    ctx.lineTo(c.x + c.radius, c.y + bob);
    ctx.stroke();

    ctx.fillStyle = c.color;
    ctx.fillRect(c.x - c.radius, c.y - c.radius + bob, c.radius * 2, c.radius * 2);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(c.x - c.radius + 2, c.y - c.radius + 2 + bob, c.radius * 2 - 4, c.radius * 2 - 4);
  }
}

// Projectile Rendering with Falling Bomb Altitude Mechanics
function drawProjectiles() {
  for (const p of projectiles) {
    if (p.type === 'blockbuster' || p.isBlockbuster) {
      // 4000lb Blockbuster "Cookie" Bomb Physics
      const maxLife = p.maxLifetime || 1.6;
      const progress = Math.min(1, (p.lifetime || 0) / maxLife);
      const currentScale = 2.2 - progress * 0.9; // 2.2 down to 1.3

      // Heavy Ground shadow
      const shadowDist = (1 - progress) * 55;
      ctx.save();
      ctx.translate(p.x + shadowDist * 0.6, p.y + shadowDist * 0.8);
      ctx.rotate(p.angle);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26 * (0.6 + progress * 0.4), 14 * (0.6 + progress * 0.4), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Falling Giant Cylindrical Blockbuster Bomb
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(currentScale, currentScale);

      // Main heavy cylindrical body (Matte Dark Olive / Steel)
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-22, -12, 44, 24, 6);
      } else {
        ctx.rect(-22, -12, 44, 24);
      }
      ctx.fill();
      ctx.strokeStyle = '#485460';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dual High-Explosive Yellow Hazard Rings
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(8, -12, 4, 24);
      ctx.fillRect(-6, -12, 4, 24);

      // Tail Drum / Fin Ring
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-27, -13, 6, 26);
      ctx.strokeStyle = '#f53b57';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-27, -13, 6, 26);

      // Stenciled text marking "4000-LB"
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#d2dae2';
      ctx.textAlign = 'center';
      ctx.fillText('4000-LB', 0, 2.5);

      ctx.restore();

    } else if (p.type === 'bomb') {
      // 500kg HE Bomb Altitude Physics
      const maxLife = p.maxLifetime || 1.35;
      const progress = Math.min(1, (p.lifetime || 0) / maxLife);

      // Bomb altitude scale: Starts larger (high altitude) and shrinks toward ground
      const currentScale = 1.55 - progress * 0.65; // 1.55 down to 0.9

      // Ground shadow converges onto impact location
      const shadowDist = (1 - progress) * 48;
      ctx.save();
      ctx.translate(p.x + shadowDist * 0.6, p.y + shadowDist * 0.8);
      ctx.rotate(p.angle);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12 * (0.6 + progress * 0.4), 5 * (0.6 + progress * 0.4), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Falling Bomb
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(currentScale, currentScale);

      // Bomb Body (Dark Olive Drab)
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose HE Yellow Warhead Stripe
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(4, -5.5, 3.5, 11);

      // Tail Fin Box
      ctx.fillStyle = '#57606f';
      ctx.fillRect(-15, -6, 5, 12);
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 1;
      ctx.strokeRect(-15, -6, 5, 12);

      ctx.restore();

    } else if (p.type === 'rocket' || p.type === 'missile') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Rocket Fuselage
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(-13, -3, 20, 6);
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(7, 0, 3, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-13, -6, 4, 12);
      ctx.restore();

    } else {
      // WW2 High-Velocity Elongated Tracer Streak
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      const grad = ctx.createLinearGradient(-26, 0, 5, 0);
      grad.addColorStop(0, 'rgba(255, 71, 87, 0)');
      grad.addColorStop(0.35, 'rgba(255, 165, 2, 0.7)');
      grad.addColorStop(0.85, '#fffa65');
      grad.addColorStop(1, '#ffffff');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(-9, 0, 14, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Aircraft Rendering Using Interpolated Positions
function drawAircraft(now) {
  const myPlane = shipInterpolationMap.get(myId);

  for (const plane of ships) {
    ctx.save();
    ctx.translate(plane.renderX, plane.renderY);

    // Pilot Tag & Level Overhead
    const isSelf = plane.id === myId;
    const isTeammate = myPlane && myPlane.team && myPlane.team !== 'ffa' && plane.team === myPlane.team;
    const isEnemy = myPlane && myPlane.team && myPlane.team !== 'ffa' && plane.team !== myPlane.team;

    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';

    let tagColor = '#ffffff';
    let teamTag = '';
    if (isSelf) {
      tagColor = '#f1c40f';
    } else if (plane.isWingman && plane.escortOwnerId === myId) {
      tagColor = '#2ed573';
      teamTag = ' [ALLY WINGMAN]';
    } else if (isTeammate) {
      tagColor = '#00d2ff';
      teamTag = ` [${plane.team.toUpperCase()}]`;
    } else if (isEnemy) {
      tagColor = '#ff6b6b';
      teamTag = ` [${plane.team.toUpperCase()}]`;
    }

    ctx.fillStyle = tagColor;
    ctx.fillText(`${plane.name}${teamTag} [L${plane.level}]`, 0, -plane.radius - 18);

    const barW = plane.radius * 2.2;
    const hpPct = Math.max(0, plane.hp / plane.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-barW / 2, -plane.radius - 14, barW, 4);

    if (isTeammate || (plane.isWingman && plane.escortOwnerId === myId)) {
      ctx.fillStyle = hpPct > 0.4 ? '#00d2ff' : '#0984e3';
    } else if (isSelf) {
      ctx.fillStyle = hpPct > 0.4 ? '#2ed573' : '#ff4757';
    } else {
      ctx.fillStyle = hpPct > 0.4 ? '#ff4757' : '#c0392b';
    }
    ctx.fillRect(-barW / 2, -plane.radius - 14, barW * hpPct, 4);

    // Draw Aircraft Sprite
    const spriteName = plane.sprite || 'plane_tier1.png';
    const sprite = ww2Sprites[spriteName] || ww2Sprites['plane_tier1.png'];
    const size = plane.radius * 3.3;

    ctx.save();
    ctx.rotate(plane.renderAngle + Math.PI / 2);
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = plane.color || '#00d2ff';
      ctx.beginPath();
      ctx.arc(0, 0, plane.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Rotating Defense Turret for Bombers
    if (plane.hasDorsalTurret) {
      ctx.save();
      ctx.rotate(plane.renderTurretAngle || 0);
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(0, 0, plane.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#2f3542';
      ctx.fillRect(plane.radius * 0.15, -2.5, plane.radius * 0.55, 5);
      ctx.restore();
    }

    // Lock-on Reticle on Targeted Enemy
    if (myPlane && myPlane.lockTargetId === plane.id) {
      const isSolid = myPlane.isLockedOn;
      const prog = myPlane.lockProgress || 0;

      window.soundManager.playLockBeep(isSolid);

      ctx.save();
      ctx.rotate((now * 0.003) % (Math.PI * 2));
      const boxSize = plane.radius * (2.4 - prog * 0.6);
      ctx.strokeStyle = isSolid ? '#ff4757' : '#2ed573';
      ctx.lineWidth = isSolid ? 3 : 1.5;

      ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);

      if (isSolid) {
        ctx.fillStyle = '#ff4757';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MISSILE LOCKED', 0, boxSize / 2 + 14);
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

function updateAndDrawParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life);

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawHitMarkers(dt) {
  for (let i = hitMarkers.length - 1; i >= 0; i--) {
    const hm = hitMarkers[i];
    hm.life -= dt;
    if (hm.life <= 0) {
      hitMarkers.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.strokeStyle = hm.isCrit ? '#f1c40f' : (hm.isHeavy ? '#ff4757' : '#ffffff');
    ctx.lineWidth = hm.isCrit ? 3.5 : 2.5;
    const s = hm.size * (hm.isCrit ? 1.3 : 1.0);

    ctx.beginPath();
    ctx.moveTo(hm.x - s, hm.y - s);
    ctx.lineTo(hm.x + s, hm.y + s);
    ctx.moveTo(hm.x + s, hm.y - s);
    ctx.lineTo(hm.x - s, hm.y + s);
    ctx.stroke();

    // Directional combat floating damage text
    if (hm.damage) {
      ctx.font = hm.isCrit ? 'bold 15px sans-serif' : 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = hm.isCrit ? '#f1c40f' : (hm.hitZone === 'nose' ? '#a4b0be' : '#ffffff');
      const textOffset = (0.28 - hm.life) * 45;
      const label = hm.isCrit ? `💥 CRIT! -${hm.damage}` : (hm.hitZone === 'nose' ? `🛡️ -${hm.damage}` : `-${hm.damage}`);
      ctx.fillText(label, hm.x, hm.y - s - 4 - textOffset);
    }
    ctx.restore();
  }
}

function drawMinimap(myPlane) {
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;
  mCtx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const outerR = 98;

  mCtx.save();

  // Circular CRT Mask
  mCtx.beginPath();
  mCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
  mCtx.clip();

  // Phosphor background gradient
  const bgGrad = mCtx.createRadialGradient(cx, cy, 5, cx, cy, outerR);
  bgGrad.addColorStop(0, '#062016');
  bgGrad.addColorStop(0.7, '#02130c');
  bgGrad.addColorStop(1, '#000806');
  mCtx.fillStyle = bgGrad;
  mCtx.fillRect(0, 0, w, h);

  // Subtle CRT horizontal scanlines
  mCtx.fillStyle = 'rgba(46, 213, 115, 0.035)';
  for (let y = 0; y < h; y += 4) {
    mCtx.fillRect(0, y, w, 1.5);
  }

  // Crosshairs & Degree Axis
  mCtx.strokeStyle = 'rgba(46, 213, 115, 0.22)';
  mCtx.lineWidth = 1;

  mCtx.beginPath();
  mCtx.moveTo(cx, cy - outerR);
  mCtx.lineTo(cx, cy + outerR);
  mCtx.moveTo(cx - outerR, cy);
  mCtx.lineTo(cx + outerR, cy);
  mCtx.stroke();

  // Axis distance tick marks
  mCtx.strokeStyle = 'rgba(46, 213, 115, 0.35)';
  mCtx.beginPath();
  for (let r = 15; r < outerR; r += 15) {
    mCtx.moveTo(cx - 3, cy - r); mCtx.lineTo(cx + 3, cy - r);
    mCtx.moveTo(cx - 3, cy + r); mCtx.lineTo(cx + 3, cy + r);
    mCtx.moveTo(cx - r, cy - 3); mCtx.lineTo(cx - r, cy + 3);
    mCtx.moveTo(cx + r, cy - 3); mCtx.lineTo(cx + r, cy + 3);
  }
  mCtx.stroke();

  // Range rings: 30px (~500m), 60px (~1200m), 90px (~2000m or 4200m on UAV)
  const rings = [30, 60, 90];
  mCtx.strokeStyle = 'rgba(46, 213, 115, 0.25)';
  mCtx.lineWidth = 1;
  mCtx.setLineDash([3, 4]);
  for (const r of rings) {
    mCtx.beginPath();
    mCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mCtx.stroke();
  }
  mCtx.setLineDash([]);

  // Range Scale Calculation
  const isUavActive = myPlane && myPlane.reconTimer > 0;
  const maxRadarDist = isUavActive ? 4200 : Math.max(1800, (myPlane ? myPlane.radarRadius || 1000 : 1800) * 1.5);
  const radarScale = 90 / maxRadarDist;

  // Range Ring Labels (small military font)
  mCtx.font = '8px monospace';
  mCtx.fillStyle = 'rgba(46, 213, 115, 0.6)';
  mCtx.textAlign = 'left';
  mCtx.fillText(isUavActive ? '1.4k' : '650m', cx + 4, cy - 32);
  mCtx.fillText(isUavActive ? '2.8k' : '1.3k', cx + 4, cy - 62);
  mCtx.fillText(isUavActive ? '4.2k' : '2.0k', cx + 4, cy - 88);

  const now = performance.now();
  const sweepAngle = (now * 0.003) % (Math.PI * 2);

  // Rotating Phosphor Sweep Sector (Afterglow Trail)
  const trailSlices = 14;
  const sectorSpread = 0.65;
  for (let i = 0; i < trailSlices; i++) {
    const frac = i / trailSlices;
    const a1 = sweepAngle - sectorSpread * (1 - frac);
    const a2 = sweepAngle - sectorSpread * (1 - (i + 1) / trailSlices);
    const alpha = (frac * frac) * 0.22;
    mCtx.fillStyle = `rgba(46, 213, 115, ${alpha.toFixed(3)})`;
    mCtx.beginPath();
    mCtx.moveTo(cx, cy);
    mCtx.arc(cx, cy, outerR, a1, a2);
    mCtx.closePath();
    mCtx.fill();
  }

  // Sweep Leading Beam Line
  mCtx.strokeStyle = 'rgba(120, 255, 180, 0.95)';
  mCtx.lineWidth = 1.5;
  mCtx.shadowColor = '#2ed573';
  mCtx.shadowBlur = 6;
  mCtx.beginPath();
  mCtx.moveTo(cx, cy);
  mCtx.lineTo(cx + Math.cos(sweepAngle) * outerR, cy + Math.sin(sweepAngle) * outerR);
  mCtx.stroke();
  mCtx.shadowBlur = 0;

  if (myPlane) {
    // Air-drop supply crates on tactical scope
    for (const c of crates) {
      const dx = c.x - myPlane.renderX;
      const dy = c.y - myPlane.renderY;
      const dist = Math.hypot(dx, dy);
      if (dist <= maxRadarDist) {
        const bx = cx + dx * radarScale;
        const by = cy + dy * radarScale;
        mCtx.fillStyle = '#f1c40f';
        mCtx.fillRect(bx - 1.5, by - 1.5, 3, 3);
      }
    }

    // Target aircraft blips
    for (const s of ships) {
      if (s.id !== myId) {
        const dx = s.renderX - myPlane.renderX;
        const dy = s.renderY - myPlane.renderY;
        const dist = Math.hypot(dx, dy);

        const isAlliedWingman = (s.isWingman && s.escortOwnerId === myId);
        const isTeammate = (myPlane.team && myPlane.team !== 'ffa' && s.team === myPlane.team);
        const inScope = isUavActive || dist <= maxRadarDist;

        if (inScope) {
          const targetBearing = Math.atan2(dy, dx);
          let angleDiff = (sweepAngle - targetBearing) % (Math.PI * 2);
          if (angleDiff < 0) angleDiff += Math.PI * 2;

          // Phosphor hit glow when beam sweeps over target
          const hitIntensity = Math.max(0, 1 - (angleDiff / 1.5));
          const blipAlpha = 0.55 + hitIntensity * 0.45;

          const clampedDist = Math.min(dist, maxRadarDist * 0.96);
          const bx = cx + Math.cos(targetBearing) * (clampedDist * radarScale);
          const by = cy + Math.sin(targetBearing) * (clampedDist * radarScale);

          mCtx.save();
          if (isAlliedWingman) {
            mCtx.fillStyle = `rgba(46, 213, 115, ${blipAlpha})`;
            mCtx.strokeStyle = '#ffffff';
            mCtx.lineWidth = 1;
            mCtx.beginPath();
            mCtx.arc(bx, by, 3.5, 0, Math.PI * 2);
            mCtx.fill();
            mCtx.stroke();
          } else if (isTeammate) {
            mCtx.fillStyle = `rgba(0, 210, 255, ${blipAlpha})`;
            mCtx.beginPath();
            mCtx.arc(bx, by, 3, 0, Math.PI * 2);
            mCtx.fill();
          } else {
            // Hostile contact: bright red echo blip with heading tick
            mCtx.fillStyle = `rgba(255, 71, 87, ${blipAlpha})`;
            mCtx.shadowColor = '#ff4757';
            mCtx.shadowBlur = hitIntensity > 0.5 ? 8 : 2;
            mCtx.beginPath();
            mCtx.arc(bx, by, 3.2, 0, Math.PI * 2);
            mCtx.fill();

            // Heading indicator line
            const sAngle = s.renderAngle !== undefined ? s.renderAngle : 0;
            mCtx.strokeStyle = `rgba(255, 71, 87, ${blipAlpha * 0.8})`;
            mCtx.lineWidth = 1;
            mCtx.beginPath();
            mCtx.moveTo(bx, by);
            mCtx.lineTo(bx + Math.cos(sAngle) * 6, by + Math.sin(sAngle) * 6);
            mCtx.stroke();
          }
          mCtx.restore();
        }
      }
    }

    // Player craft icon in center of scope
    mCtx.save();
    mCtx.translate(cx, cy);
    mCtx.rotate(myPlane.renderAngle || 0);

    // Subtle forward radar search cone
    mCtx.fillStyle = 'rgba(46, 213, 115, 0.08)';
    mCtx.beginPath();
    mCtx.moveTo(0, 0);
    mCtx.arc(0, 0, 45, -0.4, 0.4);
    mCtx.closePath();
    mCtx.fill();

    // Player plane chevron
    mCtx.fillStyle = '#2ed573';
    mCtx.shadowColor = '#2ed573';
    mCtx.shadowBlur = 8;
    mCtx.beginPath();
    mCtx.moveTo(7, 0);
    mCtx.lineTo(-6, -5);
    mCtx.lineTo(-3, 0);
    mCtx.lineTo(-6, 5);
    mCtx.closePath();
    mCtx.fill();
    mCtx.restore();

    // Radar Header & Status Banner
    mCtx.save();
    if (isUavActive) {
      const flash = (Math.floor(now / 280) % 2 === 0);
      mCtx.fillStyle = flash ? '#2ed573' : '#00d2ff';
      mCtx.font = 'bold 9px monospace';
      mCtx.textAlign = 'center';
      mCtx.fillText(`🛰 UAV SCAN: ${Math.ceil(myPlane.reconTimer)}s`, cx, 18);
    } else {
      mCtx.fillStyle = 'rgba(46, 213, 115, 0.75)';
      mCtx.font = 'bold 8.5px monospace';
      mCtx.textAlign = 'center';
      mCtx.fillText(`TACTICAL RADAR`, cx, 16);
    }

    // Heading readout at bottom
    const hdg = Math.round(((myPlane.renderAngle * 180 / Math.PI + 360) % 360));
    mCtx.fillStyle = 'rgba(46, 213, 115, 0.65)';
    mCtx.font = '8px monospace';
    mCtx.textAlign = 'center';
    mCtx.fillText(`HDG: ${hdg.toString().padStart(3, '0')}°`, cx, h - 12);
    mCtx.restore();
  }

  // Outer CRT Vignette Ring
  const vigGrad = mCtx.createRadialGradient(cx, cy, outerR - 12, cx, cy, outerR);
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  mCtx.fillStyle = vigGrad;
  mCtx.beginPath();
  mCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
  mCtx.fill();

  mCtx.restore();
}

// Start Main Game Loop
requestAnimationFrame(gameLoop);
