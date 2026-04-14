const mineflayer = require("mineflayer");
const express = require("express");

const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Keep alive server running")
);

let bot = null;
let isConnecting = false;

let intervals = [];

function clearIntervals() {
  intervals.forEach(clearInterval);
  intervals = [];
}

function startBot() {
  if (bot || isConnecting) return;

  isConnecting = true;

  bot = mineflayer.createBot({
    host: "OGOverflow.aternos.me:52600",
    port: 52600,
    username: "UltraAFK_bot2011",
  });

  bot.once("spawn", () => {
    console.log("🤖 Bot joined server!");
    isConnecting = false;
    startAFK();
  });

  bot.on("end", () => {
    console.log("🔁 Bot disconnected");

    clearIntervals();
    bot = null;
    isConnecting = false;

    setTimeout(startBot, 15000);
  });

  bot.on("kicked", (reason) => {
    console.log("❌ Kicked:", reason?.toString?.() || reason);
  });

  bot.on("error", (err) => {
    console.log("⚠️ Error:", err.message);
  });
}

function startAFK() {
  if (!bot) return;

  // 🟢 Movement
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const actions = ["forward", "back", "left", "right"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    bot.setControlState(action, true);

    setTimeout(() => {
      if (bot) bot.setControlState(action, false);
    }, 1500);

    if (Math.random() > 0.7) {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 300);
    }
  }, 5000));

  // 🔵 Look around
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * Math.PI;
    bot.look(yaw, pitch, true);
  }, 4000));
}

startBot();
