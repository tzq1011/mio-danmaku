import {
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
} from "./types";

function isComment(target: any): target is Comment {
  return target && ((target as Comment).time != null);
}

function hasCommentTextTrait(comment: Comment): comment is (Comment & CommentTextTrait) {
  return (comment as (Comment & CommentTextTrait)).text != null;
}

function hasCommentPositionXTrait(comment: Comment): comment is (Comment & CommentPositionXTrait) {
  return (comment as (Comment & CommentPositionXTrait)).positionX != null;
}

function hasCommentPositionYTrait(comment: Comment): comment is (Comment & CommentPositionYTrait) {
  return (comment as (Comment & CommentPositionYTrait)).positionY != null;
}

function hasCommentHorizontalAlignmentTrait(comment: Comment): comment is (Comment & CommentHorizontalAlignmentTrait) {
  return (comment as (Comment & CommentHorizontalAlignmentTrait)).horizontalAlignment != null;
}

function hasCommentVerticalAlignmentTrait(comment: Comment): comment is (Comment & CommentVerticalAlignmentTrait) {
  return (comment as (Comment & CommentVerticalAlignmentTrait)).verticalAlignment != null;
}

function hasCommentStackingTrait(comment: Comment): comment is (Comment & CommentStackingTrait) {
  return (comment as (Comment & CommentStackingTrait)).stackingDirection != null;
}

function hasCommentScrollingTrait(comment: Comment): comment is (Comment & CommentScrollingTrait) {
  return (comment as (Comment & CommentScrollingTrait)).scrollingDirection != null;
}

function hasCommentLifetimeTrait(comment: Comment): comment is (Comment & CommentLifetimeTrait) {
  return (comment as (Comment & CommentLifetimeTrait)).lifetime != null;
}

function isStackingComment(target: any): target is StackingComment {
  return (
    isComment(target) &&
    hasCommentTextTrait(target) &&
    hasCommentHorizontalAlignmentTrait(target) &&
    hasCommentStackingTrait(target) &&
    hasCommentLifetimeTrait(target)
  );
}

function isScrollingComment(target: any): target is ScrollingComment {
  return (
    isComment(target) &&
    hasCommentTextTrait(target) &&
    hasCommentStackingTrait(target) &&
    hasCommentScrollingTrait(target)
  );
}

function isPositioningComment(target: any): target is PositioningComment {
  return (
    isComment(target) &&
    hasCommentTextTrait(target) &&
    hasCommentPositionXTrait(target) &&
    hasCommentPositionYTrait(target) &&
    hasCommentLifetimeTrait(target)
  );
}

export {
  isComment,
  hasCommentTextTrait,
  hasCommentPositionXTrait,
  hasCommentPositionYTrait,
  hasCommentHorizontalAlignmentTrait,
  hasCommentVerticalAlignmentTrait,
  hasCommentStackingTrait,
  hasCommentScrollingTrait,
  hasCommentLifetimeTrait,
  isStackingComment,
  isScrollingComment,
  isPositioningComment,
};
