import {
  Comment,
  CommentMixingOptions,
  CommentMixingOptionsDefault,
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
  StackingCommentMixingOptionsDefault,
  StackingCommentMixingOptions,
  ScrollingComment,
  ScrollingCommentMixingOptionsDefault,
  ScrollingCommentMixingOptions,
  PositioningComment,
  PositioningCommentMixingOptionsDefault,
  PositioningCommentMixingOptions,
} from "./types";

import merge from "lodash/merge";
import assign from "lodash/assign";
import uniqueId from "lodash/uniqueId";
import mixin from "./utils/mixin";

const defaultOptions: {
  mixinComment: CommentMixingOptionsDefault,
  mixinCommentTextTrait: CommentTextTraitMixingOptionsDefault,
  mixinCommentPositionXTrait: CommentPositionXTraitMixingOptionsDefault,
  mixinCommentPositionYTrait: CommentPositionTraitMixingOptionsDefault,
  mixinCommentHorizontalAlignmentTrait: CommentHorizontalAlignmentTraitMixingOptionsDefault,
  mixinCommentVerticalAlignmentTrait: CommentVerticalAlignmentTraitMixingOptionsDefault,
  mixinCommentStackingTrait: CommentStackingTraitMixingOptionsDefault,
  mixinCommentScrollingTrait: CommentScrollingTraitMixingOptionsDefault,
  mixinCommentLifetimeTrait: CommentLifetimeTraitMixingOptionsDefault,
} = {
  mixinComment: {
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

function mixinComment<T extends object>(
  target: T,
  options: CommentMixingOptions = {},
): T & Comment {
  const finalOptions = merge({}, defaultOptions.mixinComment, options);
  const comment: Comment = {
    ...finalOptions,
    instanceId: uniqueId(),
  };

  return assign(target, comment);
}

function mixinCommentTextTrait<C extends Comment>(
  comment: C,
  options: CommentTextTraitMixingOptions = {},
): C & CommentTextTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentTextTrait, options);
  const trait: CommentTextTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentPositionXTrait<C extends Comment>(
  comment: C,
  options: CommentPositionXTraitMixingOptions = {},
): C & CommentPosotionXTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionXTrait, options);
  const trait: CommentPosotionXTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentPositionYTrait<C extends Comment>(
  comment: C,
  options: CommentPositionYTraitMixingOptions = {},
): C & CommentPositionYTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionYTrait, options);
  const trait: CommentPositionYTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentHorizontalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentHorizontalAlignmentTraitMixingOptions = {},
): C & CommentHorizontalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentHorizontalAlignmentTrait, options);
  const trait: CommentHorizontalAlignmentTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentVerticalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentVerticalAlignmentTraitMixingOptions = {},
): C & CommentVerticalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentVerticalAlignmentTrait, options);
  const trait: CommentVerticalAlignmentTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentStackingTrait<C extends Comment>(
  comment: C,
  options: CommentStackingTraitMixingOptions = {},
): C & CommentStackingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentStackingTrait, options);
  const trait: CommentStackingTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentScrollingTrait<C extends Comment>(
  comment: C,
  options: CommentScrollingTraitMixingOptions = {},
): C & CommentScrollingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentScrollingTrait, options);
  const trait: CommentScrollingTrait = finalOptions;
  return assign(comment, trait);
}

function mixinCommentLifetimeTrait<C extends Comment>(
  comment: C,
  options: CommentLifetimeTraitMixingOptions = {},
): C & CommentLifetimeTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentLifetimeTrait, options);
  const trait: CommentLifetimeTrait = finalOptions;
  return assign(comment, trait);
}

function mixinStackingComment<T extends object>(
  target: T,
  options: StackingCommentMixingOptions,
): T & StackingComment {
  return mixin(
    target,
    (target) => mixinComment(target, options),
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentHorizontalAlignmentTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

function mixinScrollingComment<T extends object>(
  target: T,
  options: ScrollingCommentMixingOptions,
): T & ScrollingComment {
  return mixin(
    target,
    (target) => mixinComment(target, options),
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentScrollingTrait(target, options),
  );
}

function mixinPositioningComment<T extends object>(
  target: T,
  options: PositioningCommentMixingOptions,
): T & PositioningComment {
  return mixin(
    target,
    (target) => mixinComment(target, options),
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentPositionXTrait(target, options),
    (target) => mixinCommentPositionYTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

export {
  mixinComment,
  mixinCommentTextTrait,
  mixinCommentPositionXTrait,
  mixinCommentPositionYTrait,
  mixinCommentHorizontalAlignmentTrait,
  mixinCommentVerticalAlignmentTrait,
  mixinCommentStackingTrait,
  mixinCommentScrollingTrait,
  mixinCommentLifetimeTrait,
  mixinStackingComment,
  mixinScrollingComment,
  mixinPositioningComment,
};
