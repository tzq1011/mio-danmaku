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

import assign from "object-assign";

import mixin from "./utils/mixin";
import { createEventEmitter } from "./event-emitter";

interface CommentOptions {
  time?: Comment["time"];
  data?: Comment["data"];
  isOwn?: Comment["isOwn"];
}

interface CommentTextTraitOptions {
  text?: CommentTextTrait["text"];
  fontSize?: CommentTextTrait["fontSize"];
  textColor?: CommentTextTrait["textColor"];
}

interface CommentPositionXTraitOptions {
  positionX?: CommentPositionXTrait["positionX"];
}

interface CommentPositionYTraitOptions {
  positionY?: CommentPositionYTrait["positionY"];
}

interface CommentHorizontalAlignmentTraitOptions {
  horizontalAlignment?: CommentHorizontalAlignmentTrait["horizontalAlignment"];
}

interface CommentVerticalAlignmentTraitOptions {
  verticalAlignment?: CommentVerticalAlignmentTrait["verticalAlignment"];
}

interface CommentStackingTraitOptions {
  stackingDirection?: CommentStackingTrait["stackingDirection"];
}

interface CommentScrollingTraitOptions {
  scrollingDirection?: CommentScrollingTrait["scrollingDirection"];
}

interface CommentLifetimeTraitOptions {
  lifetime?: CommentLifetimeTrait["lifetime"];
}

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

interface DefaultCommentOptions {
  time: Comment["time"];
  isOwn: Comment["isOwn"];
}

interface DefaultCommentTextTraitOptions {
  text: CommentTextTrait["text"];
  fontSize: CommentTextTrait["fontSize"];
  textColor: CommentTextTrait["textColor"];
}

interface DefaultCommentPositionXTraitOptions {
  positionX: CommentPositionXTrait["positionX"];
}

interface DefaultCommentPositionYTraitOptions {
  positionY: CommentPositionYTrait["positionY"];
}

interface DefaultCommentHorizontalAlignmentTraitOptions {
  horizontalAlignment: CommentHorizontalAlignmentTrait["horizontalAlignment"];
}

interface DefaultCommentVerticalAlignmentTraitOptions {
  verticalAlignment: CommentVerticalAlignmentTrait["verticalAlignment"];
}

interface DefaultCommentStackingTraitOptions {
  stackingDirection: CommentStackingTrait["stackingDirection"];
}

interface DefaultCommentScrollingTraitOptions {
  scrollingDirection: CommentScrollingTrait["scrollingDirection"];
}

interface DefaultCommentLifetimeTraitOptions {
  lifetime: CommentLifetimeTrait["lifetime"];
}

const defaultCommentOptions: DefaultCommentOptions = {
  time: 0,
  isOwn: false,
};

const defaultCommentTextTraitOptions: DefaultCommentTextTraitOptions = {
  text: "Nya",
  fontSize: 25,
  textColor: "#fff",
};

const defaultCommentPositionXTraitOptions: DefaultCommentPositionXTraitOptions = {
  positionX: 0,
};

const defaultCommentPositionYTraitOptions: DefaultCommentPositionYTraitOptions = {
  positionY: 0,
};

const defaultCommentHorizontalAlignmentTraitOptions: DefaultCommentHorizontalAlignmentTraitOptions = {
  horizontalAlignment: "center",
};

const defaultCommentVerticalAlignmentTraitOptions: DefaultCommentVerticalAlignmentTraitOptions = {
  verticalAlignment: "middle",
};

const defaultCommentStackingTraitOptions: DefaultCommentStackingTraitOptions = {
  stackingDirection: "down",
};

const defaultCommentScrollingTraitOptions: DefaultCommentScrollingTraitOptions = {
  scrollingDirection: "left",
};

const defaultCommentLifetimeTraitOptions: DefaultCommentLifetimeTraitOptions = {
  lifetime: 5000,
};

let instanceNumber: number = 0;

function createComment(options: CommentOptions = {}): Comment {
  const finalOptions = {
    ...defaultCommentOptions,
    ...options,
  };

  if (finalOptions.data == null) {
    finalOptions.data = {};
  }

  const instanceId = `Comment${++instanceNumber}`;
  const events: EventEmitter<CommentEvents> = createEventEmitter();

  const comment: Comment = {
    instanceId,
    events,
    time: finalOptions.time,
    data: finalOptions.data,
    isOwn: finalOptions.isOwn,
  };

  Object.defineProperties(comment, {
    instanceId: { configurable: false },
    events: { configurable: false },
    time: { configurable: false },
    isOwn: { configurable: false },
  });

  return comment;
}

function mixinCommentTextTrait<C extends Comment>(
  comment: C,
  options: CommentTextTraitOptions = {},
): C & CommentTextTrait {
  const finalOptions = {
    ...defaultCommentTextTraitOptions,
    ...options,
  };

  const trait: CommentTextTrait = {
    text: finalOptions.text,
    fontSize: finalOptions.fontSize,
    textColor: finalOptions.textColor,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    text: { configurable: false },
    fontSize: { configurable: false },
    textColor: { configurable: false },
  });

  return newComment;
}

