function pivit () {
  const canvas = document.getElementById('pivit')

  // const tiles = [3, 1, 2, 4, 9, 6, 8, 0, 5, 7]
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
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
  let cursorPosition = null

  function render () {
    renderTiles(canvas, tiles, colors, cursorPosition)
  }

  canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect()
    cursorPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    render()
  })

  canvas.addEventListener('mouseout', () => {
    cursorPosition = null
    render()
  })

  render()
}

function renderTiles (canvas, tiles, colors, cursorPosition) {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const hPad = width / 5
  const vPad = 2 * (height / 5)
  const tileWidth = (width - hPad - hPad) / tiles.length
  const tileHeight = height - vPad - vPad

  const tileGeometries = new Array(tiles.length)
  let selectedTile = null
  let selectedSide;
  let x = hPad
  let y = vPad
  ctx.lineWidth = 1
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]
    const tileColor = colors[tile]
    ctx.fillStyle = tileColor
    ctx.fillRect(x, y, tileWidth, tileHeight)
    ctx.strokeStyle = '#666666'
    ctx.strokeRect(x, y, tileWidth, tileHeight)
    tileGeometries[i] = [
      [x, y],
      [x + tileWidth, y],
      [x + tileWidth, y + tileHeight],
      [x, y + tileHeight]
    ]
    if (cursorPosition && cursorPosition.x >= x && cursorPosition.x < x + tileWidth) {
      if (cursorPosition.x < x + tileWidth / 2) {
        selectedSide = 'left'
      } else {
        selectedSide = 'right'
      }
      selectedTile = i
    }

    x += tileWidth
  }

  if (selectedTile !== null) {
    const [firstPoint, ...points] = tileGeometries[selectedTile]

    const gradientDirection = selectedSide === 'right'
      ? [firstPoint[0], firstPoint[1], points[0][0], firstPoint[1]]
      : [points[0][0], firstPoint[1], firstPoint[0], firstPoint[1]]
    const gradient = ctx.createLinearGradient(...gradientDirection)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.9')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)')

    ctx.fillStyle = gradient
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(...firstPoint)
    points.forEach(pt => ctx.lineTo(...pt))
    ctx.lineTo(...firstPoint)
    ctx.fill()
  }
}
