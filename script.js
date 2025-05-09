// DOM元素
const gameBoard = document.querySelector('.game-board')
const scoreElement = document.getElementById('score')
const timeElement = document.getElementById('time')
const startBtn = document.getElementById('start-btn')
const musicBtn = document.getElementById('music-btn')
const rankBtn = document.getElementById('rank-btn')
const bgMusic = document.getElementById('bg-music')
const rankModal = document.getElementById('rank-modal')
const winModal = document.getElementById('win-modal')
const failModal = document.getElementById('fail-modal')
const rankList = document.getElementById('rank-list')
const emptyRank = document.getElementById('empty-rank')
const closeRankBtn = document.getElementById('close-rank')
const shareRankBtn = document.getElementById('share-rank')
const finalScoreElement = document.getElementById('final-score')
const finalTimeElement = document.getElementById('final-time')
const playerNameInput = document.getElementById('player-name')
const saveScoreBtn = document.getElementById('save-score')
const gameHeader = document.querySelector('.game-header')
const gameFooter = document.querySelector('.game-footer')
const closeFailBtn = document.getElementById('close-fail')
const retryBtn = document.getElementById('retry-btn')

// 音效元素
const scoreSound = document.getElementById('score-sound')
const winSound = document.getElementById('win-sound')
const comboSound = document.getElementById('combo-sound')
const superComboSound = document.getElementById('super-combo-sound')
const failSound = document.getElementById('fail-sound')
const achieveSound = document.getElementById('achieve-sound')

// 游戏状态
let cards = []
let score = 0
let timeElapsed = 0
let gameTimer = null
let scoreTimer = null
let firstCard = null
let secondCard = null
let lockBoard = false
let matchedPairs = 0
let currentPotentialScore = 200 // 每对卡片的最高得分
let comboCount = 0 // 连击计数
let lastMatchTime = 0 // 上次匹配时间
let gameActive = false // 游戏是否激活中
let initCount = 0 // 游戏初始化的次数
let clickStatusCount = 0 // 点击状态栏最右侧图像的次数
let timeWarningShown = false // 是否已显示时间警告
let cardTrajectory = [] // 卡片轨迹数组
const TIME_LIMIT = 60 // 游戏时间限制（秒）
const TIME_WARNING = 30 // 剩余时间警告（秒）

// 游戏成就相关
const GAME_ACH = [
  {name:'难免失误', img: 'images/hidden/hidden9.jpeg', desc: '游戏总是有意外的😶‍🌫️，生活也是', cond:'游戏超时一次'},
  {name:'一连串', img: 'images/hidden/hidden4.jpeg', desc: '就像烧烤串一样顺理成章🎆', cond:'达成超级连击'},
  {name:'超大杯', img: 'images/hidden/hidden11.jpeg', desc: '像滚雪球🎿一样开心，超大的雪球', cond:'获得3000分'},
  {name:'大大的2', img: 'images/hidden/hidden10.jpeg', desc: '这么说来...连我们的树🎋都一年啦', cond:'画出一个2'},
  {name:'3点8',img: 'images/hidden/hidden1.jpeg', desc: '3月8日🎐要不要给小白白吹头头？', cond:'点击8次小白'},
  {name:'你的名字', img: 'images/hidden/hidden6.jpeg', desc: '小狗想永远待在四月的天空下💘', cond:'输入你的名字'},
]
const MAGIC_TRACE = JSON.stringify(['0', '1', '2', '3', '6', '9', '12', '13', '14', '15']) // 轨迹成就的魔法轨迹

// 分数层级阈值和效果
const SCORE_TIERS = [
  { threshold: 500, className: 'score-tier-1' },
  { threshold: 1000, className: 'score-tier-2' },
  { threshold: 1500, className: 'score-tier-3' },
  { threshold: 2000, className: 'score-tier-4' },
  { threshold: 2500, className: 'score-tier-5' },
  { threshold: 3000, className: 'score-tier-6' },
  { threshold: 3500, className: 'score-tier-7' },
]

// 初始化游戏
function initGame() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)

  cards = []
  cardTrajectory = [] // 重置卡片轨迹
  score = 0
  timeElapsed = 0
  matchedPairs = 0
  lockBoard = false
  firstCard = null
  secondCard = null
  currentPotentialScore = 200
  comboCount = 0 // 重置连击计数
  lastMatchTime = 0 // 重置上次匹配时间
  timeWarningShown = false // 重置时间警告状态
  gameActive = false // 重置游戏状态
  clickStatusCount = 0 // 重置状态栏点击计数

  // 移除时间警告样式
  timeElement.classList.remove('time-warning')
  timeElement.classList.remove('time-critical')

  // 更新显示
  scoreElement.textContent = score
  timeElement.textContent = TIME_LIMIT - timeElapsed

  // 重置分数显示效果
  updateScoreDisplay()

  // 清空游戏板
  gameBoard.innerHTML = ''

  // 创建卡片
  createCards()

  // 如果是第一次游戏，当用户第一次翻牌时开始计时
  // 如果不是第一次游戏，直接开始计时
  initCount++
  if (initCount > 1) resumeGame()
}

// 暂停游戏
function pauseGame() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)
  gameActive = false // 暂停游戏
}

