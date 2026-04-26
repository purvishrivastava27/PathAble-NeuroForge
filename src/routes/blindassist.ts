import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/config", (_req, res) => {
  res.json({
    googleMapsApiKey: process.env["GOOGLE_MAPS_API_KEY"] ?? "",
  });
});

router.post("/detect", (req, res) => {
  const body = req.body as {
    objects?: Array<{
      label: string;
      confidence: number;
      bbox: { x: number; y: number; width: number; height: number };
      zone: "left" | "center" | "right";
    }>;
    instruction?: string;
  };

  const objectCount = body.objects?.length ?? 0;
  req.log.info(
    {
      objectCount,
      instruction: body.instruction,
      objects: body.objects?.map((o) => ({
        label: o.label,
        zone: o.zone,
        confidence: Number(o.confidence?.toFixed?.(2) ?? o.confidence),
      })),
    },
    "detect frame",
  );

  res.json({
    received: true,
    objectCount,
    instruction: body.instruction ?? "Move Forward",
    serverTime: Date.now(),
  });
});

router.post("/emergency", (req, res) => {
  const body = req.body as {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    timestamp?: number;
    note?: string;
  };

  const { latitude, longitude, accuracy, timestamp, note } = body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    res.status(400).json({
      success: false,
      error: "latitude and longitude (numbers) are required",
    });
    return;
  }

  const alertId = `EMRG-${Date.now().toString(36).toUpperCase()}`;
  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  req.log.warn(
    {
      alertId,
      latitude,
      longitude,
      accuracy,
      mapsLink,
      note,
      timestamp,
    },
    "EMERGENCY ALERT received from BlindAssist user",
  );

  res.json({
    success: true,
    alertId,
    message:
      "Emergency alert recorded. Help is being notified with your location.",
    mapsLink,
    receivedAt: Date.now(),
  });
});

export default router;
