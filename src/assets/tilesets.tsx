import _overworld from 'gfx/tilesets/overworld.png'
import _overworldCollisions from 'gfx/tilesets/overworld.tilecoll'
import _cemetery from 'gfx/tilesets/cemetery.png'
import { Texture, BaseTexture, Rectangle } from 'pixi.js'
import { ObjectOf } from 'utils/types'
import { loop } from 'utils/render'
import { Point } from 'utils/point'
import { parseHexData } from './utils'
import { getTextureLocationHexes, blocksetData } from './blocksets'

type Asset = typeof _overworld

const cutTexture = (baseTexture: BaseTexture) => (
  x = 0,
  y = 0,
  width = 1,
  height = 1,
) => {
  const tx = new Texture(baseTexture)
  tx.frame = new Rectangle(x, y, width, height)
  return tx
}

const overworldCollisions = parseHexData(_overworldCollisions.slice(0, -1))

const getSegment = (hex: number, blocks: ReturnType<typeof getBlockTextures>) => {
  return loop(4, 4, (y, x) => ({ x: x * 8, y: y * 8 })).map((position, i) => {
    return {
      ...blocks[i],
      position: position as Point,
    }
  })
}

export type Segment = ReturnType<typeof getSegment>

const getTileType = (blocksetName: string, id: number) => {
  if (blocksetName === 'OVERWORLD') {
    switch (id) {
      case 3:
        return 'flower'
      case 20:
        return 'water'
      default:
        return undefined
    }
  }
}

type TileType = ReturnType<typeof getTileType>

const getBlockTextures = (
  hex: number,
  baseTexture: BaseTexture,
  blocksetName: string,
) => {
  const ids = getTextureLocationHexes(hex, blocksetName)
  return ids.map(num => {
    const px = num * 8
    return {
      texture: cutTexture(baseTexture)(
        px % baseTexture.width,
        Math.floor(px / baseTexture.width) * 8,
        8,
        8,
      ),
      type: getTileType(blocksetName, num) as TileType,
    }
  })
}

const makeTexture = (asset: Asset, name: string) => {
  const { baseTexture } = Texture.fromImage(asset.src)
  // Seems like pixi do not read b64 image dimensions correctly
  baseTexture.width = asset.width
  baseTexture.height = asset.height

  return {
    ...asset,
    baseTexture,
    cutTexture: cutTexture(baseTexture),
    getBlock: (hex: number) =>
      getSegment(hex, getBlockTextures(hex, baseTexture, name)),
    getBlockCollisions: (hex: number) =>
      // WIP: Collisions data should be based on 'name' param
      getTextureLocationHexes(hex, name).map(id => overworldCollisions.includes(id)),
  }
}

export const DEFAULT_TILESET_NAME = 'OVERWORLD'

export const TILESETS: ObjectOf<ReturnType<typeof makeTexture>> = {
  [DEFAULT_TILESET_NAME]: makeTexture(_overworld, DEFAULT_TILESET_NAME),
  CEMETERY: makeTexture(_cemetery, 'CEMETERY'),
}
// console.log(TILESETS.OVERWORLD)
export const tilesetData = {
  overworld: {
    collisions: _overworldCollisions.slice(0, -1),
    blockset: blocksetData.overworld,
  },
}

export type TilesetsData = ObjectOf<typeof tilesetData.overworld>
