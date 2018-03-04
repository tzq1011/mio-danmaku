type PartialDeep<T> = {
  [P in keyof T]?: T[P];
}

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

type CommentEvents = {
  rendering: null,
  renderingFinished: null,
  renderingCanceled: null,
  renderingEnded: null,
}

interface Comment {
  readonly events: EventEmitter<CommentEvents>;
  readonly time: number;
  readonly opacity: number;
}

type CommentOptionsDefault =
  Pick<
    Comment,
    (
      | "time"
      | "opacity"
    )
  >;

type CommentOptions =
  PartialDeep<
    Pick<
      Comment,
      (
        | "time"
        | "opacity"
      )
    >
  >;

interface CommentTextTrait {
  readonly text: string;
  readonly fontSize: number;
  readonly fontColor: string;
}

type CommentTextTraitOptions = PartialDeep<CommentTextTrait>;
type CommentTextTraitOptionsDefault = CommentTextTrait;

interface CommentPositionXTrait {
  readonly positionX: number;
}

type CommentPositionXTraitOptions = PartialDeep<CommentPositionXTrait>;
type CommentPositionXTraitOptionsDefault = CommentPositionXTrait;

interface CommentPositionYTrait {
  readonly positionY: number;
}

type CommentPositionYTraitOptions = PartialDeep<CommentPositionYTrait>;
type CommentPositionTraitOptionsDefault = CommentPositionYTrait;

interface CommentHorizontalAlignmentTrait {
  readonly horizontalAlignment: "left" | "center" | "right";
}

type CommentHorizontalAlignmentTraitOptions = PartialDeep<CommentHorizontalAlignmentTrait>;
type CommentHorizontalAlignmentTraitOptionsDefault = CommentHorizontalAlignmentTrait;

interface CommentVerticalAlignmentTrait {
  readonly verticalAlignment: "top" | "middle" | "bottom";
}

type CommentVerticalAlignmentTraitOptions = PartialDeep<CommentVerticalAlignmentTrait>;
type CommentVerticalAlignmentTraitOptionsDefault = CommentVerticalAlignmentTrait;

interface CommentStackingTrait {
  readonly stackingDirection: "up" | "down";
}

type CommentStackingTraitOptions = PartialDeep<CommentStackingTrait>;
type CommentStackingTraitOptionsDefault = CommentStackingTrait;

interface CommentScrollingTrait {
  readonly scrollingDirection: "left" | "right";
}

type CommentScrollingTraitOptions = PartialDeep<CommentScrollingTrait>;
type CommentScrollingTraitOptionsDefault = CommentScrollingTrait;

interface CommentLifetimeTrait {
  readonly lifetime: number;
}

type CommentLifetimeTraitOptions = PartialDeep<CommentLifetimeTrait>;
type CommentLifetimeTraitOptionsDefault = CommentLifetimeTrait;

type StackingComment =
  & Comment
  & CommentTextTrait
  & CommentHorizontalAlignmentTrait
  & CommentStackingTrait
  & CommentLifetimeTrait;

type StackingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentHorizontalAlignmentTraitOptions
  & CommentStackingTraitOptions
  & CommentLifetimeTraitOptions;

type StackingCommentOptionsDefault =
  & CommentOptionsDefault
  & CommentTextTraitOptionsDefault
  & CommentHorizontalAlignmentTraitOptionsDefault
  & CommentStackingTraitOptionsDefault
  & CommentLifetimeTraitOptionsDefault;

type ScrollingComment =
  & Comment
  & CommentTextTrait
  & CommentStackingTrait
  & CommentScrollingTrait;

type ScrollingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentStackingTraitOptions
  & CommentScrollingTraitOptions;

type ScrollingCommentOptionsDefault =
  & CommentOptionsDefault
  & CommentTextTraitOptionsDefault
  & CommentStackingTraitOptionsDefault
  & CommentScrollingTraitOptionsDefault;

type PositioningComment =
  & Comment
  & CommentTextTrait
  & CommentPositionXTrait
  & CommentPositionYTrait
  & CommentLifetimeTrait;

type PositioningCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentPositionXTraitOptions
  & CommentPositionYTraitOptions
  & CommentLifetimeTraitOptions;

type PositioningCommentOptionsDefault =
  & CommentOptionsDefault
  & CommentTextTraitOptionsDefault
  & CommentPositionXTraitOptionsDefault
  & CommentPositionTraitOptionsDefault
  & CommentLifetimeTraitOptionsDefault;

interface CommentPool {
  load(comments: Comment[]): void;
  add(comment: Comment): void;
  has(comment: Comment): void;
  remove(comment: Comment): void;
  clear(): void;
  getByTime(startTime: number, endTime: number): Comment[];
}

interface Stage {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
}

type StageOptions =
  PartialDeep<
    Pick<
      Stage,
      (
        | "width"
        | "height"
        | "marginTop"
        | "marginBottom"
      )
    >
  >;

type StageOptionsDefault =
  Pick<
    Stage,
    (
      | "width"
      | "height"
      | "marginTop"
      | "marginBottom"
    )
  >;

interface StackingPlanningOptions {
  blockHeight: number;
}

interface StackingPlan {
  readonly topY: number;
  readonly bottomY: number;
  readonly isCanceled: boolean;
  cancel(): void;
}

