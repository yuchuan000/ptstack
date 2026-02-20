import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const EMAIL_VERIFICATION_CODE_EXPIRES_IN = parseInt(process.env.EMAIL_VERIFICATION_CODE_EXPIRES_IN) || 15;

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.163.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// 生成6位验证码（数字+大小写字母）
export const generateVerificationCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 生成验证令牌（兼容旧接口）
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 发送验证邮件（带验证码）
export const sendVerificationEmail = async (to, username, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '【PTStack】您的邮箱验证码',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #165dff; margin: 0;">欢迎加入 PTStack！</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
            <p style="font-size: 16px; color: #1d2129; margin: 0 0 20px 0;">
              亲爱的用户：
            </p>
            <p style="font-size: 14px; color: #4e5969; margin: 0 0 30px 0; line-height: 1.6;">
              感谢您注册 PTStack！请使用下方验证码完成邮箱验证。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #165dff 0%, #4080ff 100%); color: white; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 13px; color: #86909c; margin: 20px 0 0 0; line-height: 1.6; text-align: center;">
              请在注册页面输入此验证码
            </p>
            
            <p style="font-size: 13px; color: #86909c; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e6eb;">
              此验证码有效期为 ${EMAIL_VERIFICATION_CODE_EXPIRES_IN} 分钟。如果您没有注册 PTStack，请忽略此邮件。
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e6eb;">
            <p style="font-size: 12px; color: #86909c; margin: 0;">
              © 2026 PTStack. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`验证邮件已发送到: ${to}, 验证码: ${code}`);
    return true;
  } catch (error) {
    console.error('发送验证邮件失败:', error.message);
    throw error;
  }
};

// 发送密码重置邮件
export const sendPasswordResetEmail = async (to, username, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '【PTStack】重置您的密码',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #165dff; margin: 0;">重置密码</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
            <p style="font-size: 16px; color: #1d2129; margin: 0 0 20px 0;">
              亲爱的 <strong>${username}</strong>：
            </p>
            <p style="font-size: 14px; color: #4e5969; margin: 0 0 30px 0; line-height: 1.6;">
              我们收到了您的密码重置请求。请点击下方按钮重置您的密码。
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #165dff 0%, #4080ff 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                重置密码
              </a>
            </div>
            
            <p style="font-size: 13px; color: #86909c; margin: 20px 0 0 0; line-height: 1.6;">
              如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
              <a href="${resetUrl}" style="color: #165dff; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="font-size: 13px; color: #86909c; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e6eb;">
              此链接有效期为 1 小时。如果您没有请求重置密码，请忽略此邮件。
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`密码重置邮件已发送到: ${to}`);
    return true;
  } catch (error) {
    console.error('发送密码重置邮件失败:', error.message);
    throw error;
  }
};