// 继续游戏
function resumeGame() {
  if (!gameActive) {
    gameActive = true // 继续游戏
    gameTimer = setInterval(() => {
      timeElapsed++
      timeElement.textContent = TIME_LIMIT - timeElapsed

      // 检查剩余时间并添加视觉警告
      const timeLeft = TIME_LIMIT - timeElapsed

      // 游戏失败检查
      if (timeLeft <= 0 && gameActive) {
        gameOver()
        return
      }

      // 显示30秒警告
      if (timeLeft === TIME_WARNING && !timeWarningShown) {
        showTimeWarning()
        timeWarningShown = true
      }

      // 剩余时间少于30秒，添加警告效果
      if (timeLeft <= TIME_WARNING && timeLeft > 10) {
        timeElement.classList.add('time-warning')
        timeElement.classList.remove('time-critical')
      }
      // 剩余时间少于10秒，添加危急效果
      else if (timeLeft <= 10) {
        timeElement.classList.remove('time-warning')
        timeElement.classList.add('time-critical')
      }
    }, 1000)

    // 启动分数递减计时器
    scoreTimer = setInterval(() => {
      if (currentPotentialScore > 1) {
        currentPotentialScore--
      }
    }, 1000)
  }
}

// 显示时间警告
function showTimeWarning() {
  const alertElement = document.createElement('div')
  alertElement.classList.add('time-alert')

  // 使用更友好的提示文本
  alertElement.textContent = `还剩${TIME_WARNING}秒哦`

  // 将提示放在游戏板元素内部的底部位置
  const gameBoard = document.querySelector('.game-board')
  gameBoard.appendChild(alertElement)

  // 轻微震动效果，降低强度，适配小屏幕
  setTimeout(() => {
    // 只对游戏板应用震动，而不是整个页面
    gameBoard.classList.add('light-shake')
    setTimeout(() => {
      gameBoard.classList.remove('light-shake')
    }, 300) // 减少震动时间
  }, 100) // 延迟一点点再震动

  // 4秒后自动淡出
  setTimeout(() => {
    if (gameBoard.contains(alertElement)) {
      alertElement.style.animation = 'fadeOut 0.8s forwards'

      // 动画结束后再移除元素
      setTimeout(() => {
        if (gameBoard.contains(alertElement)) {
          gameBoard.removeChild(alertElement)
        }
      }, 800)
    }
  }, 4000)
}

// 游戏失败处理
function gameOver() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)
  gameActive = false

  // 播放失败音效
  failSound.play()

  // 解锁失败成就
  unlockAchievement('难免失误')

  // 显示失败模态框
  failModal.style.display = 'flex'

  // 解锁游戏板，防止卡在锁定状态
  lockBoard = false
}

// 创建卡片
function createCards() {
  // 随机选择8种图片
  const availableCards = Array.from({ length: 438 }, (_, i) => i)
  const selectedCards = []

  while (selectedCards.length < 8) {
    const randomIndex = Math.floor(Math.random() * availableCards.length)
    selectedCards.push(availableCards[randomIndex])
    availableCards.splice(randomIndex, 1)
  }

  // 每种图片出现两次
  const cardPairs = [...selectedCards, ...selectedCards]

  // 随机排序
  shuffle(cardPairs)

  // 检测是否为Firefox浏览器
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1

  // 创建卡片元素
  cardPairs.forEach((cardId, index) => {
    const card = document.createElement('div')
    card.classList.add('card')
    card.dataset.card = cardId
    card.dataset.index = index // 添加卡片索引数据属性，用于记录翻牌轨迹

    const cardInner = document.createElement('div')
    cardInner.classList.add('card-inner')
    cardInner.style.transformStyle = 'preserve-3d' // Firefox fix

    const cardFront = document.createElement('div')
    cardFront.classList.add('card-front')
    // Firefox fix for backface visibility
    cardFront.style.backfaceVisibility = 'hidden'
    cardFront.style.webkitBackfaceVisibility = 'hidden'

    // Firefox专用修复：确保背面在翻转时完全隐藏
    if (isFirefox) {
      cardFront.style.zIndex = '2' // 确保正面在上层
    }

    const cardImage = document.createElement('img')
    cardImage.src = `images/cards/card${cardId}.jpeg`
    cardImage.alt = `Card ${cardId}`

    const cardBack = document.createElement('div')
    cardBack.classList.add('card-back')
    // Firefox fix for backface visibility
    cardBack.style.backfaceVisibility = 'hidden'
    cardBack.style.webkitBackfaceVisibility = 'hidden'

    // Firefox专用修复：确保背面在翻转时完全隐藏
    if (isFirefox) {
      cardBack.style.zIndex = '1' // 确保背面在下层

      // 为Firefox增加翻转时的隐藏效果
      card.addEventListener('transitionstart', function (e) {
        if (this.classList.contains('flipped')) {
          setTimeout(() => {
            cardBack.style.opacity = '0'
          }, 150) // 在翻转过程中稍后隐藏背面
        } else {
          cardBack.style.opacity = '1'
        }
      })
    }

    cardFront.appendChild(cardImage)
    cardInner.appendChild(cardFront)
    cardInner.appendChild(cardBack)
    card.appendChild(cardInner)

    card.addEventListener('click', flipCard)

    gameBoard.appendChild(card)
    cards.push(card)
  })
}

