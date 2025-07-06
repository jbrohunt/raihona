// ==================================================================
// ===               START OF COMBINED game.js FILE               ===
// ==================================================================

// === From: utils.js ===
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// === From: config.js ===
const config = {
    MOVE_AMOUNT: 4.5, SPRINT_MULTIPLIER: 1.8, GRAVITY: 0.8, JUMP_STRENGTH: -12,
    GROUND_OFFSET: 30, RAIHONA_DANCE_ANIM_SPEED: 350, WALK_FRAME_DISTANCE: 10,
    MAP_PROXIMITY_THRESHOLD: 70, NUM_CAMELS: 5, MAP_WIDTH_FOR_CAMELS: 700,
    NPC_PROXIMITY_THRESHOLD: 80, MERCHANT_PROXIMITY_THRESHOLD: 100, DANCER_ANIM_SPEED: 400,
    KID_ANIM_SPEED: 300, KID_SPEED: 2.5, MERCHANT_QUOTE_INTERVAL: 10000, MERCHANT_TALK_DURATION: 4000,
    BOBOJON_DISPLAY_TIME: 6000, BOBOJON_ANIM_INTERVAL: 500,
    SPRITES: {
        RAIHONA_IDLE_RIGHT: "images/raihona-idle-right.png", RAIHONA_IDLE_LEFT: "images/raihona-idle-left.png",
        RAIHONA_WALK_LEFT: "images/raihona-walkleft.png", RAIHONA_WALK_RIGHT: "images/raihona-walkright.png",
        RAIHONA_DANCE_1: "images/raihona-dance1.png", RAIHONA_DANCE_2: "images/raihona-dance2.png",
        BOBOJON_IDLE: "images/bobojon.png", BOBOJON_IN_MOTION: "images/bobojon-inmotion.png",
        CAMEL_SILHOUETTE: "images/camel-silhouette.png", CAMEL_FRIEND_INMOTION: "images/camelfriend-inmotion.png",
        DANCER_FRAMES: [
            "images/dancer-leftup-rightdown.png", "images/dancer-bothup.png",
            "images/dancer-rightup-leftdown.png", "images/dancer-bothdown-forward.png"
        ],
        KID_FRAMES: ["images/kid-idle.png", "images/kid-run.png"],
        MERCHANT_IDLE: "images/merchant-idle.png", MERCHANT_TALK: "images/merchant-talk.png",
        ENTER_BUTTON: "images/enter-button.png",
        SHAMAN_IDLE: "images/shaman-idle.png", NOMAD_IDLE: "images/nomad-idle.png",
        MAGIC_CAMEL_IDLE: "images/magic-camel-idle.png", MAGIC_CARPET_CAMEL: "images/magic-carpet-camel.png",
        OBSTACLE_SAND_TORNADO: "images/obstacle-sand-tornado.png"
    },
    SCENE_BACKGROUNDS: {
        map: 'images/silkroad-map.png', samarkand: 'images/samarkand-scene.png',
        kabul: 'images/kabul-scene.png', bukhara: 'images/bukhara-scene.png', yurt: 'images/yurt-scene.png',
    },
    BOBOJON_STORIES: {
        "Nomadic Camp": "These yurts shift like thoughts...", "Bukhara": "Ahh, Bukhara… Where the sand smells of books…",
        "Samarkand": "You see those domes, child? They watched over Ulugh Beg’s observatory…", "Kabul": "This place is older than the mountains…"
    },
    MERCHANT_QUOTES: [
        "That kid thinks someone’s chasing him. No one actually gives a damn.",
        "Whoa—wanna trade those dance moves for some spice?", "The real market’s out here in the streets, you know."
    ],
    DANCER_NEAR_TEXT: "Join me for dancing!",
};
window.config = config;

