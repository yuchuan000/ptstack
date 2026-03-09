# 检查用户标识显示逻辑 - 产品需求文档

## Overview
- **Summary**: 检查所有有用户标识的地方是否根据数据库中的 `show_avatar_badge` 字段决定是否显示标识，确保所有页面统一使用 `UserAvatar` 组件，并且标识显示逻辑基于数据库字段。
- **Purpose**: 确保用户标识的显示逻辑一致，基于数据库配置，而非硬编码实现。
- **Target Users**: 开发人员，确保代码质量和一致性。

## Goals
- 检查所有使用用户标识的页面，确保它们使用 `UserAvatar` 组件
- 验证 `UserAvatar` 组件的标识显示逻辑是否基于 `show_avatar_badge` 字段
- 确保所有页面的用户头像和标识样式一致
- 移除所有硬编码的管理员标识逻辑

## Non-Goals (Out of Scope)
- 修改 `UserAvatar` 组件的核心逻辑
- 修改数据库结构
- 添加新的用户标识功能

## Background & Context
- 项目使用 Vue 3 框架
- 已存在 `UserAvatar` 组件，用于显示用户头像和标识
- 标识显示逻辑应该基于数据库中的 `show_avatar_badge` 字段
- 之前已更新 `ClientLayout.vue` 以使用 `UserAvatar` 组件

## Functional Requirements
- **FR-1**: 所有有用户标识的页面必须使用 `UserAvatar` 组件
- **FR-2**: `UserAvatar` 组件必须根据 `show_avatar_badge` 字段决定是否显示标识
- **FR-3**: 所有页面的用户头像和标识样式必须一致

## Non-Functional Requirements
- **NFR-1**: 代码质量符合 ESLint 规范
- **NFR-2**: 页面加载性能不受影响
- **NFR-3**: 代码可维护性高，逻辑清晰

## Constraints
- **Technical**: Vue 3 框架，Element Plus UI 库
- **Business**: 保持现有功能不变，仅检查和修复标识显示逻辑

## Assumptions
- `UserAvatar` 组件已正确实现，基于 `show_avatar_badge` 字段显示标识
- 数据库中已存在 `show_avatar_badge` 字段

## Acceptance Criteria

### AC-1: UserAvatar 组件标识显示逻辑正确
- **Given**: 用户数据中包含 `show_avatar_badge` 字段
- **When**: 渲染 `UserAvatar` 组件
- **Then**: 标识显示状态应与 `show_avatar_badge` 字段值一致
- **Verification**: `programmatic`
- **Notes**: 检查 `hasCustomBadge` 计算属性的实现

### AC-2: 所有页面使用 UserAvatar 组件
- **Given**: 页面中显示用户头像和标识
- **When**: 检查页面代码
- **Then**: 必须使用 `UserAvatar` 组件，而非硬编码实现
- **Verification**: `human-judgment`
- **Notes**: 检查所有相关页面的代码

### AC-3: 标识样式一致
- **Given**: 不同页面显示用户标识
- **When**: 比较不同页面的标识样式
- **Then**: 所有页面的标识样式应一致
- **Verification**: `human-judgment`
- **Notes**: 检查样式是否统一

## Open Questions
- [ ] 是否所有页面都已正确传递用户数据给 `UserAvatar` 组件？
- [ ] 是否有其他页面需要检查？