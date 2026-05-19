import UserService from '../services/userService.js'
import Response from '../utils/response.js'
import asyncHandler from '../middleware/asyncHandler.js'

const UserController = {

  // ── used by admin only ────────────────────────────────────
  create: asyncHandler(async (req, res) => {
    const user = await UserService.createUser(req.body)
    return Response.created(res, user, 'User created successfully')
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id)   // ← fix
    return Response.success(res, user)
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await UserService.getAllUsers(req.query)
    return Response.paginated(res, result)
  }),

  update: asyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body)
    return Response.success(res, user, 'User updated successfully')
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await UserService.deleteUser(req.params.id)   // ← fix
    return Response.success(res, null, result.message)
  }),

  // ── used by authenticated user — own profile ──────────────
  getMe: asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.userId)
    return Response.success(res, user)
  }),

  updateMe: asyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.user.userId, req.body)
    return Response.success(res, user, 'Profile updated successfully')
  }),

  deleteMe: asyncHandler(async (req, res) => {
    const result = await UserService.deleteUser(req.user.userId)
    return Response.success(res, null, result.message)
  })

}

export default UserController