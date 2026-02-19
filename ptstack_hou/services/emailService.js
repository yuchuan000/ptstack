import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

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

    const mailOptions = {
      from: `"PTStack" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `【PTStack公告】${title}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff7d00; margin: 0;">系统公告</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
            <p style="font-size: 16px; color: #1d2129; margin: 0 0 20px 0;">
              亲爱的 <strong>${username}</strong>：
            </p>
            <h2 style="font-size: 18px; color: #1d2129; margin: 0 0 20px 0; border-left: 4px solid #ff7d00; padding-left: 12px;">
              ${title}
            </h2>
            <div style="font-size: 14px; color: #4e5969; line-height: 1.8; white-space: pre-wrap;">
              ${content}
            </div>
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
    console.log(`公告邮件已发送到: ${to}`);
    return true;
  } catch (error) {
    console.error('发送公告邮件失败:', error.message);
    throw error;
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
};