// 洗牌函数
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// 翻牌
function flipCard() {
  // 如果是第一次游戏的第一次翻牌，开始游戏并计时
  if (initCount === 1 && timeElapsed === 0) resumeGame()
  // 游戏未激活时不允许翻牌
  if (gameActive === false) return
  if (lockBoard) return
  if (this === firstCard) return

  this.classList.add('flipped')

  if (!firstCard) {
    // 第一次点击
    firstCard = this
    return
  }

  // 第二次点击
  secondCard = this

  // 记录翻牌轨迹
  cardTrajectory.push(firstCard.dataset.index)
  cardTrajectory.push(secondCard.dataset.index)

  // 轨迹成就检查
  if (JSON.stringify(cardTrajectory.slice(-10)) === MAGIC_TRACE) {
    // 解锁"大大的2"成就
    unlockAchievement('大大的2')
  }

  // 检查匹配
  checkForMatch()
}

// 检查匹配
function checkForMatch() {
  const isMatch = firstCard.dataset.card === secondCard.dataset.card

  if (isMatch) {
    addScore()
    disableCards()
  } else {
    unflipCards()
  }
}

// 添加得分
function addScore() {
  // 计算当前时间与上次匹配时间的差值（秒）
  const now = Date.now()
  const timeDiff = (now - lastMatchTime) / 1000

  // 如果是首次匹配或连击计时器已经超过限制，重置连击
  if (lastMatchTime === 0 || timeDiff > 4) {
    comboCount = 0
  }

  // 更新上次匹配时间
  lastMatchTime = now

  // 增加连击计数
  comboCount++

  // 连击成就检查
  if (comboCount === 3) {
    // 解锁"一连串"成就
    unlockAchievement('一连串')
  }

  // 连击奖励系数
  let comboMultiplier = 1

  // 根据连击数更新显示和奖励系数
  if (comboCount === 1) {
    // 单次匹配也显示简单特效，增加打击感
    showSimpleMatchEffect(firstCard, secondCard, '匹配!')

    // 播放普通得分音效
    scoreSound.currentTime = 0
    scoreSound.play()
  } else if (comboCount === 2) {
    // 普通连击：2连击
    comboMultiplier = 1.5
    showComboEffect(firstCard, secondCard, `${comboCount}连击!`)

    // 播放连击音效
    comboSound.currentTime = 0
    comboSound.play()
  } else if (comboCount >= 3) {
    // 超级连击：3连击以上
    comboMultiplier = 2 + (comboCount - 3) * 0.5 // 递增奖励(调整基数为3)
    comboMultiplier = Math.min(comboMultiplier, 5) // 限制最大倍率为5倍

    // 更新连击计数显示
    showSuperComboEffect(firstCard, secondCard, `超级${comboCount}连击!`)

    // 播放超级连击音效
    superComboSound.currentTime = 0
    superComboSound.play()
  }

  // 计算本次得分（基础分数 * 连击系数）
  const pointsEarned = Math.round(currentPotentialScore * comboMultiplier)

  // 添加得分
  score += pointsEarned
  scoreElement.textContent = score

  // 更新分数显示效果
  updateScoreDisplay()

  // 显示加分动画
  const scorePopup = document.createElement('div')
  scorePopup.classList.add('score-popup')

  // 如果是连击，显示倍率
  if (comboCount > 1) {
    scorePopup.textContent = `+${pointsEarned} (x${comboMultiplier.toFixed(1)})`
    // 连击得分颜色特殊处理
    if (comboCount >= 3) {
      // 3连击触发超级连击特效
      scorePopup.style.color = '#ff5252'
      scorePopup.style.fontSize = '1.6rem' // 改小一点，使尺寸更统一
      scorePopup.style.textShadow =
        '2px 2px 0 white, 0 0 10px rgba(255, 82, 82, 0.7)'
    } else {
      scorePopup.style.color = '#ff7730'
      scorePopup.style.fontSize = '1.5rem' // 调整为更接近的大小
    }
  } else {
    scorePopup.textContent = `+${pointsEarned}`
    scorePopup.style.fontSize = '1.4rem' // 增大单次匹配的字号，提升视觉反馈
  }

  // 计算加分动画位置（两张卡片中间）
  const firstRect = firstCard.getBoundingClientRect()
  const secondRect = secondCard.getBoundingClientRect()
  const x = (firstRect.left + secondRect.left) / 2 + firstRect.width / 2
  const y = (firstRect.top + secondRect.top) / 2 + firstRect.height / 2

  scorePopup.style.left = `${x - gameBoard.getBoundingClientRect().left}px`
  scorePopup.style.top = `${y - gameBoard.getBoundingClientRect().top}px`

  gameBoard.appendChild(scorePopup)

  // 卡片匹配动画
  firstCard.classList.add('matched')
  secondCard.classList.add('matched')

  // 清除动画元素 - 延长时间为2000ms (原来是1500ms)
  setTimeout(() => {
    if (gameBoard.contains(scorePopup)) {
      gameBoard.removeChild(scorePopup)
    }
  }, 2000)

  // 重置当前分数计算器
  currentPotentialScore = 200

  // 分数成就检查
  if (score >= 3000) {
    // 解锁"超大杯"成就
    unlockAchievement('超大杯')
  }

  // 检查游戏是否结束
  matchedPairs++
  if (matchedPairs === 8) {
    setTimeout(() => {
      endGame()
    }, 1000)
  }
}

