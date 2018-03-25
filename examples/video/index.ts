import {
  Comment,
} from "../../";

import debounce from "debounce";

import {
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createPlayer,
} from "../../";

const isIE =
  (navigator.appName === "Microsoft Internet Explorer") ||
  (navigator.userAgent.indexOf("Trident") !== -1);

// Get elements
function getElementById<E extends HTMLElement>(id: string): E {
  const elem = document.getElementById(id);
  if (elem == null) {
    throw new Error(`No element found with ID "${id}".`);
  }

  return elem as E;
}

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
const newCommentTypePicker: HTMLSelectElement = getElementById("newCommentTypePicker");
const newCommentTextTextBox: HTMLInputElement = getElementById("newCommentTextTextBox");
const newCommentFontSizeSlider: HTMLInputElement = getElementById("newCommentFontSizeSlider");
const newCommentFontSizeDisplay: HTMLInputElement = getElementById("newCommentFontSizeDisplay");
const newCommentTextColorPicker: HTMLInputElement = getElementById("newCommentTextColorPicker");
const newCommentTextColorDisplay: HTMLSpanElement = getElementById("newCommentTextColorDisplay");
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

// Screen
const danmakuPlayer = createPlayer({
  timeGetter() {
    return video.currentTime * 1000;
  },
});

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

loadVideo();
loadComments();

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

applyScreenDimensions();
applyScreenMarginTop();
applyScreenMarginBottom();
updateScreenMarginTopDisplay();
updateScreenMarginBottomDisplay();

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

applyCommentOpacity();
applyCommentFontFamily();
applyCommentLineHeight();
applyCommentScrollingSpeed();
updateCommentOpacityDisplay();
updateCommentLineHeightDisplay();
updateCommentScrollingSpeed();

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

newCommentTypePicker.addEventListener("change", () => applyNewCommentType());

applyNewCommentType();

// Utilities
function loadCommentsByURL(url: string, callback: (error: (Error | null)) => void): void {
  try {
    const xhr = new XMLHttpRequest();

    xhr.onerror = (e) => {
      callback(new Error(e.message));
    };

    xhr.onload = () => {
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
    };

    xhr.open("GET", url);
    xhr.responseType = "document";
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
    const fontColor = "#" + ("00" + Number(pItems[3]).toString(16)).slice(-6);

    const commonOptions = {
      time,
      text,
      fontSize,
      fontColor,
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
