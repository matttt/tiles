import { useState, useEffect, cloneElement } from 'react'

interface GameProps {
    sideLength: number;
}

interface Tile {
    i: number
    j: number
    layers: Set<number>
}

const BLACK = '#080705';
const LICORICE = '#362023';
const PURPLE = '#700548'
const LAVENDER = '#7272AB'
const BLUE = '#7899D4'

interface GenerateTilesInput {
    cols: number,
    rows: number
}
function generateTiles({ cols, rows }: GenerateTilesInput): Tile[] {
    const tiles: Tile[] = []
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const tile = {
                i,
                j,
                layers: new Set<number>()
            }
            tiles.push(tile)
        }
    }
    return tiles

}

interface GenerateSquiggleInput {
    width: number
    numSquiggles?: number
    squiggleDivider?: number
    widthDivider?: number
    stroke?: string
    squiggleOffset?: number
    fill?: string
}

function generateSquiggle({ width, numSquiggles = 16, squiggleDivider = 48, widthDivider = 4, stroke = PURPLE, squiggleOffset = 0, fill = 'none' }: GenerateSquiggleInput) {
    let squigglePath = "";

    const numPoints = 500;
    for (let i = 0; i <= numPoints; i++) {
        const angle = Math.PI * 2 / numPoints * i;
        const radius = Math.sin(angle * numSquiggles + squiggleOffset) * width / squiggleDivider + width / widthDivider;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            squigglePath += `M ${x} ${y} `;
        } else {
            squigglePath += `L ${x} ${y} `;
        }
    }

    return <path
        transform={`translate(${+width / 2}, ${width / 2})`}
        d={squigglePath}
        fill={fill}
        stroke={stroke}
        strokeWidth={1} />
}

interface GenerateTileLayersInput {
    width: number
}
export function generateTileLayers({ width }: GenerateTileLayersInput) {
    const outerSquiggle = generateSquiggle({ width, numSquiggles: 16, squiggleDivider: 48, widthDivider: 2.5, stroke: 'none', squiggleOffset: Math.PI / 2, fill: BLUE })
    const outerSquiggle2 = generateSquiggle({ width, numSquiggles: 16, squiggleDivider: 48, widthDivider: 2.3, stroke: LAVENDER, squiggleOffset: Math.PI / 2, fill: 'none' })
    const centerSquiggleLayer = generateSquiggle({ width, numSquiggles: 4, squiggleDivider: 24, widthDivider: 12, stroke: PURPLE, squiggleOffset: Math.PI / 2, fill: BLUE })
    const anothaOneLayer = generateSquiggle({ width, numSquiggles: 4, squiggleDivider: 24, widthDivider: 6, stroke: PURPLE, fill: 'E7E7E7', squiggleOffset: Math.PI / 2 })
    const anothaOne2Layer = generateSquiggle({ width, numSquiggles: 4, squiggleDivider: -8, widthDivider: 4, stroke: 'none', fill: LAVENDER, squiggleOffset: Math.PI / 2 })
    const anothaOne22Layer = generateSquiggle({ width, numSquiggles: 4, squiggleDivider: -8, widthDivider: 5.5, stroke: 'white', fill: BLUE, squiggleOffset: Math.PI / 2 })
    const anothaOne3Layer = generateSquiggle({ width, numSquiggles: 4, squiggleDivider: -7.5, widthDivider: 6, stroke: PURPLE, fill: 'E7E7E7', squiggleOffset: Math.PI / 2 + Math.PI })
    const anothaOne4Layer = generateSquiggle({ width, numSquiggles: 0, squiggleDivider: 5, widthDivider: 6, stroke: PURPLE, fill: 'E7E7E7', squiggleOffset: Math.PI / 2 + Math.PI })

    const biggerSquiggleLayer = generateSquiggle({ width, widthDivider: 3.5, squiggleOffset: Math.PI / 2 })

    const layers = [outerSquiggle, centerSquiggleLayer, anothaOneLayer, anothaOne2Layer, anothaOne3Layer, biggerSquiggleLayer]

    // add key attributes to each layer, which are jsx elements

    return layers.map((layer, i) => {
        return cloneElement(layer, { key: i })
    })
}

