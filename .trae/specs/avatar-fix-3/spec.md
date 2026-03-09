# 头像标识显示修复 - 产品需求文档

## Overview
- **Summary**: 修复个人详情页的订阅和订阅者列表的头像显示问题，以及文章中心列表的标识显示逻辑问题
- **Purpose**: 确保头像显示正确，标识根据数据库字段显示，提升用户体验
- **Target Users**: 开发团队和维护人员

## Goals
- 修复个人详情页的订阅和订阅者列表的头像显示问题（去掉多余的圆形区域）
- 确保个人详情页的订阅和订阅者列表的标识正确显示
- 修复文章中心列表的标识显示逻辑，使其基于数据库中的 show_avatar_badge 字段

## Non-Goals (Out of Scope)
- 不修改 UserAvatar 组件的内部实现
- 不修改数据库结构或字段
- 不添加新的标识类型或功能

## Background & Context
- 已经创建了 UserAvatar 组件，支持不同尺寸和自定义标识
- 个人详情页的订阅和订阅者列表的头像显示存在问题，有两个圆形区域
- 文章中心列表的标识显示逻辑需要基于数据库字段

## Functional Requirements
- **FR-1**: 修复个人详情页的订阅和订阅者列表的头像显示问题
- **FR-2**: 确保个人详情页的订阅和订阅者列表的标识正确显示
- **FR-3**: 修复文章中心列表的标识显示逻辑，基于数据库中的 show_avatar_badge 字段

## Non-Functional Requirements
- **NFR-1**: 所有页面的用户标识样式保持一致
- **NFR-2**: 头像显示正确，没有多余的圆形区域
- **NFR-3**: 代码整洁，遵循项目的代码规范

## Constraints
- **Technical**: 使用现有的 UserAvatar 组件，不修改其内部实现
- **Dependencies**: 依赖 UserAvatar 组件的正确实现

## Assumptions
- UserAvatar 组件已经正确实现，能够根据数据库配置显示标识
- 数据库中已经包含必要的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）

## Acceptance Criteria

### AC-1: 个人详情页的订阅和订阅者列表头像显示正确
- **Given**: 访问个人详情页的订阅和订阅者列表
- **When**: 查看头像显示
- **Then**: 头像显示在蓝色区域，没有多余的圆形区域
- **Verification**: `human-judgment`

### AC-2: 个人详情页的订阅和订阅者列表标识显示正确
- **Given**: 访问个人详情页的订阅和订阅者列表
- **When**: 查看用户标识
- **Then**: 标识根据数据库中的 show_avatar_badge 字段正确显示
- **Verification**: `human-judgment`

### AC-3: 文章中心列表的标识显示逻辑正确
- **Given**: 访问文章中心列表
- **When**: 查看作者标识
- **Then**: 标识根据数据库中的 show_avatar_badge 字段正确显示
- **Verification**: `programmatic`

## Open Questions
- [ ] 个人详情页的订阅和订阅者列表的头像显示问题具体是什么？
- [ ] 文章中心列表的标识显示逻辑当前是如何实现的？