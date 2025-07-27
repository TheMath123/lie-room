export type SerializedEither<L, R> = {
  _tag: 'Left' | 'Right';
  value: L | R;
};

export type Either<L, R> = SerializedLeft<L, R> | SerializedRight<L, R>;

export interface SerializedLeft<L, _R> {
  _tag: 'Left';
  value: L;
}

export interface SerializedRight<_L, R> {
  _tag: 'Right';
  value: R;
}

// functions.ts
export const left = <L, R>(value: L): Either<L, R> => ({
  _tag: 'Left',
  value,
});

export const right = <L, R>(value: R): Either<L, R> => ({
  _tag: 'Right',
  value,
});

export const isLeft = <L, R>(
  either: Either<L, R>,
): either is SerializedLeft<L, R> => either._tag === 'Left';

export const isRight = <L, R>(
  either: Either<L, R>,
): either is SerializedRight<L, R> => either._tag === 'Right';
