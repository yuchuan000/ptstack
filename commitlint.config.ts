// commitlint.config.js
import { defineConfig } from 'cz-git'

// 唯一的类型数据源
const typeOptions = [
  { value: 'feat', name: 'feat:     新功能' },
  { value: 'fix', name: 'fix:      修复' },
  { value: 'docs', name: 'docs:     文档变更' },
  { value: 'style', name: 'style:    代码格式' },
  { value: 'refactor', name: 'refactor: 重构' },
  { value: 'perf', name: 'perf:     性能优化' },
  { value: 'test', name: 'test:     增加测试' },
  { value: 'chore', name: 'chore:    构建/工具变动' },
  { value: 'revert', name: 'revert:   回退' },
  { value: 'build', name: 'build:    打包' },
  { value: 'ci', name: 'ci:       CI/CD' },
]

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', typeOptions.map((t) => t.value)],
    'subject-case': [0],
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀（可选）:',
      confirmCommit: '是否确认使用以上信息提交？',
    },
    types: typeOptions,
    skipQuestions: ['footer'],
    maxSubjectLength: 100,
    scopes: [
      {
        value: 'root',
        name: 'root: 根项目',
      },
      {
        value: 'backend',
        name: 'backend: 后端项目',
      },
      {
        value: 'frontend',
        name: 'frontend: 前端项目',
      },
      {
        value: 'component',
        name: 'component: 组件项目',
      },
      {
        value: 'utils',
        name: 'utils: 工具项目',
      },
      {
        value: 'types',
        name: 'types: 类型项目',
      },
    ],
    issuePrefixes: [
      { value: 'close', name: 'close:   标记 Issue 已关闭' },
      { value: 'fix', name: 'fix:     修复 Issue' },
      { value: 'ref', name: 'ref:     关联 Issue' },
    ],
  },
})
