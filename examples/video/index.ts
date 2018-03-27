import {
  Comment,
} from "../../";

import debounce from "debounce";

import {
  hasCommentTextTrait,
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createPlayer,
} from "../../";

interface MyCommentData {
  creationTime: number;
}

function isMyCommentData(value: any): value is MyCommentData {
  return value && value.creationTime != null;
}

const isIE =
  (navigator.appName === "Microsoft Internet Explorer") ||
  (navigator.userAgent.indexOf("Trident") !== -1);

// Elements
const screen: HTMLDivElement = getElementById("screen");
const video: HTMLVideoElement = getElementById("video");
const danmaku: HTMLDivElement = getElementById("danmaku");
const videoPicker: HTMLSelectElement = getElementById("videoPicker");
const commentsPicker: HTMLSelectElement = getElementById("commentsPicker");
const screenDimensionsPicker: HTMLSelectElement = getElementById("screenDimensionsPicker");
const screenMarginTopSlider: HTMLInputElement = getElementById("screenMarginTopSlider");
const screenMarginTopDisplay: HTMLSpanElement = getElementById("screenMarginTopDisplay");
const screenMarginBottomSlider: HTMLInputElement = getElementById("screenMarginBottomSlider");
const screenMarginBottomDisplay: HTMLSpanElement = getElementById("screenMarginBottomDisplay");
const commentOpacitySlider: HTMLInputElement = getElementById("commentOpacitySlider");
const commentOpacityDisplay: HTMLSpanElement = getElementById("commentOpacityDisplay");
const commentFontFamilyPicker: HTMLSelectElement = getElementById("commentFontFamilyPicker");
const commentLineHeightSlider: HTMLInputElement = getElementById("commentLineHeightSlider");
const commentLineHeightDisplay: HTMLSpanElement = getElementById("commentLineHeightDisplay");
const commentScrollingSpeedSlider: HTMLInputElement = getElementById("commentScrollingSpeedSlider");
const commentScrollingSpeedDisplay: HTMLSpanElement = getElementById("commentScrollingSpeedDisplay");
const videoToggleButton: HTMLButtonElement = getElementById("videoToggleButton");
const danmakuToggleButton: HTMLButtonElement = getElementById("danmakuToggleButton");
const newCommentTypePicker: HTMLSelectElement = getElementById("newCommentTypePicker");
const newCommentTextTextBox: HTMLInputElement = getElementById("newCommentTextTextBox");
const newCommentFontSizeSlider: HTMLInputElement = getElementById("newCommentFontSizeSlider");
const newCommentFontSizeDisplay: HTMLInputElement = getElementById("newCommentFontSizeDisplay");
const newCommentTextColorPicker: HTMLInputElement = getElementById("newCommentTextColorPicker");
const newCommentTextColorDisplay: HTMLSpanElement = getElementById("newCommentTextColorDisplay");
const newCommentTextColorShortcuts: HTMLSpanElement = getElementById("newCommentTextColorShortcuts");
const newCommentStackingDirectionFormItem: HTMLDivElement = getElementById("newCommentStackingDirectionFormItem");
const newCommentStackingDirectionPicker: HTMLSelectElement = getElementById("newCommentStackingDirectionPicker");
const newCommentScrollingDirectionFormItem: HTMLDivElement = getElementById("newCommentScrollingDirectionFormItem");
const newCommentScrollingDirectionPicker: HTMLSelectElement = getElementById("newCommentScrollingDirectionPicker");
const newCommentHorizontalAlignmentFormItem: HTMLDivElement = getElementById("newCommentHorizontalAlignmentFormItem");
const newCommentHorizontalAlignmentPicker: HTMLSelectElement = getElementById("newCommentHorizontalAlignmentPicker");
const newCommentVerticalAlignmentFormItem: HTMLDivElement = getElementById("newCommentVerticalAlignmentFormItem");
const newCommentVerticalAlignmentPicker: HTMLSelectElement = getElementById("newCommentVerticalAlignmentPicker");
const newCommentPositionXFormItem: HTMLDivElement = getElementById("newCommentPositionXFormItem");
const newCommentPositionXTextBox: HTMLInputElement = getElementById("newCommentPositionXTextBox");
const newCommentPositionYFormItem: HTMLDivElement = getElementById("newCommentPositionYFormItem");
const newCommentPositionYTextBox: HTMLInputElement = getElementById("newCommentPositionYTextBox");
const newCommentLifetimeFormItem: HTMLDivElement = getElementById("newCommentLifetimeFormItem");
const newCommentLifetimeSlider: HTMLInputElement = getElementById("newCommentLifetimeSlider");
const newCommentLifetimeDisplay: HTMLSpanElement = getElementById("newCommentLifetimeDisplay");
const newCommentPostButton: HTMLButtonElement = getElementById("newCommentPostButton");
const commentList: HTMLDivElement = getElementById("commentList");
const commentListContent: HTMLDivElement = getElementById("commentListContent");
const commentCount: HTMLSpanElement = getElementById("commentCount");
const commentsClearButton: HTMLButtonElement = getElementById("commentsClearButton");
const commentsReloadButton: HTMLButtonElement = getElementById("commentsReloadButton");

