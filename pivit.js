function pivit () {
  const canvas = document.getElementById('pivit')

  let tiles = [3, 1, 2, 4, 9, 6, 8, 0, 5, 7]
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

  const width = canvas.width
  const height = canvas.height
  const hPad = width / 5
  const vPad = 2 * (height / 5)
  const tileWidth = (width - hPad - hPad) / tiles.length
  const tileHeight = height - vPad - vPad

  const tileGeometries = new Array(tiles.length)
  const tileTransformations = new Array(tiles.length)
  function updateTileGeometries () {
    let x = hPad
    let y = vPad
    for (let i = 0; i < tiles.length; i++) {
      tileGeometries[i] = [x, y, tileWidth, tileHeight]
      x += tileWidth
    }
  }
  updateTileGeometries()

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

    animationTime = 0
    render()
    const step = 1 / 50
    const timer = setInterval(() => {
      animationTime += step
      render()
      if (animationTime >= 1.0) {
        clearInterval(timer)
        for (let i = firstTile; i <= lastTile; i++) {
          tileTransformations[i] = null
        }
        animationTime = null
        onComplete()
        render()
      }
    }, 10)
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
    ctx.fillStyle = tileColor
    ctx.strokeStyle = '#666666'
    ctx.fillRect(left, top, w, h)
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