// === From: player.js ===
const player = {
    x: 82, y: 80, velocityX: 0, velocityY: 0,
    moveState: { up: false, down: false, left: false, right: false },
    lastHorizontalDirection: 'right', lastMapPosition: { x: 82, y: 80 },
    spriteMoved: false, isJumping: false, isFalling: false, canMove: true,
    isSprinting: false, walkDistanceCounter: 0, currentWalkFrame: 0,
    danceState: { isActive: false, frame: 0, intervalId: null, animationSpeed: config.RAIHONA_DANCE_ANIM_SPEED },
    spriteElement: null, activeContainer: null,
    init(spriteElement) { this.spriteElement = spriteElement; if (!this.spriteElement) return; this.updateSpritePosition(); this.spriteElement.src = config.SPRITES.RAIHONA_IDLE_RIGHT; },
    setPosition(x, y) { this.x = x; this.y = y; this.updateSpritePosition(); },
    restoreMapPosition() { this.x = this.lastMapPosition.x; this.y = this.lastMapPosition.y; this.isJumping = false; this.isFalling = false; this.velocityY = 0; this.updateSpritePosition(); this.walkDistanceCounter = 0; this.currentWalkFrame = 0; this.updateSpriteVisuals(sceneManager.currentView, false); },
    saveMapPosition() { this.lastMapPosition.x = this.x; this.lastMapPosition.y = this.y; },
    update(deltaTime, currentView) {
        this.spriteMoved = false; if (!this.spriteElement || !this.activeContainer) return;
        let dx = 0, dy = 0; let actualDistanceMoved = 0;
        if (this.canMove) {
            let speed = config.MOVE_AMOUNT * (this.isSprinting ? config.SPRINT_MULTIPLIER : 1);
            if (currentView === 'map') { if (this.moveState.up) dy -= speed; if (this.moveState.down) dy += speed; }
            if (this.moveState.left) dx -= speed; if (this.moveState.right) dx += speed;
            actualDistanceMoved = Math.abs(dx) + Math.abs(dy);
        }
        if (dx !== 0 || dy !== 0) {
            let newX = this.x + dx; let newY = this.y + dy;
            const cW = this.activeContainer.offsetWidth, cH = this.activeContainer.offsetHeight;
            const sW = this.spriteElement.offsetWidth, sH = this.spriteElement.offsetHeight;
            if (cW > 0 && cH > 0 && sW > 0 && sH > 0) {
                newX = Math.max(0, Math.min(newX, cW - sW));
                if (currentView === 'map') { newY = Math.max(0, Math.min(newY, cH - sH)); }
            } else { newX = this.x; newY = this.y; }
            if (newX !== this.x) { this.x = newX; this.spriteMoved = true; }
            if (currentView === 'map' && newY !== this.y) { this.y = newY; this.spriteMoved = true; }
        }
        if (currentView !== 'map' && !this.danceState.isActive) {
            this.velocityY += config.GRAVITY; let potentialY = this.y + this.velocityY;
            const groundY = this.activeContainer.offsetHeight - this.spriteElement.offsetHeight - config.GROUND_OFFSET;
            if (potentialY >= groundY) { this.y = groundY; this.velocityY = 0; this.isJumping = false; this.isFalling = false; }
            else { this.y = potentialY; this.isFalling = true; }
            this.spriteMoved = true;
        }
        const isActuallyMoving = actualDistanceMoved > 0 && this.canMove;
        if (isActuallyMoving) { this.walkDistanceCounter += actualDistanceMoved; if (this.walkDistanceCounter >= config.WALK_FRAME_DISTANCE) { this.currentWalkFrame = 1 - this.currentWalkFrame; this.walkDistanceCounter = 0; } }
        else { this.walkDistanceCounter = 0; this.currentWalkFrame = 0; }
        this.updateSpritePosition(); this.updateSpriteVisuals(currentView, isActuallyMoving);
    },
    updateSpritePosition() { if (!this.spriteElement) return; this.spriteElement.style.left = this.x + 'px'; this.spriteElement.style.top = this.y + 'px'; },
    updateSpriteVisuals(currentView, isMoving) {
        if (!this.spriteElement || this.danceState.isActive) return;
        let targetSpriteSrc, facingDirection = this.lastHorizontalDirection;
        if (isMoving) { if (this.moveState.left) facingDirection = 'left'; else if (this.moveState.right) facingDirection = 'right'; }
        if (isMoving) { targetSpriteSrc = (this.currentWalkFrame === 1) ? (facingDirection === 'left' ? config.SPRITES.RAIHONA_IDLE_LEFT : config.SPRITES.RAIHONA_IDLE_RIGHT) : (facingDirection === 'left' ? config.SPRITES.RAIHONA_WALK_LEFT : config.SPRITES.RAIHONA_WALK_RIGHT); }
        else { targetSpriteSrc = (facingDirection === 'left') ? config.SPRITES.RAIHONA_IDLE_LEFT : config.SPRITES.RAIHONA_IDLE_RIGHT; }
        if (!targetSpriteSrc) { return; }
        if (!this.spriteElement.src || !this.spriteElement.src.endsWith(targetSpriteSrc.split('/').pop())) { this.spriteElement.src = targetSpriteSrc; }
    },
    handleKeyDown(key, currentView) {
        if (key === 'shift') { this.isSprinting = true; return true; }
        if (this.canMove) {
            switch (key) {
                case "arrowup": case "w": if (currentView === 'map') this.moveState.up = true; else this.jump(); break;
                case "arrowdown": case "s": if (currentView === 'map') this.moveState.down = true; break;
                case "arrowleft": case "a": this.moveState.left = true; this.lastHorizontalDirection = 'left'; break;
                case "arrowright": case "d": this.moveState.right = true; this.lastHorizontalDirection = 'right'; break;
                case " ": if (currentView !== 'map') this.jump(); break;
                default: return false;
            } return true;
        } return false;
    },
    handleKeyUp(key) {
        if (key === 'shift') { this.isSprinting = false; return true; }
        switch (key) {
            case "arrowup": case "w": this.moveState.up = false; break;
            case "arrowdown": case "s": this.moveState.down = false; break;
            case "arrowleft": case "a": this.moveState.left = false; break;
            case "arrowright": case "d": this.moveState.right = false; break;
            default: return false;
        } return true;
    },
    jump() { if (sceneManager.currentView !== 'map' && !this.isJumping && !this.isFalling && this.canMove) { this.velocityY = config.JUMP_STRENGTH; this.isJumping = true; this.isFalling = true; } },
    toggleDancing() {
        this.danceState.isActive = !this.danceState.isActive;
        if (this.danceState.isActive) {
            this.canMove = false; this.velocityY = 0; this.isJumping = false; this.isFalling = false;
            this.moveState = { up: false, down: false, left: false, right: false }; this.isSprinting = false;
            if (this.activeContainer && this.spriteElement && sceneManager.currentView !== 'map') { this.y = this.activeContainer.offsetHeight - this.spriteElement.offsetHeight - config.GROUND_OFFSET; this.updateSpritePosition(); }
            if (this.danceState.intervalId) clearInterval(this.danceState.intervalId);
            this.danceState.intervalId = setInterval(() => { if (!this.spriteElement) return; this.danceState.frame = (this.danceState.frame + 1) % 2; this.spriteElement.src = (this.danceState.frame === 0) ? config.SPRITES.RAIHONA_DANCE_1 : config.SPRITES.RAIHONA_DANCE_2; }, this.danceState.animationSpeed);
            if (this.spriteElement) { this.spriteElement.src = config.SPRITES.RAIHONA_DANCE_1; }
        } else { this.canMove = true; if (this.danceState.intervalId) { clearInterval(this.danceState.intervalId); this.danceState.intervalId = null; } this.updateSpriteVisuals(sceneManager.currentView, false); }
    },
    stopDancing() { if (this.danceState.isActive) { this.toggleDancing(); } }
};
window.player = player;

