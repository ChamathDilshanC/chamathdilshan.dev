export const vehicles = [
  {
    id: "fighter",
    label: "Gunship",
    title: "Decepticon Fighter (Transformers)",
    author: "Elite Big Speakerman",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://sketchfab.com/3d-models/decepticon-fighter-transformers-55246da5b4134725abd67cf5a1ff08d6",
    yaw: 0,
  },
  {
    id: "mclaren",
    label: "McLaren Vision GT",
    title: "McLaren Ultimate Vision GT",
    author: "VTX",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    source:
      "https://sketchfab.com/3d-models/mclaren-ultimate-vision-gt-ffaaeb3b72ac4f12a35a4753bd9cc51b",
    yaw: 0,
  },
  {
    id: "bugatti",
    label: "Bugatti Divo",
    title: "Bugati Divo",
    author: "Jonrss",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://sketchfab.com/3d-models/bugati-divo-dca375fefc65461d8a383172b235d0a9",
    yaw: 0,
  },
  {
    id: "ssc",
    label: "SSC Tuatara",
    title: "exmods SSC Tuatara Aggressor",
    author: "Kevin Love SketchFab",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    source:
      "https://sketchfab.com/3d-models/exmods-ssc-tuatara-aggressor-1daf479cdcf346b8b4ec605800d934cb",
    yaw: 0,
  },
  {
    id: "nissan",
    label: "Nissan Snowland",
    title: "Nissan Super Snowland SDC PERFORMANCE™️",
    author: "SDC PERFORMANCE™️",
    license: "CC BY-NC 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
    source:
      "https://sketchfab.com/3d-models/nissan-super-snowland-sdc-performancetm-d07a66ea95a14b018329e73dc31d8a25",
    yaw: 0,
  },
] as const;
export type VehicleId = (typeof vehicles)[number]["id"];
export const isVehicleId = (value: string | null): value is VehicleId =>
  vehicles.some((vehicle) => vehicle.id === value);
export const vehicleById = (id: VehicleId) =>
  vehicles.find((vehicle) => vehicle.id === id)!;