// 显示连击特效
function showComboEffect(card1, card2, text) {
  // 获取连击特效容器
  const comboEffectContainer = document.getElementById('combo-effect-container')

  // 创建连击特效元素
  const effect = document.createElement('div')
  effect.classList.add('combo-effect-display')
  effect.textContent = text
  effect.style.color = '#ff7730' // 橙色，比单次匹配更鲜艳
  effect.style.fontSize = '2.0rem' // 比单次匹配更大
  effect.style.textShadow =
    '0 0 10px rgba(255, 119, 48, 0.8), 0 0 20px rgba(255, 119, 48, 0.5)'

  // 添加中型冲击波特效 (比单次匹配更强)
  const shockwave = document.createElement('div')
  shockwave.classList.add('combo-shockwave')
  shockwave.style.position = 'absolute'
  shockwave.style.top = '50%'
  shockwave.style.left = '50%'
  shockwave.style.transform = 'translate(-50%, -50%)'
  shockwave.style.backgroundColor = 'rgba(255, 119, 48, 0.15)' // 更强的冲击波
  shockwave.style.boxShadow =
    '0 0 30px rgba(255, 119, 48, 0.3), inset 0 0 15px rgba(255, 119, 48, 0.2)'
  shockwave.style.animation = 'shockwaveEffect 1.0s ease-out forwards' // 比单次匹配更慢，更持久

  // 2连击比单次匹配增加轻微震动 - 只对游戏板应用
  const gameBoard = document.querySelector('.game-board')
  gameBoard.classList.add('light-shake')
  setTimeout(() => {
    gameBoard.classList.remove('light-shake')
  }, 400)

  // 添加特效到容器
  comboEffectContainer.appendChild(effect)
  comboEffectContainer.appendChild(shockwave)

  // 动画结束后移除元素
  effect.addEventListener('animationend', function () {
    if (comboEffectContainer.contains(effect)) {
      comboEffectContainer.removeChild(effect)
    }
  })

  shockwave.addEventListener('animationend', function () {
    if (comboEffectContainer.contains(shockwave)) {
      comboEffectContainer.removeChild(shockwave)
    }
  })
}

// 显示超级连击特效
function showSuperComboEffect(card1, card2, text) {
  // 获取连击特效容器
  const comboEffectContainer = document.getElementById('combo-effect-container')

  // 创建超级连击特效元素
  const effect = document.createElement('div')
  effect.classList.add('combo-effect-display', 'super-combo-effect-display')
  effect.textContent = text

  // 根据连击数调整特效强度
  if (comboCount >= 5) {
    // 5连击以上，更强烈的效果
    effect.style.fontSize = '2.7rem'
    effect.style.textShadow =
      '0 0 15px rgba(255, 221, 0, 0.9), 0 0 30px rgba(255, 221, 0, 0.7), 0 0 40px rgba(255, 151, 0, 0.5), 0 0 3px #ff5252'

    // 增加额外的发光效果
    effect.style.filter = 'brightness(1.2)'

    // 添加更强烈的震动效果 - 只对游戏板应用
    const gameBoard = document.querySelector('.game-board')
    gameBoard.classList.add('shake')
    setTimeout(() => {
      gameBoard.classList.remove('shake')
    }, 600)

    // 添加双层冲击波特效
    addSuperShockwave(comboEffectContainer)
    setTimeout(() => {
      addSuperShockwave(comboEffectContainer)
    }, 200)
  } else {
    // 3-4连击，标准超级连击效果
    const gameBoard = document.querySelector('.game-board')
    gameBoard.classList.add('shake')
    setTimeout(() => {
      gameBoard.classList.remove('shake')
    }, 500)

    // 添加标准超级冲击波特效
    addSuperShockwave(comboEffectContainer)
  }

  // 添加到特效容器
  comboEffectContainer.appendChild(effect)

  // 动画结束后移除元素
  effect.addEventListener('animationend', function () {
    if (comboEffectContainer.contains(effect)) {
      comboEffectContainer.removeChild(effect)
    }
  })
}

// 显示简单匹配特效 (用于单次匹配)
function showSimpleMatchEffect(card1, card2, text) {
  // 获取连击特效容器
  const comboEffectContainer = document.getElementById('combo-effect-container')

  // 创建简单匹配特效元素（样式比普通连击稍微小一些）
  const effect = document.createElement('div')
  effect.classList.add('combo-effect-display')
  effect.textContent = text
  effect.style.fontSize = '1.8rem' // 比连击稍小
  effect.style.opacity = '0.85' // 稍微透明一点
  effect.style.color = '#ff9c52' // 使用柔和的橙色

  // 添加小型冲击波特效
  const shockwave = document.createElement('div')
  shockwave.classList.add('combo-shockwave')
  shockwave.style.position = 'absolute'
  shockwave.style.top = '50%'
  shockwave.style.left = '50%'
  shockwave.style.transform = 'translate(-50%, -50%)'
  shockwave.style.backgroundColor = 'rgba(255, 156, 82, 0.08)' // 更轻微的冲击波
  shockwave.style.animation = 'shockwaveEffect 0.7s ease-out forwards' // 稍快的动画

  // 添加特效到容器
  comboEffectContainer.appendChild(effect)
  comboEffectContainer.appendChild(shockwave)

  // 动画结束后移除元素
  effect.addEventListener('animationend', function () {
    if (comboEffectContainer.contains(effect)) {
      comboEffectContainer.removeChild(effect)
    }
  })

  shockwave.addEventListener('animationend', function () {
    if (comboEffectContainer.contains(shockwave)) {
      comboEffectContainer.removeChild(shockwave)
    }
  })
}

