type PartialDeep<T> = {
  [P in keyof T]?: T[P];
}

type EventData = any;
type EventSpecs = {
  [event: string]: EventData;
}

type EventListener<D extends EventData> = (data: D) => void;

interface EventEmitter<ES extends EventSpecs> {
  on<E extends keyof ES>(event: E, listener: EventListener<ES[E]>): void;
  off<E extends keyof ES>(event: E, listener?: EventListener<ES[E]>): void;
  emit<E extends keyof ES>(event: E, data: ES[E]): void;
}

interface Comment {
  readonly time: number;
  readonly opacity: number;
  readonly instanceId: string;
}

type CommentCreationOptionsDefault =
  Pick<
    Comment,
    (
      | "time"
      | "opacity"
    )
  >;

type CommentCreationOptions =
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

type CommentTextTraitMixingOptions = PartialDeep<CommentTextTrait>;
type CommentTextTraitMixingOptionsDefault = CommentTextTrait;

interface CommentPositionXTrait {
  readonly positionX: number;
}

type CommentPositionXTraitMixingOptions = PartialDeep<CommentPositionXTrait>;
type CommentPositionXTraitMixingOptionsDefault = CommentPositionXTrait;

interface CommentPositionYTrait {
  readonly positionY: number;
}

type CommentPositionYTraitMixingOptions = PartialDeep<CommentPositionYTrait>;
type CommentPositionTraitMixingOptionsDefault = CommentPositionYTrait;

interface CommentHorizontalAlignmentTrait {
  readonly horizontalAlignment: "left" | "center" | "right";
}

type CommentHorizontalAlignmentTraitMixingOptions = PartialDeep<CommentHorizontalAlignmentTrait>;
type CommentHorizontalAlignmentTraitMixingOptionsDefault = CommentHorizontalAlignmentTrait;

interface CommentVerticalAlignmentTrait {
  readonly verticalAlignment: "top" | "middle" | "bottom";
}

type CommentVerticalAlignmentTraitMixingOptions = PartialDeep<CommentVerticalAlignmentTrait>;
type CommentVerticalAlignmentTraitMixingOptionsDefault = CommentVerticalAlignmentTrait;

interface CommentStackingTrait {
  readonly stackingDirection: "top" | "bottom";
}

type CommentStackingTraitMixingOptions = PartialDeep<CommentStackingTrait>;
type CommentStackingTraitMixingOptionsDefault = CommentStackingTrait;

interface CommentScrollingTrait {
  readonly scrollingDirection: "left" | "rigth";
}

type CommentScrollingTraitMixingOptions = PartialDeep<CommentScrollingTrait>;
type CommentScrollingTraitMixingOptionsDefault = CommentScrollingTrait;

interface CommentLifetimeTrait {
  readonly lifetime: number;
}

type CommentLifetimeTraitMixingOptions = PartialDeep<CommentLifetimeTrait>;
type CommentLifetimeTraitMixingOptionsDefault = CommentLifetimeTrait;

type StackingComment =
  & Comment
  & CommentTextTrait
  & CommentHorizontalAlignmentTrait
  & CommentStackingTrait
  & CommentLifetimeTrait;

type StackingCommentCreationOptions =
  & CommentCreationOptions
  & CommentTextTraitMixingOptions
  & CommentHorizontalAlignmentTraitMixingOptions
  & CommentStackingTraitMixingOptions
  & CommentLifetimeTraitMixingOptions;

type StackingCommentCreationOptionsDefault =
  & CommentCreationOptionsDefault
  & CommentTextTraitMixingOptionsDefault
  & CommentHorizontalAlignmentTraitMixingOptionsDefault
  & CommentStackingTraitMixingOptionsDefault
  & CommentLifetimeTraitMixingOptionsDefault;

type ScrollingComment =
  & Comment
  & CommentTextTrait
  & CommentStackingTrait
  & CommentScrollingTrait;

type ScrollingCommentCreationOptions =
  & CommentCreationOptions
  & CommentTextTraitMixingOptions
  & CommentStackingTraitMixingOptions
  & CommentScrollingTraitMixingOptions;

type ScrollingCommentCreationOptionsDefault =
  & CommentCreationOptionsDefault
  & CommentTextTraitMixingOptionsDefault
  & CommentStackingTraitMixingOptionsDefault
  & CommentScrollingTraitMixingOptionsDefault;

type PositioningComment =
  & Comment
  & CommentTextTrait
  & CommentPositionXTrait
  & CommentPositionYTrait
  & CommentLifetimeTrait;

type PositioningCommentCreationOptions =
  & CommentCreationOptions
  & CommentTextTraitMixingOptions
  & CommentPositionXTraitMixingOptions
  & CommentPositionYTraitMixingOptions
  & CommentLifetimeTraitMixingOptions;

type PositioningCommentCreationOptionsDefault =
  & CommentCreationOptionsDefault
  & CommentTextTraitMixingOptionsDefault
  & CommentPositionXTraitMixingOptionsDefault
  & CommentPositionTraitMixingOptionsDefault
  & CommentLifetimeTraitMixingOptionsDefault;

interface StageMargin {
  top: number;
  bottom: number;
}

interface Stage {
  width: number;
  height: number;
  margin: StageMargin;
}

interface Block {
  width: number;
  height: number;
}

interface StackingPlan {
  readonly startY: number;
  readonly endY: number;
  onEnded(): void;
}

interface StackingPlanner {
  readonly stage: Stage;
  readonly direction: "up" | "down";
  plan(block: Block): StackingPlan;
  setStage(stage: Stage): void;
}

interface StackingPlannerCreationOptions {
  stage: StackingPlanner["stage"];
  direction?: StackingPlanner["direction"];
}

