const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://vidyasagar2612:Avw2U7DAHn8VyjqP@vs.lpf0lc8.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function () {
  // console.log("Connected to MongoDB");
});


const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Default items inserted successfully");
          })
          .catch((err) => {
            console.error("Error inserting default items:", err);
          });
      }
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundList) => {
      // console.log("Result :", foundList);
      if (foundList === null) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then((removedItem) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then((docs) => {
        res.redirect("/" + listName);
    })
    
  }

  
});
app.post("/work", function (req, res) {
  let item = req.body.newItems;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