// 添加冲击波特效
function addShockwave(container, isSuper) {
  // 创建冲击波元素
  const shockwave = document.createElement('div')
  shockwave.classList.add('combo-shockwave')

  if (isSuper) {
    shockwave.classList.add('super-combo-shockwave')
  }

  // 设置冲击波位置（居中）
  shockwave.style.position = 'absolute'
  shockwave.style.top = '50%'
  shockwave.style.left = '50%'
  shockwave.style.transform = 'translate(-50%, -50%)'

  // 添加到容器
  container.appendChild(shockwave)

  // 动画结束后移除
  shockwave.addEventListener('animationend', function () {
    if (container.contains(shockwave)) {
      container.removeChild(shockwave)
    }
  })
}

// 添加超级冲击波特效 (更强的震撼效果)
function addSuperShockwave(container) {
  // 创建冲击波元素
  const shockwave = document.createElement('div')
  shockwave.classList.add('combo-shockwave', 'super-combo-shockwave')

  // 设置冲击波位置（居中）
  shockwave.style.position = 'absolute'
  shockwave.style.top = '50%'
  shockwave.style.left = '50%'
  shockwave.style.transform = 'translate(-50%, -50%)'

  // 添加到容器
  container.appendChild(shockwave)

  // 动画结束后移除
  shockwave.addEventListener('animationend', function () {
    if (container.contains(shockwave)) {
      container.removeChild(shockwave)
    }
  })
}

// 更新分数显示效果
function updateScoreDisplay() {
  // 移除所有分数效果类
  SCORE_TIERS.forEach((tier) => {
    scoreElement.classList.remove(tier.className)
  })

  // 添加匹配的最高层级效果
  for (let i = SCORE_TIERS.length - 1; i >= 0; i--) {
    if (score >= SCORE_TIERS[i].threshold) {
      scoreElement.classList.add(SCORE_TIERS[i].className)
      break
    }
  }
}

// 禁用已匹配的卡片
function disableCards() {
  firstCard.removeEventListener('click', flipCard)
  secondCard.removeEventListener('click', flipCard)
  resetBoard()
}

// 翻回不匹配的卡片
function unflipCards() {
  lockBoard = true

  setTimeout(() => {
    firstCard.classList.remove('flipped')
    secondCard.classList.remove('flipped')
    resetBoard()
  }, 1500)
}

// 重置面板状态
function resetBoard() {
  ;[firstCard, secondCard] = [null, null]
  lockBoard = false
}

// 结束游戏（胜利）
function endGame() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)
  gameActive = false

  // 播放胜利音效
  winSound.play()

  // 显示最终分数和时间
  finalScoreElement.textContent = score
  finalTimeElement.textContent = timeElapsed

  // 如果之前填过名字，自动填入
  const savedName = localStorage.getItem('dogMatchPlayerName')
  if (savedName) {
    playerNameInput.value = savedName
  }

  // 显示胜利模态框
  winModal.style.display = 'flex'
}

// 保存分数
function saveScore() {
  const playerName = playerNameInput.value.trim() || '匿名'

  // 玩家名称成就检查
  if (/aprilsky/i.test(playerName)) {
    // 解锁"你的名字"成就
    unlockAchievement('你的名字')
  }

  // 获取现有排行榜
  let leaderboard =
    JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []

  // 添加新分数
  leaderboard.push({
    name: playerName,
    score: score,
    time: timeElapsed,
    date: new Date().toISOString(),
  })

  // 按分数从高到低排序，分数相同时按时间从短到长排序
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score // 首先按分数降序
    }
    return a.time - b.time // 分数相同时按时间升序
  })

  // 只保留前5名
  if (leaderboard.length > 5) {
    leaderboard = leaderboard.slice(0, 5)
  }

  // 保存到本地存储
  localStorage.setItem('dogMatchLeaderboard', JSON.stringify(leaderboard))
  localStorage.setItem('dogMatchPlayerName', playerNameInput.value.trim())

  // 关闭胜利模态框并显示排行榜
  winModal.style.display = 'none'
  showLeaderboard()
}

