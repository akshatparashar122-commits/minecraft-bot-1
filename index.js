const mineflayer = require('mineflayer')

let bot = null
let isConnecting = false

function startBot() {

  if (bot || isConnecting) {
    console.log("⚠️ Bot already running, skipping...")
    return
  }

  isConnecting = true

  bot = mineflayer.createBot({
    host: 'OGOverflow.aternos.me',
    port: 52600,
    username: 'UltraAFK_bot2011'
  })

  bot.once('spawn', () => {
    console.log("🤖 Ultra AFK Bot joined!")

    isConnecting = false
    startAFK(bot)
  })

  bot.on('end', () => {
    console.log("🔁 Bot disconnected...")

    bot = null
    isConnecting = false

    setTimeout(() => {
      startBot()
    }, 15000)
  })

  bot.on('kicked', (reason) => {
    console.log("❌ Kicked:", reason)
  })

  bot.on('error', (err) => {
    console.log("⚠️ Error:", err.message)
  })
}

function startAFK(bot) {

  // 🟢 RANDOM MOVEMENT
  setInterval(() => {
    if (!bot.entity) return

    const actions = ['forward', 'back', 'left', 'right']
    const action = actions[Math.floor(Math.random() * actions.length)]

    bot.setControlState(action, true)

    setTimeout(() => {
      bot.setControlState(action, false)
    }, 2000)

    // random jump
    if (Math.random() > 0.7) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 400)
    }

  }, 5000)


  // 🔵 LOOK AROUND
  setInterval(() => {
    if (!bot.entity) return

    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * Math.PI
    bot.look(yaw, pitch, true)
  }, 4000)


  // ⛏️ BASIC MINING (SAFE)
  setInterval(async () => {
    if (!bot.entity) return

    try {
      const block = bot.blockAt(bot.entity.position.offset(1, 0, 0))

      if (block && block.name !== 'air') {
        console.log("⛏️ Mining block...")
        await bot.dig(block)
      }
    } catch (e) {
      // ignore errors
    }

  }, 15000)


  // 🎒 INVENTORY INTERACTION
  setInterval(() => {
    if (!bot.entity) return

    try {
      bot.activateItem()
      console.log("🎒 Using item / inventory activity")
    } catch (e) {
      // ignore errors
    }

  }, 20000)
}

startBot()