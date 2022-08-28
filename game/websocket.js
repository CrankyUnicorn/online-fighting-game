loaded = () => {
  console.log('LOADED: ./websocket.js');
}

// * websocket
const ws = new WebSocket(env.SERVER_WS);

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ ...player }));
})

ws.addEventListener('message', ({ data }) => {
  const { playerData, enemyData, matchData } = JSON.parse(data.toString())

  timeDisplay.textContent = matchData.timer;

  // * status from server
  player.key = playerData.key;
  player.controller = playerData.controller;
  player.subscribed = playerData.subscribed;
  player.matchId = playerData.matchId;
  player.enemyId = playerData.enemyId;

  // * passed by the enemy to the player
  player.health = playerData.health;
  player.downForce += playerData.transferedDownForce || 0;
  player.jumpForce += playerData.transferedJumpForce || 0;
  player.horizontalForce += playerData.transferedHorizontalForce || 0;
  player.hit = playerData.hit;

  if (playerData.restartRound) {
    player.position = playerData.position;
    player.restartRound = false;
  }

  if (player.enemyId) {
    // * enemy data
    Object.entries(enemyData).forEach(([dataKey, dataValue]) => {
      target[dataKey] = dataValue;
    })

    const { health, ...rest } = player;
    // * fight
    ws.send(JSON.stringify(rest));

  } else if (player.subscribed) {
    Object.entries(playerData).forEach(([dataKey, dataValue]) => {
      player[dataKey] = dataValue;
    })

    // * setup match and controllers
    ws.send(JSON.stringify({ ...player }));
  }

  player.damageAmount = playerData.damageAmount;
  player.hitPosition = playerData.hitPosition;
  player.hitForce = playerData.hitForce;

})