# 检查用户标识显示逻辑 - 实现计划

## [ ] Task 1: 检查 UserAvatar 组件标识显示逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 验证 UserAvatar 组件的 hasCustomBadge 计算属性是否正确使用 show_avatar_badge 字段
  - 确保组件逻辑符合需求
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 验证 hasCustomBadge 计算属性逻辑是否正确
  - `human-judgement` TR-1.2: 检查组件代码是否清晰易懂
- **Notes**: 组件已实现，需要验证逻辑正确性

## [ ] Task 2: 检查 ClientLayout.vue
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 检查 ClientLayout.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
  - 移除硬编码的管理员标识逻辑
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-2.2: 检查用户数据传递是否正确
- **Notes**: 之前已更新，需要确认

## [ ] Task 3: 检查 HomePage.vue
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 检查 HomePage.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-3.2: 检查用户数据传递是否正确
- **Notes**: 已使用 UserAvatar 组件，需要确认

## [ ] Task 4: 检查 ArticleListPage.vue
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 检查 ArticleListPage.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-4.2: 检查用户数据传递是否正确
- **Notes**: 已使用 UserAvatar 组件，需要确认

## [ ] Task 5: 检查 CategoryManagePage.vue
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 检查 CategoryManagePage.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-5.2: 检查用户数据传递是否正确
- **Notes**: 已使用 UserAvatar 组件，需要确认

## [ ] Task 6: 检查 PannelPage.vue
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 检查 PannelPage.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-6.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-6.2: 检查用户数据传递是否正确
- **Notes**: 已使用 UserAvatar 组件，需要确认

## [ ] Task 7: 检查 ProfilePage.vue
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 检查 ProfilePage.vue 是否使用 UserAvatar 组件
  - 确保正确传递用户数据
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-7.1: 验证是否使用 UserAvatar 组件
  - `human-judgement` TR-7.2: 检查用户数据传递是否正确
- **Notes**: 已使用 UserAvatar 组件，需要确认

## [ ] Task 8: 检查其他可能使用用户标识的页面
- **Priority**: P2
- **Depends On**: Task 1
- **Description**: 
  - 搜索项目中其他可能使用用户标识的页面
  - 确保它们都使用 UserAvatar 组件
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-8.1: 搜索项目中使用用户标识的地方
  - `human-judgement` TR-8.2: 检查是否都使用 UserAvatar 组件
- **Notes**: 需要全面搜索

## [ ] Task 9: 运行 ESLint 检查
- **Priority**: P1
- **Depends On**: 所有其他任务
- **Description**: 
  - 运行 pnpm run lint 检查代码质量
  - 修复发现的问题
- **Acceptance Criteria Addressed**: NFR-1
- **Test Requirements**:
  - `programmatic` TR-9.1: 验证 ESLint 检查通过
- **Notes**: 确保代码符合规范
