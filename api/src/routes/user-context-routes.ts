import { addUser, deleteUser, getUser } from '../services/user-context-service';
import * as express from 'express';

const router = express.Router();

router.get('/user', getUser);
router.post('/user/:postId', addUser);
router.delete('/user/:postId', deleteUser);

export default router;
