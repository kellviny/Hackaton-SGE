import { Router } from 'express'
import * as controller from '../controllers/locationController.js'


const router = Router()


router.get('/states', controller.getStates)
router.get('/cities/:state', controller.getCities)


export default router