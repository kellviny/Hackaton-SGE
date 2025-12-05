import * as EmailModel from '../models/emailModel.js'


export const listAll = () => EmailModel.getAll()
export const listPending = () => EmailModel.getPending()
export const listHistory = () => EmailModel.getClassified()
export const find = (id) => EmailModel.findById(id)
export const create = (data) => EmailModel.create(data)
export const update = (id, data) => EmailModel.update(id, data)
export const remove = (id) => EmailModel.remove(id)