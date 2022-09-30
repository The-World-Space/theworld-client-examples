import { Mulberry32 } from "../math/Mulberry32";
import { Vector2 } from "../math/Vector2";
import { Immutable } from "../types/Immutable";
import { LazyWorld } from "./LazyWorld";

class GridCell {
    public x: number;
    public y: number;
    public visited: boolean;
    public readonly walls: [boolean, boolean, boolean, boolean];
    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.walls = [true, true, true, true];
    }
}

export class MazeGenerator {
    private readonly _world: LazyWorld;
    private readonly _spawnedTiles: Immutable<Vector2>[] = [];
    private readonly _spawnedColliders: Immutable<Vector2>[] = [];

    public constructor(world: LazyWorld) {
        this._world = world;
    }

    // Generate a maze using the randomized DFS algorithm.
    public generate(width: number, height: number, offset: Immutable<Vector2>, seed: number): void {
        const random = new Mulberry32(seed);
        const grid: GridCell[][] = [];
        for (let x = 0; x < width; ++x) {
            grid[x] = [];
            for (let y = 0; y < height; ++y) {
                grid[x][y] = new GridCell(x, y);
            }
        }

        const stack: GridCell[] = [];
        const startCell = grid[0][0];
        startCell.visited = true;
        stack.push(startCell);
        while (stack.length > 0) {
            const cell = stack[stack.length - 1];
            const neighbors = this.getNeighbors(grid, cell);
            if (neighbors.length > 0) {
                const neighbor = neighbors[Math.floor(random.next() * neighbors.length)];
                this.removeWalls(cell, neighbor);
                neighbor.visited = true;
                stack.push(neighbor);
            } else {
                stack.pop();
            }
        }

        const blocks = this.gridCellsToBlocks(grid);

        for (let x = 0; x < blocks.length; ++x) {
            for (let y = 0; y < blocks[0].length; ++y) {
                const block = blocks[x][y];
                const xWorld = x + offset.x;
                const yWorld = y + offset.y;
                this._world.setTile(xWorld, yWorld, 40, block ? 1 : 0);
                this._spawnedTiles.push(new Vector2(xWorld, yWorld));
                if (block) {
                    this._world.setCollider(xWorld, yWorld, true);
                    this._spawnedColliders.push(new Vector2(xWorld, yWorld));
                }
            }
        }
    }

    public clear(): void {
        const spawnedTiles = this._spawnedTiles;
        for (let i = 0; i < spawnedTiles.length; ++i) {
            const tile = spawnedTiles[i];
            this._world.deleteTile(tile.x, tile.y);
        }
        spawnedTiles.length = 0;

        const spawnedColliders = this._spawnedColliders;
        for (let i = 0; i < spawnedColliders.length; ++i) {
            const collider = spawnedColliders[i];
            this._world.setCollider(collider.x, collider.y, false);
        }
        spawnedColliders.length = 0;
    }

    private getNeighbors(grid: GridCell[][], cell: GridCell): GridCell[] {
        const neighbors: GridCell[] = [];
        if (cell.x > 0) {
            const neighbor = grid[cell.x - 1][cell.y];
            if (!neighbor.visited) {
                neighbors.push(neighbor);
            }
        }
        if (cell.x < grid.length - 1) {
            const neighbor = grid[cell.x + 1][cell.y];
            if (!neighbor.visited) {
                neighbors.push(neighbor);
            }
        }
        if (cell.y > 0) {
            const neighbor = grid[cell.x][cell.y - 1];
            if (!neighbor.visited) {
                neighbors.push(neighbor);
            }
        }
        if (cell.y < grid[0].length - 1) {
            const neighbor = grid[cell.x][cell.y + 1];
            if (!neighbor.visited) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }

    private removeWalls(cell: GridCell, neighbor: GridCell): void {
        if (neighbor.x < cell.x) {
            cell.walls[0] = false;
            neighbor.walls[1] = false;
        } else if (neighbor.x > cell.x) {
            cell.walls[1] = false;
            neighbor.walls[0] = false;
        } else if (neighbor.y < cell.y) {
            cell.walls[2] = false;
            neighbor.walls[3] = false;
        } else if (neighbor.y > cell.y) {
            cell.walls[3] = false;
            neighbor.walls[2] = false;
        }
    }

    private gridCellsToBlocks(grid: GridCell[][]): boolean[][] {
        const width = grid.length;
        const height = grid[0].length;
        const blocks: boolean[][] = new Array(width * 2 + 1).fill(null).map(_ => new Array(height * 2 + 1));

        for (let x = 0; x < width * 2 + 1; ++x) {
            blocks[x][0] = true;
        }
        for (let y = 0; y < height * 2 + 1; ++y) {
            blocks[0][y] = true;
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                blocks[2 * x + 1][2 * y + 1] = false;
                blocks[2 * x + 2][2 * y + 1] = grid[x][y].walls[1];
                blocks[2 * x + 1][2 * y + 2] = grid[x][y].walls[3];
                blocks[2 * x + 2][2 * y + 2] = true;
            }
        }
        for (let x = 0; x < width * 2 + 1; ++x) {
            blocks[x][height * 2] = true;
        }
        for (let y = 0; y < height * 2 + 1; ++y) {
            blocks[width * 2][y] = true;
        }

        blocks[1][0] = false;
        blocks[width * 2 - 1][height * 2] = false;

        return blocks;
    }
}
