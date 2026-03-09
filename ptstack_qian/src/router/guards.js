import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ROUTE_PATHS } from './constants'

/**
 * 校验用户登录状态
 * @param {Object} userStore - 用户状态存储
 * @returns {boolean} 是否已登录
 */
const checkIsAuthenticated = (userStore) => {
  return !!(userStore.accessToken || userStore.refreshToken)
}

/**
 * 校验用户是否需要完善个人资料
 * @param {Object} userStore - 用户状态存储
 * @returns {boolean} 是否需要完善资料
 */
const checkNeedsProfileCompletion = (userStore) => {
  return userStore.userInfo && !userStore.userInfo.profileCompleted
}

/**
 * 检查用户是否具有指定等级或更高等级的权限
 * @param {Object} userInfo - 用户信息对象
 * @param {number} requiredLevel - 所需的最低用户等级
 * @returns {boolean} 是否具有权限
 */
const checkUserLevel = (userInfo, requiredLevel) => {
  return userInfo?.level <= requiredLevel
}

/**
 * 检查用户是否具有指定权限
 * @param {Object} userInfo - 用户信息对象
 * @param {string} permission - 权限名称
 * @returns {boolean} 是否具有权限
 */
const checkUserPermission = (userInfo, permission) => {
  if (checkUserLevel(userInfo, 1)) return true // 一级用户拥有所有权限
  return userInfo?.permissions?.includes(permission)
}

/**
 * 处理需要认证的路由访问
 * 执行登录状态、用户等级、权限、资料完善度等校验
 * @param {Object} userStore - 用户状态存储
 * @param {Object} to - 目标路由对象
 * @param {Function} next - 路由跳转函数
 * @returns {boolean} 是否通过校验
 */
const handleAuthenticatedRoute = (userStore, to, next) => {
  if (!checkIsAuthenticated(userStore)) {
    next(ROUTE_PATHS.LOGIN)
    return false
  }

  const userInfo = userStore.userInfo

  // 检查用户等级权限
  if (to.meta.requiredLevel && !checkUserLevel(userInfo, to.meta.requiredLevel)) {
    ElMessage.warning('您没有权限访问此页面')
    next(ROUTE_PATHS.ROOT)
    return false
  }

  // 检查用户具体权限
  if (to.meta.requiredPermission && !checkUserPermission(userInfo, to.meta.requiredPermission)) {
    ElMessage.warning('您没有权限访问此页面')
    next(ROUTE_PATHS.ROOT)
    return false
  }

  if (to.path !== ROUTE_PATHS.COMPLETE_PROFILE && checkNeedsProfileCompletion(userStore)) {
    next(ROUTE_PATHS.COMPLETE_PROFILE)
    return false
  }

  return true
}

/**
 * 处理已登录用户访问登录/注册页面的场景
 * 自动重定向到完善资料页或首页
 * @param {Object} userStore - 用户状态存储
 * @param {Object} to - 目标路由对象
 * @param {Function} next - 路由跳转函数
 */
const handleAuthPageForLoggedInUser = (userStore, to, next) => {
  if (checkNeedsProfileCompletion(userStore)) {
    next(ROUTE_PATHS.COMPLETE_PROFILE)
    return
  }

  next(userStore.userInfo?.level <= 2 ? ROUTE_PATHS.ADMIN : ROUTE_PATHS.ROOT)
}

/**
 * 处理已完善资料用户访问资料完善页面的场景
 * 自动重定向到首页或管理后台
 * @param {Object} userStore - 用户状态存储
 * @param {Function} next - 路由跳转函数
 */
const handleCompletedProfileAccess = (userStore, next) => {
  next(userStore.userInfo?.level <= 2 ? ROUTE_PATHS.ADMIN : ROUTE_PATHS.ROOT)
}

/**
 * 配置全局前置导航守卫
 * 统一处理路由访问权限控制
 * @param {Object} router - Vue Router 实例
 */
export const setupNavigationGuards = (router) => {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth) {
      if (handleAuthenticatedRoute(userStore, to, next)) {
        next()
      }
    } else if (
      (to.path === ROUTE_PATHS.LOGIN || to.path === ROUTE_PATHS.REGISTER) &&
      userStore.isLoggedIn
    ) {
      handleAuthPageForLoggedInUser(userStore, to, next)
    } else if (
      to.path === ROUTE_PATHS.COMPLETE_PROFILE &&
      userStore.userInfo &&
      userStore.userInfo.profileCompleted
    ) {
      handleCompletedProfileAccess(userStore, next)
    } else {
      next()
    }
  })
}
