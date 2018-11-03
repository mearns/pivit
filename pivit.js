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
  renderTiles(canvas, tiles, colors)
}

function renderTiles (canvas, tiles, colors) {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const hPad = width / 5
  const vPad = 2 * (height / 5)
  const tileWidth = (width - hPad - hPad) / tiles.length
  const tileHeight = height - vPad - vPad

  let x = hPad
  let y = vPad
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]
    const tileColor = colors[tile]
    ctx.fillStyle = tileColor
    ctx.strokeStyle = '#666666'
    ctx.fillRect(x, y, tileWidth, tileHeight)
    ctx.strokeRect(x, y, tileWidth, tileHeight)
    x += tileWidth
  }
}