export const sendAnnouncementEmail = async (to, username, title, content) => {
  try {
    const transporter = createTransporter();
    const htmlContent = md.render(content);

    const styledHtmlContent = htmlContent
      .replace(/<h1/g, '<h1 style="font-size: 22px; font-weight: 700; color: #1d2129; margin: 20px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #165dff;"')
      .replace(/<h2/g, '<h2 style="font-size: 18px; font-weight: 600; color: #1d2129; margin: 16px 0 10px 0;"')
      .replace(/<h3/g, '<h3 style="font-size: 16px; font-weight: 600; color: #1d2129; margin: 14px 0 8px 0;"')
      .replace(/<p/g, '<p style="font-size: 15px; color: #4e5969; line-height: 1.75; margin: 10px 0;"')
      .replace(/<ul/g, '<ul style="padding-left: 24px; margin: 10px 0;"')
      .replace(/<ol/g, '<ol style="padding-left: 24px; margin: 10px 0;"')
      .replace(/<li/g, '<li style="font-size: 15px; color: #4e5969; line-height: 1.75; margin: 5px 0;"')
      .replace(/<a /g, '<a style="color: #165dff; text-decoration: none; font-weight: 500; border-bottom: 1px solid rgba(22, 93, 255, 0.3);" ')
      .replace(/<strong>/g, '<strong style="color: #1d2129; font-weight: 600;">')
      .replace(/<code>/g, '<code style="background: #f7f8fa; padding: 3px 8px; border-radius: 4px; font-size: 14px; color: #d03050; font-family: Consolas, Monaco, "Courier New", monospace;"')
      .replace(/<pre>/g, '<pre style="background: #f7f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 14px 0; border: 1px solid #e5e6eb;"')
      .replace(/<pre><code>/g, '<pre style="background: #f7f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 14px 0; border: 1px solid #e5e6eb;"><code style="color: #1d2129; font-size: 14px; font-family: Consolas, Monaco, "Courier New", monospace; background: none; padding: 0; line-height: 1.6;"')
      .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #165dff; padding: 12px 16px; margin: 14px 0; background: #f2f3f5; border-radius: 0 6px 6px 0; color: #4e5969; font-style: normal;"')
      .replace(/<hr>/g, '<hr style="border: none; border-top: 1px solid #e5e6eb; margin: 20px 0;">');

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `【PTStack公告】${title}`,
      html: `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
        </head>
        <body style="margin: 0; padding: 0; background: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;">
          <div style="max-width: 680px; margin: 0 auto; padding: 32px 16px;">
            
            <div style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%); border-radius: 12px 12px 0 0; padding: 28px 32px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: white; margin: 0; letter-spacing: 2px;">PTStack</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 8px;">系统公告</div>
            </div>
            
            <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 4px 16px rgba(22, 93, 255, 0.08);">
              
              <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; color: #4e5969; margin: 0 0 16px 0;">
                  亲爱的 <strong style="color: #1d2129; font-weight: 600;">${username}</strong>：
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f2f8ff 0%, #e6f4ff 100%); border-left: 4px solid #165dff; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 0 0 24px 0;">
                <div style="font-size: 20px; font-weight: 700; color: #165dff; margin: 0; line-height: 1.4;">
                  ${title}
                </div>
              </div>
              
              <div style="color: #4e5969;">
                ${styledHtmlContent}
              </div>
              
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px 24px; margin-top: 16px; text-align: center;">
              <p style="font-size: 13px; color: #86909c; margin: 0 0 6px 0; line-height: 1.6;">
                此邮件由系统自动发送，请勿直接回复
              </p>
              <p style="font-size: 13px; color: #86909c; margin: 0 0 8px 0; line-height: 1.6;">
                如有疑问，请访问 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #165dff; text-decoration: none; font-weight: 500;">PTStack 官网</a> 联系我们
              </p>
              <p style="font-size: 12px; color: #c9cdd4; margin: 0; line-height: 1.5;">
                © 2026 PTStack. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`公告邮件已发送到: ${to}`);
    return true;
  } catch (error) {
    console.error('发送公告邮件失败:', error.message);
    throw error;
  }
};

export const sendCategoryApplicationEmail = async (to, username, categoryName, description, applicantName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '【PTStack】新分类申请提醒',
      html: `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
        </head>
        <body style="margin: 0; padding: 0; background: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;">
          <div style="max-width: 680px; margin: 0 auto; padding: 32px 16px;">
            
            <div style="background: linear-gradient(135deg, #165dff 0%, #4080ff 100%); border-radius: 12px 12px 0 0; padding: 28px 32px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: white; margin: 0; letter-spacing: 2px;">PTStack</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 8px;">新分类申请提醒</div>
            </div>
            
            <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 4px 16px rgba(22, 93, 255, 0.08);">
              
              <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; color: #4e5969; margin: 0 0 16px 0;">
                  亲爱的 <strong style="color: #1d2129; font-weight: 600;">${username}</strong>：
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f2f8ff 0%, #e6f4ff 100%); border-left: 4px solid #165dff; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 0 0 24px 0;">
                <div style="font-size: 20px; font-weight: 700; color: #165dff; margin: 0; line-height: 1.4;">
                  收到新的分类申请
                </div>
              </div>
              
              <div style="color: #4e5969;">
                <p style="font-size: 15px; line-height: 1.75; margin: 10px 0;">
                  申请人：<strong style="color: #1d2129;">${applicantName}</strong>
                </p>
                <p style="font-size: 15px; line-height: 1.75; margin: 10px 0;">
                  分类名称：<strong style="color: #1d2129;">${categoryName}</strong>
                </p>
                ${description ? `
                <p style="font-size: 15px; line-height: 1.75; margin: 10px 0;">
                  分类描述：<strong style="color: #1d2129;">${description}</strong>
                </p>
                ` : ''}
                <p style="font-size: 15px; line-height: 1.75; margin: 20px 0;">
                  请登录后台查看并审核该申请。
                </p>
              </div>
              
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px 24px; margin-top: 16px; text-align: center;">
              <p style="font-size: 13px; color: #86909c; margin: 0 0 6px 0; line-height: 1.6;">
                此邮件由系统自动发送，请勿直接回复
              </p>
              <p style="font-size: 13px; color: #86909c; margin: 0 0 8px 0; line-height: 1.6;">
                如有疑问，请访问 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #165dff; text-decoration: none; font-weight: 500;">PTStack 官网</a> 联系我们
              </p>
              <p style="font-size: 12px; color: #c9cdd4; margin: 0; line-height: 1.5;">
                © 2026 PTStack. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`分类申请邮件已发送到: ${to}`);
    return true;
  } catch (error) {
    console.error('发送分类申请邮件失败:', error.message);
    throw error;
  }
};

