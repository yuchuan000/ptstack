# UserAvatar 组件使用规范 - 产品需求文档

## Overview
- **Summary**: 确保所有有用户标识的地方都使用统一的 UserAvatar 组件，以保证标识显示的一致性和正确性
- **Purpose**: 解决不同页面中用户标识显示不一致、样式错误或不显示的问题
- **Target Users**: 开发团队和维护人员

## Goals
- 确保所有有用户标识的地方都使用 UserAvatar 组件
- 保证标识显示逻辑基于数据库配置（show_avatar_badge 字段）
- 统一所有页面的用户头像和标识样式
- 移除硬编码的管理员标识逻辑，使用配置的样式

## Non-Goals (Out of Scope)
- 不修改 UserAvatar 组件的内部实现
- 不修改数据库结构或字段
- 不添加新的标识类型或功能

## Background & Context
- 已经创建了 UserAvatar 组件，支持不同尺寸和自定义标识
- 部分页面已经使用了 UserAvatar 组件，但仍有部分页面使用旧的实现
- 标识显示逻辑应该基于数据库中的 show_avatar_badge 字段
- 管理员标识应该使用配置的样式，而不是硬编码

## Functional Requirements
- **FR-1**: 侧边栏（PannelPage）使用 UserAvatar 组件显示用户头像和标识
- **FR-2**: 个人详情页上方使用 UserAvatar 组件显示用户头像和标识
- **FR-3**: 个人详情页订阅列表使用 UserAvatar 组件显示用户头像和标识
- **FR-4**: 个人详情页订阅者列表使用 UserAvatar 组件显示用户头像和标识
- **FR-5**: 移除所有硬编码的管理员标识逻辑，使用配置的样式

## Non-Functional Requirements
- **NFR-1**: 所有页面的用户头像和标识样式保持一致
- **NFR-2**: 标识显示逻辑正确，基于数据库配置
- **NFR-3**: 代码整洁，遵循项目的代码规范

## Constraints
- **Technical**: 使用现有的 UserAvatar 组件，不修改其内部实现
- **Dependencies**: 依赖 UserAvatar 组件的正确实现

## Assumptions
- UserAvatar 组件已经正确实现，能够根据数据库配置显示标识
- 数据库中已经包含必要的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）

## Acceptance Criteria

### AC-1: 侧边栏使用 UserAvatar 组件
- **Given**: 用户打开管理后台
- **When**: 查看侧边栏的用户信息
- **Then**: 侧边栏显示用户头像和标识，使用 UserAvatar 组件
- **Verification**: `human-judgment`

### AC-2: 个人详情页上方使用 UserAvatar 组件
- **Given**: 用户打开个人详情页
- **When**: 查看页面上方的用户信息
- **Then**: 页面上方显示用户头像和标识，使用 UserAvatar 组件
- **Verification**: `human-judgment`

### AC-3: 个人详情页订阅列表使用 UserAvatar 组件
- **Given**: 用户打开个人详情页并切换到订阅列表
- **When**: 查看订阅列表中的用户
- **Then**: 订阅列表中的用户显示头像和标识，使用 UserAvatar 组件
- **Verification**: `human-judgment`

### AC-4: 个人详情页订阅者列表使用 UserAvatar 组件
- **Given**: 用户打开个人详情页并切换到订阅者列表
- **When**: 查看订阅者列表中的用户
- **Then**: 订阅者列表中的用户显示头像和标识，使用 UserAvatar 组件
- **Verification**: `human-judgment`

### AC-5: 移除硬编码的管理员标识逻辑
- **Given**: 查看代码
- **When**: 检查所有页面的标识显示逻辑
- **Then**: 所有页面都使用 UserAvatar 组件，没有硬编码的管理员标识逻辑
- **Verification**: `programmatic`

## Open Questions
- [ ] 个人详情页中的用户数据结构是否与 UserAvatar 组件期望的结构一致？
- [ ] 侧边栏中的用户数据结构是否与 UserAvatar 组件期望的结构一致？