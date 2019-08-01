//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
mongoose.connect("mongodb+srv://userId:<Password>@todolistcluster-uep2s.mongodb.net/todolistdb", {useNewUrlParser: true});


const listItemSchema = new mongoose.Schema({
    item_description: {
        type: String,
        required: [true, "description can't be empty"]
    }
});
const listSchema = new mongoose.Schema({
    name: String,
    items: [listItemSchema]
});

const listItem = new mongoose.model("items", listItemSchema);
const list = new mongoose.model("lists", listSchema);


app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.redirect("/Home");
});
app.get('/:customListName', function (req, res) {
    const listName = _.upperFirst(_.toLower(req.params.customListName));
    list.findOne({name: listName}, function (err, foundList) {

        if (!err) {
            if (!foundList) {
                let item1 = new listItem({
                    item_description: "Welcome to your todolist!"
                });
                let item2 = new listItem({
                    item_description: "Hit the + button to add a new item"
                });
                let item3 = new listItem({
                    item_description: "<-- Hit this checkbox to delete items"
                });
                let defaultItems = [item1, item2, item3];
                const defaultList = new list({
                    name: listName,
                    items: defaultItems
                });
                defaultList.save();
                res.redirect("/" + listName);

            } else {
                res.render("list", {listTitle: foundList.name, listItems: foundList.items});

            }
        }
    })

});
app.post("/", function (req, res) {
    let nextItem = req.body.nextItem;
    let listName = req.body.list;
    let newItem = new listItem({
        item_description: nextItem
    });
    list.findOne({name: listName}, function (err, foundList) {
        foundList.items.push(newItem);
        foundList.save();
    });
    res.redirect("/" + listName);
});
app.post("/delete", function (req, res) {
    var itemId = req.body.checkbox;
    let listTitle = req.body.listName;
    list.findOne({name: listTitle}, function (err, result) {
    });
    list.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemId}}}, {useFindAndModify: true}, function (err) {
        if (err) {
            console.log(err);
        } else {
        }
        res.redirect("/" + listTitle);
    });


});

app.get("/about", function (req, res) {

    res.render("about");

});


app.listen(process.env.PORT || 3000, function () {

    console.log('Server started on port 3000.');
});