interface StackingPlanner {
  readonly stage: Stage;
  readonly direction: "up" | "down";
  plan(options: StackingPlanningOptions): StackingPlan;
  setStage(stage: Stage): void;
}

interface StackingPlannerOptions {
  stage: StackingPlanner["stage"];
  direction?: StackingPlanner["direction"];
}

type StackingPlannerOptionsDefault =
  Pick<
    StackingPlanner,
    (
      | "direction"
    )
  >;

interface ScrollingPlanningOptions {
  blockWidth: number;
}

interface ScrollingPlan {
  readonly fromX: number;
  readonly toX: number;
  readonly speed: number;
  readonly duration: number;
}

interface ScrollingPlanner {
  readonly stage: Stage;
  readonly direction: "left" | "right";
  readonly basicSpeed: number;
  readonly extraSpeedPerPixel: number;
  plan(options: ScrollingPlanningOptions): ScrollingPlan;
  setStage(stage: Stage): void;
  setBasicSpeed(speed: number): void;
  setExtraSpeedPerPixel(speed: number): void;
}

interface ScrollingPlannerOptions {
  stage: ScrollingPlanner["stage"];
  direction?: ScrollingPlanner["direction"];
  basicSpeed?: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel?: ScrollingPlanner["extraSpeedPerPixel"];
}

type ScrollingPlannerOptionsDefault =
  Pick<
    ScrollingPlanner,
    (
      | "direction"
      | "basicSpeed"
      | "extraSpeedPerPixel"
    )
  >;

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
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

interface RendererStackingPlanners {
  readonly up: StackingPlanner,
  readonly down: StackingPlanner,
  readonly upScrolling: StackingPlanner,
  readonly downScrolling: StackingPlanner,
}

interface RendererScrollingPlanners {
  readonly left: ScrollingPlanner,
  readonly right: ScrollingPlanner,
}

interface Renderer {
  readonly events: EventEmitter<RendererEvents>;
  readonly state: RendererState;
  readonly stage: Stage;
  readonly stageElement: HTMLElement;
  readonly stackingPlanners: RendererStackingPlanners;
  readonly scrollingPlanners: RendererScrollingPlanners;
  run(): void;
  pause(): void;
  stop(): void;
  setStage(stage: Stage): void;
  renderComment(comment: Comment): CommentView;
  unrenderComment(comment: Comment): void;
  isCommentRendering(comment: Comment): boolean;
  getRenderingComments(): Comment[];
  getCommentView(comment: Comment): CommentView | null;
}

type RendererOptions = Pick<Renderer, "stage">;

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

type CSSScrollingAnimationOptions = Pick<
  CSSScrollingAnimation,
  (
    | "element"
    | "duration"
    | "fromX"
    | "toX"
  )
>;

type CSSRenderer = Renderer;
type CSSRendererOptions = RendererOptions;

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

type TimerOptions = Pick<Timer, "duration">;

export {
  PartialDeep,
  EventListener,
  EventSpecs,
  EventEmitter,
  CommentEvents,
  Comment,
  CommentOptionsDefault,
  CommentOptions,
  CommentTextTrait,
  CommentTextTraitOptions,
  CommentTextTraitOptionsDefault,
  CommentPositionXTrait,
  CommentPositionXTraitOptions,
  CommentPositionXTraitOptionsDefault,
  CommentPositionYTrait,
  CommentPositionYTraitOptions,
  CommentPositionTraitOptionsDefault,
  CommentHorizontalAlignmentTrait,
  CommentHorizontalAlignmentTraitOptions,
  CommentHorizontalAlignmentTraitOptionsDefault,
  CommentVerticalAlignmentTrait,
  CommentVerticalAlignmentTraitOptions,
  CommentVerticalAlignmentTraitOptionsDefault,
  CommentStackingTrait,
  CommentStackingTraitOptions,
  CommentStackingTraitOptionsDefault,
  CommentScrollingTrait,
  CommentScrollingTraitOptions,
  CommentScrollingTraitOptionsDefault,
  CommentLifetimeTrait,
  CommentLifetimeTraitOptions,
  CommentLifetimeTraitOptionsDefault,
  StackingComment,
  StackingCommentOptions,
  StackingCommentOptionsDefault,
  ScrollingComment,
  ScrollingCommentOptions,
  ScrollingCommentOptionsDefault,
  PositioningComment,
  PositioningCommentOptions,
  PositioningCommentOptionsDefault,
  CommentPool,
  Stage,
  StageOptions,
  StageOptionsDefault,
  StackingPlanningOptions,
  StackingPlan,
  StackingPlanner,
  StackingPlannerOptions,
  StackingPlannerOptionsDefault,
  ScrollingPlanningOptions,
  ScrollingPlan,
  ScrollingPlanner,
  ScrollingPlannerOptions,
  ScrollingPlannerOptionsDefault,
  Dimensions,
  Position,
  CommentView,
  RendererState,
  RendererEvents,
  RendererStackingPlanners,
  RendererScrollingPlanners,
  Renderer,
  RendererOptions,
  DOMOperation,
  DOMOperator,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
  CSSScrollingAnimation,
  CSSScrollingAnimationOptions,
  CSSRenderer,
  CSSRendererOptions,
  TimerState,
  TimerEvents,
  Timer,
  TimerOptions,
};
