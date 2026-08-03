import { Router } from 'express';
import * as ctrl from '../controllers/membersController.js';
import { authenticate } from '../middleware/auth.js';
import { requireBusiness, requirePermission } from '../middleware/requireBusiness.js';

const router = Router();

router.use(authenticate, requireBusiness);

router.get('/', requirePermission('members', 'read'), ctrl.listMembers);
router.post('/invite', requirePermission('members', 'write'), ctrl.inviteMember);
router.patch('/:memberId', requirePermission('members', 'write'), ctrl.updateMemberRole);
router.delete('/:memberId', requirePermission('members', 'delete'), ctrl.removeMember);

export default router;
