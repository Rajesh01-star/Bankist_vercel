const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const ejs = require("ejs");
const { pin } = require("nodemon/lib/version");
const https = require("https");
const { min } = require("lodash");

mongoose.connect(
  "mongodb+srv://Atharv-admin:amhustle01@cluster0.7sm6f.mongodb.net/Bank",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const BankSchema = new mongoose.Schema({
  owner: String,
  movements: [],
  interestRate: Number,
  pin: Number,
  ini: String,
  balance: Number,
  positive: Number,
  negative: Number,
});

const Bank = mongoose.model("Person", BankSchema);

const JS = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  ini: "js",
};

const JD = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  ini: "jd",
};

// Bank.insertMany([JS, JD], function (err) {
//   if (err) console.log(err);
//   else console.log(`Successfully added`);
// });

// Bank.find(function (err, response) {
//   if (err) console.log(err);
//   else {
//     response.forEach((each) => {
//       console.log(each.name);
//     });
//   }
// });

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/holder/:topic", function (req, res) {
  const curOwner = req.params.topic.slice(1);
  Bank.find({ ini: curOwner }, function (err, details) {
    if (err) console.log(`68 - ${err}`);
    else {
      // console.log(details);
      const total = details[0].movements.reduce((acc, mov) => acc + mov, 0);
      const plus = details[0].movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
      const minus = details[0].movements
        .filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
      Bank.updateMany(
        { ini: curOwner },
        { $set: { balance: total, positive: plus, negative: minus } },
        { multi: true, upsert: true },
        (err, doc) => {
          if (err) console.log(err);
        }
      );
    }
    res.render("holder", { Person: details });
  });
});

app.get("/signIn", (req, res) => {
  res.render("signIn");
});

app.post("/", function (req, res) {
  const Username = req.body.Username;
  const Pin = req.body.Psswd;
  const Balance = req.body.Balance;
  const transferTo = req.body.transferTo;
  const transferAmount = req.body.transferAmount;
  const hiddenInitials = req.body.hidden;
  const logout = req.body.logout;
  const loan = Math.floor(req.body.loan);
  const closeName = req.body.closeName;
  const closePassword = req.body.closePassword;
  const sort = req.body.sort;
  let holder = req.body.hiddenHolder;
  const signUp = req.body.createAcc;
  const openBank = req.body.openBank;
  const openDemo = req.body.openDemo;
  const logIn = req.body.logIn;

  if (transferTo && transferAmount && transferTo != hiddenInitials) {
    // to add a negative movement into the transferFrom account
    Bank.updateOne(
      { ini: hiddenInitials },
      {
        $push: {
          movements: { $each: [Number(-transferAmount)], $position: 0 },
        },
      },
      // { $push: { property: {$each: ['value'], $position: 0 } } }
      (err, doc) => {
        if (err) console.log(`102 - ${err}`);
      }
    );
    // to add a positive movement into the transferTo account
    Bank.updateOne(
      { ini: transferTo },
      {
        $push: { movements: { $each: [Number(transferAmount)], $position: 0 } },
      },
      (err, doc) => {
        if (err) console.log(`102 - ${err}`);
      }
    );

    res.redirect(`/holder/:${hiddenInitials}`);
  }

  if (logout) {
    console.log(logout);
    res.redirect("/");
  }

  if (loan) {
    Bank.find({ ini: hiddenInitials }, function (err, result) {
      if (
        result[0].movements.some((mov) => mov >= loan * result[0].interestRate)
      ) {
        Bank.updateOne(
          { ini: hiddenInitials },
          {
            $push: {
              movements: { $each: [Number(loan)], $position: 0 },
            },
          },
          (err, doc) => {
            if (err) console.log(err);
            console.log(`loan should be passed`);
            res.redirect(`/holder/:${hiddenInitials}`);
          }
        );
      } else {
        console.log(`Requested amount is too much for your credit`);
      }
    });
  }

  // close account
  if (closeName && closePassword) {
    if (closeName != hiddenInitials)
      console.log(`Sorry you can not remove any other user beside yourself`);
    else {
      Bank.find({ ini: closeName, pin: closePassword }, (err, foundUser) => {
        if (err) console.log(err);
        if (foundUser.length == 0) {
          console.log(`Information mismatched`);
        } else {
          Bank.remove({ ini: closeName }, (err, doc) => {
            if (err) console.log(err);
            else
              console.log(
                `The user has been successfully removed from the list`
              );
            res.redirect("/");
          });
        }
      });
    }
  }

  if (sort) {
    console.log(`sorting feature is yet to be added`);
  }

  if (openBank) {
    res.redirect("/signIn");
  }

  if (openDemo) {
    res.redirect(`/holder/:ak`);
  }

  if (signUp) {
    console.log(`Username = ${Username} , Pin = ${Pin} , Balance = ${Balance}`);
    let Initials = Username.toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
    console.log(Initials);
    const newUser = {
      owner: Username,
      movements: [Balance],
      interestRate: 1.5,
      pin: Pin,
      ini: Initials,
    };
    Bank.create(newUser, function (err, result) {
      if (err) console.log(err);
      else {
        console.log(`Congrats the newUser has been added to the database`);
      }
    });
    console.log(openDemo);
    res.redirect(`/holder/:${Initials}`);
  }

  if (logIn) {
    let Initials = Username.toLowerCase();
    Bank.find({ ini: Initials }, (err, result) => {
      if (err) console.log(err);
      else {
        res.redirect(`/holder/:${Initials}`);
      }
    });
    //   Bank.find(function (err, details) {
    //     if (err) console.log(err);
    //     details.forEach((each) => {
    //       // to check if the details match with the database
    //       if (each.ini == Initials && each.pin == Pin) {
    //         res.redirect(`/holder/:${Initials}`);
    //       }
    //     });
    //   });
    //
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server based Bank is now online successfully");
});
