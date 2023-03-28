const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views");
app.use(express.static(src));
app.use(express.json())
const multer = Multer({
  storage: Multer.memoryStorage(
  ),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
});

let projectId = "bluepig-380909"; // Get this from Google Cloud
let keyFilename = "KEYFILE.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
const bucket = storage.bucket("bpbuclet"); // Get this from Google Cloud -> Storage

// Gets all files in the defined bucket
app.get("/upload", async (req, res) => {
  try {
    // console.log(req.file.fieldname)
    const [files] = await bucket.getFiles();
    res.send([files]);
    console.log("Success");
  } catch (error) {
    res.send("Error:" + error);
  }
});
// Streams file upload to Google Storage
app.post("/upload", multer.single("imgfile"), async (req, res) => {
  console.log("Made it /upload");
  try {
    console.log(req.file.filename)
    if (req.file) {
      const bucket = storage.bucket("bpbuclet");
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on("finish", () => {
        res.status(200).send("Success");
        console.log("Success");
      });
      blobStream.end(req.file.buffer);
    } else throw "error with img";
  } catch (error) {
    res.status(500).send(error);
  }
});
// Get the main index html file


// Start the server on port 8080 or as defined
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});










//const db = require("../../db/conn");
var Publishable_Key = "pk_test_51Mp8zHSCWxDhX6nbxM8mcTTHK5rXI3LYklBOWf5vSaszLaNc2L5vUrzUSWqjjt1fxfvLvEHhgSfqVxUOryAkv7RS000FTXWJcD"
var Secret_Key = "sk_test_51Mp8zHSCWxDhX6nbdAeR042KKk0Zjp0DTlaTWPzRop1rvAYV3ztidIabzR4foD3w9RMrbgyqLCSd0XygxvVm8fIp00WwPeOrIO"
const stripe = require('stripe')(Secret_Key)


const paymentGateway = (req, res) => {
  const {
    customer_Id,
    card_Name,
    card_ExpYear,
    card_ExpMonth,
    card_Number,
    card_CVC,
  } = req.body;

  stripe.customers.create({
    name: req.body.name,
    email: req.body.email,
  }
  ).then(async () => {
    const card_Token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
    });

    const card = await stripe.customers.createSource(customer_Id, {
      source: `${card_Token.id}`,
    });
  })
    .then((customer) => {

      return stripe.paymentIntents.create({
        amount: 5000,
        description: 'Web Development Product',
        currency: 'usd',
        customer: customer.id
      });
    })
    .then((charge) => {
      res.status(200).send({
        success: true,
        message: "Payment Success",
        data: charge
      })
    })
    .catch((err) => {
      res.status(500).send({
        success: false,
        message: err
      })
    });


}



module.exports = paymentGateway;


module.exports.addNewCard = async (req, res, next) => {
  const {
    customer_Id,
    card_Name,
    card_ExpYear,
    card_ExpMonth,
    card_Number,
    card_CVC,
  } = req.body;

  try {
    const card_Token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
    });

    const card = await stripe.customers.createSource(customer_Id, {
      source: `${card_Token.id}`,
    });

    return res.status(200).send({ card: card.id });
  } catch (error) {
    throw new Error(error);
  }
}

//checking payment api


app.post('/createNewCustomer', async (req, res) => {
  console.log('hiiiii')
  try {
    const name = req.body.name
    const email = req.body.email
    const card_Name = req.body.card_Name
    const card_Number = req.body.card_Number
    const card_ExpMonth = req.body.card_ExpMonth
    const card_ExpYear = req.body.card_ExpYear
    const card_CVC = req.body.card_CVC
    // console.log(name)
    // console.log(email)
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });
    console.log(customer.id, 'this is the customer')

    if (customer) {
      try {
        const card_Token = await stripe.tokens.create({
          card: {
            name: card_Name,
            number: card_Number,
            exp_month: card_ExpMonth,
            exp_year: card_ExpYear,
            cvc: card_CVC,
          },
        });
        //console.log(card_Token)

        //console.log(card_Token.id, 'this is the value of the card token')

        if (card_Token) {
          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: 5000,


              description: 'Web Development Product',
              currency: 'gbp',
              customer: customer.id,

            })
            res.status(200).send(paymentIntent)

          } catch (error) {
            res.status(500).send({ message: error.message })
          }

        }



      } catch (error) {
        res.status(500).send({ message: error.message })
      }

    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }

})


// module.exports.createNewCustomer = async (req, res, next) => {
//   try {
//     const customer = await stripe.customers.create({
//       name: req.body.name,
//       email: req.body.email,
//     });
//     res.status(200).send(customer);
//   } catch (error) {
//     throw new Error(error);
//   }
// }


// module.exports.createCharges = async (req, res, next) => {
//   try {
//     const createCharge = await stripe.paymentIntents.create({
//       amount: req.body.amount,
//       currency: 'usd',
//       description: 'Mobapps Solutions Private Limited',
//       payment_method_types: ['card'],
//     });
//     res.send(createCharge);
//   } catch (err) {
//     res.status(500).send({
//       success: false,
//       message: 'err',
//       data: err
//     })
//   }
// }





// paymentIntent = await stripe.paymentIntents.create({
//   payment_method: paymentMethod.id,
//   amount: 75 * 100, // USD*100
//   currency: 'inr',
//   confirm: true,
//   payment_method_types: ['card'],
// });

// res.send(paymentIntent);
// 		});