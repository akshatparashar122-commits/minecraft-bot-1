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

// ===================== BOT START =====================
function startBot() {
  if (bot || isConnecting) return;

  isConnecting = true;

  bot = mineflayer.createBot({
    host: "OGOverflow.aternos.me",
    port: 52600,
    username: "UltraAFK_bot2011",
  });

  bot.once("spawn", () => {
    console.log("🤖 Smart Survival Bot joined!");

    isConnecting = false;

    startSurvivalSystem();
    startSmartInventory();
  });

  bot.on("end", () => {
    console.log("🔁 Disconnected, reconnecting...");

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

// ===================== SURVIVAL MOVEMENT =====================
function startSurvivalSystem() {
  if (!bot) return;

  // Movement
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const actions = ["forward", "back"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    bot.setControlState(action, true);

    setTimeout(() => {
      if (bot) bot.setControlState(action, false);
    }, 1500);
  }, 6000));

  // Look around
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * 0.5;

    bot.look(yaw, pitch, true);
  }, 5000));

  // Safe mining (only front block)
  intervals.push(setInterval(async () => {
    if (!bot?.entity) return;

    try {
      const block = bot.blockAt(bot.entity.position.offset(1, 0, 0));

      if (block && block.name !== "air") {
        await bot.dig(block);
        console.log("⛏️ Mined:", block.name);
      }
    } catch (e) {}
  }, 12000));
}

// ===================== SMART INVENTORY =====================

// 🍞 AUTO EAT FOOD
function autoEat() {
  if (!bot) return;

  if (bot.food < 14) {
    const food = bot.inventory.items().find(i =>
      i.name.includes("bread") ||
      i.name.includes("beef") ||
      i.name.includes("chicken") ||
      i.name.includes("pork")
    );

    if (food) {
      bot.equip(food, "hand", (err) => {
        if (!err) {
          bot.consume();
          console.log("🍞 Eating:", food.name);
        }
      });
    }
  }
}

// ⛏️ AUTO EQUIP TOOL
function autoEquipTools() {
  if (!bot) return;

  const tool = bot.inventory.items().find(i =>
    i.name.includes("pickaxe")
  );

  if (tool) {
    bot.equip(tool, "hand", () => {
      console.log("⛏️ Equipped tool:", tool.name);
    });
  }
}

// 📦 SMART CHEST STORAGE
async function openNearbyChest() {
  if (!bot) return;

  const chestBlock = bot.findBlock({
    matching: b => b.name.includes("chest"),
    maxDistance: 3
  });

  if (!chestBlock) return;

  try {
    const chest = await bot.openChest(chestBlock);

    console.log("📦 Chest opened");

    const junk = bot.inventory.items().filter(i =>
      i.name.includes("dirt") ||
      i.name.includes("cobblestone")
    );

    for (const item of junk) {
      await chest.deposit(item.type, null, item.count);
    }

    console.log("📤 Junk stored");
    chest.close();

  } catch (e) {
    console.log("Chest error:", e.message);
  }
}

// ===================== SMART LOOP =====================
function startSmartInventory() {
  if (!bot) return;

  // food + tools check
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    autoEat();
    autoEquipTools();
  }, 5000));

  // chest check
  intervals.push(setInterval(() => {
    if (!bot?.entity) return;

    openNearbyChest();
  }, 20000));
}

// ===================== START =====================
startBot();
