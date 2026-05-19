import prisma from '../config/prisma.js'

const userRepo = {

  async create(data) {
    return prisma.user.create({ data })
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } })
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findAll({ skip = 0, take = 20 } = {}) {   
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data })
  },

  async delete(id) {
    return prisma.user.delete({ where: { id } })
  },

  async count() {                                  
    return prisma.user.count()
  }

}

export default userRepo                            