const tmpCommentRowTemplate = commentListContent.querySelector("li");
if (tmpCommentRowTemplate == null) {
  throw new Error("CommentRowTemplate not found.");
}

const commentRowTemplate = tmpCommentRowTemplate;

// Player
const danmakuPlayer = createPlayer({
  timeGetter() {
    return video.currentTime * 1000;
  },
});

danmakuPlayer.play();
danmakuPlayer.pause();

danmaku.appendChild(danmakuPlayer.element);
video.addEventListener("playing", () => danmakuPlayer.play());
video.addEventListener("pause", () => danmakuPlayer.pause());

// Screen Settings
function loadVideo(): void {
  video.src = videoPicker.value;
}

function loadComments(): void {
  commentsPicker.disabled = true;
  danmakuPlayer.comments.clear();

  loadCommentsByURL(commentsPicker.value, (error) => {
    if (error != null) {
      alert(`Failed to load comments: ${error}`);
    }

    commentsPicker.disabled = false;
  });
}

videoPicker.addEventListener("change", () => loadVideo());
commentsPicker.addEventListener("change", () => loadComments());

// Screen Settings
function applyScreenDimensions(): void {
  const dimensions = screenDimensionsPicker.value.split("x");
  const width = Number(dimensions[0]);
  const height = Number(dimensions[1]);

  screen.style.width = width + "px";
  screen.style.height = height + "px";
  danmakuPlayer.resize(width, height);
}

function applyScreenMarginTop(): void {
  danmakuPlayer.renderer.screenMarginTop = Number(screenMarginTopSlider.value);
}

function applyScreenMarginBottom(): void {
  danmakuPlayer.renderer.screenMarginBottom = Number(screenMarginBottomSlider.value);
}

function updateScreenMarginTopDisplay(): void {
  screenMarginTopDisplay.innerText = screenMarginTopSlider.value;
}

function updateScreenMarginBottomDisplay(): void {
  screenMarginBottomDisplay.innerText = screenMarginBottomSlider.value;
}

screenDimensionsPicker.addEventListener("change", () => applyScreenDimensions());

if (isIE) {
  const applyScreenMarginTopDebounced = debounce(applyScreenMarginTop, 1000);
  const applyScreenMarginBottomDebounced = debounce(applyScreenMarginBottom, 1000);
  screenMarginTopSlider.addEventListener("change", () => applyScreenMarginTopDebounced());
  screenMarginBottomSlider.addEventListener("change", () => applyScreenMarginBottomDebounced());
  screenMarginTopSlider.addEventListener("change", () => updateScreenMarginTopDisplay());
  screenMarginBottomSlider.addEventListener("change", () => updateScreenMarginBottomDisplay());
} else {
  screenMarginTopSlider.addEventListener("change", () => applyScreenMarginTop());
  screenMarginBottomSlider.addEventListener("change", () => applyScreenMarginBottom());
  screenMarginTopSlider.addEventListener("input", () => updateScreenMarginTopDisplay());
  screenMarginBottomSlider.addEventListener("input", () => updateScreenMarginBottomDisplay());
}

