import { describe, expect, it } from "vitest";

import { cloudinaryLoader, isCloudinary, videoPoster, videoSrc } from "../lib/media";

const image = "https://res.cloudinary.com/demo/image/upload/v1730000000/site/shot.png";
const video = "https://res.cloudinary.com/demo/video/upload/v1730000000/site/demo.mp4";

describe("cloudinary helpers", () => {
  it("asks Cloudinary for the exact width in the best format", () => {
    expect(cloudinaryLoader({ src: image, width: 640 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/v1730000000/site/shot.png",
    );
  });

  it("leaves non-Cloudinary and video URLs alone in the image loader", () => {
    expect(isCloudinary("/images/placeholders/a.jpg")).toBe(false);
    expect(cloudinaryLoader({ src: video, width: 640 })).toBe(video);
  });

  it("derives a poster from the first frame of a video", () => {
    expect(videoPoster(video)).toBe(
      "https://res.cloudinary.com/demo/video/upload/so_0,f_jpg,q_auto,c_limit,w_1600/v1730000000/site/demo.jpg",
    );
    expect(videoPoster("/local.mp4")).toBeUndefined();
  });

  it("streams videos with automatic quality and codec", () => {
    expect(videoSrc(video)).toBe("https://res.cloudinary.com/demo/video/upload/q_auto,vc_auto/v1730000000/site/demo.mp4");
  });
});