// 显示排行榜
function showLeaderboard() {
  const leaderboard =
    JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []

  if (leaderboard.length === 0) {
    rankList.innerHTML = ''
    emptyRank.style.display = 'block'
  } else {
    emptyRank.style.display = 'none'

    // 构建排行榜HTML
    let rankHTML = `
      <div class="rank-header">
        <span class="rank-col">排名</span>
        <span class="rank-col">玩家</span>
        <span class="rank-col">分数</span>
        <span class="rank-col">用时</span>
      </div>
    `

    leaderboard.forEach((entry, index) => {
      // 为前三名显示奖牌图标
      let rankDisplay = `${index + 1}`

      if (index === 0) {
        rankDisplay = `<img src="images/gold.svg" alt="金牌" class="rank-medal" />`
      } else if (index === 1) {
        rankDisplay = `<img src="images/silver.svg" alt="银牌" class="rank-medal" />`
      } else if (index === 2) {
        rankDisplay = `<img src="images/bronze.svg" alt="铜牌" class="rank-medal" />`
      }

      rankHTML += `
        <div class="rank-item ${index < 3 ? 'top-rank' : ''}">
          <span class="rank-col">${rankDisplay}</span>
          <span class="rank-col">${entry.name}</span>
          <span class="rank-col">${entry.score}</span>
          <span class="rank-col">${entry.time}秒</span>
        </div>
      `
    })

    rankList.innerHTML = rankHTML

    // 优化奖牌图标大小和排行榜项样式 (整合了ensureMedalSizes函数)
    const medals = document.querySelectorAll('.rank-medal')
    medals.forEach((medal) => {
      medal.style.width = '20px'
      medal.style.height = '20px'
      medal.style.verticalAlign = 'middle'
      medal.style.marginTop = '-3px' // 微调垂直位置
      medal.style.animation = 'medalShine 2s infinite alternate'

      // 根据设备尺寸调整图标大小
      if (window.innerWidth <= 375) {
        medal.style.width = '18px'
        medal.style.height = '18px'
      } else if (window.innerWidth >= 768) {
        medal.style.width = '24px'
        medal.style.height = '24px'
      }
    })

    // 为顶部排行榜添加反应式风格
    const topRanks = document.querySelectorAll('.top-rank')
    topRanks.forEach((rank, index) => {
      // 根据名次设置不同的背景色深度
      const opacity = 0.3 - index * 0.05
      rank.style.backgroundColor = `rgba(255, 187, 123, ${opacity})`
      rank.style.transition = 'all 0.3s ease'

      // 添加鼠标悬停效果
      rank.addEventListener('mouseenter', function () {
        this.style.transform = 'translateX(5px)'
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      })

      rank.addEventListener('mouseleave', function () {
        this.style.transform = 'translateX(0)'
        this.style.boxShadow = 'none'
      })
    })
  }

  rankModal.style.display = 'flex'
}

// 分享排行榜
function shareRanking() {
  const leaderboard =
    JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  const pageUrl = window.location.href
  let shareText = ''

  // 根据排行榜情况选择分享模板
  if (leaderboard.length === 0) {
    shareText = `【线条小狗连连看】我发现了一个超可爱的线条小狗主题游戏，快来和我一起挑战吧！${pageUrl}`
  } else {
    shareText = `【线条小狗连连看】我在这个线条小狗主题游戏中获得了第一名，共获得${leaderboard[0].score}分，仅用时${leaderboard[0].time}秒！你也来试试吧！${pageUrl}`
  }

  // 复制到剪贴板
  copyToClipboard(shareText)

  // 显示成功通知
  showNotification('分享链接已复制到剪贴板')
}

// 显示游戏成就
function showAchievement() {
  // 获取成就模态框
  const achieveModal = document.getElementById('achieve-modal')
  const achieveList = document.getElementById('achieve-list')
  
  // 从本地存储中获取已解锁成就
  const unlockedAchievements = JSON.parse(localStorage.getItem('dogMatchAchievements')) || {}
  
  // 构建成就列表HTML
  let achieveHTML = ''
  
  // 遍历所有成就
  GAME_ACH.forEach((achievement, index) => {
    // 检查成就是否已解锁
    const isUnlocked = unlockedAchievements[achievement.name] === true
    
    // 设置成就项的类和状态图标
    const achieveItemClass = isUnlocked ? 'achieve-item unlocked' : 'achieve-item locked'
    const statusIcon = isUnlocked ? '🏆' : '🔒'
    const statusClass = isUnlocked ? 'achievement-status unlocked' : 'achievement-status locked'
    
    // 构建每个成就项的HTML
    achieveHTML += `
      <div class="${achieveItemClass}" data-index="${index}">
        <div class="achievement-icon">
          <img src="${isUnlocked ? achievement.img : 'images/locked.svg'}" alt="${achievement.name}" />
        </div>
        <div class="achievement-content">
          <div class="achievement-header">
            <span class="achievement-name">${achievement.name}</span>
            <span class="${statusClass}">${statusIcon}</span>
          </div>
          ${isUnlocked ? `<p class="achievement-desc">${achievement.cond}</p>` : '<p class="achievement-desc">未解锁</p>'}
        </div>
        ${isUnlocked ? '<button class="view-achievement game-btn">查看</button>' : ''}
      </div>
    `
  })
  
  // 更新成就列表内容
  achieveList.innerHTML = achieveHTML
  
  // 为已解锁成就的"查看"按钮添加事件监听
  const viewButtons = document.querySelectorAll('.view-achievement')
  viewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation()
      const achieveItem = this.closest('.achieve-item')
      const index = parseInt(achieveItem.dataset.index)
      showAchievementDetail(GAME_ACH[index])
    })
  })
  
  // 显示成就模态框
  achieveModal.style.display = 'flex'
}

// 显示成就详情
function showAchievementDetail(achievement) {
  // 创建详情模态框
  const detailModal = document.createElement('div')
  detailModal.classList.add('modal', 'achievement-detail-modal')
  
  // 构建详情模态框内容
  detailModal.innerHTML = `
    <div class="modal-content achievement-detail-content">
      <div class="modal-header">
        <h2>${achievement.name}</h2>
      </div>
      <div class="modal-body">
        <div class="achievement-detail-image">
          <img src="${achievement.img}" alt="${achievement.name}" />
        </div>
        <div class="achievement-detail-desc">
          <p>${achievement.desc}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="close-detail game-btn">关闭</button>
      </div>
    </div>
  `
  
  // 将详情模态框添加到页面
  document.body.appendChild(detailModal)
  
  // 设置关闭按钮事件
  const closeButton = detailModal.querySelector('.close-detail')
  closeButton.addEventListener('click', () => {
    document.body.removeChild(detailModal)
  })
  
  // 显示详情模态框
  detailModal.style.display = 'flex'
}