interface GenerateTileElementsInput {
    tiles: Tile[]
    sideLength: number
    cols: number
    rows: number
    layers: any[],
    onClick: (tile: Tile) => void,
    selected: Tile[]
}
function generateTileElements({
    tiles,
    sideLength,
    cols,
    rows,
    layers,
    onClick,
    selected
}: GenerateTileElementsInput) {
    const tileElements = []
    const squareSize = ((sideLength - 2) / (rows - 1))
    for (const tile of tiles) {
        const x = tile.i * squareSize + 1
        const y = tile.j * squareSize + 1
        const tileLayers = layers.filter((_, i) => tile.layers.has(i))

        let classes = 'hover:brightness-90'

        if (selected.find(t => t.i === tile.i && t.j === tile.j)) {
            classes += ' brightness-90'
        }

        // lets get a checkered pattern going
        const fill = (tile.i + tile.j) % 2 === 0 ? 'white' : 'EEEEEE'

        const tileElement = <g key={`${tile.i}${tile.j}`} onClick={() => onClick(tile)} fill={'white'} className={classes} transform={`translate(${x},${y})`} stroke="black">
            <rect width={squareSize} height={squareSize} fill={'white'} stroke="black" />
            {tileLayers}
        </g>
        tileElements.push(tileElement)
    }
    return tileElements

}

// find a pair of tiles
function getTilePair(tiles: Tile[]) {
    const tile1 = tiles[Math.floor(Math.random() * tiles.length)]
    const tile2 = tiles[Math.floor(Math.random() * tiles.length)]
    if (tile1 === tile2) return getTilePair(tiles)
    return [tile1, tile2]
}

function addLayerPair(tiles: Tile[], layers: any[]) {
    const newLayerIdx = Math.floor(Math.random() * layers.length)

    const [tile1, tile2] = getTilePair(tiles)

    if (tile1.layers.has(newLayerIdx) || tile2.layers.has(newLayerIdx)) {
        return addLayerPair(tiles, layers)
    }

    for (const t of tiles) {
        if (t === tile1 || t === tile2) {
            t.layers.add(newLayerIdx)
        }
    }

}

const COLS = 5, ROWS = 6;

export function Game({ sideLength }: GameProps) {
    const outerStyle = { width: sideLength, height: sideLength * (6 / 5) }

    const layers = generateTileLayers({ width: sideLength / (ROWS - 1) })
    const initTiles = generateTiles({ cols: COLS, rows: ROWS });

    for (let i = 0; i < 50; i++) {
        addLayerPair(initTiles, layers)
    }

    const [tiles, setTiles] = useState(initTiles)
    const [selected, setSelected] = useState<Tile[]>([])
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    function onClick(tile: Tile) {
        if (selected.length === 0) {
            setSelected([...selected, tile])
        } else if (selected.length === 1 && tile !== selected[0]) {
            setSelected([...selected, tile])

            for (const l of Array.from(selected[0].layers)) {
                if (tile.layers.has(l)) {
                    const newTiles = tiles.map(t => {
                        if (t === selected[0] || t === tile) {
                            t.layers.delete(l)
                        }
                        return t
                    })

                    break;
                }
            }
            
            setTiles(tiles=>tiles)
            setTimeout(() => {
                setSelected(selected => [selected[1]])
            }, 500)
        }
    }

    const tileElements = generateTileElements({ tiles, sideLength, cols: COLS, rows: ROWS, layers, onClick, selected })

    return isClient && <div className='border'>
        <svg style={outerStyle}>
            {tileElements}
        </svg>
    </div>
}