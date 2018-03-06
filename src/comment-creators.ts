import {
  Comment,
  CommentEvents,
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
  EventEmitter,
} from "./types";

import merge from "lodash/merge";
import uniqueId from "lodash/uniqueId";
import mixin from "./utils/mixin";
import { createEventEmitter } from "./event-emitter";

interface CommentOptionsDefault {
  time: Comment["time"];
  extra: Comment["extra"];
}

type CommentTextTraitOptionsDefault = CommentTextTrait;
type CommentPositionXTraitOptionsDefault = CommentPositionXTrait;
type CommentPositionYTraitOptionsDefault = CommentPositionYTrait;
type CommentHorizontalAlignmentTraitOptionsDefault = CommentHorizontalAlignmentTrait;
type CommentVerticalAlignmentTraitOptionsDefault = CommentVerticalAlignmentTrait;
type CommentStackingTraitOptionsDefault = CommentStackingTrait;
type CommentScrollingTraitOptionsDefault = CommentScrollingTrait;
type CommentLifetimeTraitOptionsDefault = CommentLifetimeTrait;
type StackingCommentOptionsDefault = StackingComment;
type ScrollingCommentOptionsDefault = ScrollingComment;
type PositioningCommentOptionsDefault = PositioningComment;

type CommentOptions = Partial<CommentOptionsDefault>;
type CommentTextTraitOptions = Partial<CommentTextTraitOptionsDefault>;
type CommentPositionXTraitOptions = Partial<CommentPositionXTraitOptionsDefault>;
type CommentPositionYTraitOptions = Partial<CommentPositionYTraitOptionsDefault>;
type CommentHorizontalAlignmentTraitOptions = Partial<CommentHorizontalAlignmentTraitOptionsDefault>;
type CommentVerticalAlignmentTraitOptions = Partial<CommentVerticalAlignmentTraitOptionsDefault>;
type CommentStackingTraitOptions = Partial<CommentStackingTraitOptionsDefault>;
type CommentScrollingTraitOptions = Partial<CommentScrollingTraitOptionsDefault>;
type CommentLifetimeTraitOptions = Partial<CommentLifetimeTraitOptionsDefault>;

type StackingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentHorizontalAlignmentTraitOptions
  & CommentStackingTraitOptions
  & CommentLifetimeTraitOptions;

type ScrollingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentStackingTraitOptions
  & CommentScrollingTraitOptions;

type PositioningCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentPositionXTraitOptions
  & CommentPositionYTraitOptions
  & CommentLifetimeTraitOptions;

const defaultOptions: {
  createComment: CommentOptionsDefault,
  mixinCommentTextTrait: CommentTextTraitOptionsDefault,
  mixinCommentPositionXTrait: CommentPositionXTraitOptionsDefault,
  mixinCommentPositionYTrait: CommentPositionYTraitOptionsDefault,
  mixinCommentHorizontalAlignmentTrait: CommentHorizontalAlignmentTraitOptionsDefault,
  mixinCommentVerticalAlignmentTrait: CommentVerticalAlignmentTraitOptionsDefault,
  mixinCommentStackingTrait: CommentStackingTraitOptionsDefault,
  mixinCommentScrollingTrait: CommentScrollingTraitOptionsDefault,
  mixinCommentLifetimeTrait: CommentLifetimeTraitOptionsDefault,
} = {
  createComment: {
    time: 0,
    extra: {},
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
  const instanceId = uniqueId();
  const events: EventEmitter<CommentEvents> = createEventEmitter();

  const comment: Comment = {
    instanceId,
    events,
    time: finalOptions.time,
    extra: finalOptions.extra,
  };

  Object.defineProperties(comment, {
    instanceId: { writable: false },
    events: { writable: false },
    time: { writable: false },
    extra: { writable: false },
  });

  return comment;
}

function mixinCommentTextTrait<C extends Comment>(
  comment: C,
  options: CommentTextTraitOptions = {},
): C & CommentTextTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentTextTrait, options);
  const textTrait: CommentTextTrait = {
    text: finalOptions.text,
    fontSize: finalOptions.fontSize,
    fontColor: finalOptions.fontColor,
  };

  const newComment = Object.assign(comment, textTrait);
  Object.defineProperties(newComment, {
    text: { writable: false },
    fontSize: { writable: false },
    fontColor: { writable: false },
  });

  return newComment;
}

function mixinCommentPositionXTrait<C extends Comment>(
  comment: C,
  options: CommentPositionXTraitOptions = {},
): C & CommentPositionXTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionXTrait, options);
  const positionXTrait: CommentPositionXTrait = {
    positionX: finalOptions.positionX,
  };

  const newComment = Object.assign(comment, positionXTrait);
  Object.defineProperties(newComment, {
    positionX: { writable: false },
  });

  return newComment;
}

function mixinCommentPositionYTrait<C extends Comment>(
  comment: C,
  options: CommentPositionYTraitOptions = {},
): C & CommentPositionYTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentPositionYTrait, options);
  const positionYTrait: CommentPositionYTrait = {
    positionY: finalOptions.positionY,
  };

  const newComment = Object.assign(comment, positionYTrait);
  Object.defineProperties(newComment, {
    positionY: { writable: false },
  });

  return newComment;
}

function mixinCommentHorizontalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentHorizontalAlignmentTraitOptions = {},
): C & CommentHorizontalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentHorizontalAlignmentTrait, options);
  const alignmentTrait: CommentHorizontalAlignmentTrait = {
    horizontalAlignment: finalOptions.horizontalAlignment,
  };

  const newComment = Object.assign(comment, alignmentTrait);
  Object.defineProperties(newComment, {
    horizontalAlignment: { writable: false },
  });

  return newComment;
}

function mixinCommentVerticalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentVerticalAlignmentTraitOptions = {},
): C & CommentVerticalAlignmentTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentVerticalAlignmentTrait, options);
  const alignmentTrait: CommentVerticalAlignmentTrait = {
    verticalAlignment: finalOptions.verticalAlignment,
  };

  const newComment = Object.assign(comment, alignmentTrait);
  Object.defineProperties(newComment, {
    verticalAlignment: { writable: false },
  });

  return newComment;
}

function mixinCommentStackingTrait<C extends Comment>(
  comment: C,
  options: CommentStackingTraitOptions = {},
): C & CommentStackingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentStackingTrait, options);
  const stackingTrait: CommentStackingTrait = {
    stackingDirection: finalOptions.stackingDirection,
  };

  const newComment = Object.assign(comment, stackingTrait);
  Object.defineProperties(newComment, {
    stackingDirection: { writable: false },
  });

  return newComment;
}

function mixinCommentScrollingTrait<C extends Comment>(
  comment: C,
  options: CommentScrollingTraitOptions = {},
): C & CommentScrollingTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentScrollingTrait, options);
  const scrollingTrait: CommentScrollingTrait = {
    scrollingDirection: finalOptions.scrollingDirection,
  };

  const newComment = Object.assign(comment, scrollingTrait);
  Object.defineProperties(newComment, {
    scrollingDirection: { writable: false },
  });

  return newComment;
}

function mixinCommentLifetimeTrait<C extends Comment>(
  comment: C,
  options: CommentLifetimeTraitOptions = {},
): C & CommentLifetimeTrait {
  const finalOptions = merge({}, defaultOptions.mixinCommentLifetimeTrait, options);
  const lifetimeTrait: CommentLifetimeTrait = {
    lifetime: finalOptions.lifetime,
  };

  const newComment = Object.assign(comment, lifetimeTrait);
  Object.defineProperties(newComment, {
    lifetime: { writable: false },
  });

  return newComment;
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
  defaultOptions,
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