// === From: npc.js ===
const npcs = {
    bobojon: { state: { isVisible: false, hideTimeoutId: null, animationIntervalId: null }, elements: { container: null, sprite: null, text: null }, init(container, sprite, text) { this.elements.container = container; this.elements.sprite = sprite; this.elements.text = text; }, animate() { if (!this.state.isVisible || !this.elements.sprite) return; try { const currentSrc = this.elements.sprite.src.split('/').pop(); const motionSrc = config.SPRITES.BOBOJON_IN_MOTION.split('/').pop(); if (currentSrc === motionSrc) { this.elements.sprite.src = config.SPRITES.BOBOJON_IDLE; } else { this.elements.sprite.src = config.SPRITES.BOBOJON_IN_MOTION; } } catch (e) { this.stopAnimation(); } }, stopAnimation() { if (this.state.animationIntervalId) { clearInterval(this.state.animationIntervalId); this.state.animationIntervalId = null; if (this.elements.sprite) { this.elements.sprite.src = config.SPRITES.BOBOJON_IDLE; } } }, show(cityName) { if (this.state.isVisible || sceneManager.currentView !== 'map' || !this.elements.container) return; const story = config.BOBOJON_STORIES[cityName]; const displayDuration = story ? config.BOBOJON_DISPLAY_TIME : 200; this.elements.text.textContent = story || "..."; if (this.elements.sprite) this.elements.sprite.src = config.SPRITES.BOBOJON_IDLE; this.elements.container.classList.remove('hidden'); this.state.isVisible = true; if (this.state.hideTimeoutId) clearTimeout(this.state.hideTimeoutId); this.state.hideTimeoutId = setTimeout(() => this.hideVisuals(), displayDuration); this.stopAnimation(); this.state.animationIntervalId = setInterval(() => this.animate(), config.BOBOJON_ANIM_INTERVAL); }, hideVisuals() { if (!this.state.isVisible) return; this.stopAnimation(); this.elements.container.classList.add('hidden'); this.state.isVisible = false; if (this.state.hideTimeoutId) { clearTimeout(this.state.hideTimeoutId); this.state.hideTimeoutId = null; } } },
    dancer: { state: { frame: 0, intervalId: null, position: { x: 150, y: 420 }, isNear: false }, elements: { sprite: null, dialogue: null, dialogueText: null }, init(sprite, dialogue, dialogueText) { this.elements.sprite = sprite; this.elements.dialogue = dialogue; this.elements.dialogueText = dialogueText; if (!sprite || !dialogue || !dialogueText) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.sprite.src = config.SPRITES.DANCER_FRAMES[0]; this.elements.dialogueText.textContent = config.DANCER_NEAR_TEXT; this.elements.dialogue.classList.add('hidden'); }, startAnimation() { if (!this.elements.sprite || this.state.intervalId) return; this.state.intervalId = setInterval(() => { this.state.frame = (this.state.frame + 1) % config.SPRITES.DANCER_FRAMES.length; this.elements.sprite.src = config.SPRITES.DANCER_FRAMES[this.state.frame]; }, config.DANCER_ANIM_SPEED); }, stopAnimation() { if (this.state.intervalId) clearInterval(this.state.intervalId); this.state.intervalId = null; }, updateProximity(playerX, playerY, playerWidth, playerHeight) { if (!this.elements.sprite || !this.elements.dialogue || playerWidth <= 0) return; const dW = this.elements.sprite.offsetWidth; const dH = this.elements.sprite.offsetHeight; const dist = getDistance(playerX + playerWidth / 2, playerY + playerHeight / 2, this.state.position.x + dW / 2, this.state.position.y + dH / 2); this.state.isNear = (dist < config.NPC_PROXIMITY_THRESHOLD); if (this.state.isNear && !player.danceState.isActive) { this.elements.dialogue.style.left = this.state.position.x + (dW / 2) + 'px'; this.elements.dialogue.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.remove('hidden'); } else { this.elements.dialogue.classList.add('hidden'); } }, cleanup() { this.stopAnimation(); this.state.isNear = false; if(this.elements.dialogue) this.elements.dialogue.classList.add('hidden'); } },
    kid: { state: { frame: 0, intervalId: null, position: { x: -60, y: 420 }, speed: config.KID_SPEED }, elements: { sprite: null }, init(sprite) { this.elements.sprite = sprite; if (!sprite) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.sprite.src = config.SPRITES.KID_FRAMES[0]; }, startAnimation() { if (!this.elements.sprite || this.state.intervalId) return; this.state.intervalId = setInterval(() => { this.state.frame = (this.state.frame + 1) % config.SPRITES.KID_FRAMES.length; this.elements.sprite.src = config.SPRITES.KID_FRAMES[this.state.frame]; }, config.KID_ANIM_SPEED); }, stopAnimation() { if (this.state.intervalId) clearInterval(this.state.intervalId); this.state.intervalId = null; }, update(containerWidth) { if (!this.elements.sprite || containerWidth <= 0) return; this.state.position.x += this.state.speed; if (this.state.position.x > containerWidth) { this.state.position.x = -(this.elements.sprite.offsetWidth || 60); } this.elements.sprite.style.left = this.state.position.x + 'px'; }, cleanup() { this.stopAnimation(); } },
    merchant: { state: { intervalId: null, talkTimeoutId: null, position: { x: 550, y: 420 }, isNear: false, isTalking: false, lastQuoteIndex: -1 }, elements: { sprite: null, dialogue: null, dialogueText: null }, init(sprite, dialogue, dialogueText) { this.elements.sprite = sprite; this.elements.dialogue = dialogue; this.elements.dialogueText = dialogueText; if (!sprite || !dialogue || !dialogueText) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.sprite.src = config.SPRITES.MERCHANT_IDLE; this.elements.dialogue.classList.add('hidden'); }, startPeriodicQuotes() { if (!this.elements.sprite || this.state.intervalId) return; this.state.intervalId = setInterval(() => { if (!this.state.isNear && !this.state.isTalking) this.showQuote(); }, config.MERCHANT_QUOTE_INTERVAL); }, stopPeriodicQuotes() { if (this.state.intervalId) clearInterval(this.state.intervalId); this.state.intervalId = null; if (this.state.talkTimeoutId) clearTimeout(this.state.talkTimeoutId); this.state.talkTimeoutId = null; }, showQuote() { if (!this.elements.dialogue || this.state.isTalking) return; const quotes = config.MERCHANT_QUOTES; if (!quotes || quotes.length === 0) return; let quoteIndex; do { quoteIndex = getRandomInt(quotes.length); } while (quotes.length > 1 && quoteIndex === this.state.lastQuoteIndex); this.state.lastQuoteIndex = quoteIndex; this.elements.dialogueText.textContent = quotes[quoteIndex]; const spriteWidth = this.elements.sprite.offsetWidth; this.elements.dialogue.style.left = this.state.position.x + (spriteWidth / 2) + 'px'; this.elements.dialogue.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.remove('hidden'); this.elements.sprite.src = config.SPRITES.MERCHANT_TALK; this.state.isTalking = true; if (this.state.talkTimeoutId) clearTimeout(this.state.talkTimeoutId); this.state.talkTimeoutId = setTimeout(() => this.hideQuote(), config.MERCHANT_TALK_DURATION); }, hideQuote() { if(this.elements.dialogue) this.elements.dialogue.classList.add('hidden'); if(this.elements.sprite && this.state.isTalking) this.elements.sprite.src = config.SPRITES.MERCHANT_IDLE; this.state.isTalking = false; }, updateProximity(playerX, playerY, pW, pH) { if (!this.elements.sprite || !this.elements.dialogue || pW <= 0) return; const mH = this.elements.sprite.offsetHeight; const mW = this.elements.sprite.offsetWidth; const dist = getDistance(playerX + pW / 2, playerY + pH / 2, this.state.position.x + mW / 2, this.state.position.y + mH / 2); const previouslyNear = this.state.isNear; this.state.isNear = (dist < config.MERCHANT_PROXIMITY_THRESHOLD); if (this.state.isNear && !previouslyNear && !this.state.isTalking) this.showQuote(); }, cleanup() { this.stopPeriodicQuotes(); this.state.isNear = false; this.hideQuote(); } },
    shaman: { state: { position: { x: 100, y: 420 }, isNear: false }, elements: { sprite: null, dialogue: null, dialogueText: null }, init(sprite, dialogue, dialogueText) { this.elements.sprite = sprite; this.elements.dialogue = dialogue; this.elements.dialogueText = dialogueText; if (!sprite || !dialogue || !dialogueText) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.add('hidden'); }, updateProximity(playerX, playerY, pW, pH) { if (!this.elements.sprite || !this.elements.dialogue || pW <= 0) return; const dW = this.elements.sprite.offsetWidth; const dH = this.elements.sprite.offsetHeight; const dist = getDistance(playerX + pW / 2, playerY + pH / 2, this.state.position.x + dW / 2, this.state.position.y + dH / 2); this.state.isNear = (dist < config.NPC_PROXIMITY_THRESHOLD); if (this.state.isNear) { this.elements.dialogue.style.left = this.state.position.x + (dW / 2) + 'px'; this.elements.dialogue.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.remove('hidden'); } else { this.elements.dialogue.classList.add('hidden'); } }, cleanup() { this.state.isNear = false; if(this.elements.dialogue) this.elements.dialogue.classList.add('hidden'); } },
    nomad: { state: { position: { x: 600, y: 420 }, isNear: false }, elements: { sprite: null, dialogue: null, dialogueText: null }, init(sprite, dialogue, dialogueText) { this.elements.sprite = sprite; this.elements.dialogue = dialogue; this.elements.dialogueText = dialogueText; if (!sprite || !dialogue || !dialogueText) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.add('hidden'); }, updateProximity(playerX, playerY, pW, pH) { if (!this.elements.sprite || !this.elements.dialogue || pW <= 0) return; const dW = this.elements.sprite.offsetWidth; const dH = this.elements.sprite.offsetHeight; const dist = getDistance(playerX + pW / 2, playerY + pH / 2, this.state.position.x + dW / 2, this.state.position.y + dH / 2); this.state.isNear = (dist < config.NPC_PROXIMITY_THRESHOLD); if (this.state.isNear) { this.elements.dialogue.style.left = this.state.position.x + (dW / 2) + 'px'; this.elements.dialogue.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.remove('hidden'); } else { this.elements.dialogue.classList.add('hidden'); } }, cleanup() { this.state.isNear = false; if(this.elements.dialogue) this.elements.dialogue.classList.add('hidden'); } },
    magicCamel: { state: { position: { x: 350, y: 410 }, isNear: false }, elements: { sprite: null, dialogue: null, dialogueText: null }, init(sprite, dialogue, dialogueText) { this.elements.sprite = sprite; this.elements.dialogue = dialogue; this.elements.dialogueText = dialogueText; if (!sprite || !dialogue || !dialogueText) return; this.elements.sprite.style.left = this.state.position.x + 'px'; this.elements.sprite.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.add('hidden'); }, updateProximity(playerX, playerY, pW, pH) { if (!this.elements.sprite || !this.elements.dialogue || pW <= 0) return; const dW = this.elements.sprite.offsetWidth; const dH = this.elements.sprite.offsetHeight; const dist = getDistance(playerX + pW / 2, playerY + pH / 2, this.state.position.x + dW / 2, this.state.position.y + dH / 2); this.state.isNear = (dist < config.NPC_PROXIMITY_THRESHOLD); if (this.state.isNear) { this.elements.dialogue.style.left = this.state.position.x + (dW / 2) + 'px'; this.elements.dialogue.style.top = this.state.position.y + 'px'; this.elements.dialogue.classList.remove('hidden'); } else { this.elements.dialogue.classList.add('hidden'); } }, cleanup() { this.state.isNear = false; if(this.elements.dialogue) this.elements.dialogue.classList.add('hidden'); } }
};
window.npcs = npcs;

