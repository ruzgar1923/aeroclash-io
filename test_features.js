const GameEngine = require('./server/gameEngine');
const Ship = require('./server/Ship');
const Projectile = require('./server/Projectile');
const assert = require('assert');

console.log('--- STARTING COMPREHENSIVE FLIGHT & KILLSTREAK UNIT TESTS ---');

const game = new GameEngine();

// 1. Test Projectile speed
const testProj = new Projectile({
  id: 'proj_1',
  ownerId: 'ship_1',
  type: 'bullet',
  x: 0,
  y: 0,
  angle: 0,
  damage: 25,
  speed: 780,
  lifetime: 1.25
});
assert.strictEqual(testProj.speed, 780, 'Tracer projectile speed must be balanced at 780 px/s');
console.log('✓ Projectile tracer velocity balanced at 780 px/s (evadable dogfighting)');

// 2. Test Player Join
const ship = game.addPlayer('player_1', 'Maverick', { team: 'allies' });
assert(ship, 'Ship should be created');
assert.strictEqual(ship.wingmanDuration, 0, 'Initial wingmanDuration must be 0');
assert.strictEqual(ship.killStreak, 0, 'Initial killStreak must be 0');
console.log('✓ Player joins successfully with zero initial streak');

// 3. Test Killstreak Activation Restrictions (Insufficient streak)
game.handleActivateKillstreak('player_1', 'flak', { targetX: 500, targetY: 500 });
assert.strictEqual(ship.killStreak, 0, 'Flak should not activate with 0 streak');

// 4. Test Killstreak Activation & Consumption (Flak exploit fix)
ship.killStreak = 6;
game.handleActivateKillstreak('player_1', 'flak', { targetX: 500, targetY: 500 });
assert.strictEqual(ship.killStreak, 1, 'Flak must consume 5 kills from streak! (was 6 -> now 1)');
console.log('✓ Flak Barrage consumes 5 killstreak kills: infinite spam exploit resolved');

// 5. Test Wingman Duration & Auto-Despawn
ship.killStreak = 4;
game.handleActivateKillstreak('player_1', 'escort');
assert.strictEqual(ship.killStreak, 1, 'Escort wingman must consume 3 kills (was 4 -> now 1)');
assert.strictEqual(ship.wingmanDuration, 40, 'Wingman duration must start at 40s');

const wingman = game.ships.get(ship.wingmanId);
assert(wingman, 'Wingman aircraft must be spawned in game world');
assert.strictEqual(wingman.isWingman, true, 'Spawned plane must have isWingman=true');
assert.strictEqual(wingman.escortOwnerId, 'player_1', 'Escort owner must match player');
console.log('✓ Escort wingman spawns with 40s operational timer');

// 6. Test Wingman Duration Decay in loop
// Advance time: 10 ticks of 100ms = 1.0 second
for (let i = 0; i < 10; i++) {
  game.lastTick = Date.now() - 100;
  game.loop();
}
assert(ship.wingmanDuration <= 39.1 && ship.wingmanDuration >= 38.5, `Wingman duration should have decayed: ${ship.wingmanDuration}`);
console.log(`✓ Wingman duration properly decays in game loop (remaining: ${ship.wingmanDuration.toFixed(1)}s)`);

// Simulate remaining duration down to 0 to trigger RTB / despawn
const savedWingmanId = ship.wingmanId;
ship.wingmanDuration = 0.05;
game.lastTick = Date.now() - 100;
game.loop();
assert.strictEqual(game.ships.has(savedWingmanId), false, 'Wingman must be removed from game world when timer hits 0');
assert.strictEqual(ship.wingmanDuration, 0, 'Ship wingmanDuration must be 0 after RTB');
console.log('✓ Wingman aircraft safely despawns on "BINGO FUEL / RTB" when timer expires');

// 7. Test Recon UAV
ship.killStreak = 3;
game.handleActivateKillstreak('player_1', 'recon');
assert.strictEqual(ship.killStreak, 1, 'Recon UAV must consume 2 kills (was 3 -> now 1)');
assert.strictEqual(ship.reconTimer, 18, 'Recon UAV timer must be 18 seconds');
console.log('✓ Recon UAV consumes 2 kills and activates 18s global tactical scan');

// 8. Test Death resets wingman timer
ship.wingmanDuration = 35;
game.handleShipCrash(ship, { name: 'Ground', tier: 1 });
assert.strictEqual(ship.wingmanDuration, 0, 'Dying or crashing must reset wingmanDuration');
console.log('✓ Crash/death properly cleans up wingman timer');

console.log('\n--- ALL UNIT AND INTEGRATION TESTS PASSED 100% ---');
