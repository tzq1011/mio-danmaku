import {
  Comment,
  CommentEvents,
  CommentOptions,
  CommentOptionsDefault,
  CommentTextTrait,
  CommentTextTraitOptions,
  CommentTextTraitOptionsDefault,
  CommentPositionXTrait,
  CommentPositionXTraitOptionsDefault,
  CommentPositionXTraitOptions,
  CommentPositionYTrait,
  CommentPositionTraitOptionsDefault,
  CommentPositionYTraitOptions,
  CommentHorizontalAlignmentTrait,
  CommentHorizontalAlignmentTraitOptionsDefault,
  CommentHorizontalAlignmentTraitOptions,
  CommentVerticalAlignmentTrait,
  CommentVerticalAlignmentTraitOptionsDefault,
  CommentVerticalAlignmentTraitOptions,
  CommentStackingTrait,
  CommentStackingTraitOptions,
  CommentStackingTraitOptionsDefault,
  CommentScrollingTrait,
  CommentScrollingTraitOptions,
  CommentScrollingTraitOptionsDefault,
  CommentLifetimeTrait,
  CommentLifetimeTraitOptionsDefault,
  CommentLifetimeTraitOptions,
  StackingComment,
  StackingCommentOptionsDefault,
  StackingCommentOptions,
  ScrollingComment,
  ScrollingCommentOptionsDefault,
  ScrollingCommentOptions,
  PositioningComment,
  PositioningCommentOptionsDefault,
  PositioningCommentOptions,
  EventEmitter,
} from "./types";

import merge from "lodash/merge";
import mixin from "./utils/mixin";
import { createEventEmitter } from "./event-emitter";

const defaultOptions: {
  createComment: CommentOptionsDefault,
  mixinCommentTextTrait: CommentTextTraitOptionsDefault,
  mixinCommentPositionXTrait: CommentPositionXTraitOptionsDefault,
  mixinCommentPositionYTrait: CommentPositionTraitOptionsDefault,
  mixinCommentHorizontalAlignmentTrait: CommentHorizontalAlignmentTraitOptionsDefault,
  mixinCommentVerticalAlignmentTrait: CommentVerticalAlignmentTraitOptionsDefault,
  mixinCommentStackingTrait: CommentStackingTraitOptionsDefault,
  mixinCommentScrollingTrait: CommentScrollingTraitOptionsDefault,
  mixinCommentLifetimeTrait: CommentLifetimeTraitOptionsDefault,
} = {
  createComment: {
    time: 0,
    opacity: 1,
  },
  mixinCommentTextTrait: {
    text: "Nya",
    fontSize: 20,
    fontColor: "#000",
  },
  mixinCommentPositionXTrait: {
    positionX: 0,
  },
  mixinCommentPositionYTrait: {
    positionY: 0,
  },
  mixinCommentHorizontalAlignmentTrait: {
    horizontalAlignment: "center",
  },
  mixinCommentVerticalAlignmentTrait: {
    verticalAlignment: "middle",
  },
  mixinCommentStackingTrait: {
    stackingDirection: "down",
  },
  mixinCommentScrollingTrait: {
    scrollingDirection: "left",
  },
  mixinCommentLifetimeTrait: {
    lifetime: 5000,
  },
};

function createComment(options: CommentOptions = {}): Comment {
  const finalOptions = merge({}, defaultOptions.createComment, options);
  const events: EventEmitter<CommentEvents> = createEventEmitter();
  const comment: Comment = {
    ...finalOptions,
    get events() {
      return events;
    },
  };

  return comment;
}

function mixinCommentTextTrait<C extends Comment>(
  comment: C,
  options: CommentTextTraitOptions = {},
): C & CommentTextTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentTextTrait, options);
  const trait: CommentTextTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentPositionXTrait<C extends Comment>(
  comment: C,
  options: CommentPositionXTraitOptions = {},
): C & CommentPositionXTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionXTrait, options);
  const trait: CommentPositionXTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentPositionYTrait<C extends Comment>(
  comment: C,
  options: CommentPositionYTraitOptions = {},
): C & CommentPositionYTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionYTrait, options);
  const trait: CommentPositionYTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentHorizontalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentHorizontalAlignmentTraitOptions = {},
): C & CommentHorizontalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentHorizontalAlignmentTrait, options);
  const trait: CommentHorizontalAlignmentTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentVerticalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentVerticalAlignmentTraitOptions = {},
): C & CommentVerticalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentVerticalAlignmentTrait, options);
  const trait: CommentVerticalAlignmentTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentStackingTrait<C extends Comment>(
  comment: C,
  options: CommentStackingTraitOptions = {},
): C & CommentStackingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentStackingTrait, options);
  const trait: CommentStackingTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentScrollingTrait<C extends Comment>(
  comment: C,
  options: CommentScrollingTraitOptions = {},
): C & CommentScrollingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentScrollingTrait, options);
  const trait: CommentScrollingTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentLifetimeTrait<C extends Comment>(
  comment: C,
  options: CommentLifetimeTraitOptions = {},
): C & CommentLifetimeTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentLifetimeTrait, options);
  const trait: CommentLifetimeTrait = finalOptions;
  return Object.assign(comment, trait);
}

function createStackingComment(options: StackingCommentOptions): StackingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentHorizontalAlignmentTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

function createScrollingComment(options: ScrollingCommentOptions): ScrollingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentScrollingTrait(target, options),
  );
}

function createPositioningComment(options: PositioningCommentOptions): PositioningComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentPositionXTrait(target, options),
    (target) => mixinCommentPositionYTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

export {
  createComment,
  mixinCommentTextTrait,
  mixinCommentPositionXTrait,
  mixinCommentPositionYTrait,
  mixinCommentHorizontalAlignmentTrait,
  mixinCommentVerticalAlignmentTrait,
  mixinCommentStackingTrait,
  mixinCommentScrollingTrait,
  mixinCommentLifetimeTrait,
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
};
