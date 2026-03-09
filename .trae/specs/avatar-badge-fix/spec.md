# 用户标识显示修复 - 产品需求文档

## Overview
- **Summary**: 修复文章中心、分类申请、个人详情页的订阅者和订阅板块的用户标识显示异常问题，确保所有用户标识都使用统一的 UserAvatar 组件并正确显示
- **Purpose**: 解决不同页面中用户标识显示不一致的问题，确保管理员标识和其他用户标识能够正确显示
- **Target Users**: 开发团队和维护人员

## Goals
- 确保文章中心页面的作者标识正确显示
- 确保分类申请页面的申请人标识正确显示
- 确保个人详情页的订阅者和订阅板块的用户标识正确显示
- 统一所有页面的用户标识显示逻辑

## Non-Goals (Out of Scope)
- 不修改 UserAvatar 组件的内部实现
- 不修改数据库结构或字段
- 不添加新的标识类型或功能

## Background & Context
- 已经创建了 UserAvatar 组件，支持不同尺寸和自定义标识
- 部分页面已经使用了 UserAvatar 组件，但仍有一些页面的标识显示异常
- 标识显示逻辑应该基于数据库中的 show_avatar_badge 字段

## Functional Requirements
- **FR-1**: 文章中心页面的作者标识使用 UserAvatar 组件并正确显示
- **FR-2**: 分类申请页面的申请人标识使用 UserAvatar 组件并正确显示
- **FR-3**: 个人详情页的订阅者和订阅板块的用户标识使用 UserAvatar 组件并正确显示
- **FR-4**: 所有页面的用户标识显示逻辑基于数据库配置（show_avatar_badge 字段）

## Non-Functional Requirements
- **NFR-1**: 所有页面的用户标识样式保持一致
- **NFR-2**: 标识显示逻辑正确，基于数据库配置
- **NFR-3**: 代码整洁，遵循项目的代码规范

## Constraints
- **Technical**: 使用现有的 UserAvatar 组件，不修改其内部实现
- **Dependencies**: 依赖 UserAvatar 组件的正确实现

## Assumptions
- UserAvatar 组件已经正确实现，能够根据数据库配置显示标识
- 数据库中已经包含必要的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）

## Acceptance Criteria

### AC-1: 文章中心页面标识显示正确
- **Given**: 访问文章中心页面
- **When**: 查看文章列表中的作者信息
- **Then**: 所有作者的标识都使用 UserAvatar 组件并正确显示
- **Verification**: `human-judgment`

### AC-2: 分类申请页面标识显示正确
- **Given**: 访问分类申请页面
- **When**: 查看申请人信息
- **Then**: 所有申请人的标识都使用 UserAvatar 组件并正确显示
- **Verification**: `human-judgment`

### AC-3: 个人详情页标识显示正确
- **Given**: 访问个人详情页
- **When**: 查看订阅者和订阅板块的用户信息
- **Then**: 所有用户的标识都使用 UserAvatar 组件并正确显示
- **Verification**: `human-judgment`

### AC-4: 标识显示逻辑基于数据库配置
- **Given**: 查看所有使用 UserAvatar 组件的页面
- **When**: 检查标识显示逻辑
- **Then**: 标识显示逻辑基于数据库中的 show_avatar_badge 字段
- **Verification**: `programmatic`

## Open Questions
- [ ] 文章中心页面是否已经使用 UserAvatar 组件？
- [ ] 分类申请页面是否已经使用 UserAvatar 组件？
- [ ] 个人详情页的订阅者和订阅板块是否已经使用 UserAvatar 组件？