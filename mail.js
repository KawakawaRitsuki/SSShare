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

const reset_mes = {
  from: config.get('mail.user'),
  subject: 'パスワードリセット | SSShare',
  text: 'TEST MAIL BODY'
};

const change_mes = {
  from: config.get('mail.user'),
  subject: 'メールアドレス変更 | SSShare',
  text: 'TEST MAIL BODY'
};


module.exports = {
  new: addr => {
    const token = uniqid()
    const mes = {
      from: config.get('mail.user'),
      subject: '新規アカウント登録 | SSShare',
      to: addr,
      text: `アカウントを作成するには下記リンクをクリックしてください。<br><br><a href="http://${config.get('server.domain')}:8000/user/register?token=${token}">http://${config.get('server.domain')}/user/register?token=${token}`
    };

    transporter.sendMail( mes, ( error, info ) => {
      if( error ){
        return console.log( error );
      } else {
        console.log('Message sent: ' + info.response);
      }
    })
    return token
  },
  reset: addr => {
    let mes = reset_mes
    mes.to = addr
    transporter.sendMail( mes, ( error, info ) => {
      if( error ){
        return console.log( error );
      } else {
        console.log('Message sent: ' + info.response);
      }
    })
  },
  change: addr => {
    let mes = change_mes
    mes.to = addr
    transporter.sendMail( mes, ( error, info ) => {
      if( error ){
        return console.log( error );
      } else {
        console.log('Message sent: ' + info.response);
      }
    })
  }
}
