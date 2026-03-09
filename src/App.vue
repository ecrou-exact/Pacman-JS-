<template>
  <div id="app">
    <h1>Pacman VueJS Edition</h1>
    <GameCanvas />
    <div class="instructions">
      <p>Utilisez les flèches du clavier pour manger les points blancs !</p>
    </div>
  </div>
</template>

<script>
import GameCanvas from "./components/GameCanvas.vue";

export default {
  name: "App",
  components: {
    GameCanvas,
  },
};
</script>

<style>
body {
  margin: 0;
  background: #121212;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: sans-serif;
}
#app {
  text-align: center;
}
h1 {
  color: #ffe700;
  text-shadow: 2px 2px #ff0000;
}
</style>