// 解锁成就函数
function unlockAchievement(achievementName) {
  // 获取当前已解锁成就
  const unlockedAchievements = JSON.parse(localStorage.getItem('dogMatchAchievements')) || {}
  
  // 检查成就是否已解锁
  if (!unlockedAchievements[achievementName]) {
    // 标记为已解锁
    unlockedAchievements[achievementName] = true
    
    // 保存到本地存储
    localStorage.setItem('dogMatchAchievements', JSON.stringify(unlockedAchievements))
    
    // 查找成就对象以显示通知
    const achievement = GAME_ACH.find(ach => ach.name === achievementName)
    if (achievement) {
      // 显示解锁通知
      showNotification(`🎉 解锁：${achievementName}`)
      
      // 成就解锁的音效
      achieveSound.currentTime = 0
      achieveSound.play()
    }
  }
}

// 分享成就
function shareAchievements() {
  // 获取已解锁的成就
  const unlockedAchievements = JSON.parse(localStorage.getItem('dogMatchAchievements')) || {}
  const unlockedCount = Object.keys(unlockedAchievements).filter(key => unlockedAchievements[key]).length
  const totalAchievements = GAME_ACH.length
  
  // 准备分享文本
  const pageUrl = window.location.href
  let shareText = ''
  
  if (unlockedCount === 0) {
    shareText = `【线条小狗连连看】我发现了一个超可爱的线条小狗主题游戏，有${totalAchievements}个隐藏成就等你解锁！快来一起玩吧！${pageUrl}`
  } else if (unlockedCount === totalAchievements) {
    shareText = `【线条小狗连连看】太厉害了！我在线条小狗连连看游戏中解锁了所有${totalAchievements}个成就！你也来试试吧！${pageUrl}`
  } else {
    shareText = `【线条小狗连连看】我在线条小狗连连看游戏中已经解锁了${unlockedCount}/${totalAchievements}个成就！快来挑战吧！${pageUrl}`
  }
  
  // 复制到剪贴板
  copyToClipboard(shareText)
  
  // 显示成功通知
  showNotification('分享链接已复制到剪贴板')
}

// 3点8成就的相关函数
// 如果在一局游戏间隔内点击了8次右上角图像，则解锁成就
function clickStatus() {
  clickStatusCount++
  if (clickStatusCount >= 8) {
    // 解锁"3点8"成就
    unlockAchievement('3点8')
  }
}

// 复制文本到剪贴板
function copyToClipboard(text) {
  // 创建临时元素
  const tempEl = document.createElement('textarea')
  tempEl.value = text
  tempEl.style.position = 'absolute'
  tempEl.style.left = '-9999px'
  document.body.appendChild(tempEl)

  // 选择并复制文本
  tempEl.select()
  tempEl.setSelectionRange(0, 99999) // 对于移动设备

  try {
    const successful = document.execCommand('copy')
    if (!successful) {
      // 如果execCommand不可用，尝试使用Clipboard API
      navigator.clipboard.writeText(text).catch((err) => {
        console.error('无法复制文本: ', err)
      })
    }
  } catch (err) {
    console.error('无法复制文本: ', err)
    // 尝试使用Clipboard API作为备选方案
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Clipboard API也失败: ', err)
    })
  }

  // 删除临时元素
  document.body.removeChild(tempEl)
}

// 显示通知
function showNotification(message) {
  // 检查是否已有通知，如果有则移除
  const existingNotification = document.querySelector('.notification')
  if (existingNotification) {
    document.body.removeChild(existingNotification)
  }

  // 创建通知元素
  const notification = document.createElement('div')
  notification.classList.add('notification')
  notification.textContent = message

  // 添加到页面
  document.body.appendChild(notification)

  // 自动移除通知
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 2500)
}

