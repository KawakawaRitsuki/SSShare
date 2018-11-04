const nodemailer = require('nodemailer'),
  config = require('config'),
  uniqid = require('uniqid')

const transporter = nodemailer.createTransport({
  host: config.get('mail.host'),
  port: config.get('mail.port'),
  use_authentication: true,
  auth: {
    user: config.get('mail.user'),
    pass: config.get('mail.pass')
  }
});

const new_mes = {
  from: config.get('mail.user'),
  subject: '新規アカウント登録 | SSShare',
  text: 'アカウントを作成するには下記リンクをクリックしてください。'
};

const reset_mes = {
  from: config.get('mail.user'),
  subject: 'パスワードリセット | SSShare',
  text: 'パスワードのリセットをするには下記リンクをクリックしてください。'
}

const change_mes = {
  from: config.get('mail.user'),
  subject: 'メールアドレス変更 | SSShare',
  text: 'メールアドレスの変更をするには下記リンクをクリックしてください。'
}


module.exports = {
  new: addr => {
    const token = uniqid()
    let mes = Object.assign({},new_mes)
    mes.to = addr
    mes.text = `${mes.text}<br><br><a href="http://${config.get('server.domain')}/account/register?token=${token}">http://${config.get('server.domain')}/account/register?token=${token}`

    transporter.sendMail(mes,(error, info) => {
      if(error) return console.log(error)
      console.log('Message sent: ' + info.response)
    })
    return token
  },
  reset: addr => {
    const token = uniqid()
    let mes = Object.assign({},reset_mes)
    mes.to = addr
    mes.text = `${mes.text}<br><br><a href="http://${config.get('server.domain')}/account/reset?token=${token}">http://${config.get('server.domain')}/account/reset?token=${token}`

    transporter.sendMail(mes, (error, info) => {
      if(error) return console.log(error)
      console.log('Message sent: ' + info.response)
    })
    return token
  },
  change: addr => {
    const token = uniqid()
    let mes = Object.assign({},change_mes)
    mes.to = addr
    mes.text = `${mes.text}<br><br><a href="http://${config.get('server.domain')}/account/change?token=${token}">http://${config.get('server.domain')}/account/change?token=${token}`

    transporter.sendMail(mes, (error, info) => {
      if(error) return console.log(error)
      console.log('Message sent: ' + info.response)
    })
    return token
  }
}
