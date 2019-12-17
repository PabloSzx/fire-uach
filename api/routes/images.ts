import encodeUrl from "encodeurl";
import { Router } from "express";

import { readFileGridFS } from "../db/gridFS";
import { ImageModel } from "../entities/image";

export const ImagesRouter = Router();

ImagesRouter.get("/:filename", async (req, res) => {
  let { filename } = req.params;

  if (typeof filename !== "string" || filename?.length === 0) {
    return res.sendStatus(404);
  }
  filename = encodeUrl(filename);

  const [img, imgData] = await Promise.all([
    ImageModel.findOne({
      filename,
    }),
    readFileGridFS({
      filename,
    }),
  ]);

  if (img && imgData) {
    res.type(img.mimetype);
    imgData.pipe(res);
  } else {
    res.sendStatus(404);
  }
});