// Comment Settings
function applyCommentOpacity(): void {
  danmakuPlayer.renderer.commentOpacity = Number(commentOpacitySlider.value) / 100;
}

function applyCommentFontFamily(): void {
  danmakuPlayer.renderer.commentFontFamily = [
    commentFontFamilyPicker.value,
    "Arial",
    "Microsoft YaHei",
    "sans-serif",
  ];
}

function applyCommentLineHeight(): void {
  danmakuPlayer.renderer.commentLineHeight = Number(commentLineHeightSlider.value);
}

function applyCommentScrollingSpeed(): void {
  const ratio = Number(commentScrollingSpeedSlider.value) / 100;
  danmakuPlayer.renderer.commentScrollingBasicSpeed = 0.120 * ratio;
  danmakuPlayer.renderer.commentScrollingExtraSpeedPerPixel = 0.0002 * ratio;
}

function updateCommentOpacityDisplay(): void {
  commentOpacityDisplay.innerText = commentOpacitySlider.value;
}

function updateCommentLineHeightDisplay(): void {
  commentLineHeightDisplay.innerText = commentLineHeightSlider.value;
}

function updateCommentScrollingSpeed(): void {
  commentScrollingSpeedDisplay.innerText = commentScrollingSpeedSlider.value;
}

commentFontFamilyPicker.addEventListener("change", () => applyCommentFontFamily());

if (isIE) {
  const applyCommentOpacityDebounced = debounce(applyCommentOpacity, 1000);
  const applyCommentLineHeightDebounced = debounce(applyCommentLineHeight, 1000);
  const applyCommentScrollingSpeedDebounced = debounce(applyCommentScrollingSpeed, 1000);
  commentOpacitySlider.addEventListener("change", () => applyCommentOpacityDebounced());
  commentLineHeightSlider.addEventListener("change", () => applyCommentLineHeightDebounced());
  commentScrollingSpeedSlider.addEventListener("change", () => applyCommentScrollingSpeedDebounced());
  commentOpacitySlider.addEventListener("change", () => updateCommentOpacityDisplay());
  commentLineHeightSlider.addEventListener("change", () => updateCommentLineHeightDisplay());
  commentScrollingSpeedSlider.addEventListener("change", () => updateCommentScrollingSpeed());
} else {
  commentOpacitySlider.addEventListener("change", () => applyCommentOpacity());
  commentLineHeightSlider.addEventListener("change", () => applyCommentLineHeight());
  commentScrollingSpeedSlider.addEventListener("change", () => applyCommentScrollingSpeed());
  commentOpacitySlider.addEventListener("input", () => updateCommentOpacityDisplay());
  commentLineHeightSlider.addEventListener("input", () => updateCommentLineHeightDisplay());
  commentScrollingSpeedSlider.addEventListener("input", () => updateCommentScrollingSpeed());
}

// Controls
function updateVideoToggleButton(): void {
  if (video.paused) {
    videoToggleButton.innerText = "Play";
  } else {
    videoToggleButton.innerText = "Pause";
  }
}

function updateDanmakuToggleButton(): void {
  if (danmakuPlayer.state === "idle") {
    danmakuToggleButton.innerText = "Show Damaku";
  } else {
    danmakuToggleButton.innerText = "Hide Damaku";
  }
}

