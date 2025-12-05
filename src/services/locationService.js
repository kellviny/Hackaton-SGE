import { statesData } from '../data/states.js'

export const getStates = () => Object.keys(statesData)
export const getCities = (state) => statesData[state] || []