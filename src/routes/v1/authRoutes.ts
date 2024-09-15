import express, {Router} from 'express';
import {loginUser, registerUser} from '../../controllers/UserController';
import {createUserValidator, loginUserValidator} from '../../validators/userValidators';
import {verifyToken} from "../../middleware/auth";

const router: Router = express.Router();

router.post('/login', loginUserValidator, loginUser);
router.post('/register', createUserValidator, registerUser);

router.get('/verifyToken', verifyToken, (req, res) => {
    res.status(200).json({message: 'Token is valid'});
});

export default router;