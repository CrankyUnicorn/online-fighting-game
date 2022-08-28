// todo: list of issues
/* direction of attacks of right enemy is wrong */
/* direction of mirror sprites is wrong */


document.addEventListener("DOMContentLoaded", () => {

  const loadScripts = (index = 0) => {
    const scriptsSrc = ['env.js', 'util.js', 'input.js', 'draw.js', 'player.js', 'instanciation.js', 'websocket.js'];
    const script = document.createElement('script');

    script.src = scriptsSrc[index];

    script.onload = () => {
      index++;
      if (index < scriptsSrc.length) {
        loadScripts(index);
      }
      loaded();
    };

    document.head.appendChild(script);
  }

  loadScripts()
});

window.addEventListener("load", event => {

  console.log('LOADED: ./index.js');

  setInterval(() => {
    // todo: optimize - background should be a div
    background.update();
    shop.update();

    target.update(player);
    player.update(target);

    // todo: optimize - no state check; pass element to owner
    // UI update
    if (target.enemyId && player.enemyId) {
      if (player.controller === 1) {
        healthBarOne.style.width = `${player.health < 0 ? 0 : player.health}%`;
        healthBarTwo.style.width = `${target.health < 0 ? 0 : target.health}%`;
      } else {
        healthBarOne.style.width = `${target.health < 0 ? 0 : target.health}%`;
        healthBarTwo.style.width = `${player.health < 0 ? 0 : player.health}%`;
      }

    } else {
      healthBarOne.style.width = `${100}%`;
      healthBarTwo.style.width = `${100}%`;
    }
  }, 33)

});
