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

type CommentMixingOptionsDefault =
  Pick<
    Comment,
    (
      | "time"
      | "opacity"
    )
  >;

type CommentMixingOptions =
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

interface CommentPosotionXTrait {
  readonly positionX: number;
}

type CommentPositionXTraitMixingOptions = PartialDeep<CommentPosotionXTrait>;
type CommentPositionXTraitMixingOptionsDefault = CommentPosotionXTrait;

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

type StackingCommentMixingOptions =
  & CommentMixingOptions
  & CommentTextTraitMixingOptions
  & CommentHorizontalAlignmentTraitMixingOptions
  & CommentStackingTraitMixingOptions
  & CommentLifetimeTraitMixingOptions;

type StackingCommentMixingOptionsDefault =
  & CommentMixingOptionsDefault
  & CommentTextTraitMixingOptionsDefault
  & CommentHorizontalAlignmentTraitMixingOptionsDefault
  & CommentStackingTraitMixingOptionsDefault
  & CommentLifetimeTraitMixingOptionsDefault;

type ScrollingComment =
  & Comment
  & CommentTextTrait
  & CommentStackingTrait
  & CommentScrollingTrait;

type ScrollingCommentMixingOptions =
  & CommentMixingOptions
  & CommentTextTraitMixingOptions
  & CommentStackingTraitMixingOptions
  & CommentScrollingTraitMixingOptions;

type ScrollingCommentMixingOptionsDefault =
  & CommentMixingOptionsDefault
  & CommentTextTraitMixingOptionsDefault
  & CommentStackingTraitMixingOptionsDefault
  & CommentScrollingTraitMixingOptionsDefault;

type PositioningComment =
  & Comment
  & CommentTextTrait
  & CommentPosotionXTrait
  & CommentPositionYTrait
  & CommentLifetimeTrait;

type PositioningCommentMixingOptions =
  & CommentMixingOptions
  & CommentTextTraitMixingOptions
  & CommentPositionXTraitMixingOptions
  & CommentPositionYTraitMixingOptions
  & CommentLifetimeTraitMixingOptions;

type PositioningCommentMixingOptionsDefault =
  & CommentMixingOptionsDefault
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

interface StackingPlannerMixingOptions {
  stage: StackingPlanner["stage"];
  direction?: StackingPlanner["direction"];
}

type StackingPlannerMixingOptionsDefault =
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

interface ScrollingPlannerMixingOptions {
  stage: ScrollingPlanner["stage"];
  direction?: ScrollingPlanner["direction"];
  basicSpeed?: ScrollingPlanner["basicSpeed"];
  extraSpeedPerPixel?: ScrollingPlanner["extraSpeedPerPixel"];
} 

type ScrollingPlannerMixingOptionsDefault =
  Pick<
    ScrollingPlanner,
    (
      | "direction"
      | "basicSpeed"
      | "extraSpeedPerPixel"
    )
  >;

interface CommentView {
  readonly width: number;
  readonly height: number;
  readonly positionX: number;
  readonly positionY: number;
  destroy(): void;
}

type RendererState =
  | "idle"
  | "running"
  | "paused"
  | "destroyed";

interface Renderer {
  readonly stage: Stage;
  readonly state: RendererState;
  run(): void;
  stop(): void;
  pause(): void;
  destroy(): void;
  setStage(stage: Stage): void;
  renderComment(comment: Comment): CommentView;
  isCommentRendering(comment: Comment): boolean;
}

type CSSScrollingAnimationState =
  | "idle"
  | "starting"
  | "playing"
  | "pausing"
  | "paused"
  | "ended"
  | "destroying"
  | "destroyed";

interface CSSScrollingAnimation {
  readonly state: CSSScrollingAnimationState;
  readonly element: HTMLElement;
  readonly startX: number;
  readonly endX: number;
  readonly duration: number;
  readonly elapsedTime: number;
  play(): Promise<void>;
  pause(): Promise<void>;
  locate(): Promise<number>;
  destroy(): Promise<void>;
}

interface CSSScrollingAnimationMixingOptions {
  readonly element: HTMLElement;
  readonly startX: number;
  readonly endX: number;
  readonly duration: number;
}

type DOMOperation<R = any> = (...args: any[]) => R;

interface DOMOperator {
  measure<R>(operation: DOMOperation<R>): Promise<R>;
  mutate<R>(operation: DOMOperation<R>): Promise<R>;
  cancel(operation: DOMOperation): void;
}

export {
  PartialDeep,
  EventListener,
  EventSpecs,
  EventEmitter,
  Comment,
  CommentMixingOptionsDefault,
  CommentMixingOptions,
  CommentTextTrait,
  CommentTextTraitMixingOptions,
  CommentTextTraitMixingOptionsDefault,
  CommentPosotionXTrait,
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
  StackingCommentMixingOptions,
  StackingCommentMixingOptionsDefault,
  ScrollingComment,
  ScrollingCommentMixingOptions,
  ScrollingCommentMixingOptionsDefault,
  PositioningComment,
  PositioningCommentMixingOptions,
  PositioningCommentMixingOptionsDefault,
  StageMargin,
  Stage,
  Block,
  StackingPlan,
  StackingPlanner,
  StackingPlannerMixingOptions,
  StackingPlannerMixingOptionsDefault,
  ScrollingPlan,
  ScrollingPlanner,
  ScrollingPlannerMixingOptions,
  ScrollingPlannerMixingOptionsDefault,
  CommentView,
  RendererState,
  Renderer,
  DOMOperation,
  DOMOperator,
  CSSScrollingAnimationState,
  CSSScrollingAnimation,
  CSSScrollingAnimationMixingOptions,
};