function toggleVideo(): void {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function toggleDanmaku(): void {
  if (danmakuPlayer.state === "idle") {
    danmakuPlayer.play();
  } else {
    danmakuPlayer.stop();
  }
}

video.addEventListener("pause", () => updateVideoToggleButton());
video.addEventListener("playing", () => updateVideoToggleButton());
danmakuPlayer.events.on("idle", () => updateDanmakuToggleButton());
danmakuPlayer.events.on("playing", () => updateDanmakuToggleButton());
videoToggleButton.addEventListener("click", () => toggleVideo());
danmakuToggleButton.addEventListener("click", () => toggleDanmaku());

// New Comment
function applyNewCommentType(): void {
  const type = newCommentTypePicker.value;

  newCommentStackingDirectionFormItem.style.display = "none";
  newCommentScrollingDirectionFormItem.style.display = "none";
  newCommentHorizontalAlignmentFormItem.style.display = "none";
  newCommentVerticalAlignmentFormItem.style.display = "none";
  newCommentPositionXFormItem.style.display = "none";
  newCommentPositionYFormItem.style.display = "none";
  newCommentLifetimeFormItem.style.display = "none";

  if (type === "ScrollingComment") {
    newCommentStackingDirectionFormItem.style.display = "block";
    newCommentScrollingDirectionFormItem.style.display = "block";
  } else if (type === "StackingComment") {
    newCommentStackingDirectionFormItem.style.display = "block";
    newCommentHorizontalAlignmentFormItem.style.display = "block";
    newCommentLifetimeFormItem.style.display = "block";
  } else if (type === "PositioningComment") {
    newCommentPositionXFormItem.style.display = "block";
    newCommentPositionYFormItem.style.display = "block";
    newCommentLifetimeFormItem.style.display = "block";
  }
}

function updateNewCommentFontSizeDisplay(): void {
  newCommentFontSizeDisplay.innerText = newCommentFontSizeSlider.value;
}

function updateNewCommentTextColorDisplay(): void {
  newCommentTextColorDisplay.innerText = newCommentTextColorPicker.value.toUpperCase();
}

function updateNewCommentLifetimeDisplay(): void {
  newCommentLifetimeDisplay.innerText = newCommentLifetimeSlider.value;
}

function postComment(): void {
  const type = newCommentTypePicker.value;

  const data: MyCommentData = {
    creationTime: Date.now(),
  };

  const commonOptions = {
    time: danmakuPlayer.time,
    data,
    text: newCommentTextTextBox.value,
    fontSize: Number(newCommentFontSizeSlider.value),
    textColor: newCommentTextColorPicker.value,
    isOwn: true,
  };

  let comment: Comment;

  if (type === "ScrollingComment") {
    comment = createScrollingComment({
      ...commonOptions,
      stackingDirection: newCommentStackingDirectionPicker.value as ("up" | "down"),
      scrollingDirection: newCommentScrollingDirectionPicker.value as ("left" | "right"),
    });
  } else if (type === "StackingComment") {
    comment = createStackingComment({
      ...commonOptions,
      stackingDirection: newCommentStackingDirectionPicker.value as ("up" | "down"),
      horizontalAlignment: newCommentHorizontalAlignmentPicker.value as ("left" | "center" | "right"),
      lifetime: Number(newCommentLifetimeSlider.value) * 1000,
    });
  } else if (type === "PositioningComment") {
    comment = createPositioningComment({
      ...commonOptions,
      positionX: Number(newCommentPositionXTextBox.value),
      positionY: Number(newCommentPositionYTextBox.value),
      lifetime: Number(newCommentLifetimeSlider.value) * 1000,
    });
  } else {
    throw new Error(`Unexpected type: ${type}`);
  }

  danmakuPlayer.comments.add(comment);
  danmakuPlayer.renderer.renderComment(comment);
}

newCommentTypePicker.addEventListener("change", () => applyNewCommentType());

newCommentTextColorShortcuts.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const color = target.getAttribute("data-color");
  if (color != null) {
    newCommentTextColorPicker.value = color;
    updateNewCommentTextColorDisplay();
    e.preventDefault();
  }
});

newCommentPostButton.addEventListener("click", () => postComment());

