const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodeMailer = require('nodemailer');
const app = express();
const personalEmail = 'elimalcolmadams@gmail.com';

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist/truecount21')));
app.use(cors({origin: '*'}));
app.use(bodyParser.json());
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/truecount21/index.html'));
});

const sendMail = (user, callback) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NM,
      pass: process.env.EMAIL_PW_NM
    }
  });
  const mailToSelf = {
    from: user.email, // sender address
    to: personalEmail, // list of receivers
    subject: `${user.name} Sent a Message from your Website`,
    text: user.message
  };
  transporter.sendMail(mailToSelf, callback);

  const confirmationOptions = {
    from: personalEmail,
    to: user.email,
    subject: 'TrueCount21 Confirmation',
    text: `Hi ${user.name}. Thank you for your input on TrueCount21`
  };
  transporter.sendMail(confirmationOptions, callback);
};

app.post('/email', (req, res) => {
  console.log('email Request received');
  let user = req.body;
  console.log(user);
  sendMail(user, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400);
      res.send({ error: "Failed to send email" });
    } else {
      console.log(`emails sent for${user.email}`);
      res.send(data);
    }
  })
});


const port = process.env.PORT || '3000';
app.set('port', port);


app.listen(port, () => console.log('Server running at http://127.0.0.1:' + port + '/') );