function mixinCommentPositionXTrait<C extends Comment>(
  comment: C,
  options: CommentPositionXTraitOptions = {},
): C & CommentPositionXTrait {
  const finalOptions = {
    ...defaultCommentPositionXTraitOptions,
    ...options,
  };

  const trait: CommentPositionXTrait = {
    positionX: finalOptions.positionX,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    positionX: { configurable: false },
  });

  return newComment;
}

function mixinCommentPositionYTrait<C extends Comment>(
  comment: C,
  options: CommentPositionYTraitOptions = {},
): C & CommentPositionYTrait {
  const finalOptions = {
    ...defaultCommentPositionYTraitOptions,
    ...options,
  };

  const trait: CommentPositionYTrait = {
    positionY: finalOptions.positionY,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    positionY: { configurable: false },
  });

  return newComment;
}

function mixinCommentHorizontalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentHorizontalAlignmentTraitOptions = {},
): C & CommentHorizontalAlignmentTrait {
  const finalOptions = {
    ...defaultCommentHorizontalAlignmentTraitOptions,
    ...options,
  };

  const trait: CommentHorizontalAlignmentTrait = {
    horizontalAlignment: finalOptions.horizontalAlignment,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    horizontalAlignment: { configurable: false },
  });

  return newComment;
}

function mixinCommentVerticalAlignmentTrait<C extends Comment>(
  comment: C,
  options: CommentVerticalAlignmentTraitOptions = {},
): C & CommentVerticalAlignmentTrait {
  const finalOptions = {
    ...defaultCommentVerticalAlignmentTraitOptions,
    ...options,
  };

  const trait: CommentVerticalAlignmentTrait = {
    verticalAlignment: finalOptions.verticalAlignment,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    verticalAlignment: { configurable: false },
  });

  return newComment;
}

function mixinCommentStackingTrait<C extends Comment>(
  comment: C,
  options: CommentStackingTraitOptions = {},
): C & CommentStackingTrait {
  const finalOptions = {
    ...defaultCommentStackingTraitOptions,
    ...options,
  };

  const trait: CommentStackingTrait = {
    stackingDirection: finalOptions.stackingDirection,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    stackingDirection: { configurable: false },
  });

  return newComment;
}

function mixinCommentScrollingTrait<C extends Comment>(
  comment: C,
  options: CommentScrollingTraitOptions = {},
): C & CommentScrollingTrait {
  const finalOptions = {
    ...defaultCommentScrollingTraitOptions,
    ...options,
  };

  const trait: CommentScrollingTrait = {
    scrollingDirection: finalOptions.scrollingDirection,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    scrollingDirection: { configurable: false },
  });

  return newComment;
}

function mixinCommentLifetimeTrait<C extends Comment>(
  comment: C,
  options: CommentLifetimeTraitOptions = {},
): C & CommentLifetimeTrait {
  const finalOptions = {
    ...defaultCommentLifetimeTraitOptions,
    ...options,
  };

  const trait: CommentLifetimeTrait = {
    lifetime: finalOptions.lifetime,
  };

  const newComment = assign(comment, trait);
  Object.defineProperties(newComment, {
    lifetime: { configurable: false },
  });

  return newComment;
}

function createStackingComment(options: StackingCommentOptions = {}): StackingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentHorizontalAlignmentTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentLifetimeTrait(target, options),
  );
}

function createScrollingComment(options: ScrollingCommentOptions = {}): ScrollingComment {
  const comment = createComment(options);
  return mixin(
    comment,
    (target) => mixinCommentTextTrait(target, options),
    (target) => mixinCommentStackingTrait(target, options),
    (target) => mixinCommentScrollingTrait(target, options),
  );
}

function createPositioningComment(options: PositioningCommentOptions = {}): PositioningComment {
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
  CommentOptions,
  CommentTextTraitOptions,
  CommentPositionXTraitOptions,
  CommentPositionYTraitOptions,
  CommentHorizontalAlignmentTraitOptions,
  CommentVerticalAlignmentTraitOptions,
  CommentStackingTraitOptions,
  CommentScrollingTraitOptions,
  CommentLifetimeTraitOptions,
  StackingCommentOptions,
  ScrollingCommentOptions,
  PositioningCommentOptions,
  DefaultCommentOptions,
  DefaultCommentTextTraitOptions,
  DefaultCommentPositionXTraitOptions,
  DefaultCommentPositionYTraitOptions,
  DefaultCommentHorizontalAlignmentTraitOptions,
  DefaultCommentVerticalAlignmentTraitOptions,
  DefaultCommentStackingTraitOptions,
  DefaultCommentScrollingTraitOptions,
  DefaultCommentLifetimeTraitOptions,
};

export {
  defaultCommentOptions,
  defaultCommentTextTraitOptions,
  defaultCommentPositionXTraitOptions,
  defaultCommentPositionYTraitOptions,
  defaultCommentHorizontalAlignmentTraitOptions,
  defaultCommentVerticalAlignmentTraitOptions,
  defaultCommentStackingTraitOptions,
  defaultCommentScrollingTraitOptions,
  defaultCommentLifetimeTraitOptions,
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
