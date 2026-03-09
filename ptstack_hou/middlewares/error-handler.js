/**
 * 错误处理中间件
 * 处理Express应用中的错误
 */

/**
 * 错误处理中间件函数
 * @param {Error} err - 错误对象
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @param {function} next - Express下一个中间件函数
 * @returns {void}
 */
export default (err, req, res, next) => {
  // 设置本地变量，仅在开发环境提供错误详情
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // 设置响应状态码
  res.status(err.status || 500)

  // 渲染错误页面
  // 若要返回JSON数据，可使用 res.json 替代 res.render
  // res.json({
  //   status: false,
  //   message: err.message
  // })
  res.render('error')
}
