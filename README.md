# MioDanmaku

[![stability-experimental](https://img.shields.io/badge/stability-experimental-orange.svg)](https://github.com/emersion/stability-badges#experimental)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/mio-danmaku.svg)](https://www.npmjs.com/package/mio-danmaku)

This is a simple JavaScript library for playing danmaku.

这是一个简单的 JavaScript 库，用于播放弹幕。  
注意：这不是稳定的库，请不要将其使用在生产环境中。

已支持：
* 堆叠弹幕（顶部、底部弹幕）
* 滚动弹幕（向左、向右滚动）
* 定位弹幕（在指定位置呈现）
* CSS3 弹幕渲染

待支持：
* 实时弹幕
* Canvas 弹幕渲染

已知问题：
* 当使用 Edge 浏览器时，滚动弹幕会在特定情况下出现闪烁与偏移现象。<br>
该问题可能与此浏览器 [BUG](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14653084/) 有关。

[Demo](https://tzq1011.github.io/mio-danmaku)

## Supported Browsers

* IE10+
* Edge
* Chrome
* Firefox
* Safari

## Installation

Using npm:
```
npm install --save mio-danmaku
```

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MioDanmaku</title>
  <style>
    #screen { position: relative; background-color: black; }
    #video { width: 100%; height: 100%; position: absolute; }
    #danmaku { width: 100%; height: 100%; position: absolute; pointer-events: none; }
  </style>
</head>
<body>
  <div id="screen">
    <video id="video" src="https://media.w3.org/2010/05/sintel/trailer.mp4" controls></video>
    <div id="danmaku"></div>
  </div>
  <button id="addButton" type="button">Add a Comment</button>
  <script src="https://unpkg.com/mio-danmaku@^0.1.0"></script>
  <script>
    (function() {
      var createPlayer = mioDanmaku.createPlayer;
      var createStackingComment = mioDanmaku.createStackingComment;
      var createScrollingComment = mioDanmaku.createScrollingComment;
      var createPositioningComment = mioDanmaku.createPositioningComment;

      var screen = document.getElementById("screen");
      var video = document.getElementById("video");
      var danmaku = document.getElementById("danmaku");
      var addButton = document.getElementById("addButton");

      var danmakuPlayer = createPlayer({
        timeGetter: function () {
          return video.currentTime * 1000;
        }
      });

      danmaku.appendChild(danmakuPlayer.element);
      video.addEventListener("playing", function() { danmakuPlayer.play(); });
      video.addEventListener("pause", function() { danmakuPlayer.pause(); });

      function resize(width, height) {
        screen.style.width = width + "px";
        screen.style.height = height + "px";
        danmakuPlayer.resize(width, height);
      }

      resize(640, 360);

      var stackingComment = createStackingComment({
        time: 2000,
        data: { creationTime: Date.now() }, // custom data
        text: "StackingComment",
        fontSize: 30,
        textColor: "#00FF00",
        stackingDirection: "up", // up or down
        horizontalAlignment: "center", // left, center or right
        lifetime: 5000
      });

      var scrollingComment = createScrollingComment({
        time: 3000,
        data: {},
        text: "ScrollingComment",
        fontSize: 30,
        textColor: "#66CCFF",
        stackingDirection: "down", // up or down
        scrollingDirection: "left" // left or right
      });

      var positioningComment = createPositioningComment({
        time: 1000,
        data: {},
        text: "PositioningComment",
        fontSize: 30,
        textColor: "#FF0000",
        positionX: 50,
        positionY: 200,
        lifetime: 10000
      });

      danmakuPlayer.comments.load([
        stackingComment,
        scrollingComment,
        positioningComment
      ]);

      addButton.addEventListener("click", function() {
        var myComment = createScrollingComment({
          time: danmakuPlayer.time,
          isOwn: true,
          text: "MyComment"
        });

        danmakuPlayer.comments.add(myComment);
      });
    })();
  </script>
</body>
</html>
```

## API

### *createPlayer() / 创建播放器*

```typescript
declare function createPlayer(options: PlayerOptions): Player;
```

options

| Property   | Type       | Required | Default     |
| ---------- | ---------- | -------- | ----------- |
| timeGetter | TimeGetter | Yes      | None        |
| width      | number     | No       | 800         |
| height     | number     | No       | 600         |
| renderer   | Renderer   | No       | CSSRenderer |

---

### *createCSSRenderer() / 创建CSS渲染器*

```typescript
declare function createCSSRenderer(options: CSSRendererOptions = {}): CSSRenderer;
```

options

| Property                           | Type                    | Required | Default                                              |
| ---------------------------------- | ----------------------- | -------- | ---------------------------------------------------- |
| screenWidth                        | number                  | No       | 800                                                  |
| screenHeight                       | number                  | No       | 600                                                  |
| screenMarginTop                    | number                  | No       | 0                                                    |
| screenMarginBottom                 | number                  | No       | 0                                                    |
| commentOpacity                     | number                  | No       | 1                                                    |
| commentFontFamily                  | `ReadonlyArray<string>` | No       | `["Microsoft Yahei", "sans-serif"]`                  |
| commentLineHeight                  | number                  | No       | 1.2                                                  |
| commentTextShadow                  | Shadow                  | No       | `{ offsetX: 0, offsetY: 0, blur: 3, color: "#000" }` |
| commentScrollingBasicSpeed         | number                  | No       | 0.120                                                |
| commentScrollingExtraSpeedPerPixel | number                  | No       | 0.0002                                               |
| ownCommentBorder                   | number                  | No       | `{ width: 1, color: "green" }`                       |
| ownCommentPaddingLeft              | number                  | No       | 2                                                    |
| ownCommentPaddingRight             | number                  | No       | 2                                                    |

---

### *createStackingComment() / 创建堆叠评论*

```typescript
declare function createStackingComment(options: StackingCommentOptions = {}): StackingComment;
```

options

| Property            | Type                          | Required | Default   |
| ------------------- | ----------------------------- | -------- | --------- |
| text                | string                        | No       | "Nya"     |
| fontSize            | number                        | No       | 25        |
| textColor           | string                        | No       | "#FFFFFF" |
| horizontalAlignment | "left" or "center" or "right" | No       | "center"  |
| stackingDirection   | "up" or "down"                | No       | "down"    |
| lifetime            | number                        | No       | 5000      |

---

### *createScrollingComment() / 创建滚动评论*

```typescript
declare function createScrollingComment(options: ScrollingCommentOptions = {}): ScrollingComment;
```

options

| Property           | Type              | Required | Default   |
| ------------------ | ----------------- | -------- | --------- |
| text               | string            | No       | "Nya"     |
| fontSize           | number            | No       | 25        |
| textColor          | string            | No       | "#FFFFFF" |
| stackingDirection  | "up" or "down"    | No       | "down"    |
| scrollingDirection | "left" or "right" | No       | "left"    |

---

### *createPositioningComment() / 创建定位评论*

```typescript
declare function createPositioningComment(options: PositioningCommentOptions = {}): PositioningComment;
```

options

| Property  | Type   | Required | Default   |
| --------- | ------ | -------- | --------- |
| text      | string | No       | "Nya"     |
| fontSize  | number | No       | 25        |
| textColor | string | No       | "#FFFFFF" |
| positionX | number | No       | 0         |
| positionY | number | No       | 0         |
| lifetime  | number | No       | 5000      |

---

### *isStackingComment() / 检查目标是否为堆叠评论*

```typescript
declare function isStackingComment(target: any): target is StackingComment;
```

---

### *isScrollingComment() / 检查目标是否为滚动评论*

```typescript
declare function isScrollingComment(target: any): target is ScrollingComment;
```

---

### *isPositioningComment() / 检查目标是否为定位评论*

```typescript
declare function isPositioningComment(target: any): target is PositioningComment;
```

---

### *createComment() / 创建评论*

```typescript
declare function createComment(options: CommentOptions = {}): Comment;
```

options

| Property | Type    | Required | Default |
| -------- | ------- | -------- | ------- |
| time     | number  | No       | 0       |
| data     | object  | No       | {}      |
| isOwn    | boolean | No       | false   |

---

### *mixinCommentTextTrait() / 混入评论文本特性*

```typescript
declare function mixinCommentTextTrait<C extends Comment> (comment: C, options: CommentTextTraitOptions = {}): C & CommentTextTrait;
```

options

| Property  | Type   | Required | Default   |
| --------- | ------ | -------- | --------- |
| text      | string | No       | "Nya"     |
| fontSize  | number | No       | 25        |
| textColor | string | No       | "#FFFFFF" |

---

### *mixinCommentPositionXTrait() / 混入评论水平位置特性*

```typescript
declare function mixinCommentPositionXTrait<C extends Comment> (comment: C, options: CommentPositionXTraitOptions = {}): C & CommentPositionXTrait;
```

options

| Property  | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| positionX | number | No       | 0       |

---

### *mixinCommentPositionYTrait() / 混入评论垂直位置特性*

```typescript
declare function mixinCommentPositionYTrait<C extends Comment> (comment: C, options: CommentPositionYTraitOptions = {}): C & CommentPositionYTrait;
```

options

| Property  | Type   | Required | Default |
| --------- | ------ | -------- | ------- |
| positionY | number | No       | 0       |

---

### *mixinCommentHorizontalAlignmentTrait() / 混入评论水平对齐特性*

```typescript
declare function mixinCommentHorizontalAlignmentTrait<C extends Comment> (comment: C, options: CommentHorizontalAlignmentTraitOptions = {}): C & CommentHorizontalAlignmentTrait;
```

options

| Property            | Type                          | Required | Default  |
| ------------------- | ----------------------------- | -------- | -------- |
| horizontalAlignment | "left" or "center" or "right" | No       | "center" |

---

### *mixinCommentVerticalAlignmentTrait() / 混入评论垂直对齐特性*

```typescript
declare function mixinCommentVerticalAlignmentTrait<C extends Comment> (comment: C, options: CommentVerticalAlignmentTraitOptions = {}): C & CommentVerticalAlignmentTrait;
```

options

| Property          | Type                          | Required | Default  |
| ----------------- | ----------------------------- | -------- | -------- |
| verticalAlignment | "top" or "middle" or "bottom" | No       | "middle" |

---

### *mixinCommentStackingTrait() / 混入评论堆叠特性*

```typescript
declare function mixinCommentStackingTrait<C extends Comment> (comment: C, options: CommentStackingTraitOptions = {}): C & CommentStackingTrait;
```

options

| Property          | Type           | Required | Default |
| ----------------- | -------------- | -------- | ------- |
| stackingDirection | "up" or "down" | No       | "down"  |

---

### *mixinCommentScrollingTrait() / 混入评论滚动特性*

```typescript
declare function mixinCommentScrollingTrait<C extends Comment> (comment: C, options: CommentScrollingTraitOptions = {}): C & CommentScrollingTrait;
```

options

| Property           | Type              | Required | Default |
| ------------------ | ----------------- | -------- | ------- |
| scrollingDirection | "left" or "right" | No       | "left"  |

---

### *mixinCommentLifetimeTrait() / 混入评论寿命特性*

```typescript
declare function mixinCommentLifetimeTrait<C extends Comment> (comment: C, options: CommentLifetimeTraitOptions = {}): C & CommentLifetimeTrait;
```

options

| Property | Type   | Required | Default |
| -------- | ------ | -------- | ------- |
| lifetime | number | No       | 5000    |

---

### *isComment() / 检查目标是否为评论*

```typescript
declare function isComment(target: any): target is Comment;
```

---

### *hasCommentTextTrait() / 检查评论是否有文本特性*

```typescript
declare function hasCommentTextTrait(comment: Comment): comment is (Comment & CommentTextTrait);
```

---

### *hasCommentPositionXTrait() / 检查评论是否有水平位置特性*

```typescript
declare function hasCommentPositionXTrait(comment: Comment): comment is (Comment & CommentPositionXTrait);
```

---

### *hasCommentPositionYTrait() / 检查评论是否有垂直位置特性*

```typescript
declare function hasCommentPositionYTrait(comment: Comment): comment is (Comment & CommentPositionYTrait);
```

---

### *hasCommentHorizontalAlignmentTrait() / 检查评论是否有水平对齐特性*

```typescript
declare function hasCommentHorizontalAlignmentTrait(comment: Comment): comment is (Comment & CommentHorizontalAlignmentTrait);
```

---

### *hasCommentVerticalAlignmentTrait() / 检查评论是否有垂直对齐特性*

```typescript
declare function hasCommentVerticalAlignmentTrait(comment: Comment): comment is (Comment & CommentVerticalAlignmentTrait);
```

---

### *hasCommentStackingTrait() / 检查评论是否有堆叠特性*

```typescript
declare function hasCommentStackingTrait(comment: Comment): comment is (Comment & CommentStackingTrait);
```

---

### *hasCommentScrollingTrait() / 检查评论是否有滚动特性*

```typescript
declare function hasCommentScrollingTrait(comment: Comment): comment is (Comment & CommentScrollingTrait);
```

---

### *hasCommentLifetimeTrait() / 检查评论是否有寿命特性*

```typescript
declare function hasCommentLifetimeTrait(comment: Comment): comment is (Comment & CommentLifetimeTrait);
```

## Typings
```typescript
// 事件数据
type EventData = any;

// 事件规格
interface EventSpecs {
  // 事件名称: 事件数据类型
  [event: string]: EventData;
}

// 事件监听器
type EventListener<D extends EventData> = (data: D) => void;

// 事件发射器
interface EventEmitter<ES extends EventSpecs> {
  on<E extends keyof ES>(event: E, listener: EventListener<ES[E]>): EventEmitter<ES>; // 绑定事件处理器
  off<E extends keyof ES>(event: E, listener?: EventListener<ES[E]>): EventEmitter<ES>; // 解绑事件处理器
  emit<E extends keyof ES>(event: E, data: ES[E]): void; // 触发事件
}

// 尺寸
interface Dimensions {
  width: number; // 宽度（像素）
  height: number; // 高度（像素）
}

// 位置
interface Position {
  x: number; // 水平位置（像素）
  y: number; // 垂直位置（像素）
}

// 阴影
interface Shadow {
  readonly offsetX: number; // 水平偏移（像素）
  readonly offsetY: number; // 垂直偏移（像素）
  readonly blur: number; // 模糊度
  readonly color: string; // 颜色（十六进制RGB）
}

// 边框
interface Border {
  readonly width: number; // 宽度
  readonly color: string; // 颜色（十六进制RGB）
}

// 评论事件
interface CommentEvents {
  rendering: null; // 渲染中
  renderingCanceled: null; // 渲染已取消
  renderingFinished: null; // 渲染已完成
  renderingEnded: null; // 渲染已结束
}

// 评论
interface Comment {
  readonly instanceId: string; // 实例ID
  readonly events: EventEmitter<CommentEvents>; // 事件发射器
  readonly time: number; // 何时渲染（毫秒），对应视频时间轴。
  readonly data: object; // 自定义数据，用于存储“用户ID”等数据。
  readonly isOwn: boolean; // 自己发送的评论？为真时渲染器将使用特定的风格渲染该评论。
}

// 评论文本特性
interface CommentTextTrait {
  readonly text: string; // 文本
  readonly fontSize: number; // 字体大小（像素）
  readonly textColor: string; // 文本颜色（十六进制RGB）
}

// 评论水平位置特性
interface CommentPositionXTrait {
  readonly positionX: number; // 水平位置（像素）
}

// 评论垂直位置特性
interface CommentPositionYTrait {
  readonly positionY: number; // 垂直位置（像素）
}

// 评论水平对齐特性
interface CommentHorizontalAlignmentTrait {
  readonly horizontalAlignment: "left" | "center" | "right"; // 水平对齐（left: 左, center: 中, right: 右）
}

// 评论垂直对齐特性
interface CommentVerticalAlignmentTrait {
  readonly verticalAlignment: "top" | "middle" | "bottom"; // 垂直对齐（top: 上, middle: 中, bottom: 下）
}

// 评论堆叠特性
interface CommentStackingTrait {
  readonly stackingDirection: "up" | "down"; // 堆叠方向（up: 上, down: 下）
}

// 评论滚动特性
interface CommentScrollingTrait {
  readonly scrollingDirection: "left" | "right"; // 滚动方向（left: 左, right: 右）
}

// 评论寿命特性
interface CommentLifetimeTrait {
  readonly lifetime: number; // 评论将渲染多久（毫秒）
}

// 堆叠评论
type StackingComment =
  & Comment
  & CommentTextTrait
  & CommentHorizontalAlignmentTrait
  & CommentStackingTrait
  & CommentLifetimeTrait;

// 滚动评论
type ScrollingComment =
  & Comment
  & CommentTextTrait
  & CommentStackingTrait
  & CommentScrollingTrait;

// 定位评论
type PositioningComment =
  & Comment
  & CommentTextTrait
  & CommentPositionXTrait
  & CommentPositionYTrait
  & CommentLifetimeTrait;

// 评论过滤器
type CommentFilter = (comment: Comment) => boolean;

// 评论池事件
interface CommentPoolEvents {
  loaded: { comments: Comment[] }; // 载入一批评论
  added: { index: number, comment: Comment }; // 添加一条评论
  removed: { index: number, comment: Comment }; // 移除一条评论
  cleared: { comments: Comment[] }; // 移除所有评论
  filterAdded: { filter: CommentFilter }; // 添加评论过滤器
  filterRemoved: { filter: CommentFilter }; // 移除评论过滤器
}

// 评论池
interface CommentPool {
  readonly comments: ReadonlyArray<Comment>; // 评论列表
  readonly filters: ReadonlyArray<CommentFilter>; // 评论过滤器列表
  readonly events: EventEmitter<CommentPoolEvents>; // 事件发射器
  load(comments: Comment[]): void; // 批量载入评论，载入大量评论时，有性能增益。
  add(comment: Comment): void; // 添加评论
  has(comment: Comment): void; // 检查评论是否已添加
  remove(comment: Comment): boolean; // 移除评论
  clear(): void; // 移除所有评论
  getByTime(startTime: number, endTime: number, limit: number): Comment[]; // 获取特定时间段的评论
  addFilter(filter: CommentFilter): void; // 添加评论过滤器，过滤器将影响 getByTime() 方法的返回结果。
  hasFilter(filter: CommentFilter): boolean; // 检查评论过滤器是否已添加
  removeFilter(filter: CommentFilter): boolean; // 移除评论过滤器
  clearFilters(): void; // 移除所有评论过滤器
}

// 评论视图
interface CommentView {
  readonly isDestroyed: boolean; // 视图已销毁？
  measure(): Dimensions; // 测量视图，用于获取视图宽高。
  locate(): Position; // 定位视图，用于获取视图位置。
  destroy(): void; // 销毁视图，等同于 Renderer.unrenderComment()。
}

// 渲染器状态
type RendererState =
  | "idle" // 闲置中
  | "running" // 运行中
  | "paused"; // 已暂停

// 渲染器事件
interface RendererEvents {
  idle: null; // 已闲置
  running: null; // 运行中
  paused: null; // 已暂停
}

// 渲染器
interface Renderer {
  screenMarginTop: number; // 荧幕上边距
  screenMarginBottom: number; // 荧幕下边距，可用于实现字幕防挡。
  commentOpacity: number; // 评论不透明度
  commentFontFamily: ReadonlyArray<string>; // 评论字体家族
  commentLineHeight: number; // 评论文本行高
  commentTextShadow: Shadow | null; // 评论文本阴影
  commentScrollingBasicSpeed: number; // 评论滚动基速（像素/毫秒）
  commentScrollingExtraSpeedPerPixel: number; // 评论滚动增速（像素/毫秒）（最终速度 = 基速 + 评论宽度 * 增速）
  ownCommentBorder: Border | null; // 己发（自己发送的）评论边框
  ownCommentPaddingLeft: number; // 己发评论左填充
  ownCommentPaddingRight: number; // 己发评论右填充
  readonly state: RendererState; // 渲染器状态
  readonly events: EventEmitter<RendererEvents>; // 事件发射器
  readonly screenWidth: number; // 荧幕宽度
  readonly screenHeight: number; // 荧幕高度
  readonly screenElement: HTMLElement; // 荧幕元素
  run(): void; // 运行，渲染器进入工作状态，定格中的评论视图将继续渲染。
  pause(): void; // 暂停，渲染中的评论视图将定格在当前状态（例如：当前视图位置，当前计时器耗时等等）。
  stop(): void; // 停止，渲染中的评论视图将被销毁，渲染器进入闲置状态。
  resizeScreen(width: number, height: number): void; // 调整荧幕尺寸
  renderComment(comment: Comment): CommentView; // 渲染评论，当渲染器处于运行或暂停态时可以调用。
  unrenderComment(comment: Comment): void; // 取消渲染评论
  isCommentRendering(comment: Comment): boolean; // 检查评论是否正在渲染
  getRenderingComments(): Comment[]; // 获取渲染中的评论
  getRenderingCommentsCount(): number; // 获取渲染中的评论数量
  getCommentView(comment: Comment): CommentView | null; // 获取评论视图
}

// CSS渲染器
type CSSRenderer = Renderer;

// 时间获取器
type TimeGetter = () => number;

// 播放器状态
type PlayerState =
  | "idle" // 闲置中
  | "playing" // 播放中
  | "paused"; // 已暂停

// 播放器事件
interface PlayerEvents {
  idle: null; // 已闲置
  playing: null; // 播放中
  paused: null; // 已暂停
  resized: null; // 调整尺寸
}

// 播放器
interface Player {
  renderer: Renderer; // 渲染器
  maxRenderingComments: number; // 最大同时渲染评论数，即同屏弹幕数。
  readonly state: PlayerState; // 播放器状态
  readonly events: EventEmitter<PlayerEvents>; // 事件发射器
  readonly width: number; // 宽度
  readonly height: number; // 高度
  readonly element: HTMLElement; // 播放器元素
  readonly time: number; // 时间（毫秒），对应视频时间轴。
  readonly timeGetter: TimeGetter; // 时间获取器
  readonly comments: CommentPool; // 评论池
  play(): void; // 播放
  pause(): void; // 暂停
  stop(): void; // 停止
  resize(width: number, height: number): void; // 调整尺寸
}

// 评论选项
interface CommentOptions {
  time?: number; // 时间
  data?: object; // 自定义数据
  isOwn?: boolean; // 自己发送的评论？
}

// 评论文本特性选项
interface CommentTextTraitOptions {
  text?: string; // 文本
  fontSize?: number; // 字体大小（像素）
  textColor?: string; // 文本颜色（十六进制RGB）
}

// 评论水平位置特性选项
interface CommentPositionXTraitOptions {
  positionX?: number; // 水平位置（像素）
}

// 评论垂直位置特性选项
interface CommentPositionYTraitOptions {
  positionY?: number; // 垂直位置（像素）
}

// 评论水平对齐特性选项
interface CommentHorizontalAlignmentTraitOptions {
  horizontalAlignment?: "left" | "center" | "right"; // 水平对齐（left: 左, center: 中, right: 右）
}

// 评论垂直对齐特性选项
interface CommentVerticalAlignmentTraitOptions {
  verticalAlignment?: "top" | "middle" | "bottom"; // 垂直对齐（top: 上, middle: 中, bottom: 下）
}

// 评论堆叠特性选项
interface CommentStackingTraitOptions {
  stackingDirection?: "up" | "down"; // 堆叠方向（up: 上, down: 下）
}

// 评论滚动特性选项
interface CommentScrollingTraitOptions {
  scrollingDirection?: "left" | "right"; // 滚动方向（left: 左, right: 右）
}

// 滚动寿命特性选项
interface CommentLifetimeTraitOptions {
  lifetime?: number; // 评论将渲染多久（毫秒）
}

// 堆叠评论选项
type StackingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentHorizontalAlignmentTraitOptions
  & CommentStackingTraitOptions
  & CommentLifetimeTraitOptions;

// 滚动评论选项
type ScrollingCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentStackingTraitOptions
  & CommentScrollingTraitOptions;

// 定位评论选项
type PositioningCommentOptions =
  & CommentOptions
  & CommentTextTraitOptions
  & CommentPositionXTraitOptions
  & CommentPositionYTraitOptions
  & CommentLifetimeTraitOptions;

// CSS渲染器选项
interface CSSRendererOptions {
  screenWidth?: number; // 荧幕宽度（像素）
  screenHeight?: number; // 荧幕高度（像素）
  screenMarginTop?: number; // 荧幕左边距（像素）
  screenMarginBottom?: number; // 荧幕右边距（像素）
  commentOpacity?: number; // 评论不透明度
  commentFontFamily?: ReadonlyArray<string>; // 评论字体家族
  commentLineHeight?: number; // 评论文本行高
  commentTextShadow?: Shadow | null; // 评论文本阴影
  commentScrollingBasicSpeed?: number; // 评论滚动基速
  commentScrollingExtraSpeedPerPixel?: number; // 评论滚动增速
  ownCommentBorder?: Border | null; // 己发（自己发送的）评论边框
  ownCommentPaddingLeft?: number; // 己发评论左填充（像素）
  ownCommentPaddingRight?: number; // 己发评论右填充（像素）
}

// 播放器选项
interface PlayerOptions {
  timeGetter: TimeGetter; // 时间获取器，其返回值对应视频时间轴。
  width?: number; // 宽度
  height?: number; // 高度
  renderer?: Renderer; // 渲染器
  maxRenderingComments?: number; // 最大同时渲染评论数，即同屏弹幕数。
}
```

## Build

```
git clone https://github.com/tzq1011/mio-danmaku.git
cd mio-danmaku
npm install
npm run clean
npm run build
```

## License

Copyright (c) 2018 PPC.  
Released under the MIT License.
