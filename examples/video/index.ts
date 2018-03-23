import {
  Comment,
} from "../../";

import {
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createPlayer,
} from "../../";

// Initialize the Player
const tmpScreenElem = document.getElementById("screen") as (HTMLDivElement | null);
const tmpScreenVideoElem = document.getElementById("screenVideo") as (HTMLVideoElement | null);
const tmpScreenCommentsElem = document.getElementById("screenComments") as (HTMLDivElement | null);

if (
  tmpScreenElem == null ||
  tmpScreenVideoElem == null ||
  tmpScreenCommentsElem == null
) {
  throw new Error("Element not found.");
}

const screenElem = tmpScreenElem;
const screenVideoElem = tmpScreenVideoElem;
const screenCommentsElem = tmpScreenCommentsElem;

const danmakuPlayer = createPlayer({
  timeGetter() {
    return screenVideoElem.currentTime * 1000;
  },
});

screenCommentsElem.appendChild(danmakuPlayer.element);
screenVideoElem.addEventListener("playing", () => danmakuPlayer.play());
screenVideoElem.addEventListener("pause", () => danmakuPlayer.pause());

// Initialize the options panel for the video resource.
const tmpVideoURLInputElem = document.getElementById("videoURLInput") as (HTMLInputElement | null);
const tmpVideoURLSelectElem = document.getElementById("videoURLSelect") as (HTMLSelectElement | null);
const tmpVideoLoadingButtonElem = document.getElementById("videoLoadingButton") as (HTMLButtonElement | null);

if (
  tmpVideoURLInputElem == null ||
  tmpVideoURLSelectElem == null ||
  tmpVideoLoadingButtonElem == null
) {
  throw new Error("Element not found.");
}

const videoURLInputElem = tmpVideoURLInputElem;
const videoURLSelectElem = tmpVideoURLSelectElem;
const videoLoadingButtonElem = tmpVideoLoadingButtonElem;

videoURLSelectElem.addEventListener("change", onVideoURLSelectChange);
videoLoadingButtonElem.addEventListener("click", onVideoLoadingButtonClick);

function onVideoURLSelectChange(): void {
  videoURLInputElem.value = videoURLSelectElem.value;
}

function onVideoLoadingButtonClick(): void {
  if (videoURLInputElem.value === "") {
    alert("Please enter a URL to load the video.");
    return;
  }

  loadVideoByURL(videoURLInputElem.value);
}

onVideoURLSelectChange();
onVideoLoadingButtonClick();

// Initialize the options panel for the comment resource.
const tmpCommentsURLInputElem = document.getElementById("commentsURLInput") as (HTMLInputElement | null);
const tmpCommentsURLSelectElem = document.getElementById("commentsURLSelect") as (HTMLSelectElement | null);
const tmpCommentsLoadingButtonElem = document.getElementById("commentsLoadingButton") as (HTMLButtonElement | null);

if (
  tmpCommentsURLInputElem == null ||
  tmpCommentsURLSelectElem == null ||
  tmpCommentsLoadingButtonElem == null
) {
  throw new Error("Element not found.");
}

const commentsURLInputElem = tmpCommentsURLInputElem;
const commentsURLSelectElem = tmpCommentsURLSelectElem;
const commentsLoadingButtonElem = tmpCommentsLoadingButtonElem;

commentsURLSelectElem.addEventListener("change", onCommentsURLSelectChange);
commentsLoadingButtonElem.addEventListener("click", onCommentsLoadingButtonClick);

function onCommentsURLSelectChange(): void {
  commentsURLInputElem.value = commentsURLSelectElem.value;
}

function onCommentsLoadingButtonClick(): void {
  if (videoURLInputElem.value === "") {
    alert("Please enter a URL to load the comments.");
    return;
  }

  loadCommentsByURL(commentsURLInputElem.value);
}

onCommentsURLSelectChange();
onCommentsLoadingButtonClick();

// Utils
function loadVideoByURL(url: string): void {
  screenVideoElem.src = url;
  screenVideoElem.play();
}

function loadCommentsByURL(url: string): void {
  const xhr = new XMLHttpRequest();
  xhr.responseType = "document";

  xhr.onload = () => {
    const xml = xhr.responseXML;
    if (xml == null) {
      alert("ResponseXML is empty.");
      throw new Error("ResponseXML is empty.");
    }

    const comments = parseCommentsXML(xml);
    danmakuPlayer.comments.load(comments);
  };

  xhr.open("GET", url);
  xhr.send();
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
