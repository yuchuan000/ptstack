/**
 * 首页控制器
 * 处理首页相关的请求
 */

/**
 * 获取首页
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express下一个中间件函数
 */
export const getIndex = (req, res, next) => {
  // 渲染首页视图
  // 若要返回JSON数据，可使用 res.json 替代 res.render
  // res.json({ title: 'Express' });
  res.render('index', { title: 'Express' })
}
