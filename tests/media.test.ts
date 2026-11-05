import { describe, expect, it } from "vitest";

import { cloudinaryLoader, faceArea, faceInfoUrl, isCloudinary, videoPoster, videoSrc } from "../lib/media";

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

describe("face detection", () => {
  it("asks Cloudinary where the faces are, for Cloudinary images only", () => {
    expect(faceInfoUrl(image)).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_crop,g_faces,fl_getinfo/v1730000000/site/shot.png",
    );
    expect(faceInfoUrl(video)).toBeNull();
    expect(faceInfoUrl("/images/placeholders/a.jpg")).toBeNull();
  });

  it("turns the face crop into fractions of the image", () => {
    // Cloudinary's answer for the live hero photo.
    const info = {
      input: { width: 1672, height: 941 },
      landmarks: [[{ r_eye: { x: 822, y: 178 }, l_eye: { x: 895, y: 185 } }]],
      resize: [{ x: 733, y: 62, width: 234, height: 293 }],
    };
    const box = faceArea(info);
    expect(box?.x).toBeCloseTo(733 / 1672);
    expect(box?.y).toBeCloseTo(62 / 941);
    expect(box?.width).toBeCloseTo(234 / 1672);
    expect(box?.height).toBeCloseTo(293 / 941);
  });

  it("reports no face when none was found or the answer is incomplete", () => {
    // No face: an empty landmark list and a crop of the whole image.
    expect(
      faceArea({ input: { width: 864, height: 576 }, landmarks: [[]], resize: [{ x: 0, y: 0, width: 864, height: 576 }] }),
    ).toBeNull();
    expect(faceArea({})).toBeNull();
    expect(faceArea({ landmarks: [[{}]], resize: [{ x: 0, y: 0, width: 1, height: 1 }] })).toBeNull();
  });
});
