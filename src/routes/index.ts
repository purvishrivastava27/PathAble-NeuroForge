import { Router, type IRouter } from "express";
import healthRouter from "./health";
import blindassistRouter from "./blindassist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(blindassistRouter);

export default router;
