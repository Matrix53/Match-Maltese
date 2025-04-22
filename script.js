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
const shareRankBtn = document.getElementById('share-rank')
const finalScoreElement = document.getElementById('final-score')
const finalTimeElement = document.getElementById('final-time')
const playerNameInput = document.getElementById('player-name')
const saveScoreBtn = document.getElementById('save-score')
const gameHeader = document.querySelector('.game-header')
const gameFooter = document.querySelector('.game-footer')

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
  const availableCards = Array.from({ length: 56 }, (_, i) => i)
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
      card.addEventListener('transitionstart', function(e) {
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
  ;[firstCard, secondCard] = [null, null]
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

    // 确保奖牌图标大小适当
    ensureMedalSizes()
  }

  rankModal.style.display = 'flex'
}

// 确保奖牌图标大小适当
function ensureMedalSizes() {
  const medals = document.querySelectorAll('.rank-medal')
  medals.forEach(medal => {
    medal.style.width = '20px'
    medal.style.height = '20px'
    medal.style.verticalAlign = 'middle'
    medal.style.marginTop = '-3px' // 微调垂直位置
    
    // 添加一些动画效果
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
    const opacity = 0.3 - (index * 0.05)
    rank.style.backgroundColor = `rgba(255, 187, 123, ${opacity})`
    rank.style.transition = 'all 0.3s ease'
    
    // 添加鼠标悬停效果
    rank.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)'
      this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
    })
    
    rank.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)'
      this.style.boxShadow = 'none'
    })
  })
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
  showNotification('链接已复制到剪贴板')
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
  ensureButtonVisibility()
  
  // 确保宽屏上的布局一致性
  ensureWideScreenLayout()

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

  // 3秒后自动播放背景音乐
  setTimeout(() => {
    bgMusic
      .play()
      .then(() => {
        musicBtn.textContent = '🔊 音乐开'
        musicBtn.classList.add('active')
      })
      .catch((err) => {
        console.log('自动播放音乐失败:', err)
        // 手机浏览器通常需要用户交互才能播放音频
      })
  }, 3000)

  // 初始显示排行榜（用于更新是否为空的状态）
  const leaderboard =
    JSON.parse(localStorage.getItem('dogMatchLeaderboard')) || []
  if (leaderboard.length === 0) {
    emptyRank.style.display = 'block'
  } else {
    emptyRank.style.display = 'none'
  }

  // 监听窗口大小变化，以便调整宽屏布局
  window.addEventListener('resize', ensureWideScreenLayout)

  // 初始化游戏
  initGame()
})

// 确保按钮在所有平台上可见
function ensureButtonVisibility() {
  // 获取所有游戏按钮
  const allButtons = document.querySelectorAll('.game-btn')

  // 强制应用样式确保按钮可见
  allButtons.forEach((button) => {
    // 强制按钮可见
    button.style.display = 'inline-block'
    button.style.visibility = 'visible'
    button.style.opacity = '1'

    // 给按钮添加触摸事件监听器以确保在移动设备上有响应
    button.addEventListener('touchstart', function (e) {
      e.preventDefault() // 防止默认行为
      // 模拟点击按钮
      setTimeout(() => {
        this.click()
      }, 0)
    })
  })

  // 特殊处理底部区域，确保它总是可见的
  const footer = document.querySelector('.game-footer')
  if (footer) {
    footer.style.display = 'flex'
    footer.style.zIndex = '10'

    // 特别针对Edge浏览器的额外处理
    if (
      navigator.userAgent.indexOf('Edge') !== -1 ||
      navigator.userAgent.indexOf('Edg') !== -1
    ) {
      footer.style.position = 'fixed'
      footer.style.bottom = '10px'
      footer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
      footer.style.paddingTop = '5px'
      footer.style.paddingBottom = '5px'
    }
  }

  // 处理游戏板的居中问题，特别是在移动版Edge
  ensureGameBoardCentering()
}

