import { Request, Response } from "express";

export const calculateMetrics = (req: Request, res: Response) => {
  const { type, value, profit } = req.body;
  let commission = 0;

  switch (type) {
    case "deposit":
      commission = 0;
      break;
    case "execution":
      commission = value * 0.02;
      break;
    case "close":
      commission = profit > 0 ? profit * 0.05 : 0;
      break;
    case "withdraw":
      commission = value * 0.02;
      break;
    default:
      return res.status(400).json({ error: "Tipo inválido" });
  }

  return res.json({ commission });
};
