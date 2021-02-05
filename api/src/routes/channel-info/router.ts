import { getChannelInfo, addChannelInfo, updateChannelInfo, deleteChannelInfo } from './routes';
import { Router } from 'express';

const router = Router();
router.get('/channel/:channelAddress', getChannelInfo);
router.post('/channel/:channelAddress', addChannelInfo);
router.put('/channel/:channelAddress', updateChannelInfo);
router.delete('/channel/:channelAddress', deleteChannelInfo);

export default router;
