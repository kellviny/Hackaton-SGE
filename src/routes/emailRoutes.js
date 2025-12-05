import { Router } from "express";
import { getAll, getPending, getClassified, create, classify, remove, syncGmail} from "../controllers/emailController.js";

const router = Router();

router.get("/sync", syncGmail);
router.get("/", getAll);
router.get("/pending", getPending);
router.get("/classified", getClassified);
router.post("/", create);
router.put("/:id/classify", classify);
router.delete("/:id", remove);

export default router;
