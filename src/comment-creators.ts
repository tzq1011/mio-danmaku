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

import uniqueId from "lodash/uniqueId";

import mixin from "./utils/mixin";
import { createEventEmitter } from "./event-emitter";

interface DefaultCommentOptions {
  time: Comment["time"];
  isOwn: Comment["isOwn"];
}

type DefaultCommentTextTraitOptions = CommentTextTrait;
type DefaultCommentPositionXTraitOptions = CommentPositionXTrait;
type DefaultCommentPositionYTraitOptions = CommentPositionYTrait;
type DefaultCommentHorizontalAlignmentTraitOptions = CommentHorizontalAlignmentTrait;
type DefaultCommentVerticalAlignmentTraitOptions = CommentVerticalAlignmentTrait;
type DefaultCommentStackingTraitOptions = CommentStackingTrait;
type DefaultCommentScrollingTraitOptions = CommentScrollingTrait;
type DefaultCommentLifetimeTraitOptions = CommentLifetimeTrait;
type DefaultStackingCommentOptions = StackingComment;
type DefaultScrollingCommentOptions = ScrollingComment;
type DefaultPositioningCommentOptions = PositioningComment;

type CommentOptions = Partial<DefaultCommentOptions>;
type CommentTextTraitOptions = Partial<DefaultCommentTextTraitOptions>;
type CommentPositionXTraitOptions = Partial<DefaultCommentPositionXTraitOptions>;
type CommentPositionYTraitOptions = Partial<DefaultCommentPositionYTraitOptions>;
type CommentHorizontalAlignmentTraitOptions = Partial<DefaultCommentHorizontalAlignmentTraitOptions>;
type CommentVerticalAlignmentTraitOptions = Partial<DefaultCommentVerticalAlignmentTraitOptions>;
type CommentStackingTraitOptions = Partial<DefaultCommentStackingTraitOptions>;
type CommentScrollingTraitOptions = Partial<DefaultCommentScrollingTraitOptions>;
type CommentLifetimeTraitOptions = Partial<DefaultCommentLifetimeTraitOptions>;

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

const defaultCommentOptions: DefaultCommentOptions = {
  time: 0,
  isOwn: false,
};

const defaultCommentTextTraitOptions: DefaultCommentTextTraitOptions = {
  text: "Nya",
  fontSize: 25,
  fontColor: "#fff",
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

function createComment(options: CommentOptions = {}): Comment {
  const finalOptions = {
    ...defaultCommentOptions,
    ...options,
  };

  const instanceId = uniqueId();
  const events: EventEmitter<CommentEvents> = createEventEmitter();

  const comment: Comment = {
    instanceId,
    events,
    time: finalOptions.time,
    isOwn: finalOptions.isOwn,
  };

  Object.defineProperties(comment, {
    instanceId: { writable: false },
    events: { writable: false },
    time: { writable: false },
    isOwn: { writable: false },
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
    fontColor: finalOptions.fontColor,
  };

  const newComment = Object.assign(comment, trait);
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
  const finalOptions = {
    ...defaultCommentPositionXTraitOptions,
    ...options,
  };

  const trait: CommentPositionXTrait = {
    positionX: finalOptions.positionX,
  };

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    positionX: { writable: false },
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

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    positionY: { writable: false },
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

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    horizontalAlignment: { writable: false },
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

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    verticalAlignment: { writable: false },
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

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    stackingDirection: { writable: false },
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

  const newComment = Object.assign(comment, trait);
  Object.defineProperties(newComment, {
    scrollingDirection: { writable: false },
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

  const newComment = Object.assign(comment, trait);
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
