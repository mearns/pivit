function randomizeTiles (count) {
  const options = new Array(count)
  const tiles = new Array(count)
  for (let i = 0; i < count; i++) {
    options[i] = i
  }
  for (let i = 0; i < count; i++) {
    const r = parseInt(Math.random() * options.length)
    const [tile] = options.splice(r, 1)
    tiles[i] = tile
  }
  return tiles
}

function pivit () {
  const animationDuration = 800
  const animationSteps = 20
  const colors = [
    '#ff0000',
    '#ff8822',
    '#ffbb44',
    '#ffff00',
    '#aaff00',
    '#00ff00',
    '#008888',
    '#0000ff',
    '#8800ff',
    '#ff00ff'
  ]
  let tiles = randomizeTiles(colors.length)

  const tileGeometries = new Array(tiles.length)
  const tileTransformations = new Array(tiles.length)
  let hPad, vPad, tileWidth, tileHeight
  function updateTileGeometries () {
    let x = hPad
    let y = vPad
    for (let i = 0; i < tiles.length; i++) {
      tileGeometries[i] = [x, y, tileWidth, tileHeight]
      x += tileWidth
    }
  }

  const canvas = document.getElementById('pivit')
  const parentEl = canvas.parentElement
  function fitToWindow () {
    document.body.style.height = window.innerHeight + 'px'
    canvas.width = 0.95 * parentEl.clientWidth
    canvas.height = 0.95 * parentEl.clientHeight

    const width = canvas.width
    const height = canvas.height
    hPad = width / 5
    vPad = 2 * (height / 5)
    tileWidth = (width - hPad - hPad) / tiles.length
    tileHeight = height - vPad - vPad
    updateTileGeometries()
    render()
  }
  window.addEventListener('resize', fitToWindow)
  fitToWindow()

  let animationTime = null
  let selectedTile = null
  let selectedSide = null

  function render () {
    window.requestAnimationFrame(() => renderTiles(canvas, tiles, colors, tileGeometries, tileTransformations, animationTime, selectedTile, selectedSide))
  }

  function calculateSelections (event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    selectedTile = null
    selectedSide = null
    for (let i = 0; i < tileGeometries.length; i++) {
      const [left, top, tw, th] = tileGeometries[i]
      const right = left + tw
      if (x >= left && x < right && y >= top && y < top + th) {
        if (x < left + tileWidth / 2) {
          selectedSide = 'left'
        } else {
          selectedSide = 'right'
        }
        selectedTile = i
      }
    }
  }

  function reverseSelection () {
    if (selectedTile === null) {
      return
    }
    let selected, remainder, firstTile, lastTile, onComplete
    if (selectedSide === 'left') {
      selected = tiles.slice(selectedTile).reverse()
      remainder = tiles.slice(0, selectedTile)
      firstTile = selectedTile
      lastTile = tiles.length - 1
      onComplete = () => {
        tiles = [...remainder, ...selected]
      }
    } else {
      selected = tiles.slice(0, selectedTile + 1).reverse()
      remainder = tiles.slice(selectedTile + 1)
      firstTile = 0
      lastTile = selectedTile
      onComplete = () => {
        tiles = [...selected, ...remainder]
      }
    }
    const [left, top, ignore1, h] = tileGeometries[firstTile]
    const [nearRight, ignore2, w] = tileGeometries[lastTile]
    const right = nearRight + w
    const cx = (left + right) / 2
    const cy = top + (h / 2)
    for (let i = firstTile; i <= lastTile; i++) {
      tileTransformations[i] = (ctx, pct) => {
        ctx.translate(cx, cy)
        ctx.rotate(pct * Math.PI)
        ctx.translate(-cx, -cy)
      }
    }
    runTransformationAnimation(onComplete)
  }

  function runTransformationAnimation (onComplete) {
    animationTime = 0
    render()
    const pctStep = 1 / animationSteps
    const interval = animationDuration / animationSteps
    const timer = setInterval(() => {
      animationTime += pctStep
      if (animationTime >= 1.0) {
        clearInterval(timer)
        tileTransformations.fill(null)
        animationTime = null
        onComplete()
      }
      render()
    }, interval)
  }

  canvas.addEventListener('mousemove', event => {
    calculateSelections(event)
    render()
  })

  canvas.addEventListener('mouseout', () => {
    selectedTile = null
    render()
  })

  canvas.addEventListener('click', event => {
    if (animationTime === null) {
      calculateSelections(event)
      reverseSelection()
      render()
    }
  })

  render()
}

function renderTiles (canvas, tiles, colors, tileGeometries, tileTransformations, animationTime, selectedTile, selectedSide) {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)

  ctx.lineWidth = 1
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]
    const tileColor = colors[tile]
    const [left, top, w, h] = tileGeometries[i]
    const xformer = tileTransformations[i]
    ctx.save()
    if (xformer) {
      xformer(ctx, animationTime)
    }

    const gradient = ctx.createLinearGradient(left, top, left, top + h)
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.75)')

    ctx.fillStyle = tileColor
    ctx.fillRect(left, top, w, h)
    ctx.fillStyle = gradient
    ctx.fillRect(left, top, w, h)
    ctx.strokeStyle = '#666666'
    ctx.strokeRect(left, top, w, h)
    ctx.restore()
  }

  if (selectedTile !== null && animationTime === null) {
    const [left, top, w, h] = tileGeometries[selectedTile]

    const gradientDirection = selectedSide === 'right'
      ? [left, top, left + w, top]
      : [left + w, top, left, top]
    const gradient = ctx.createLinearGradient(...gradientDirection)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.9')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')

    ctx.fillStyle = gradient
    ctx.fillRect(left, top, w, h)
  }
}