export const sendCategoryReviewEmail = async (to, username, categoryName, action, reviewComment) => {
  try {
    const transporter = createTransporter();
    const isApproved = action === 'approve';
    const actionText = isApproved ? '审核通过' : '审核拒绝';
    const actionColor = isApproved ? '#00b42a' : '#d03050';

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `【PTStack】您的分类申请${actionText}`,
      html: `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
        </head>
        <body style="margin: 0; padding: 0; background: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;">
          <div style="max-width: 680px; margin: 0 auto; padding: 32px 16px;">
            
            <div style="background: linear-gradient(135deg, ${isApproved ? '#00b42a 0%, #20c997 100%' : '#d03050 0%, #e34d71 100%'}); border-radius: 12px 12px 0 0; padding: 28px 32px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; color: white; margin: 0; letter-spacing: 2px;">PTStack</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 8px;">分类申请${actionText}</div>
            </div>
            
            <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 4px 16px rgba(22, 93, 255, 0.08);">
              
              <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; color: #4e5969; margin: 0 0 16px 0;">
                  亲爱的 <strong style="color: #1d2129; font-weight: 600;">${username}</strong>：
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, ${isApproved ? '#f0fff4 0%, #e6ffec 100%' : '#fff1f2 0%, #ffeef0 100%'}); border-left: 4px solid ${actionColor}; border-radius: 0 8px 8px 0; padding: 18px 20px; margin: 0 0 24px 0;">
                <div style="font-size: 20px; font-weight: 700; color: ${actionColor}; margin: 0; line-height: 1.4;">
                  分类申请${actionText}
                </div>
              </div>
              
              <div style="color: #4e5969;">
                <p style="font-size: 15px; line-height: 1.75; margin: 10px 0;">
                  分类名称：<strong style="color: #1d2129;">${categoryName}</strong>
                </p>
                ${reviewComment ? `
                <p style="font-size: 15px; line-height: 1.75; margin: 10px 0;">
                  审核意见：<strong style="color: #1d2129;">${reviewComment}</strong>
                </p>
                ` : ''}
                <p style="font-size: 15px; line-height: 1.75; margin: 20px 0;">
                  ${isApproved ? '您申请的分类已成功创建，可以开始使用了。' : '如有疑问，请重新提交申请或联系管理员。'}
                </p>
              </div>
              
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px 24px; margin-top: 16px; text-align: center;">
              <p style="font-size: 13px; color: #86909c; margin: 0 0 6px 0; line-height: 1.6;">
                此邮件由系统自动发送，请勿直接回复
              </p>
              <p style="font-size: 13px; color: #86909c; margin: 0 0 8px 0; line-height: 1.6;">
                如有疑问，请访问 <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #165dff; text-decoration: none; font-weight: 500;">PTStack 官网</a> 联系我们
              </p>
              <p style="font-size: 12px; color: #c9cdd4; margin: 0; line-height: 1.5;">
                © 2026 PTStack. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`分类审核邮件已发送到: ${to}`);
    return true;
  } catch (error) {
    console.error('发送分类审核邮件失败:', error.message);
    throw error;
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendCategoryApplicationEmail,
  sendCategoryReviewEmail,
};
