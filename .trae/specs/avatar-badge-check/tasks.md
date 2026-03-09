# 用户标识显示规范 - 实施计划

## [x] 任务 1: 检查 UserAvatar 组件的标识显示逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 检查 UserAvatar 组件的 hasCustomBadge 计算属性
  - 确保它正确使用数据库中的 show_avatar_badge 字段
  - 验证标识显示逻辑是否正确
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: UserAvatar 组件的 hasCustomBadge 计算属性正确使用 show_avatar_badge 字段
  - `programmatic` TR-1.2: 标识显示逻辑基于数据库配置
- **Notes**: 这是核心任务，确保标识显示逻辑正确

## [x] 任务 2: 检查所有使用 UserAvatar 组件的页面
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 检查所有使用 UserAvatar 组件的页面
  - 确保它们正确传递用户数据
  - 确保它们没有硬编码的管理员标识逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有页面都使用 UserAvatar 组件显示用户标识
  - `programmatic` TR-2.2: 所有页面都没有硬编码的管理员标识逻辑
- **Notes**: 需要检查的页面包括 HomePage, ArticleListPage, CategoryManagePage, PannelPage, ProfilePage

## [ ] 任务 3: 检查是否有未使用 UserAvatar 组件的页面
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**:
  - 检查项目中是否有其他显示用户标识的页面
  - 如果有，确保它们使用 UserAvatar 组件
  - 确保它们没有硬编码的管理员标识逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有有用户标识的页面都使用 UserAvatar 组件
  - `programmatic` TR-3.2: 所有页面都没有硬编码的管理员标识逻辑
- **Notes**: 需要搜索整个项目中可能显示用户标识的地方

## [ ] 任务 4: 验证所有页面的样式一致性
- **Priority**: P1
- **Depends On**: 任务 2, 任务 3
- **Description**:
  - 访问所有有用户标识的页面
  - 检查用户头像和标识的样式是否一致
  - 确保所有页面的样式统一
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 所有页面的用户头像和标识样式保持一致
- **Notes**: 需要手动检查每个页面的显示效果

## [ ] 任务 5: 运行 ESLint 检查
- **Priority**: P2
- **Depends On**: 任务 2, 任务 3
- **Description**:
  - 运行 ESLint 检查，确保代码没有语法错误或代码规范问题
  - 修复发现的问题
- **Acceptance Criteria Addressed**: NFR-3
- **Test Requirements**:
  - `programmatic` TR-5.1: ESLint 检查通过，没有错误
- **Notes**: 确保代码质量符合项目规范