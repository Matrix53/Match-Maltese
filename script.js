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
const rankList = document.getElementById('rank-list')
const emptyRank = document.getElementById('empty-rank')
const closeRankBtn = document.getElementById('close-rank')
const finalScoreElement = document.getElementById('final-score')
const finalTimeElement = document.getElementById('final-time')
const playerNameInput = document.getElementById('player-name')
const saveScoreBtn = document.getElementById('save-score')

// 音效元素
const scoreSound = document.getElementById('score-sound')
const winSound = document.getElementById('win-sound')

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

// 初始化游戏
function initGame() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)
  cards = []
  score = 0
  timeElapsed = 0
  matchedPairs = 0
  lockBoard = false
  firstCard = null
  secondCard = null
  currentPotentialScore = 200

  // 更新显示
  scoreElement.textContent = score
  timeElement.textContent = timeElapsed

  // 清空游戏板
  gameBoard.innerHTML = ''

  // 创建卡片
  createCards()

  // 启动计时器
  gameTimer = setInterval(() => {
    timeElapsed++
    timeElement.textContent = timeElapsed
  }, 1000)

  // 启动分数递减计时器
  scoreTimer = setInterval(() => {
    if (currentPotentialScore > 1) {
      currentPotentialScore--
    }
  }, 1000)
}

// 创建卡片
function createCards() {
  // 随机选择8种图片
  const availableCards = Array.from({ length: 15 }, (_, i) => i + 1)
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

  // 创建卡片元素
  cardPairs.forEach((cardId, index) => {
    const card = document.createElement('div')
    card.classList.add('card')
    card.dataset.card = cardId

    const cardInner = document.createElement('div')
    cardInner.classList.add('card-inner')
    cardInner.style.transformStyle = 'preserve-3d' // Firefox fix

    const cardFront = document.createElement('div')
    cardFront.classList.add('card-front')
    // Firefox fix for backface visibility
    cardFront.style.backfaceVisibility = 'hidden'
    cardFront.style.webkitBackfaceVisibility = 'hidden'

    const cardImage = document.createElement('img')
    cardImage.src = `images/card${cardId}.jpeg`
    cardImage.alt = `Card ${cardId}`

    const cardBack = document.createElement('div')
    cardBack.classList.add('card-back')
    // Firefox fix for backface visibility
    cardBack.style.backfaceVisibility = 'hidden'
    cardBack.style.webkitBackfaceVisibility = 'hidden'

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
  // 添加得分
  score += currentPotentialScore
  scoreElement.textContent = score

  // 播放得分音效
  scoreSound.play()

  // 显示加分动画
  const scorePopup = document.createElement('div')
  scorePopup.classList.add('score-popup')
  scorePopup.textContent = `+${currentPotentialScore}`

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

  // 清除动画元素
  setTimeout(() => {
    gameBoard.removeChild(scorePopup)
  }, 1500)

  // 重置当前分数计算器
  currentPotentialScore = 200

  // 检查游戏是否结束
  matchedPairs++
  if (matchedPairs === 8) {
    setTimeout(() => {
      endGame()
    }, 1000)
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
  [firstCard, secondCard] = [null, null]
  lockBoard = false
}

// 结束游戏
function endGame() {
  clearInterval(gameTimer)
  clearInterval(scoreTimer)

  // 播放胜利音效
  winSound.play()

  // 显示最终分数和时间
  finalScoreElement.textContent = score
  finalTimeElement.textContent = timeElapsed

  // 显示胜利模态框
  winModal.style.display = 'flex'
}

// 保存分数
function saveScore() {
  const playerName = playerNameInput.value.trim() || '匿名'
  
  // 获取现有排行榜
  let leaderboard = JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  
  // 添加新分数
  leaderboard.push({
    name: playerName,
    score: score,
    time: timeElapsed,
    date: new Date().toISOString()
  })
  
  // 按分数从高到低排序，分数相同时按时间从短到长排序
  leaderboard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // 首先按分数降序
    }
    return a.time - b.time; // 分数相同时按时间升序
  })
  
  // 只保留前10名
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10)
  }
  
  // 保存到本地存储
  localStorage.setItem('dogMatchLeaderboard', JSON.stringify(leaderboard))
  
  // 关闭胜利模态框并显示排行榜
  winModal.style.display = 'none'
  showLeaderboard()
}

// 显示排行榜
function showLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  
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
      rankHTML += `
        <div class="rank-item ${index < 3 ? 'top-rank' : ''}">
          <span class="rank-col">${index + 1}</span>
          <span class="rank-col">${entry.name}</span>
          <span class="rank-col">${entry.score}</span>
          <span class="rank-col">${entry.time}秒</span>
        </div>
      `
    })
    
    rankList.innerHTML = rankHTML
  }
  
  rankModal.style.display = 'flex'
}