if (isIE) {
  newCommentFontSizeSlider.addEventListener("change", () => updateNewCommentFontSizeDisplay());
  newCommentTextColorPicker.addEventListener("change", () => updateNewCommentTextColorDisplay());
  newCommentLifetimeSlider.addEventListener("change", () => updateNewCommentLifetimeDisplay());
} else {
  newCommentFontSizeSlider.addEventListener("input", () => updateNewCommentFontSizeDisplay());
  newCommentTextColorPicker.addEventListener("input", () => updateNewCommentTextColorDisplay());
  newCommentLifetimeSlider.addEventListener("input", () => updateNewCommentLifetimeDisplay());
}

// Comments
const commentListHeight = 360;
const commentRowHeight = 36;
let commentListMinSafeOffset: number = 0;
let commentListMaxSafeOffset: number = commentListHeight;

function updateCommentCount(): void {
  commentCount.innerText = String(danmakuPlayer.comments.comments.length);
}

function updateCommentList(): void {
  const comments = danmakuPlayer.comments.comments;
  const maxVisibleRows = Math.ceil(commentListHeight / commentRowHeight);
  const maxBufferedRows = maxVisibleRows * 3;
  const maxSpreadRows = maxBufferedRows - maxVisibleRows;

  commentListContent.style.height = (comments.length * commentRowHeight) + "px";

  const firstVisibleRowIndex = Math.floor(commentList.scrollTop / commentRowHeight);
  const lastVisibleRowIndex = Math.min(firstVisibleRowIndex + maxVisibleRows, comments.length - 1);
  const firstSafeRowIndex = Math.max(firstVisibleRowIndex - maxSpreadRows, 0);
  const lastSafeRowIndex = Math.min(lastVisibleRowIndex + maxSpreadRows, comments.length - 1);
  const firstRowIndex = Math.max(firstVisibleRowIndex - maxBufferedRows, 0);
  const lastRowIndex = Math.min(lastVisibleRowIndex + maxBufferedRows, comments.length - 1);
  const rowCount = lastRowIndex - firstRowIndex + 1;

  const rows: HTMLLIElement[] = Array.prototype.slice.call(commentListContent.querySelectorAll("li"));

  if (rowCount > rows.length) {
    let numAppend: number = rowCount - rows.length;

    while (numAppend--) {
      const row = commentRowTemplate.cloneNode(true) as HTMLLIElement;
      commentListContent.appendChild(row);
      rows.push(row);
    }
  } else if (rowCount < rows.length) {
    let numRemove: number = rows.length - rowCount;

    do {
      const row = rows.pop();
      if (row == null) {
        break;
      }

      commentListContent.removeChild(row);
    } while (--numRemove);
  }

  commentListMinSafeOffset = 0;
  commentListMaxSafeOffset = commentListHeight;

  rows.forEach((row, iterIndex) => {
    const rowIndex = firstRowIndex + iterIndex;
    const comment = comments[rowIndex];
    const timeCol = row.querySelector(".comments-timeCol") as (HTMLElement | null);
    const textCol = row.querySelector(".comments-textCol") as (HTMLElement | null);
    const creationTimeCol = row.querySelector(".comments-creationTimeCol") as (HTMLElement | null);

    if (timeCol == null || textCol == null || creationTimeCol == null) {
      throw new Error("Unexcepted CommentRowTemplate.");
    }

    const timeInSeconds = Math.round(comment.time / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const minutesText = minutes < 10 ? `0${minutes}` : String(minutes);
    const secondsText = seconds < 10 ? `0${seconds}` : String(seconds);
    timeCol.innerText = `${minutesText}:${secondsText}`;

    if (hasCommentTextTrait(comment)) {
      textCol.innerText = comment.text;
      textCol.title = comment.text;
    } else {
      textCol.innerText = "This is not a text comment.";
      textCol.title = "This is not a text comment.";
    }

    if (isMyCommentData(comment.data)) {
      const isoDatetime = (new Date(comment.data.creationTime)).toISOString();
      const foramtedDatetime = isoDatetime.substr(0, 19).replace("T", " ");
      creationTimeCol.innerText = foramtedDatetime;
    }

    const rowOffset = rowIndex * commentRowHeight;
    row.style.top = rowOffset + "px";

    if (rowIndex === firstSafeRowIndex) {
      commentListMinSafeOffset = rowOffset;
    } else if (rowIndex === lastSafeRowIndex) {
      commentListMaxSafeOffset = rowOffset + commentRowHeight;
    }
  });
}

commentList.addEventListener("scroll", () => {
  const viewTopOffset = commentList.scrollTop;
  const viewBottomOffset = viewTopOffset + commentListHeight;

  if (
    viewTopOffset < commentListMinSafeOffset ||
    viewBottomOffset > commentListMaxSafeOffset
  ) {
    updateCommentList();
  }
});

commentsClearButton.addEventListener("click", () => danmakuPlayer.comments.clear());
commentsReloadButton.addEventListener("click", () => loadComments());

const updateCommentCountDebounced = debounce(updateCommentCount, 500);
const updateCommentListDebounced = debounce(updateCommentList, 500);

danmakuPlayer.comments.events
  .on("added", () => {
    updateCommentCountDebounced();
    updateCommentListDebounced();
  })
  .on("removed", () => {
    updateCommentCountDebounced();
    updateCommentListDebounced();
  })
  .on("loaded", () => {
    updateCommentCount();
    updateCommentList();
  })
  .on("cleared", () => {
    updateCommentCount();
    updateCommentList();
  });

// Utilities
function getElementById<E extends HTMLElement>(id: string): E {
  const elem = document.getElementById(id);
  if (elem == null) {
    throw new Error(`No element found with ID "${id}".`);
  }

  return elem as E;
}

function loadCommentsByURL(url: string, callback: (error: (Error | null)) => void): void {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";

    xhr.addEventListener("error", (e) => {
      callback(new Error(e.message));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status !== 200) {
        callback(new Error(`Unexpected status: ${xhr.status}.`));
        return;
      }

      const xml = xhr.responseXML;
      if (xml == null) {
        callback(new Error("Content is empty."));
        return;
      }

      const comments = parseCommentsXML(xml);
      danmakuPlayer.comments.load(comments);
      callback(null);
    });

    xhr.send();
  } catch (e) {
    callback(e);
  }
}

