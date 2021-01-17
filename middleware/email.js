const sgMail = require('@sendgrid/mail');

module.exports = {
    sendEmail: async function (contactMessage) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: `${process.env.EMAIL_ADDRESS}`,
            from: `${process.env.EMAIL_ADDRESS}`,
            subject: `${contactMessage.name} contacted you!`,
            text: `
            Name: ${contactMessage.name},
            Email: ${contactMessage.email},
            Message: ${contactMessage.body}`,
            html: `
            <h1>You have a new message!</h1>
            <div><strong>Name:</strong> ${contactMessage.name}</div>
            <div><strong>Email:</strong> ${contactMessage.email}</div>
            <div><strong>Message:</strong></div><div>${contactMessage.body}</div>`
        };
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent!');
            })
            .catch((error) => {
                console.error("Error sending email: ", error);
            })
    }
};