type StackingPlannerCreationOptionsDefault =
  Pick<
    StackingPlanner,
    (
      | "direction"
    )
  >;

interface ScrollingPlan {
  readonly startX: number;
  readonly endX: number;
  readonly duration: number;
}

interface ScrollingPlanner {
  readonly stage: Stage;
  readonly direction: "left" | "right";
  readonly basicSpeed: number;
  readonly extraSpeedPerPixel: number;
  plan(block: Block): ScrollingPlan;
  setStage(stage: Stage): void;
  setBasicSpeed(speed: number): void;
  setExtraSpeedPerPixel(speed: number): void;
}

interface ScrollingPlannerCreationOptions {
  stage: ScrollingPlanner["stage"];
  direction?: ScrollingPlanner["direction"];
  basicSpeed?: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel?: ScrollingPlanner["extraSpeedPerPixel"];
} 

type ScrollingPlannerCreationOptionsDefault =
  Pick<
    ScrollingPlanner,
    (
      | "direction"
      | "basicSpeed"
      | "extraSpeedPerPixel"
    )
  >;

interface Position {
  x: number;
  y: number;
}

type CSSScrollingAnimationState =
  | "idle"
  | "playing"
  | "paused"
  | "ended"
  | "destroyed";

interface CSSScrollingAnimationEvents {
  playing: null,
  paused: null,
  ended: null,
  destroyed: null,
}

interface CSSScrollingAnimation {
  readonly state: CSSScrollingAnimationState;
  readonly events: EventEmitter<CSSScrollingAnimationEvents>
  readonly element: HTMLElement;
  readonly duration: number;
  readonly startX: number;
  readonly endX: number;
}

type CSSScrollingAnimationCreationOptions =
  Pick<
    CSSScrollingAnimation,
    (
      | "element"
      | "duration"
      | "startX"
      | "endX"
    )
  >;

interface CSSScrollingAnimationService {
  create(options: CSSScrollingAnimationCreationOptions): CSSScrollingAnimation;
  createBatch(optionsList: CSSScrollingAnimationCreationOptions[]): CSSScrollingAnimation[];
  play(animation: CSSScrollingAnimation): void;
  playBatch(animations: CSSScrollingAnimation[]): void;
  pause(animation: CSSScrollingAnimation): void;
  pauseBatch(animations: CSSScrollingAnimation[]): void;
  destroy(animation: CSSScrollingAnimation): void;
  destroyBatch(animations: CSSScrollingAnimation[]): void;
  getElapsedTime(animation: CSSScrollingAnimation): number;
  getElapsedTimeBatch(animations: CSSScrollingAnimation[]): number[];
  getCurrentX(animation: CSSScrollingAnimation): number;
  getCurrentXBatch(animations: CSSScrollingAnimation[]): number[];
}

type TimerState =
  | "idle"
  | "running"
  | "paused"
  | "ended"
  | "destroyed";

type TimerEvents = {
  running: null,
  paused: null,
  ended: null,
  destroyed: null,
};

interface Timer {
  readonly state: TimerState;
  readonly events: EventEmitter<TimerEvents>;
  readonly duration: number;
  readonly elapsedTime: number;
  run(): void;
  pause(): void;
  destroy(): void;
}

type TimerCreationOptions = Pick<Timer, "duration">;

export {
  PartialDeep,
  EventListener,
  EventSpecs,
  EventEmitter,
  Comment,
  CommentCreationOptionsDefault,
  CommentCreationOptions,
  CommentTextTrait,
  CommentTextTraitMixingOptions,
  CommentTextTraitMixingOptionsDefault,
  CommentPositionXTrait,
  CommentPositionXTraitMixingOptions,
  CommentPositionXTraitMixingOptionsDefault,
  CommentPositionYTrait,
  CommentPositionYTraitMixingOptions,
  CommentPositionTraitMixingOptionsDefault,
  CommentHorizontalAlignmentTrait,
  CommentHorizontalAlignmentTraitMixingOptions,
  CommentHorizontalAlignmentTraitMixingOptionsDefault,
  CommentVerticalAlignmentTrait,
  CommentVerticalAlignmentTraitMixingOptions,
  CommentVerticalAlignmentTraitMixingOptionsDefault,
  CommentStackingTrait,
  CommentStackingTraitMixingOptions,
  CommentStackingTraitMixingOptionsDefault,
  CommentScrollingTrait,
  CommentScrollingTraitMixingOptions,
  CommentScrollingTraitMixingOptionsDefault,
  CommentLifetimeTrait,
  CommentLifetimeTraitMixingOptions,
  CommentLifetimeTraitMixingOptionsDefault,
  StackingComment,
  StackingCommentCreationOptions,
  StackingCommentCreationOptionsDefault,
  ScrollingComment,
  ScrollingCommentCreationOptions,
  ScrollingCommentCreationOptionsDefault,
  PositioningComment,
  PositioningCommentCreationOptions,
  PositioningCommentCreationOptionsDefault,
  StageMargin,
  Stage,
  Block,
  StackingPlan,
  StackingPlanner,
  StackingPlannerCreationOptions,
  StackingPlannerCreationOptionsDefault,
  ScrollingPlan,
  ScrollingPlanner,
  ScrollingPlannerCreationOptions,
  ScrollingPlannerCreationOptionsDefault,
  CSSScrollingAnimationState,
  CSSScrollingAnimationEvents,
  CSSScrollingAnimation,
  CSSScrollingAnimationCreationOptions,
  CSSScrollingAnimationService,
  TimerState,
  TimerEvents,
  Timer,
  TimerCreationOptions,
};
