# 头像标识显示修复 - 产品需求文档

## Overview
- **Summary**: 修复文章中心列表的标识显示问题，以及个人详情页的订阅者列表和订阅列表的头像大小和标识显示问题
- **Purpose**: 确保所有用户标识能够正确显示，并且头像尺寸符合设计规范
- **Target Users**: 开发团队和维护人员

## Goals
- 确保文章中心列表的作者标识正确显示
- 调整个人详情页的订阅者列表和订阅列表的头像尺寸
- 确保个人详情页的订阅者列表和订阅列表的标识正确显示

## Non-Goals (Out of Scope)
- 不修改 UserAvatar 组件的内部实现
- 不修改数据库结构或字段
- 不添加新的标识类型或功能

## Background & Context
- 已经创建了 UserAvatar 组件，支持不同尺寸和自定义标识
- 部分页面的标识显示存在问题，需要修复
- 个人详情页的订阅者和订阅列表的头像尺寸过小

## Functional Requirements
- **FR-1**: 文章中心列表的作者标识使用 UserAvatar 组件并正确显示
- **FR-2**: 个人详情页的订阅者列表的头像尺寸调整为合适大小
- **FR-3**: 个人详情页的订阅者列表的标识正确显示
- **FR-4**: 个人详情页的订阅列表的头像尺寸调整为合适大小
- **FR-5**: 个人详情页的订阅列表的标识正确显示

## Non-Functional Requirements
- **NFR-1**: 所有页面的用户标识样式保持一致
- **NFR-2**: 头像尺寸符合设计规范
- **NFR-3**: 代码整洁，遵循项目的代码规范

## Constraints
- **Technical**: 使用现有的 UserAvatar 组件，不修改其内部实现
- **Dependencies**: 依赖 UserAvatar 组件的正确实现

## Assumptions
- UserAvatar 组件已经正确实现，能够根据数据库配置显示标识
- 数据库中已经包含必要的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）

## Acceptance Criteria

### AC-1: 文章中心列表标识显示正确
- **Given**: 访问文章中心列表页面
- **When**: 查看文章列表中的作者信息
- **Then**: 所有作者的标识都使用 UserAvatar 组件并正确显示
- **Verification**: `human-judgment`

### AC-2: 个人详情页订阅者列表头像尺寸和标识显示正确
- **Given**: 访问个人详情页的订阅者列表
- **When**: 查看订阅者信息
- **Then**: 订阅者的头像尺寸合适，标识正确显示
- **Verification**: `human-judgment`

### AC-3: 个人详情页订阅列表头像尺寸和标识显示正确
- **Given**: 访问个人详情页的订阅列表
- **When**: 查看订阅信息
- **Then**: 订阅的用户头像尺寸合适，标识正确显示
- **Verification**: `human-judgment`

## Open Questions
- [ ] 文章中心列表页面的具体文件路径是什么？
- [ ] 个人详情页的订阅者和订阅列表的头像尺寸应该调整为多少？