// === From: map.js ===
const mapHandler = { cityData: [], nearbyCity: null, currentInteractionCityName: null, camels: [], enterButtonState: { isVisible: false }, mapContainer: null, cityElements: [], enterCityButton: null, init(mapContainer, cityElements, enterCityButton) { this.mapContainer = mapContainer; this.cityElements = cityElements; this.enterCityButton = enterCityButton; setTimeout(() => this.calculateCityData(), 150); this.initializeCamels(); }, calculateCityData() { if (!this.mapContainer || this.cityElements.length === 0) { setTimeout(() => this.calculateCityData(), 300); return; } const mapRect = this.mapContainer.getBoundingClientRect(); if (mapRect.width === 0) { setTimeout(() => this.calculateCityData(), 300); return; } this.cityData = this.cityElements.map(el => { const cityRect = el.getBoundingClientRect(); const name = el.dataset.cityName; const hasHotspot = el.dataset.hotx && el.dataset.hoty; const centerX = hasHotspot ? parseFloat(el.dataset.hotx) : (cityRect.left - mapRect.left) + (cityRect.width / 2); const centerY = hasHotspot ? parseFloat(el.dataset.hoty) : (cityRect.top - mapRect.top) + (cityRect.height / 2); return { name: name || `Unnamed City (${el.id})`, element: el, x: isNaN(centerX) ? 0 : centerX, y: isNaN(centerY) ? 0 : centerY }; }); }, checkProximity() { if (!player.spriteElement || !this.mapContainer || this.cityData.length === 0) return; let currentNearestCity = null; const spriteWidth = player.spriteElement.offsetWidth; const spriteHeight = player.spriteElement.offsetHeight; if (spriteWidth <= 0) return; const raihonaCenterX = player.x + (spriteWidth / 2); const raihonaCenterY = player.y + (spriteHeight / 2); let minDistanceFound = Infinity; for (const city of this.cityData) { const distance = getDistance(raihonaCenterX, raihonaCenterY, city.x, city.y); if (distance < config.MAP_PROXIMITY_THRESHOLD) { if (distance < minDistanceFound) { minDistanceFound = distance; currentNearestCity = city; } } } this.nearbyCity = currentNearestCity; if (this.nearbyCity) { if (this.nearbyCity.name !== this.currentInteractionCityName) { if (this.currentInteractionCityName) this.endInteractionSequence(); this.currentInteractionCityName = this.nearbyCity.name; this.startInteractionSequence(this.currentInteractionCityName); } } else { if (this.currentInteractionCityName) this.endInteractionSequence(); } }, startInteractionSequence(cityName) { npcs.bobojon.show(cityName); this.showEnterButtonVisuals(); }, endInteractionSequence() { if (!this.currentInteractionCityName) return; npcs.bobojon.hideVisuals(); this.hideEnterButton(); this.currentInteractionCityName = null; this.nearbyCity = null; }, showEnterButtonVisuals() { if (this.enterButtonState.isVisible || sceneManager.currentView !== 'map' || !this.enterCityButton) return; this.enterButtonState.isVisible = true; this.enterCityButton.classList.remove('hidden'); }, hideEnterButton() { if (!this.enterButtonState.isVisible || !this.enterCityButton) return; this.enterButtonState.isVisible = false; this.enterCityButton.classList.add('hidden'); }, initializeCamels() { if (!this.mapContainer) return; this.camels = []; this.mapContainer.querySelectorAll('.camel-sprite').forEach(el => el.remove()); const camelSprites = [config.SPRITES.CAMEL_SILHOUETTE, config.SPRITES.CAMEL_FRIEND_INMOTION]; if (!camelSprites[0] || !camelSprites[1]) return; for (let i = 0; i < config.NUM_CAMELS; i++) { const camelData = this.createCamelData(i, camelSprites); const img = document.createElement('img'); img.src = camelData.spritePath; img.alt = "Camel"; img.classList.add('camel-sprite'); img.style.width = camelData.width + 'px'; img.style.top = camelData.y + 'px'; img.style.left = camelData.x + 'px'; this.mapContainer.appendChild(img); camelData.element = img; this.camels.push(camelData); } }, createCamelData(index, spritePaths) { const baseWidth = 50, wVar = 30, baseY = 300, yVar = 100, baseSpeed = 0.3, sVar = 0.4; const rW = baseWidth + (Math.random() * wVar) - (wVar / 2); const rY = baseY + (Math.random() * yVar) - (yVar / 2); const fS = Math.max(0.1, baseSpeed + (Math.random() * sVar) - (sVar / 2)); const startX = -(rW + (index * (config.MAP_WIDTH_FOR_CAMELS * 1.5 / config.NUM_CAMELS)) + Math.random() * 100); const initialSpriteIndex = Math.floor(Math.random() * spritePaths.length); return { element: null, x: startX, y: rY, width: Math.max(25, rW), speed: fS, spriteIndex: initialSpriteIndex, spritePath: spritePaths[initialSpriteIndex] }; }, updateCamels() { if (!this.mapContainer || this.camels.length === 0) return; const mapWidth = this.mapContainer.offsetWidth; if (mapWidth <= 0) return; this.camels.forEach(camel => { if (!camel.element) return; camel.x += camel.speed; const camelWidth = camel.element.offsetWidth || camel.width; if (camel.x > mapWidth) { camel.x = -camelWidth - Math.random() * 100; } camel.element.style.left = camel.x + 'px'; }); } };
window.mapHandler = mapHandler;

