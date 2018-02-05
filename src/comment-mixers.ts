import {
  Comment,
  CommentCreationOptions,
  CommentCreationOptionsDefault,
  CommentTextTrait,
  CommentTextTraitMixingOptions,
  CommentTextTraitMixingOptionsDefault,
  CommentPosotionXTrait,
  CommentPositionXTraitMixingOptionsDefault,
  CommentPositionXTraitMixingOptions,
  CommentPositionYTrait,
  CommentPositionTraitMixingOptionsDefault,
  CommentPositionYTraitMixingOptions,
  CommentHorizontalAlignmentTrait,
  CommentHorizontalAlignmentTraitMixingOptionsDefault,
  CommentHorizontalAlignmentTraitMixingOptions,
  CommentVerticalAlignmentTrait,
  CommentVerticalAlignmentTraitMixingOptionsDefault,
  CommentVerticalAlignmentTraitMixingOptions,
  CommentStackingTrait,
  CommentStackingTraitMixingOptions,
  CommentStackingTraitMixingOptionsDefault,
  CommentScrollingTrait,
  CommentScrollingTraitMixingOptions,
  CommentScrollingTraitMixingOptionsDefault,
  CommentLifetimeTrait,
  CommentLifetimeTraitMixingOptionsDefault,
  CommentLifetimeTraitMixingOptions,
  StackingComment,
  StackingCommentCreationOptionsDefault,
  StackingCommentCreationOptions,
  ScrollingComment,
  ScrollingCommentCreationOptionsDefault,
  ScrollingCommentCreationOptions,
  PositioningComment,
  PositioningCommentCreationOptionsDefault,
  PositioningCommentCreationOptions,
} from "./types";

import merge from "lodash/merge";
import uniqueId from "lodash/uniqueId";
import mixin from "./utils/mixin";

const defaultOptions: {
  createComment: CommentCreationOptionsDefault,
  mixinCommentTextTrait: CommentTextTraitMixingOptionsDefault,
  mixinCommentPositionXTrait: CommentPositionXTraitMixingOptionsDefault,
  mixinCommentPositionYTrait: CommentPositionTraitMixingOptionsDefault,
  mixinCommentHorizontalAlignmentTrait: CommentHorizontalAlignmentTraitMixingOptionsDefault,
  mixinCommentVerticalAlignmentTrait: CommentVerticalAlignmentTraitMixingOptionsDefault,
  mixinCommentStackingTrait: CommentStackingTraitMixingOptionsDefault,
  mixinCommentScrollingTrait: CommentScrollingTraitMixingOptionsDefault,
  mixinCommentLifetimeTrait: CommentLifetimeTraitMixingOptionsDefault,
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
    stackingDirection: "top",
  },
  mixinCommentScrollingTrait: {
    scrollingDirection: "left",
  },
  mixinCommentLifetimeTrait: {
    lifetime: 5000,
  },
};

function createComment(options: CommentCreationOptions = {}): Comment {
  const finalOptions = merge({}, defaultOptions.createComment, options);
  const comment: Comment = {
    ...finalOptions,
    instanceId: uniqueId(),
  };

  return comment;
}

function mixinCommentTextTrait<C extends Comment>(
  comment: C,
  options: CommentTextTraitMixingOptions = {},
): C & CommentTextTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentTextTrait, options);
  const trait: CommentTextTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentPositionXTrait<C extends Comment>(
  comment: C,
  options: CommentPositionXTraitMixingOptions = {},
): C & CommentPosotionXTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionXTrait, options);
  const trait: CommentPosotionXTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentPositionYTrait<C extends Comment>(
  comment: C,
  options: CommentPositionYTraitMixingOptions = {},
): C & CommentPositionYTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionYTrait, options);
  const trait: CommentPositionYTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentHorizontalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentHorizontalAlignmentTraitMixingOptions = {},
): C & CommentHorizontalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentHorizontalAlignmentTrait, options);
  const trait: CommentHorizontalAlignmentTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentVerticalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentVerticalAlignmentTraitMixingOptions = {},
): C & CommentVerticalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentVerticalAlignmentTrait, options);
  const trait: CommentVerticalAlignmentTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentStackingTrait<C extends Comment>(
  comment: C,
  options: CommentStackingTraitMixingOptions = {},
): C & CommentStackingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentStackingTrait, options);
  const trait: CommentStackingTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentScrollingTrait<C extends Comment>(
  comment: C,
  options: CommentScrollingTraitMixingOptions = {},
): C & CommentScrollingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentScrollingTrait, options);
  const trait: CommentScrollingTrait = finalOptions;
  return Object.assign(comment, trait);
}

function mixinCommentLifetimeTrait<C extends Comment>(
  comment: C,
  options: CommentLifetimeTraitMixingOptions = {},
): C & CommentLifetimeTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentLifetimeTrait, options);
  const trait: CommentLifetimeTrait = finalOptions;
  return Object.assign(comment, trait);
}

function createStackingComment(options: StackingCommentCreationOptions): StackingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentHorizontalAlignmentTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

function createScrollingComment(options: ScrollingCommentCreationOptions): ScrollingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentScrollingTrait(target, options),
  );
}

function createPositioningComment(options: PositioningCommentCreationOptions): PositioningComment {
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