function parseCommentsXML(xml: XMLDocument): Comment[] {
  const dList = xml.querySelectorAll("d");
  const comments: Comment[] = [];

  Array.prototype.forEach.call(dList, (d: Element) => {
    const p = d.getAttribute("p");
    if (p == null) {
      return;
    }

    const pItems = p.split(",");
    const text = d.childNodes[0].nodeValue || "";
    const time = Math.round(Number(pItems[0]) * 1000);
    const type = pItems[1];
    const fontSize = Number(pItems[2]);
    const textColor = "#" + ("00" + Number(pItems[3]).toString(16)).slice(-6);
    const creationTime = Number(pItems[4]) * 1000;

    const data: MyCommentData = { creationTime };

    const commonOptions = {
      time,
      data,
      text,
      fontSize,
      textColor,
    };

    let comment: Comment;

    if (type === "1") {
      const options = {
        ...commonOptions,
        scrollingDirection: "left" as "left",
      };

      comment = createScrollingComment(options);
    } else if (type === "4") {
      const options = {
        ...commonOptions,
        stackingDirection: "up" as "up",
      };

      comment = createStackingComment(options);
    } else if (type === "5") {
      const options = {
        ...commonOptions,
        stackingDirection: "down" as "down",
      };

      comment = createStackingComment(options);
    } else {
      return;
    }

    comments.push(comment);
  });

  return comments;
}

// Side Effects
applyScreenDimensions();
applyScreenMarginTop();
applyScreenMarginBottom();
updateScreenMarginTopDisplay();
updateScreenMarginBottomDisplay();
applyCommentOpacity();
applyCommentFontFamily();
applyCommentLineHeight();
applyCommentScrollingSpeed();
updateCommentOpacityDisplay();
updateCommentLineHeightDisplay();
updateCommentScrollingSpeed();
updateVideoToggleButton();
updateDanmakuToggleButton();
applyNewCommentType();
updateCommentCount();
updateCommentList();
loadVideo();
loadComments();
