# 检查用户标识显示逻辑 - 验证检查清单

- [ ] 检查 UserAvatar 组件的 hasCustomBadge 计算属性是否正确使用 show_avatar_badge 字段
- [ ] 检查 ClientLayout.vue 是否使用 UserAvatar 组件
- [ ] 检查 HomePage.vue 是否使用 UserAvatar 组件
- [ ] 检查 ArticleListPage.vue 是否使用 UserAvatar 组件
- [ ] 检查 CategoryManagePage.vue 是否使用 UserAvatar 组件
- [ ] 检查 PannelPage.vue 是否使用 UserAvatar 组件
- [ ] 检查 ProfilePage.vue 是否使用 UserAvatar 组件
- [ ] 搜索项目中其他可能使用用户标识的页面
- [ ] 运行 pnpm run lint 检查代码质量
- [ ] 确保所有页面的用户头像和标识样式一致
- [ ] 确保所有页面正确传递用户数据给 UserAvatar 组件
- [ ] 移除所有硬编码的管理员标识逻辑