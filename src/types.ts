type EventData = any;

interface EventSpecs {
  [event: string]: any;
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
  readonly offsetX: number;
  readonly offsetY: number;
  readonly blur: number;
  readonly color: string;
}

interface Border {
  readonly width: number;
  readonly color: string;
}

type VerticalSpaceFilter = (topY: number, bottomY: number) => boolean;

interface CommentEvents {
  rendering: null;
  renderingCanceled: null;
  renderingFinished: null;
  renderingEnded: null;
}

interface Comment {
  readonly instanceId: string;
  readonly events: EventEmitter<CommentEvents>;
  readonly time: number;
  readonly data: object;
  readonly isOwn: boolean;
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

interface CommentPoolEvents {
  loaded: { comments: Comment[] };
  added: { index: number, comment: Comment };
  removed: { index: number, comment: Comment };
  cleared: { comments: Comment[] };
  filterAdded: { filter: CommentFilter };
  filterRemoved: { filter: CommentFilter };
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
  getByTime(startTime: number, endTime: number, limit: number): Comment[];
  addFilter(filter: CommentFilter): void;
  hasFilter(filter: CommentFilter): boolean;
  removeFilter(filter: CommentFilter): boolean;
  clearFilters(): void;
}

interface CommentView {
  readonly isDestroyed: boolean;
  measure(): Dimensions;
  locate(): Position;
  destroy(): void;
}

interface StackingPlan {
  readonly topY: number;
  readonly bottomY: number;
  readonly isCanceled: boolean;
  cancel(): void;
}

interface StackingPlanner {
  containerHeight: number;
  containerMarginTop: number;
  containerMarginBottom: number;
  readonly direction: "up" | "down";
  plan(blockHeight: number, spaceFilter?: VerticalSpaceFilter): StackingPlan;
}

interface ScrollingPlan {
  readonly fromX: number;
  readonly toX: number;
  readonly speed: number;
  readonly duration: number;
}

interface ScrollingPlanner {
  marqueeWidth: number;
  basicSpeed: number;
  extraSpeedPerPixel: number;
  readonly direction: "left" | "right";
  plan(contentWidth: number): ScrollingPlan;
}

type RendererState =
  | "idle"
  | "running"
  | "paused";

interface RendererEvents {
  idle: null;
  running: null;
  paused: null;
}

interface Renderer {
  screenMarginTop: number;
  screenMarginBottom: number;
  commentOpacity: number;
  commentFontFamily: string | ReadonlyArray<string>;
  commentLineHeight: number;
  commentTextShadow: Shadow | null;
  commentScrollingBasicSpeed: number;
  commentScrollingExtraSpeedPerPixel: number;
  ownCommentBorder: Border | null;
  ownCommentPaddingLeft: number;
  ownCommentPaddingRight: number;
  readonly state: RendererState;
  readonly events: EventEmitter<RendererEvents>;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly screenElement: HTMLElement;
  run(): void;
  pause(): void;
  stop(): void;
  resizeScreen(width: number, height: number): void;
  renderComment(comment: Comment): CommentView;
  unrenderComment(comment: Comment): void;
  isCommentRendering(comment: Comment): boolean;
  getRenderingComments(): Comment[];
  getRenderingCommentsCount(): number;
  getCommentView(comment: Comment): CommentView | null;
}

type DOMOperation<R = any> = (...args: any[]) => R;

interface DOMOperationCallback<R = any> {
  (error: null, result: R): void;
  (error: Error): void;
}

interface DOMOperator {
  measure<R>(operation: DOMOperation<R>, callback?: DOMOperationCallback<R>): void;
  mutate<R>(operation: DOMOperation<R>, callback?: DOMOperationCallback<R>): void;
  cancel(operation: DOMOperation): void;
}

type CSSScrollingAnimationState =
  | "idle"
  | "running"
  | "paused"
  | "canceled"
  | "finished";

interface CSSScrollingAnimationEvents {
  running: null;
  runningStrict: null;
  paused: null;
  canceled: null;
  finished: null;
  ended: null;
}

interface CSSScrollingAnimation {
  readonly state: CSSScrollingAnimationState;
  readonly isPending: boolean;
  readonly events: EventEmitter<CSSScrollingAnimationEvents>;
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

interface TimerEvents {
  running: null;
  paused: null;
  canceled: null;
  finished: null;
  ended: null;
}

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

interface PlayerEvents {
  idle: null;
  playing: null;
  paused: null;
}

interface Player {
  renderer: Renderer;
  maxRenderingComments: number;
  readonly state: PlayerState;
  readonly events: EventEmitter<PlayerEvents>;
  readonly width: number;
  readonly height: number;
  readonly element: HTMLElement;
  readonly time: number;
  readonly timeGetter: TimeGetter;
  readonly comments: CommentPool;
  play(): void;
  pause(): void;
  stop(): void;
  resize(width: number, height: number): void;
}

export {
  EventData,
  EventSpecs,
  EventListener,
  EventEmitter,
  Dimensions,
  Position,
  Shadow,
  Border,
  VerticalSpaceFilter,
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
  CommentView,
  StackingPlan,
  StackingPlanner,
  ScrollingPlan,
  ScrollingPlanner,
  RendererState,
  RendererEvents,
  Renderer,
  DOMOperation,
  DOMOperationCallback,
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
