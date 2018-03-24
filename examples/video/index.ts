import {
  Comment,
} from "../../";

import {
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createPlayer,
} from "../../";

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
const videoURLTextBox: HTMLInputElement = getElementById("videoURLTextBox");
const videoURLPicker: HTMLSelectElement = getElementById("videoURLPicker");
const videoLoadButton: HTMLButtonElement = getElementById("videoLoadingButton");
const commentsURLTextBox: HTMLInputElement = getElementById("commentsURLTextBox");
const commentsURLPicker: HTMLSelectElement = getElementById("commentsURLPicker");
const commentsLoadButton: HTMLButtonElement = getElementById("commentsLoadingButton");
const commentOpacitySlider: HTMLInputElement = getElementById("commentOpacitySlider");
const commentOpacityDisplay: HTMLInputElement = getElementById("commentOpacityDisplay");
const commentFontFamilyTextBox: HTMLInputElement = getElementById("commentFontFamilyTextBox");
const commentFontFamilyPicker: HTMLSelectElement = getElementById("commentFontFamilyPicker");
const commentLineHeightTextBox: HTMLInputElement = getElementById("commentLineHeightTextBox");
const commentTextShadowTextBox: HTMLInputElement = getElementById("commentTextShadowTextBox");
const maxRenderingCommentsTextBox: HTMLInputElement = getElementById("maxRenderingCommentsTextBox");
const generalRenderingOptionsApplyButton: HTMLButtonElement = getElementById("generalRenderingOptionsApplyButton");
const generalRenderingOptionsResetButton: HTMLButtonElement = getElementById("generalRenderingOptionsResetButton");
// const commentScrollingSpeedTextSlider: HTMLInputElement = getElementById("commentScrollingSpeedTextSlider");
// const commentScrollingBasicSpeedTextBox: HTMLInputElement = getElementById("commentScrollingBasicSpeedTextBox");
// const commentScrollingExtraSpeedTextBox: HTMLInputElement = getElementById("commentScrollingExtraSpeedTextBox");
// const screenWidthTextBox: HTMLInputElement = getElementById("screenWidthTextBox");
// const screenHeightTextBox: HTMLInputElement = getElementById("screenHeightTextBox");
// const screenMarginTopTextBox: HTMLInputElement = getElementById("screenMarginTopTextBox");
// const screenMarginBottomTextBox: HTMLInputElement = getElementById("screenMarginBottomTextBox");

// Screen
const danmakuPlayer = createPlayer({
  timeGetter() {
    return video.currentTime * 1000;
  },
});

danmaku.appendChild(danmakuPlayer.element);
video.addEventListener("playing", () => danmakuPlayer.play());
video.addEventListener("pause", () => danmakuPlayer.pause());

// Resources for Testing
function pickVideoURL(): void {
  videoURLTextBox.value = videoURLPicker.value;
}

function pickCommentsURL(): void {
  commentsURLTextBox.value = commentsURLPicker.value;
}

function loadVideo(): void {
  if (videoURLTextBox.value === "") {
    alert("Video URL is required.");
    return;
  }

  video.src = videoURLTextBox.value;
}

function loadComments(): void {
  if (commentsURLTextBox.value === "") {
    alert("Comments URL is required.");
    return;
  }

  const originalText = commentsLoadButton.innerText;
  commentsLoadButton.innerText = "Loading...";
  commentsLoadButton.disabled = true;

  danmakuPlayer.comments.clear();
  loadCommentsByURL(commentsURLTextBox.value, (error) => {
    if (error != null) {
      alert(`Failed to load comments: ${error}`);
    }

    commentsLoadButton.innerText = originalText;
    commentsLoadButton.disabled = false;
  });
}

videoURLPicker.addEventListener("change", () => pickVideoURL());
videoLoadButton.addEventListener("click", () => loadVideo());
commentsURLPicker.addEventListener("change", () => pickCommentsURL());
commentsLoadButton.addEventListener("click", () => loadComments());

pickVideoURL();
pickCommentsURL();
loadVideo();
loadComments();

// Rendering Options for All Comments
function updateCommentOpacityDisplay(): void {
  commentOpacityDisplay.innerText = commentOpacitySlider.value;
}

function pickCommentFontFamily(): void {
  commentFontFamilyTextBox.value = commentFontFamilyPicker.value;
}

function applyGeneralRenderingOptions(): void {
  if (commentOpacitySlider.value === "" || isNaN(Number(commentOpacitySlider.value))) {
    alert(`Opacity must be a number.`);
    return;
  }

  if (commentLineHeightTextBox.value === "" || isNaN(Number(commentLineHeightTextBox.value))) {
    alert(`Line height must be a number.`);
    return;
  }

  if (maxRenderingCommentsTextBox.value === "" || isNaN(Number(maxRenderingCommentsTextBox.value))) {
    alert(`Max concurrent must be a number.`);
    return;
  }

  const textShadowRE = /^(\d+) (\d+) (\d+) ([a-z]{2,}|#[0-9a-f]{3}|#[0-9a-f]{6})$/i;
  const textShadowMatch = textShadowRE.exec(commentTextShadowTextBox.value);

  if (commentTextShadowTextBox.value === "" || textShadowMatch == null) {
    alert(`Invalid text shadow format.`);
    return;
  }

  danmakuPlayer.renderer.commentOpacity = Number(commentOpacitySlider.value);
  danmakuPlayer.renderer.commentLineHeight = Number(commentLineHeightTextBox.value);
  danmakuPlayer.maxRenderingComments = Number(maxRenderingCommentsTextBox.value);

  danmakuPlayer.renderer.commentFontFamily =
    [commentFontFamilyTextBox.value, "Helvetica", "Arial", "sans-serif"];

  if (textShadowMatch != null) {
    danmakuPlayer.renderer.commentTextShadow = {
      offsetX: Number(textShadowMatch[1]),
      offsetY: Number(textShadowMatch[2]),
      blur: Number(textShadowMatch[3]),
      color: textShadowMatch[4],
    };
  }
}

function resetGeneralRenderingOptions(): void {
  commentOpacitySlider.value = String(danmakuPlayer.renderer.commentOpacity);
  commentLineHeightTextBox.value = String(danmakuPlayer.renderer.commentLineHeight);
  maxRenderingCommentsTextBox.value = String(danmakuPlayer.maxRenderingComments);

  commentFontFamilyTextBox.value =
    danmakuPlayer.renderer.commentFontFamily.length > 0
      ? danmakuPlayer.renderer.commentFontFamily[0]
      : "";

  let textShadow: string = "";
  if (danmakuPlayer.renderer.commentTextShadow != null) {
    const {
      offsetX,
      offsetY,
      blur,
      color,
    } = danmakuPlayer.renderer.commentTextShadow;

    textShadow = `${offsetX} ${offsetY} ${blur} ${color}`;
  }

  commentTextShadowTextBox.value = textShadow;
}

commentOpacitySlider.addEventListener("input", () => updateCommentOpacityDisplay());
commentFontFamilyPicker.addEventListener("change", () => pickCommentFontFamily());
generalRenderingOptionsApplyButton.addEventListener("click", () => applyGeneralRenderingOptions());
generalRenderingOptionsResetButton.addEventListener("click", () => resetGeneralRenderingOptions());

updateCommentOpacityDisplay();
pickCommentFontFamily();
applyGeneralRenderingOptions();

// Utilities
function loadCommentsByURL(url: string, callback: (error: (Error | null)) => void): void {
  try {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "document";

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