// 控制音乐
function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play()
    musicBtn.textContent = '🔊 音乐开'
    musicBtn.classList.add('active')
  } else {
    bgMusic.pause()
    musicBtn.textContent = '🔈 音乐关'
    musicBtn.classList.remove('active')
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 确保按钮在所有平台上可见
  ensureButtonVisibility();

  // 绑定按钮事件
  startBtn.addEventListener('click', initGame)
  musicBtn.addEventListener('click', toggleMusic)
  rankBtn.addEventListener('click', showLeaderboard)
  closeRankBtn.addEventListener('click', () => rankModal.style.display = 'none')
  saveScoreBtn.addEventListener('click', saveScore)
  
  // 3秒后自动播放背景音乐
  setTimeout(() => {
    bgMusic.play().then(() => {
      musicBtn.textContent = '🔊 音乐开'
      musicBtn.classList.add('active')
    }).catch(err => {
      console.log('自动播放音乐失败:', err)
      // 手机浏览器通常需要用户交互才能播放音频
    })
  }, 3000)

  // 初始显示排行榜（用于更新是否为空的状态）
  const leaderboard = JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  if (leaderboard.length === 0) {
    emptyRank.style.display = 'block'
  } else {
    emptyRank.style.display = 'none'
  }

  // 初始化游戏
  initGame()
})

// 确保按钮在所有平台上可见
function ensureButtonVisibility() {
  // 获取所有游戏按钮
  const allButtons = document.querySelectorAll('.game-btn');
  
  // 强制应用样式确保按钮可见
  allButtons.forEach(button => {
    // 强制按钮可见
    button.style.display = 'inline-block';
    button.style.visibility = 'visible';
    button.style.opacity = '1';
    
    // 给按钮添加触摸事件监听器以确保在移动设备上有响应
    button.addEventListener('touchstart', function(e) {
      e.preventDefault(); // 防止默认行为
      // 模拟点击按钮
      setTimeout(() => {
        this.click();
      }, 0);
    });
  });
  
  // 特殊处理底部区域，确保它总是可见的
  const footer = document.querySelector('.game-footer');
  if (footer) {
    footer.style.display = 'flex';
    footer.style.zIndex = '10';
    
    // 特别针对Edge浏览器的额外处理
    if (navigator.userAgent.indexOf('Edge') !== -1 || navigator.userAgent.indexOf('Edg') !== -1) {
      footer.style.position = 'fixed';
      footer.style.bottom = '10px';
      footer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      footer.style.paddingTop = '5px';
      footer.style.paddingBottom = '5px';
    }
  }
  
  // 处理游戏板的居中问题，特别是在移动版Edge
  ensureGameBoardCentering();
}

// 确保游戏板在所有浏览器中居中
function ensureGameBoardCentering() {
  // 获取游戏板元素
  const gameBoard = document.querySelector('.game-board');
  if (!gameBoard) return;
  
  // 判断浏览器类型
  const isEdge = navigator.userAgent.indexOf('Edge') !== -1 || navigator.userAgent.indexOf('Edg') !== -1;
  const isEdgeMobile = isEdge && navigator.userAgent.indexOf('Mobile') !== -1;
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  
  // 应用通用居中样式
  gameBoard.style.position = 'relative';
  gameBoard.style.margin = 'auto';
  
  if (isEdgeMobile) {
    // 针对手机版Edge的特殊处理
    gameBoard.style.position = 'absolute';
    gameBoard.style.top = '50%';
    gameBoard.style.left = '50%';
    gameBoard.style.transform = 'translate(-50%, -50%)';
    
    // 确保游戏容器也居中对齐
    const container = document.querySelector('.game-container');
    if (container) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.height = '100vh';
    }
    
    // 调整顶部信息栏，确保它不会与游戏板重叠
    const header = document.querySelector('.game-header');
    if (header) {
      header.style.position = 'absolute';
      header.style.top = '10px';
      header.style.zIndex = '5';
    }
    
    // 调整底部按钮，确保它们可见
    const footer = document.querySelector('.game-footer');
    if (footer) {
      footer.style.position = 'absolute';
      footer.style.bottom = '10px';
      footer.style.zIndex = '5';
    }
  } else if (isFirefox && window.innerWidth < 768) {
    // 针对手机版Firefox的特殊处理
    gameBoard.style.marginTop = '80px'; // 给顶部留出空间
    gameBoard.style.marginBottom = '80px'; // 给底部留出空间
  }

  // 在窗口大小改变时重新应用居中
  window.addEventListener('resize', function() {
    // 短暂延迟以确保所有布局计算完成
    setTimeout(() => {
      // 重新应用居中逻辑
      if (isEdgeMobile) {
        gameBoard.style.position = 'absolute';
        gameBoard.style.top = '50%';
        gameBoard.style.left = '50%';
        gameBoard.style.transform = 'translate(-50%, -50%)';
      }
    }, 100);
  });
  
  // 在页面加载完成后再次应用居中，确保所有资源都已加载
  window.addEventListener('load', function() {
    if (isEdgeMobile) {
      gameBoard.style.position = 'absolute';
      gameBoard.style.top = '50%';
      gameBoard.style.left = '50%';
      gameBoard.style.transform = 'translate(-50%, -50%)';
    }
  });
}
