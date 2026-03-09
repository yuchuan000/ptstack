# 用户标识显示规范 - 产品需求文档

## Overview
- **Summary**: 确保所有有用户标识的地方都使用统一的 UserAvatar 组件，并且标识显示逻辑基于数据库中的 show_avatar_badge 字段
- **Purpose**: 解决不同页面中用户标识显示不一致、样式错误或不显示的问题，确保标识显示逻辑正确
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
- 部分页面已经使用了 UserAvatar 组件，但需要确保所有页面都使用
- 标识显示逻辑应该基于数据库中的 show_avatar_badge 字段
- 管理员标识应该使用配置的样式，而不是硬编码

## Functional Requirements
- **FR-1**: 所有有用户标识的地方都使用 UserAvatar 组件
- **FR-2**: 标识显示逻辑基于数据库中的 show_avatar_badge 字段
- **FR-3**: 移除所有硬编码的管理员标识逻辑
- **FR-4**: 统一所有页面的用户头像和标识样式

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

### AC-1: 所有页面使用 UserAvatar 组件
- **Given**: 查看所有有用户标识的页面
- **When**: 检查代码实现
- **Then**: 所有页面都使用 UserAvatar 组件显示用户标识
- **Verification**: `programmatic`

### AC-2: 标识显示逻辑基于数据库配置
- **Given**: 查看 UserAvatar 组件和使用它的页面
- **When**: 检查标识显示逻辑
- **Then**: 标识显示逻辑基于数据库中的 show_avatar_badge 字段
- **Verification**: `programmatic`

### AC-3: 移除硬编码的管理员标识逻辑
- **Given**: 查看所有页面的代码
- **When**: 检查是否有硬编码的管理员标识逻辑
- **Then**: 所有页面都没有硬编码的管理员标识逻辑
- **Verification**: `programmatic`

### AC-4: 所有页面的样式一致
- **Given**: 访问所有有用户标识的页面
- **When**: 查看页面显示效果
- **Then**: 所有页面的用户头像和标识样式保持一致
- **Verification**: `human-judgment`

## Open Questions
- [ ] 所有有用户标识的页面是否都已使用 UserAvatar 组件？
- [ ] 标识显示逻辑是否都基于数据库中的 show_avatar_badge 字段？