// === From: samarkandScene.js ===
const samarkandScene = { isInitialized: false, danceMusicAudio: null, initialize() { if (this.isInitialized) return; console.log("Initializing Samarkand Scene..."); try { this.danceMusicAudio = new Audio('audio/samarkand-music.mp3'); this.danceMusicAudio.loop = true; this.danceMusicAudio.volume = 0.6; this.danceMusicAudio.preload = 'auto'; } catch (error) { console.error("Error creating dance music Audio object:", error); this.danceMusicAudio = null; } const dancerSprite = mainGame.elements.dancerSprite; const dancerDialogue = mainGame.elements.dancerDialogue; const dancerDialogueText = dancerDialogue?.querySelector('p'); const kidSprite = mainGame.elements.kidSprite; const merchantSprite = mainGame.elements.merchantSprite; const merchantDialogue = mainGame.elements.merchantDialogue; const merchantDialogueText = merchantDialogue?.querySelector('p'); npcs.dancer.init(dancerSprite, dancerDialogue, dancerDialogueText); npcs.kid.init(kidSprite); npcs.merchant.init(merchantSprite, merchantDialogue, merchantDialogueText); npcs.dancer.startAnimation(); npcs.kid.startAnimation(); npcs.merchant.startPeriodicQuotes(); this.isInitialized = true; console.log("Samarkand Scene Initialized."); }, playDanceMusic() { if (this.danceMusicAudio && this.danceMusicAudio.paused) { const playPromise = this.danceMusicAudio.play(); if (playPromise !== undefined) { playPromise.catch(error => { console.error("Audio play prevented:", error); }); } } }, stopDanceMusic() { if (this.danceMusicAudio && !this.danceMusicAudio.paused) { this.danceMusicAudio.pause(); this.danceMusicAudio.currentTime = 0; } }, update() { if (!this.isInitialized) return; const containerWidth = sceneManager.activeContainer?.offsetWidth; if (containerWidth > 0) { npcs.kid.update(containerWidth); } const p = player; const pWidth = p.spriteElement?.offsetWidth || 0; const pHeight = p.spriteElement?.offsetHeight || 0; if (pWidth > 0 && pHeight > 0) { npcs.dancer.updateProximity(p.x, p.y, pWidth, pHeight); npcs.merchant.updateProximity(p.x, p.y, pWidth, pHeight); } }, handleInteractionKey() { if (!this.isInitialized) return; if (npcs.dancer.state.isNear) { player.toggleDancing(); if (player.danceState.isActive) { this.playDanceMusic(); } else { this.stopDanceMusic(); } } }, cleanup() { if (!this.isInitialized) return; console.log("Cleaning up Samarkand Scene..."); this.stopDanceMusic(); npcs.dancer.cleanup(); npcs.kid.cleanup(); npcs.merchant.cleanup(); this.isInitialized = false; } };
window.samarkandScene = samarkandScene;

