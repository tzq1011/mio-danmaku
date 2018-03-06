type EventData = any;
type EventSpecs = {
  [event: string]: EventData;
}

type EventListener<D extends EventData> = (data: D) => void;

interface EventEmitter<ES extends EventSpecs> {
  on<E extends keyof ES>(event: E, listener: EventListener<ES[E]>): EventEmitter<ES>;
  off<E extends keyof ES>(event: E, listener?: EventListener<ES[E]>): EventEmitter<ES>;
  emit<E extends keyof ES>(event: E, data: ES[E]): void;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

type CommentEvents = {
  rendering: null,
  renderingCanceled: null,
  renderingFinished: null,
  renderingEnded: null,
}

interface Comment {
  readonly instanceId: string;
  readonly events: EventEmitter<CommentEvents>;
  readonly time: number;
  readonly extra: object;
}

interface CommentTextTrait {
  readonly text: string;
  readonly fontSize: number;
  readonly fontColor: string;
}

interface CommentPositionXTrait {
  readonly positionX: number;
}

interface CommentPositionYTrait {
  readonly positionY: number;
}

interface CommentHorizontalAlignmentTrait {
  readonly horizontalAlignment: "left" | "center" | "right";
}

interface CommentVerticalAlignmentTrait {
  readonly verticalAlignment: "top" | "middle" | "bottom";
}

interface CommentStackingTrait {
  readonly stackingDirection: "up" | "down";
}

interface CommentScrollingTrait {
  readonly scrollingDirection: "left" | "right";
}

interface CommentLifetimeTrait {
  readonly lifetime: number;
}

type StackingComment =
  & Comment
  & CommentTextTrait
  & CommentHorizontalAlignmentTrait
  & CommentStackingTrait
  & CommentLifetimeTrait;

type ScrollingComment =
  & Comment
  & CommentTextTrait
  & CommentStackingTrait
  & CommentScrollingTrait;

type PositioningComment =
  & Comment
  & CommentTextTrait
  & CommentPositionXTrait
  & CommentPositionYTrait
  & CommentLifetimeTrait;

type CommentFilter = (comment: Comment) => boolean;

type CommentPoolEvents = {
  loaded: { comments: Comment[] };
  added: { index: number, comment: Comment },
  removed: { index: number, comment: Comment },
  cleared: { comments: Comment[] },
  filterAdded: { filter: CommentFilter },
  filterRemoved: { filter: CommentFilter },
}

interface CommentPool {
  readonly comments: ReadonlyArray<Comment>;
  readonly filters: ReadonlyArray<CommentFilter>;
  readonly events: EventEmitter<CommentPoolEvents>;
  load(comments: Comment[]): void;
  add(comment: Comment): void;
  has(comment: Comment): void;
  remove(comment: Comment): boolean;
  clear(): void;
  getByTime(startTime: number, endTime: number): Comment[];
  addFilter(filter: CommentFilter): void;
  hasFilter(filter: CommentFilter): boolean;
  removeFilter(filter: CommentFilter): boolean;
  clearFilters(): void;
}

interface Stage {
  readonly width: number;
  readonly height: number;
  readonly marginTop: number;
  readonly marginBottom: number;
}

interface StackingPlan {
  readonly topY: number;
  readonly bottomY: number;
  readonly isCanceled: boolean;
  cancel(): void;
}

interface StackingPlanner {
  stage: Stage;
  readonly direction: "up" | "down";
  plan(blockHeight: number): StackingPlan;
}

interface ScrollingPlan {
  readonly fromX: number;
  readonly toX: number;
  readonly speed: number;
  readonly duration: number;
}

interface ScrollingPlanner {
  stage: Stage;
  basicSpeed: number;
  extraSpeedPerPixel: number;
  readonly direction: "left" | "right";
  plan(blockWidth: number): ScrollingPlan;
}

interface CommentView {
  readonly isDestroyed: boolean;
  measure(): Dimensions;
  locate(): Position;
  destroy(): void;
}

type RendererState =
  | "idle"
  | "running"
  | "paused";

type RendererEvents = {
  idle: null,
  running: null,
  paused: null,
};

interface Renderer {
  stage: Stage;
  commentOpacity: number;
  commentFontFamily: string | string[];
  commentLineHeight: number;
  commentTextShadow: Shadow | null;
  commentScrollingBasicSpeed: number;
  commentScrollingExtraSpeedPerPixel: number;
  readonly state: RendererState;
  readonly events: EventEmitter<RendererEvents>;
  readonly stageElement: HTMLElement;
  run(): void;
  pause(): void;
  stop(): void;
  renderComment(comment: Comment): CommentView;
  unrenderComment(comment: Comment): void;
  isCommentRendering(comment: Comment): boolean;
  getRenderingComments(): Comment[];
  getCommentView(comment: Comment): CommentView | null;
}

type DOMOperation<R = any> = (...args: any[]) => R;

interface DOMOperator {
  measure<R>(operation: DOMOperation<R>): Promise<R>;
  mutate<R>(operation: DOMOperation<R>): Promise<R>;
  cancel(operation: DOMOperation): void;
}

type CSSScrollingAnimationState =
  | "idle"
  | "running"
  | "paused"
  | "canceled"
  | "finished";

interface CSSScrollingAnimationEvents {
  running: null,
  runningStrict: null,
  paused: null,
  canceled: null,
  finished: null,
  ended: null,
}

interface CSSScrollingAnimation {
  readonly state: CSSScrollingAnimationState;
  readonly isPending: boolean;
  readonly events: EventEmitter<CSSScrollingAnimationEvents>
  readonly element: HTMLElement;
  readonly duration: number;
  readonly fromX: number;
  readonly toX: number;
  readonly elapsedTime: number;
  readonly currentX: number;
  run(): void;
  pause(): void;
  cancel(): void;
}

type CSSRenderer = Renderer;

type TimerState =
  | "idle"
  | "running"
  | "paused"
  | "canceled"
  | "finished";

type TimerEvents = {
  running: null,
  paused: null,
  canceled: null,
  finished: null,
  ended: null,
};

interface Timer {
  readonly state: TimerState;
  readonly events: EventEmitter<TimerEvents>;
  readonly duration: number;
  readonly elapsedTime: number;
  run(): void;
  pause(): void;
  cancel(): void;
}

type TimeGetter = () => number;

type PlayerState =
  | "idle"
  | "playing"
  | "paused";

type PlayerEvents = {
  idle: null,
  playing: null,
  paused: null,
};

interface Player {
  stage: Stage;
  renderer: Renderer;
  readonly state: PlayerState;
  readonly events: EventEmitter<PlayerEvents>;
  readonly element: HTMLElement;
  readonly timeGetter: TimeGetter;
  readonly commentPool: CommentPool;
  play(): void;
  pause(): void;
  stop(): void;
}

export {
  EventListener,
  EventSpecs,
  EventEmitter,
  Dimensions,
  Position,
  Shadow,
  CommentEvents,
  Comment,
  CommentTextTrait,
  CommentPositionXTrait,
  CommentPositionYTrait,
  CommentHorizontalAlignmentTrait,
  CommentVerticalAlignmentTrait,
  CommentStackingTrait,
  CommentScrollingTrait,
  CommentLifetimeTrait,
  StackingComment,
  ScrollingComment,
  PositioningComment,
  CommentFilter,
  CommentPoolEvents,
  CommentPool,
  Stage,
  StackingPlan,
  StackingPlanner,
  ScrollingPlan,
  ScrollingPlanner,
  CommentView,
  RendererState,
  RendererEvents,
  Renderer,
  DOMOperation,
  DOMOperator,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
  CSSScrollingAnimation,
  CSSRenderer,
  TimerState,
  TimerEvents,
  Timer,
  TimeGetter,
  PlayerState,
  PlayerEvents,
  Player,
};
