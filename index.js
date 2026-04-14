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
    host: "OGOverflow.aternos.me",
    port: 52600,
    username: "UltraAFK_bot2011",
  });

  bot.once("spawn", () => {
    console.log("🤖 Pro Survival Bot joined!");
    isConnecting = false;

    startSurvival();
  });

  bot.on("end", () => {
    console.log("🔁 Disconnected... reconnecting");

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

function startSurvival() {
  if (!bot) return;

  // 🧠 STATUS CHECK LOOP
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    // ❤️ Auto eat when hungry
    if (bot.food < 14) {
      const food = bot.inventory.items().find(i =>
        i.name.includes("bread") ||
        i.name.includes("steak") ||
        i.name.includes("cooked")
      );

      if (food) {
        bot.equip(food, "hand", () => {
          bot.consume();
          console.log("🍞 Eating food");
        });
      }
    }

    // ❤️ Safety check
    if (bot.health < 10) {
      console.log("⚠️ Low health - stopping risky actions");
    }
  }, 5000));

  // ⛏️ SAFE MINING (ONLY NEAR BLOCKS)
  intervals.push(setInterval(async () => {
    if (!bot?.entity) return;

    try {
      const pos = bot.entity.position;
      const block = bot.blockAt(pos.offset(1, 0, 0));

      if (block && block.name !== "air") {
        await bot.dig(block);
        console.log("⛏️ Mining:", block.name);
      }
    } catch (e) {}
  }, 12000));

  // 🧭 NATURAL MOVEMENT
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const directions = ["forward", "back"];
    const dir = directions[Math.floor(Math.random() * directions.length)];

    bot.setControlState(dir, true);

    setTimeout(() => {
      if (bot) bot.setControlState(dir, false);
    }, 1500);
  }, 7000));

  // 👀 LOOK AROUND (SMOOTH)
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * 0.5;

    bot.look(yaw, pitch, true);
  }, 6000));
}

startBot();
