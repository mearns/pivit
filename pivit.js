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
  function updateTileGeometries () {
    let x = hPad
    let y = vPad
    for (let i = 0; i < tiles.length; i++) {
      tileGeometries[i] = [
        [x, y],
        [x + tileWidth, y],
        [x + tileWidth, y + tileHeight],
        [x, y + tileHeight]
      ]
      x += tileWidth
    }
  }
  updateTileGeometries()

  let selectedTile = null
  let selectedSide = null
  let rotate = false

  function render () {
    window.requestAnimationFrame(() => renderTiles(canvas, tiles, colors, tileGeometries, selectedTile, selectedSide, rotate))
  }

  function calculateSelections (event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    selectedTile = null
    selectedSide = null
    // const y = event.clientY - rect.top
    for (let i = 0; i < tileGeometries.length; i++) {
      // FIXME: proper collision detection for non-rectangles
      const tileLeft = tileGeometries[i][0][0]
      const tileRight = tileGeometries[i][1][0]
      if (x >= tileLeft && x < tileRight) {
        if (x < tileLeft + tileWidth / 2) {
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
    if (selectedSide === 'left') {
      const selected = tiles.slice(selectedTile).reverse()
      const remainder = tiles.slice(0, selectedTile)
      tiles = [...remainder, ...selected]
    } else {
      const selected = tiles.slice(0, selectedTile + 1).reverse()
      const remainder = tiles.slice(selectedTile + 1)
      tiles = [...selected, ...remainder]
    }
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
    rotate = true
    calculateSelections(event)
    reverseSelection()
    render()
  })

  render()
}

function renderTiles (canvas, tiles, colors, tileGeometries, selectedTile, selectedSide, rotate) {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)

  ctx.save()
  ctx.translate(...tileGeometries[3][0])
  if (rotate) {
    ctx.rotate(Math.PI / 3)
  }
  ctx.translate(-tileGeometries[3][0][0], -tileGeometries[3][0][1])

  ctx.lineWidth = 1
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]
    const tileColor = colors[tile]

    const [firstPoint, ...points] = tileGeometries[i]
    ctx.beginPath()
    ctx.moveTo(...firstPoint)
    points.forEach(pt => ctx.lineTo(...pt))
    ctx.lineTo(...firstPoint)

    ctx.fillStyle = tileColor
    ctx.strokeStyle = '#666666'
    ctx.fill()
    ctx.stroke()
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
  ctx.restore()
}
