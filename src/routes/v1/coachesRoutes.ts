import express, {Router} from 'express';
import {verifyToken} from "../../middleware/auth";
import {getCoachAgents} from "../../controllers/UserController";

const router: Router = express.Router();

router.get('/agents', verifyToken, getCoachAgents);

export default router;