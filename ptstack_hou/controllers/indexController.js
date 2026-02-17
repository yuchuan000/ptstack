// 首页控制器
export const getIndex = (req, res, next) => {
  // if you want to use json, you can use res.json instead of res.render
  // res.json({ title: 'Express' });
  res.render('index', { title: 'Express' })
}