// === From: bukharaScene.js ===
const bukharaScene = {
    isInitialized: false,
    initialize() {
        if (this.isInitialized) return;
        console.log("Initializing Bukhara Scene...");
        const shamanSprite = mainGame.elements.shamanSprite;
        const shamanDialogue = mainGame.elements.shamanDialogue;
        const shamanDialogueText = shamanDialogue?.querySelector('p');
        const nomadSprite = mainGame.elements.nomadSprite;
        const nomadDialogue = mainGame.elements.nomadDialogue;
        const nomadDialogueText = nomadDialogue?.querySelector('p');
        const magicCamelSprite = mainGame.elements.magicCamelSprite;
        const magicCamelDialogue = mainGame.elements.magicCamelDialogue;
        const magicCamelDialogueText = magicCamelDialogue?.querySelector('p');

        npcs.shaman.init(shamanSprite, shamanDialogue, shamanDialogueText);
        npcs.nomad.init(nomadSprite, nomadDialogue, nomadDialogueText);
        npcs.magicCamel.init(magicCamelSprite, magicCamelDialogue, magicCamelDialogueText);

        if(npcs.shaman.elements.dialogueText) npcs.shaman.elements.dialogueText.textContent = "The spirits of the desert are restless...";
        if(npcs.nomad.elements.dialogueText) npcs.nomad.elements.dialogueText.textContent = "The winds are changing. Soon, we move.";
        if(npcs.magicCamel.elements.dialogueText) npcs.magicCamel.elements.dialogueText.textContent = "Care for a ride on the wild side? (Press E)";

        this.isInitialized = true;
    },
    update() {
        if (!this.isInitialized) return;
        const p = player;
        const pWidth = p.spriteElement?.offsetWidth || 0;
        const pHeight = p.spriteElement?.offsetHeight || 0;
        if (pWidth > 0 && pHeight > 0) {
            npcs.shaman.updateProximity(p.x, p.y, pWidth, pHeight);
            npcs.nomad.updateProximity(p.x, p.y, pWidth, pHeight);
            npcs.magicCamel.updateProximity(p.x, p.y, pWidth, pHeight);
        }
    },
    handleInteractionKey() {
        if (!this.isInitialized) return;
        if (npcs.magicCamel.state.isNear) {
          flappyCamel.start();
        }
    },
    cleanup() {
        if (!this.isInitialized) return;
        console.log("Cleaning up Bukhara Scene...");
        npcs.shaman.cleanup();
        npcs.nomad.cleanup();
        npcs.magicCamel.cleanup();
        this.isInitialized = false;
    }
};
window.bukharaScene = bukharaScene;

