import {
  Comment,
} from "../../";

import {
  createStackingComment,
  createScrollingComment,
  createPositioningComment,
  createPlayer,
} from "../../";

const containerElement = document.getElementById("container") as HTMLDivElement;
const videoElement = document.getElementById("video") as HTMLVideoElement;
const commentsElement = document.getElementById("comments") as HTMLDivElement;

function timeGetter(): number {
  return videoElement.currentTime * 1000;
}

const danmakuPlayer = createPlayer({ timeGetter });
commentsElement.appendChild(danmakuPlayer.element);
danmakuPlayer.renderer.screenMarginBottom = 40;

videoElement.addEventListener("playing", () => {
    if (danmakuPlayer.state !== "playing") {
      danmakuPlayer.play();
    }
  });

videoElement.addEventListener("pause", () => {
    if (danmakuPlayer.state !== "paused") {
      danmakuPlayer.pause();
    }
  });

// tslint:disable-next-line:max-line-length
// const videoUrl = "https://images.apple.com/media/cn/macbook-pro/2016/b4a9efaa_6fe5_4075_a9d0_8e4592d6146c/films/design/macbook-pro-design-tft-cn-20161026_1536x640h.mp4";
const videoUrl = "assets/video.mp4";
videoElement.src = videoUrl;
videoElement.play();

function resize(width: number, height: number): void {
  containerElement.style.width = width + "px";
  containerElement.style.height = height + "px";
  videoElement.style.width = width + "px";
  videoElement.style.height = height + "px";
  commentsElement.style.width = width + "px";
  commentsElement.style.height = height + "px";
  danmakuPlayer.resize(width, height);
}

resize(846, 568);

const xhr = new XMLHttpRequest();
xhr.onload = () => {
  if (xhr.responseXML == null) {
    throw new Error("ResponseXML not found.");
  }

  const dList = xhr.responseXML.querySelectorAll("d");
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

    let comment;

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
    }

    if (comment != null) {
      comments.push(comment);
    }
  });

  danmakuPlayer.commentPool.load(comments);
};

xhr.open("GET", "assets/bilibili.xml");
xhr.responseType = "document";
xhr.send();
