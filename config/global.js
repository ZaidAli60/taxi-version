// const Users = require('../models/auth');

const getRandomId = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
const getRandomRef = () => Math.random().toString().slice(2, 11)
const isObjectBlank = obj => Object.keys(obj).length === 0
const hasRole = (user, requiredRoles) => { return user.roles.some(role => requiredRoles.includes(role)) }
// const getUser = async (query, res, projection = "-password") => {
//     const user = await Users.findOne(query).select(projection).exec()
//     if (!user) { return res.status(404).json({ message: "Unauthorized or User not found" }) }
//     return user
// }

module.exports = { getRandomId, getRandomRef, isObjectBlank, hasRole }