import express from 'express';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const wsPort = 8082;
const httpPort = 8083;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static('../game'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../game/index.html');
});

app.listen(httpPort, () => {
  console.log(`Express server listenning to port ${httpPort}`);
})

const webSocket = new WebSocketServer({ port: wsPort });

const clients = {};
const matches = {
  1: {
    timer: false,
    controllerLeft: false,
    controllerRight: false,
    round: 1,
    leftVictories: 0,
    rightVictories: 0
  }
};

// * match timer
const createTimer = (matchRef) => {
  const matchId = matchRef;

  const timer = setInterval(() => {
    if (matches[matchId].timer > 0) {
      matches[matchId].timer--;
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

webSocket.on('connection', (ws, req) => {
  ws.id = req.headers['sec-websocket-key'];

  clients[ws.id] = {};

  console.log(`${ws.id} > WebSocket started - connection client: ${ws.id}`);

  ws.on('message', (data) => {
    const dataObject = JSON.parse(data.toString());

    Object.entries(dataObject).forEach(([dataKey, dataValue]) => {
      clients[ws.id][dataKey] = dataValue;
    })

    let sendFlag = false;

    const matchId = clients[ws.id].matchId;
    const enemyId = clients[ws.id].enemyId;

    // * fight - trade messages
    if (enemyId) {
      sendFlag = true;

        if (clients[ws.id].health <= 0
          || clients[enemyId].health <= 0
          || matches[matchId].timer <= 0) {

            matches[matchId].round++;

            if (clients[ws.id].health <= 0 && clients[ws.id].controller === 1) {
              matches[matchId].rightVictories++;
              console.log(`${ws.id} > Right Victory`);
            } else {
              matches[matchId].leftVictories++;
              console.log(`${ws.id} > Left Victory`);
            }

            console.log(`${ws.id} > Round : ${matches[matchId].round} | Left ${matches[matchId].leftVictories} - Right ${matches[matchId].rightVictories}`);

            // todo: clean up match
            clients[ws.id].health = 100;
            clients[enemyId].health = 100;
            matches[matchId].timer = 60;
            clients[ws.id].restartRound = true;
            clients[enemyId].restartRound = true;
            if(clients[ws.id].controller === 1){
              clients[ws.id].position = {x: 50, y: 300 };
              clients[enemyId].position = {x: 800 - 50 -70, y: 300 };
            }else {
              clients[enemyId].position = {x: 50, y: 300 };
              clients[ws.id].position = {x: 800 - 50 -70, y: 300 };
            }

            console.log(`${ws.id} > End Match!`);
        } else {
          // * check for hit and damage
          if (!clients[ws.id].damageAmount.resolved) {
            clients[enemyId].health -= clients[ws.id].damageAmount.amount;
            clients[ws.id].damageAmount.resolved = true;
            clients[ws.id].damageAmount.amount = 0;
          }
          if (!clients[ws.id].hitPosition.resolved) {
            clients[enemyId].hit = {...clients[ws.id].hitPosition};
            clients[ws.id].hitPosition.resolved = true;
            clients[ws.id].hitPosition.posX = false;
            clients[ws.id].hitPosition.posY = false;
          }

          clients[enemyId].transferedDownForce = clients[ws.id].hitForce.downForce;
          clients[enemyId].transferedJumpForce = clients[ws.id].hitForce.jumpForce;
          clients[enemyId].transferedHorizontalForce = clients[ws.id].hitForce.horizontalForce;
          clients[ws.id].hitForce.downForce = 0;
          clients[ws.id].hitForce.jumpForce = 0;
          clients[ws.id].hitForce.horizontalForce = 0;
        }

    } else if (clients[ws.id].subscribed) {
      // * ready - assing controller ans setup positions
      sendFlag = true;

      if (!matchId) {
        // todo: refactor match assignment
        clients[ws.id].matchId = 1;
      } else {

        if (matches[matchId].controllerLeft
          && matches[matchId].controllerRight) {

            if (clients[ws.id].controller === 1) {
              clients[ws.id].enemyId = matches[matchId].controllerRight
            } else if (clients[ws.id].controller === 2) {
              clients[ws.id].enemyId = matches[matchId].controllerLeft
            } else {
              console.log(`${ws.id} > Controller error - player missing controller`);
            }

            if (!matches[matchId].timer) {
              matches[matchId].timer = 60;
              createTimer(matchId);
            }

            console.log(`${ws.id} > Both controllers taken - match ${matchId} set`);

        } else if (!clients[ws.id].controller) {

          if (!matches[matchId].controllerLeft) {
            clients[ws.id].controller = 1;
            clients[ws.id].position.x = 50;
            matches[matchId].controllerLeft = ws.id;
            console.log(`${ws.id} > User "${ws.id}" got controller: 1`);
          } else {
            clients[ws.id].controller = 2;
            clients[ws.id].position.x = 800 - 50 - 20;
            matches[matchId].controllerRight = ws.id;
            console.log(`${ws.id} > User "${ws.id}" got controller: 2`);
          }
        }
      }

    } else if (!clients[ws.id].subscribed) {
      // * starting connection
      sendFlag = true;

      clients[ws.id].subscribed = true;
      clients[ws.id].key = ws.id;

      console.log(`${ws.id} > Subscribed new client`);
    }

    // * set response message
    setTimeout(() => {
      if (sendFlag) {
        try {
          ws.send(JSON.stringify(
            {
              playerData: { ...clients[ws.id] },
              enemyData: { ...clients[enemyId] },
              matchData: { ...matches[1] }
            }));
        } catch (error) {
          console.log(`Sending error: ${error}`);
        }
      }
    }, 60);
  })


  ws.on('close', () => {
    if (clients[ws.id]) {
      delete clients[ws.id];
      console.log(`${ws.id} > Deleted client: ${ws.id}`);
    }

    console.log(`Connection Closed`);
  })
});