// 确保游戏板在所有浏览器中居中
function ensureGameBoardCentering() {
  // 获取游戏板元素
  const gameBoard = document.querySelector('.game-board')
  if (!gameBoard) return

  // 判断浏览器类型
  const isEdge =
    navigator.userAgent.indexOf('Edge') !== -1 ||
    navigator.userAgent.indexOf('Edg') !== -1
  const isEdgeMobile =
    isEdge &&
    (navigator.userAgent.indexOf('Mobile') !== -1 ||
      navigator.userAgent.indexOf('Android') !== -1 ||
      navigator.userAgent.indexOf('iPhone') !== -1)
  const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1

  // 修改布局结构，确保元素可见性和正确定位
  const container = document.querySelector('.game-container')
  const header = document.querySelector('.game-header')
  const footer = document.querySelector('.game-footer')

  // 应用通用居中样式
  gameBoard.style.position = 'relative'
  gameBoard.style.margin = 'auto'

  // 确保按钮绝对可见
  const allButtons = document.querySelectorAll('.game-btn')
  allButtons.forEach((button) => {
    button.style.display = 'inline-block'
    button.style.visibility = 'visible'
    button.style.opacity = '1'
    button.style.zIndex = '1000'
  })

  if (isEdgeMobile) {
    console.log('Edge Mobile detected, applying special layout')

    // 针对手机版Edge的特殊处理
    // 确保游戏容器占满全屏并提供良好的间距
    if (container) {
      container.style.position = 'relative'
      container.style.height = '100vh'
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.justifyContent = 'space-between'
      container.style.padding = '20px 10px 80px 10px'
    }

    // 确保游戏板居中
    gameBoard.style.position = 'relative'
    gameBoard.style.maxWidth = 'calc(100vw - 30px)'
    gameBoard.style.maxHeight = 'calc(100vh - 240px)'
    gameBoard.style.flexGrow = '0'
    gameBoard.style.marginTop = '10px'
    gameBoard.style.marginBottom = '10px'

    // 确保底部按钮区域可见
    if (footer) {
      footer.style.position = 'relative'
      footer.style.bottom = '0'
      footer.style.width = '100%'
      footer.style.padding = '10px 5px'
      footer.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
      footer.style.marginTop = '20px'
      footer.style.zIndex = '1000'
      footer.style.borderRadius = '15px'
      footer.style.boxShadow = '0 -2px 8px rgba(0, 0, 0, 0.1)'
    }

    // 确保顶部信息栏可见
    if (header) {
      header.style.position = 'relative'
      header.style.top = '0'
      header.style.width = '100%'
      header.style.zIndex = '999'
      header.style.marginBottom = '10px'
    }
  } else if (isFirefox && window.innerWidth < 768) {
    // 针对手机版Firefox的特殊处理
    gameBoard.style.marginTop = '60px'
    gameBoard.style.marginBottom = '60px'

    if (footer) {
      footer.style.position = 'relative'
      footer.style.marginTop = '15px'
    }

    if (header) {
      header.style.position = 'relative'
      header.style.marginBottom = '15px'
    }
  } else {
    // 其他浏览器的通用居中处理
    gameBoard.style.margin = '20px auto'

    if (container) {
      container.style.justifyContent = 'space-between'
      container.style.padding = '20px 10px'
    }

    if (footer) {
      footer.style.position = 'relative'
      footer.style.marginTop = '20px'
    }

    if (header) {
      header.style.position = 'relative'
      header.style.marginBottom = '20px'
    }
  }

  // 应用宽屏布局适配
  ensureWideScreenLayout()

  // 添加窗口大小变化监听器
  window.addEventListener('resize', function () {
    setTimeout(() => {
      // 重新应用布局逻辑，确保窗口改变大小后仍然保持正确的布局
      ensureGameBoardCentering()
      // 重新应用宽屏布局适配
      ensureWideScreenLayout()
    }, 100)
  })
}

// 确保在宽屏上的布局一致性
function ensureWideScreenLayout() {
  if (!gameBoard || !gameHeader || !gameFooter) return;
  
  const gameBoardWidth = gameBoard.offsetWidth;
  
  // 设置顶部和底部区域宽度与游戏区域相同
  if (gameHeader) {
    gameHeader.style.maxWidth = `${gameBoardWidth}px`;
  }
  
  if (gameFooter) {
    gameFooter.style.maxWidth = `${gameBoardWidth}px`;
  }
}
