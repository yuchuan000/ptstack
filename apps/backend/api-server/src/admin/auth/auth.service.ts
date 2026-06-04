import dayjs from 'dayjs'

export const loginService = (username: string, password: string) => {
  const truePassword = 'yuchuan' + dayjs().format('HHmm')
  if (username === 'yuchuan' && password === truePassword) {
    return {
      code: 200,
      message: '登录成功！',
      data: {
        token: 'Bearer 123123123',
      },
    }
  } else {
    return {
      code: 400,
      message: '账号或密码错误，请重试！',
    }
  }
}
