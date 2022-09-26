export interface IWorld {
    setTile(x: number, y: number, atlasId: number, atlasIndex: number, isEffect: boolean): void;
    deleteTile(x: number, y: number, isEffect: boolean): void;
    setCollider(x: number, y: number, isBlocked: boolean): void;
}
