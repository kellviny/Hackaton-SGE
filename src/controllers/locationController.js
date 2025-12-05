import * as locationService from '../services/locationService.js'


export async function getStates(req, res) {
try {
res.json(locationService.getStates())
} catch (err) {
console.error(err)
res.status(500).json({ error: 'Erro' })
}
}


export async function getCities(req, res) {
try {
const state = req.params.state
res.json(locationService.getCities(state))
} catch (err) {
console.error(err)
res.status(500).json({ error: 'Erro' })
}
}