// === From: flappyCamel.js ===
const flappyCamel = {
    state: { isActive: false, score: 0, camelY: 200, velocityY: 0, frameCounter: 0 },
    config: { GRAVITY: 0.3, FLAP_STRENGTH: -7, OBSTACLE_SPEED: 3, OBSTACLE_SPAWN_RATE: 150, GAP_HEIGHT: 150 },
    elements: {}, obstacles: [],
    init() {
        this.elements.container = document.getElementById('flappy-camel-container');
        this.elements.player = document.getElementById('flappy-camel-player');
        this.elements.scoreDisplay = document.getElementById('flappy-score');
        document.addEventListener('keydown', (e) => {
            if (this.state.isActive && (e.key === ' ' || e.key === 'ArrowUp')) {
                e.preventDefault();
                this.state.velocityY = this.config.FLAP_STRENGTH;
            }
        });
    },
    start() {
        if (this.state.isActive) return;
        this.state = { ...this.state, isActive: true, score: 0, camelY: 200, velocityY: 0, frameCounter: 0 };
        this.obstacles.forEach(obs => obs.element.remove());
        this.obstacles = [];
        this.elements.container.classList.remove('hidden');
        player.canMove = false;
        this.gameLoop();
    },
    gameLoop() {
        if (!this.state.isActive) return;
        this.state.frameCounter++;
        this.state.velocityY += this.config.GRAVITY;
        this.state.camelY += this.state.velocityY;
        this.elements.player.style.top = this.state.camelY + 'px';

        if (this.state.frameCounter >= this.config.OBSTACLE_SPAWN_RATE) {
            this.state.frameCounter = 0;
            this.spawnObstaclePair();
        }
        this.moveAndCheckObstacles();

        if (this.state.camelY > 500 || this.state.camelY < -50) { // Hit top/bottom
            this.stop();
            return;
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    spawnObstaclePair() {
        const containerHeight = 500;
        const gapPosition = Math.random() * (containerHeight - this.config.GAP_HEIGHT - 100) + 50;
        const topHeight = gapPosition;
        const bottomHeight = containerHeight - (gapPosition + this.config.GAP_HEIGHT);

        const topObstacle = document.createElement('div');
        topObstacle.className = 'flappy-obstacle';
        topObstacle.style.height = topHeight + 'px';
        topObstacle.style.top = '0px';
        topObstacle.style.left = '700px';

        const bottomObstacle = document.createElement('div');
        bottomObstacle.className = 'flappy-obstacle';
        bottomObstacle.style.height = bottomHeight + 'px';
        bottomObstacle.style.bottom = '0px';
        bottomObstacle.style.left = '700px';

        this.elements.container.appendChild(topObstacle);
        this.elements.container.appendChild(bottomObstacle);
        this.obstacles.push({ element: topObstacle, x: 700 }, { element: bottomObstacle, x: 700 });
    },
    moveAndCheckObstacles() {
        const playerRect = this.elements.player.getBoundingClientRect();
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.config.OBSTACLE_SPEED;
            obs.element.style.left = obs.x + 'px';
            const obsRect = obs.element.getBoundingClientRect();
            if (playerRect.right > obsRect.left && playerRect.left < obsRect.right && playerRect.bottom > obsRect.top && playerRect.top < obsRect.bottom) {
                this.stop();
                return;
            }
            if (obs.x < -60) {
                obs.element.remove();
                this.obstacles.splice(i, 1);
            }
        }
    },
    stop() {
        this.state.isActive = false;
        alert("Game Over! Your score: " + this.state.score); // Simple game over
        this.elements.container.classList.add('hidden');
        player.canMove = true;
    }
};
window.flappyCamel = flappyCamel;

// === From: sceneManager.js ===
const sceneManager = { currentView: 'map', activeContainer: null, viewWrapper: null, mapContainer: null, sceneContainers: {}, playerSprite: null, uiElements: {}, init(viewWrapper, mapContainer, sceneContainers, playerSprite, uiElements) { this.viewWrapper = viewWrapper; this.mapContainer = mapContainer; this.sceneContainers = sceneContainers; this.playerSprite = playerSprite; this.uiElements = uiElements; if (!viewWrapper || !mapContainer || !playerSprite) return; this.activeContainer = this.mapContainer; player.activeContainer = this.activeContainer; for (const key in this.sceneContainers) { if (this.sceneContainers[key]) this.sceneContainers[key].classList.add('hidden'); } this.uiElements.exitPrompt.classList.add('hidden'); this.mapContainer.classList.remove('hidden'); if (this.playerSprite.parentNode) this.playerSprite.parentNode.removeChild(this.playerSprite); this.mapContainer.appendChild(this.playerSprite); }, enterCity(cityName) { if (!cityName || this.currentView !== 'map') return; let targetSceneKey = null; switch (cityName) { case "Samarkand": targetSceneKey = 'samarkand'; break; case "Kabul": targetSceneKey = 'kabul'; break; case "Bukhara": targetSceneKey = 'bukhara'; break; case "Nomadic Camp": targetSceneKey = 'yurt'; break; default: return; } const targetSceneContainer = this.sceneContainers[targetSceneKey]; if (!targetSceneContainer) return; mapHandler.endInteractionSequence(); player.saveMapPosition(); this.currentView = targetSceneKey; this.activeContainer = targetSceneContainer; player.activeContainer = this.activeContainer; this.mapContainer.classList.add('hidden'); targetSceneContainer.classList.remove('hidden'); this.uiElements.exitPrompt?.classList.remove('hidden'); if (this.playerSprite.parentNode) this.playerSprite.parentNode.removeChild(this.playerSprite); targetSceneContainer.appendChild(this.playerSprite); player.isJumping = false; player.isFalling = true; player.velocityY = 0; player.canMove = true; player.moveState = { up: false, down: false, left: false, right: false }; setTimeout(() => { const spriteWidth = this.playerSprite.offsetWidth || 60; const spriteHeight = this.playerSprite.offsetHeight || 80; const containerWidth = this.activeContainer.offsetWidth || 700; const containerHeight = this.activeContainer.offsetHeight || 500; const startX = containerWidth / 2 - spriteWidth / 2; const startY = containerHeight - spriteHeight - config.GROUND_OFFSET; player.setPosition(startX, startY); player.isFalling = true; }, 50); if(this.uiElements.cityDescriptionText) this.uiElements.cityDescriptionText.textContent = `You have entered ${cityName}. Explore the area!`; if (this.uiElements.currentLocationDisplay) this.uiElements.currentLocationDisplay.textContent = `Current Location: ${cityName}`; mainGame.updateCoordsDisplay(); switch (targetSceneKey) { case 'samarkand': samarkandScene.initialize(); break; case 'bukhara': bukharaScene.initialize(); break; } }, exitScene() { if (this.currentView === 'map') return; const exitedSceneKey = this.currentView; const exitedSceneContainer = this.activeContainer; player.stopDancing(); switch (exitedSceneKey) { case 'samarkand': samarkandScene.cleanup(); break; case 'bukhara': bukharaScene.cleanup(); break; } this.currentView = 'map'; this.activeContainer = this.mapContainer; player.activeContainer = this.activeContainer; if (exitedSceneContainer) exitedSceneContainer.classList.add('hidden'); this.mapContainer.classList.remove('hidden'); this.uiElements.exitPrompt?.classList.add('hidden'); if (this.playerSprite.parentNode) this.playerSprite.parentNode.removeChild(this.playerSprite); this.mapContainer.appendChild(this.playerSprite); player.restoreMapPosition(); player.canMove = true; player.moveState = { up: false, down: false, left: false, right: false }; if(this.uiElements.cityDescriptionText) this.uiElements.cityDescriptionText.textContent = `You have returned to the Silk Road map.`; if (this.uiElements.currentLocationDisplay) this.uiElements.currentLocationDisplay.textContent = `On the Road`; mainGame.updateCoordsDisplay(); setTimeout(() => { mapHandler.checkProximity(); }, 100); } };
window.sceneManager = sceneManager;

// === From: main.js ===
const mainGame = {
    elements: {}, lastTimestamp: 0,
    initialize() {
        if (!this.fetchElements()) { document.body.innerHTML = '<p style="color:red;">Error: Game could not start. Check console (F12).</p>'; return; }
        player.init(this.elements.raihonaSprite);
        npcs.bobojon.init(this.elements.bobojonContainer, this.elements.bobojonSprite, this.elements.bobojonText);
        mapHandler.init(this.elements.mapContainer, this.elements.cityMarkers, this.elements.enterCityButton);
        flappyCamel.init();
        const sceneContainersMap = { samarkand: this.elements.samarkandSceneContainer, kabul: this.elements.kabulSceneContainer, bukhara: this.elements.bukharaSceneContainer, yurt: this.elements.yurtSceneContainer };
        const sharedUiElements = { exitPrompt: this.elements.exitPrompt, cityDescriptionText: this.elements.cityDescriptionText, currentLocationDisplay: this.elements.currentLocationDisplay };
        sceneManager.init(this.elements.viewWrapper, this.elements.mapContainer, sceneContainersMap, this.elements.raihonaSprite, sharedUiElements);
        if(this.elements.cityDescriptionText) this.elements.cityDescriptionText.textContent = 'Welcome, traveler. Begin your journey on the Silk Road.';
        if(this.elements.currentLocationDisplay) this.elements.currentLocationDisplay.textContent = 'On the Road';
        this.updateCoordsDisplay();
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        if (this.elements.enterCityButton) this.elements.enterCityButton.addEventListener('click', this.handleEnterCityClick.bind(this));
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    fetchElements() {
        let success = true;
        const getElement = (id, isCritical = true) => { const el = document.getElementById(id); if (!el && isCritical) { console.error(`Error: Critical element "${id}" not found!`); success = false; } return el; };
        this.elements.raihonaSprite = getElement('raihona-sprite'); this.elements.mapContainer = getElement('map-container'); this.elements.viewWrapper = getElement('view-wrapper');
        this.elements.samarkandSceneContainer = getElement('samarkand-scene-container'); this.elements.bukharaSceneContainer = getElement('bukhara-scene-container');
        this.elements.kabulSceneContainer = getElement('kabul-scene-container', false); this.elements.yurtSceneContainer = getElement('yurt-scene-container', false);
        this.elements.enterCityButton = getElement('enter-city-button'); this.elements.exitPrompt = getElement('exit-prompt');
        this.elements.coordsDisplay = getElement('coords'); this.elements.currentLocationDisplay = getElement('current-location-display');
        const cityDescDiv = getElement('city-description'); this.elements.cityDescriptionText = cityDescDiv?.querySelector('p');
        this.elements.cityMarkers = Array.from(this.elements.mapContainer?.querySelectorAll('.city') || []);
        this.elements.bobojonContainer = getElement('bobojon-container'); this.elements.bobojonSprite = getElement('bobojon-sprite'); this.elements.bobojonText = getElement('bobojon-speech-bubble')?.querySelector('p');
        this.elements.dancerSprite = getElement('character-dancer', false); this.elements.dancerDialogue = getElement('dancer-dialogue', false);
        this.elements.kidSprite = getElement('character-kid', false);
        this.elements.merchantSprite = getElement('character-merchant', false); this.elements.merchantDialogue = getElement('merchant-dialogue', false);
        this.elements.shamanSprite = getElement('character-shaman', false); this.elements.shamanDialogue = getElement('shaman-dialogue', false);
        this.elements.nomadSprite = getElement('character-nomad', false); this.elements.nomadDialogue = getElement('nomad-dialogue', false);
        this.elements.magicCamelSprite = getElement('character-magic-camel', false); this.elements.magicCamelDialogue = getElement('magic-camel-dialogue', false);
        return success;
    },
    handleKeyDown(event) {
        if (flappyCamel.state.isActive) return;
        const key = event.key.toLowerCase();
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "e", "escape", "shift"].includes(key)) event.preventDefault();
        if (key === "escape") { sceneManager.exitScene(); return; }
        if (key === "e") {
            if (sceneManager.currentView === 'samarkand') { samarkandScene.handleInteractionKey(); return; }
            if (sceneManager.currentView === 'bukhara') { bukharaScene.handleInteractionKey(); return; }
        }
        player.handleKeyDown(key, sceneManager.currentView);
    },
    handleKeyUp(event) { if (flappyCamel.state.isActive) return; player.handleKeyUp(event.key.toLowerCase()); },
    handleEnterCityClick() { if (mapHandler.currentInteractionCityName) sceneManager.enterCity(mapHandler.currentInteractionCityName); },
    gameLoop(timestamp) {
        if (flappyCamel.state.isActive) return; // PAUSE main game
        this.lastTimestamp = timestamp;
        player.update(0, sceneManager.currentView);
        if (sceneManager.currentView === 'map') {
            mapHandler.updateCamels();
            if (player.spriteMoved) mapHandler.checkProximity();
        }
        else if (sceneManager.currentView === 'samarkand') samarkandScene.update();
        else if (sceneManager.currentView === 'bukhara') bukharaScene.update();
        this.updateCoordsDisplay();
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    updateCoordsDisplay() {
        if (this.elements.coordsDisplay) {
            let viewDisplayName = sceneManager.currentView;
            if (viewDisplayName === 'yurt') viewDisplayName = 'Nomadic Camp'; else viewDisplayName = viewDisplayName.charAt(0).toUpperCase() + viewDisplayName.slice(1);
            this.elements.coordsDisplay.textContent = `${viewDisplayName}: (${Math.round(player.x)}, ${Math.round(player.y)})`;
        }
    }
};
document.addEventListener('DOMContentLoaded', () => { window.mainGame = mainGame; mainGame.initialize(); });