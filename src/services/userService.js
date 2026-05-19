import userRepo from '../repository/userRepo.js'
import HashUtil from '../utils/hashToken.js'
import emitter from '../events/eventEmitter.js'
import { USER_EVENTS } from '../events/index.js'
import { NotFoundError, ConflictError } from '../utils/Errors.js'

const PRIVATE_FIELDS = ['password']

const strip = (user) => {
  const sanitized = { ...user }
  PRIVATE_FIELDS.forEach(field => delete sanitized[field])
  return sanitized
}

const UserService = {

  async createUser(data) {
    const existing = await userRepo.findByEmail(data.email)
    if (existing) throw new ConflictError('Email already in use')
    const hashed = await HashUtil.hashPassword(data.password)
    const user   = await userRepo.create({ ...data, password: hashed })
    emitter.safeEmit(USER_EVENTS.CREATED, user)
    return strip(user)
  },

  async getUserById(id) {
    const user = await userRepo.findById(id)
    if (!user) throw new NotFoundError('User')
    return strip(user)
  },

  async getAllUsers({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      userRepo.findAll({ skip, take: limit }),
      userRepo.count()
    ])
    return {
      users: users.map(strip),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)   // ← fix typo totoalPages
    }
  },

  async updateUser(id, data) {
    await UserService.getUserById(id)
    if (data.password) {
      data.password = await HashUtil.hashPassword(data.password)
    }
    const updated = await userRepo.update(id, data)
    emitter.safeEmit(USER_EVENTS.UPDATED, updated)
    return strip(updated)
  },

  async deleteUser(id) {                      // ← fix name delete → deleteUser
    const user = await UserService.getUserById(id)
    await userRepo.delete(id)
    emitter.safeEmit(USER_EVENTS.DELETED, user)
    return { message: 'User deleted successfully' }
  },

  async findByEmailRaw(email) {
    const user = await userRepo.findByEmail(email)
    if (!user) throw new NotFoundError('User')
    return user                               // ← fix User → user
  }

}

export default UserService