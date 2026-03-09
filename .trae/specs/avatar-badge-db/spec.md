# 头像标识显示修复 - 产品需求文档

## Overview
- **Summary**: 修改所有头像标识的显示逻辑，基于数据库中的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）而不是level字段
- **Purpose**: 确保标识显示逻辑基于数据库配置，提升系统的可配置性和灵活性
- **Target Users**: 开发团队和维护人员

## Goals
- 修改所有头像标识的显示逻辑，使用数据库中的show_avatar_badge字段判断是否显示
- 修改所有头像标识的样式逻辑，使用数据库中的avatar_badge, avatar_badge_bg_color, avatar_badge_text_color字段
- 确保当样式字段为空时，不显示标识

## Non-Goals (Out of Scope)
- 不修改数据库结构或字段
- 不添加新的标识类型或功能
- 不修改UserAvatar组件的内部实现

## Background & Context
- 目前标识显示逻辑基于level字段，需要改为基于数据库中的专门字段
- 数据库中已经包含show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color字段
- 需要确保当样式字段为空时，不显示标识

## Functional Requirements
- **FR-1**: 修改所有头像标识的显示判断逻辑，基于show_avatar_badge字段
- **FR-2**: 修改所有头像标识的样式逻辑，基于avatar_badge, avatar_badge_bg_color, avatar_badge_text_color字段
- **FR-3**: 确保当样式字段为空时，不显示标识

## Non-Functional Requirements
- **NFR-1**: 所有页面的用户标识样式保持一致
- **NFR-2**: 代码整洁，遵循项目的代码规范
- **NFR-3**: 确保所有修改的文件都能通过ESLint检查

## Constraints
- **Technical**: 使用现有的UserAvatar组件，不修改其内部实现
- **Dependencies**: 依赖UserAvatar组件的正确实现

## Assumptions
- 数据库中已经包含必要的字段（show_avatar_badge, avatar_badge, avatar_badge_bg_color, avatar_badge_text_color）
- UserAvatar组件已经正确实现，能够根据传递的属性显示标识

## Acceptance Criteria

### AC-1: 所有头像标识显示逻辑基于数据库配置
- **Given**: 访问任何有头像标识的页面
- **When**: 查看标识显示
- **Then**: 标识显示基于数据库中的show_avatar_badge字段
- **Verification**: `human-judgment`

### AC-2: 所有头像标识样式基于数据库配置
- **Given**: 访问任何有头像标识的页面
- **When**: 查看标识样式
- **Then**: 标识样式基于数据库中的avatar_badge, avatar_badge_bg_color, avatar_badge_text_color字段
- **Verification**: `human-judgment`

### AC-3: 当样式字段为空时不显示标识
- **Given**: 数据库中某个用户的avatar_badge, avatar_badge_bg_color, avatar_badge_text_color字段为空
- **When**: 查看该用户的头像标识
- **Then**: 不显示标识，即使show_avatar_badge为1
- **Verification**: `human-judgment`

## Open Questions
- [ ] 所有需要修改的文件路径是否都已确认？
- [ ] UserAvatar组件是否需要修改以支持新的逻辑？