// 控制音乐
function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play()
    musicBtn.textContent = '🔊'
    musicBtn.classList.add('active')
  } else {
    bgMusic.pause()
    musicBtn.textContent = '🔈'
    musicBtn.classList.remove('active')
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 确保游戏布局在所有平台上正确显示
  ensureGameLayout()

  // 绑定按钮事件
  startBtn.addEventListener('click', initGame)
  musicBtn.addEventListener('click', toggleMusic)
  rankBtn.addEventListener('click', showLeaderboard)
  closeRankBtn.addEventListener(
    'click',
    () => (rankModal.style.display = 'none')
  )
  saveScoreBtn.addEventListener('click', saveScore)
  shareRankBtn.addEventListener('click', shareRanking)
  
  // 成就按钮事件
  const achieveBtn = document.getElementById('achieve-btn')
  const closeAchieveBtn = document.getElementById('close-achieve')
  const shareAchieveBtn = document.getElementById('share-achieve')
  const statusRightImg = document.querySelector('.status-right')
  
  achieveBtn.addEventListener('click', showAchievement)
  closeAchieveBtn.addEventListener('click', () => {
    document.getElementById('achieve-modal').style.display = 'none'
  })
  shareAchieveBtn.addEventListener('click', shareAchievements)
  statusRightImg.addEventListener('click', clickStatus)

  // 失败模态框按钮事件
  closeFailBtn.addEventListener('click', () => {
    failModal.style.display = 'none'
  })

  retryBtn.addEventListener('click', () => {
    failModal.style.display = 'none'
    initGame()
  })

  // 音乐播放状态标记
  let musicStarted = false

  // 尝试立即播放背景音乐
  playBackgroundMusic()

  // 如果自动播放失败，监听第一次用户交互
  function setupUserInteractionMusic() {
    if (musicStarted) return // 如果音乐已经播放，不再设置交互监听

    const interactionEvents = ['click', 'touchstart', 'keydown']

    function onFirstInteraction() {
      if (!musicStarted && bgMusic.paused) {
        playBackgroundMusic()

        // 如果成功播放，移除所有交互监听器
        if (!bgMusic.paused) {
          interactionEvents.forEach((event) => {
            document.removeEventListener(event, onFirstInteraction)
          })
        }
      }
    }

    // 添加交互监听器
    interactionEvents.forEach((event) => {
      document.addEventListener(event, onFirstInteraction, { once: false })
    })
  }

  // 封装音乐播放逻辑
  function playBackgroundMusic() {
    bgMusic
      .play()
      .then(() => {
        musicStarted = true
        musicBtn.textContent = '🔊'
        musicBtn.classList.add('active')
      })
      .catch((err) => {
        console.log('自动播放音乐失败:', err)
        // 设置用户交互监听
        setupUserInteractionMusic()
      })
  }

  // 初始显示排行榜（用于更新是否为空的状态）
  const leaderboard =
    JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  if (leaderboard.length === 0) {
    emptyRank.style.display = 'block'
  } else {
    emptyRank.style.display = 'none'
  }

  // 监听窗口大小变化，以便调整布局
  window.addEventListener('resize', ensureGameLayout)

  // 初始化游戏
  initGame()
})

// 确保游戏布局在所有设备和浏览器中正确显示
function ensureGameLayout() {
  // 获取关键DOM元素
  const container = document.querySelector('.game-container')
  const gameBoard = document.querySelector('.game-board')
  const header = document.querySelector('.game-header')
  const footer = document.querySelector('.game-footer')
  const comboEffectContainer = document.getElementById('combo-effect-container')

  if (!gameBoard || !header || !footer) return

  // 检测是否为移动设备
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

  // 设置基础容器样式
  if (container) {
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.alignItems = 'center'
    container.style.justifyContent = 'flex-start'
    container.style.width = '100%'
    container.style.minHeight = '100vh'
    container.style.padding = isMobile ? '10px 5px' : '15px 10px'
  }

  // 设置游戏板样式 - 保持为正方形
  const boardSize = Math.min(
    window.innerWidth * 0.85,
    window.innerHeight * 0.6,
    500 // 最大尺寸
  )

  gameBoard.style.width = `${boardSize}px`
  gameBoard.style.height = `${boardSize}px`
  gameBoard.style.position = 'relative'
  gameBoard.style.margin = '0 auto'
  gameBoard.style.flexShrink = '0'

  // 统一顶部、底部和连击显示区域的宽度与游戏板一致
  const layoutWidth = `${boardSize}px`

  // 设置顶部信息栏样式
  header.style.width = '100%'
  header.style.maxWidth = layoutWidth
  header.style.position = 'relative'
  header.style.marginBottom = '10px'
  header.style.zIndex = '10'

  if (comboEffectContainer) {
    comboEffectContainer.style.width = '100%'
    comboEffectContainer.style.maxWidth = layoutWidth
    comboEffectContainer.style.position = 'relative'
    comboEffectContainer.style.height = '60px'
    comboEffectContainer.style.marginBottom = '10px'
  }

  // 设置底部按钮区域样式
  footer.style.width = '100%'
  footer.style.maxWidth = layoutWidth
  footer.style.display = 'flex'
  footer.style.justifyContent = 'space-around'
  footer.style.flexWrap = 'wrap'
  footer.style.marginTop = '15px'
  footer.style.zIndex = '10'

  // 横屏模式特殊处理
  if (window.innerWidth > window.innerHeight && window.innerHeight < 500) {
    // 横屏且高度较小时，采用水平布局
    const landscapeBoardSize = Math.min(window.innerHeight * 0.7, 450)
    gameBoard.style.width = `${landscapeBoardSize}px`
    gameBoard.style.height = `${landscapeBoardSize}px`

    if (container) {
      container.style.flexDirection = 'row'
      container.style.flexWrap = 'wrap'
      container.style.justifyContent = 'center'
      container.style.alignItems = 'center'
    }

    header.style.width = '30%'
    header.style.maxWidth = '200px'
    header.style.marginBottom = '0'

    footer.style.width = '30%'
    footer.style.maxWidth = '200px'
    footer.style.flexDirection = 'column'

    // 调整连击显示器
    if (comboEffectContainer) {
      comboEffectContainer.style.position = 'absolute'
      comboEffectContainer.style.top = '0'
      comboEffectContainer.style.left = '0'
      comboEffectContainer.style.width = '100%'
    }
  } else {
    // 竖屏或宽屏模式，恢复垂直布局
    if (container) {
      container.style.flexDirection = 'column'
    }

    header.style.width = '100%'

    footer.style.width = '100%'
    footer.style.flexDirection = 'row'
  }
}
