// script.js – Lógica Kombat Fofinho
document.addEventListener('DOMContentLoaded', () => {
  // -------------------- PERSONAGENS --------------------
  const CHARACTERS = {
    bonnie: {
      name: 'Bonnie',
      emoji: '🐰',
      hp: 100,
      attack: 14,
      special: 22,
      type: 'melee',
      defense: 4,
    },
    rosse: {
      name: 'Rosse',
      emoji: '🪳',
      hp: 92,
      attack: 10,
      special: 28,
      type: 'ranged',
      defense: 3,
    },
    miau: {
      name: 'MIAU',
      emoji: '🐱',
      hp: 108,
      attack: 16,
      special: 20,
      type: 'melee',
      defense: 5,
    }
  };

  // -------------------- ESTADO --------------------
  let playerChar = 'bonnie';
  let enemyChar = 'rosse'; // máquina escolhe aleatório depois
  let playerHP = 100;
  let enemyHP = 100;
  let playerMaxHP = 100;
  let enemyMaxHP = 100;
  let isPlayerTurn = true;
  let fightActive = false;
  let messageTimeout = null;

  // -------------------- DOM --------------------
  const menuScreen = document.getElementById('menu-screen');
  const selectScreen = document.getElementById('select-screen');
  const fightScreen = document.getElementById('fight-screen');

  const btnPlay = document.getElementById('btn-play');
  const btnBackMenu = document.getElementById('btn-back-menu');
  const btnAttack = document.getElementById('btn-attack');
  const btnSpecial = document.getElementById('btn-special');
  const btnBlock = document.getElementById('btn-block');
  const btnRestart = document.getElementById('btn-restart');

  const playerNameEl = document.getElementById('player-name');
  const enemyNameEl = document.getElementById('enemy-name');
  const playerHealthFill = document.getElementById('player-health');
  const enemyHealthFill = document.getElementById('enemy-health');
  const playerSprite = document.getElementById('player-sprite');
  const enemySprite = document.getElementById('enemy-sprite');
  const fightMsg = document.getElementById('fight-message');
  const playerAttackEffect = document.getElementById('player-attack');
  const enemyAttackEffect = document.getElementById('enemy-attack');

  const selectCards = document.querySelectorAll('.select-card');

  // -------------------- FUNÇÕES AUXILIARES --------------------
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  function setMessage(msg, isGood = true) {
    if (messageTimeout) clearTimeout(messageTimeout);
    fightMsg.textContent = msg;
    fightMsg.style.color = isGood ? '#fdd' : '#f88';
    messageTimeout = setTimeout(() => {
      fightMsg.textContent = '⚔️ LUTE!';
      fightMsg.style.color = '#fdd';
    }, 1800);
  }

  function updateHealthBars() {
    const pPercent = Math.max(0, (playerHP / playerMaxHP) * 100);
    const ePercent = Math.max(0, (enemyHP / enemyMaxHP) * 100);
    playerHealthFill.style.width = pPercent + '%';
    enemyHealthFill.style.width = ePercent + '%';
    if (playerHP <= 0) playerHealthFill.style.background = '#711';
    else playerHealthFill.style.background = 'linear-gradient(90deg, #d22, #f66)';
    if (enemyHP <= 0) enemyHealthFill.style.background = '#711';
    else enemyHealthFill.style.background = 'linear-gradient(90deg, #d22, #f66)';
  }

  // -------------------- INICIAR LUTA --------------------
  function startFight(playerId, enemyId) {
    const p = CHARACTERS[playerId];
    const e = CHARACTERS[enemyId];
    playerChar = playerId;
    enemyChar = enemyId;
    playerHP = p.hp;
    enemyHP = e.hp;
    playerMaxHP = p.hp;
    enemyMaxHP = e.hp;
    playerNameEl.textContent = p.name.toUpperCase();
    enemyNameEl.textContent = e.name.toUpperCase();
    playerSprite.textContent = p.emoji;
    enemySprite.textContent = e.emoji;
    playerAttackEffect.textContent = '';
    enemyAttackEffect.textContent = '';
    updateHealthBars();
    fightActive = true;
    isPlayerTurn = true;
    setMessage('⚔️ LUTE!', true);
    showScreen('fight-screen');
  }

  // -------------------- AÇÕES DE COMBATE --------------------
  function playerAction(action) {
    if (!fightActive || !isPlayerTurn) return;
    if (playerHP <= 0 || enemyHP <= 0) {
      setMessage('A luta acabou!', false);
      return;
    }

    const player = CHARACTERS[playerChar];
    const enemy = CHARACTERS[enemyChar];
    let damage = 0;
    let actionName = '';

    if (action === 'attack') {
      damage = Math.floor(player.attack * (0.85 + Math.random() * 0.3));
      actionName = '👊 SOCA';
      playerAttackEffect.textContent = '💥';
      setTimeout(() => { playerAttackEffect.textContent = ''; }, 250);
    } else if (action === 'special') {
      damage = Math.floor(player.special * (0.9 + Math.random() * 0.25));
      actionName = '🔥 PODER';
      playerAttackEffect.textContent = '✨🔥';
      setTimeout(() => { playerAttackEffect.textContent = ''; }, 300);
    } else if (action === 'block') {
      setMessage('🛡️ Você se defendeu!');
      isPlayerTurn = false;
      setTimeout(() => enemyTurn(), 500);
      return;
    } else return;

    // Aplica dano no inimigo com defesa
    const defenseFactor = 1 - (enemy.defense / 100);
    let finalDamage = Math.floor(damage * defenseFactor);
    if (finalDamage < 1) finalDamage = 1;
    enemyHP = Math.max(0, enemyHP - finalDamage);
    updateHealthBars();
    setMessage(`💢 ${actionName} → -${finalDamage} HP!`);

    // Efeito visual no inimigo
    enemySprite.style.transform = 'scale(0.8)';
    setTimeout(() => { enemySprite.style.transform = 'scale(1)'; }, 180);

    if (enemyHP <= 0) {
      setMessage('🏆 VOCÊ VENCEU! 🎉', true);
      fightActive = false;
      return;
    }

    isPlayerTurn = false;
    setTimeout(() => enemyTurn(), 600);
  }

  // -------------------- TURNO DA MÁQUINA --------------------
  function enemyTurn() {
    if (!fightActive) return;
    if (enemyHP <= 0 || playerHP <= 0) {
      fightActive = false;
      return;
    }

    const player = CHARACTERS[playerChar];
    const enemy = CHARACTERS[enemyChar];
    // IA: ataque normal (75%) ou especial (25%)
    const isSpecial = Math.random() < 0.35;
    let damage = 0;
    let actionName = '';

    if (isSpecial) {
      damage = Math.floor(enemy.special * (0.8 + Math.random() * 0.3));
      actionName = '🔥 PODER';
      enemyAttackEffect.textContent = '🔥💥';
      setTimeout(() => { enemyAttackEffect.textContent = ''; }, 300);
    } else {
      damage = Math.floor(enemy.attack * (0.8 + Math.random() * 0.35));
      actionName = '👊 ATAQUE';
      enemyAttackEffect.textContent = '💥';
      setTimeout(() => { enemyAttackEffect.textContent = ''; }, 250);
    }

    const defenseFactor = 1 - (player.defense / 100);
    let finalDamage = Math.floor(damage * defenseFactor);
    if (finalDamage < 1) finalDamage = 1;
    playerHP = Math.max(0, playerHP - finalDamage);
    updateHealthBars();
    setMessage(`💢 Máquina ${actionName} → -${finalDamage} HP!`, false);

    playerSprite.style.transform = 'scale(0.8)';
    setTimeout(() => { playerSprite.style.transform = 'scale(1)'; }, 180);

    if (playerHP <= 0) {
      setMessage('💀 Você perdeu... Tente de novo.', false);
      fightActive = false;
      return;
    }

    isPlayerTurn = true;
  }

  // -------------------- REINICIAR --------------------
  function restartFight() {
    if (playerChar && enemyChar) {
      startFight(playerChar, enemyChar);
    } else {
      showScreen('menu-screen');
    }
  }

  // -------------------- EVENTOS --------------------
  // Menu -> Seleção
  btnPlay.addEventListener('click', () => {
    showScreen('select-screen');
  });

  // Back
  btnBackMenu.addEventListener('click', () => {
    showScreen('menu-screen');
  });

  // Selecionar personagem (clique no card)
  selectCards.forEach(card => {
    card.addEventListener('click', () => {
      const charId = card.dataset.char;
      if (!charId) return;
      // define personagem do jogador
      playerChar = charId;
      // máquina escolhe aleatório (diferente do jogador se possível)
      const keys = Object.keys(CHARACTERS);
      let enemyId = keys[Math.floor(Math.random() * keys.length)];
      if (enemyId === playerChar && keys.length > 1) {
        const others = keys.filter(k => k !== playerChar);
        enemyId = others[Math.floor(Math.random() * others.length)];
      }
      enemyChar = enemyId;
      // highlight
      selectCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      // inicia luta
      startFight(playerChar, enemyChar);
    });
  });

  // Botoes de luta
  btnAttack.addEventListener('click', () => playerAction('attack'));
  btnSpecial.addEventListener('click', () => playerAction('special'));
  btnBlock.addEventListener('click', () => playerAction('block'));
  btnRestart.addEventListener('click', restartFight);

  // Inicializa menu com preview
  showScreen('menu-screen');
  // pré seleciona Bonnie
  document.querySelector('.char-preview[data-char="bonnie"]')?.classList.add('selected');
});