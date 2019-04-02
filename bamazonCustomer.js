var mysql = require("mysql");
var inquirer = require("inquirer");

// Set up connection with bamazon database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    displayInventory();
});

function start() {
    //Prompt user to: Select the ID of the product they would like to buy.
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What item would you like to buy? (select the item_id)",
                validation: function () {
                    var isValid = !_.isNaN(parseFloat(age));
                    return isValid || "You need to type a number!";
                }
            }
        ]).then(function (answer) {

            //mysql query to get info from database
            var query = "SELECT product_name, price, stock_quantity FROM products WHERE item_id = ?;"
            connection.query(
                query, answer.item, function (err, response) {
                    if (err) throw err;

                    console.table(response);
                    promptForPurchase(answer.item, response[0].stock_quantity);
                }
            )
        })
};

function promptForPurchase(id, stock_quantity) {
    inquirer.prompt([
        {
            name: "amount",
            type: "input",
            message: "How many would you like to buy?",
            validation: function () {
                var isValid = !_.isNaN(parseFloat(age));
                return isValid || "You need to type a number!";
            }
        }
    ]).then(function (answer) {

        //Check to see if the selected item is in stock
        console.log(stock_quantity);
        if (stock_quantity <= answer.amount) {
            console.log("Sorry, we don't have enough");
            displayInventory();
        }




        //Update database by removing the amount bought
        connection.query(

            "SELECT stock_quantity, price FROM products WHERE ?", { item_id: id }, function (err, response) {
                if (err) throw err;



                var totalAmount = response[0].stock_quantity;
                var unitPrice = response[0].price;

                console.log("Total: " + totalAmount);
                console.log("Price: " + unitPrice);


                var remainingAmount = totalAmount - answer.amount;
                console.log("remaining: " + remainingAmount);




                var query = "UPDATE products SET stock_quantity= ? WHERE item_id= ?;";
                var filter = [remainingAmount, id]
                console.log("remainingAmount: " + remainingAmount);
                console.log("id: " + id);

                connection.query(
                    query, filter, function (err, response) {
                        if (err) throw err;
                    }
                )

                //Display how much the purchase was for the user
                var totalCost = answer.amount * unitPrice;
                console.log("Your total is: " + totalCost);
                displayInventory();
            }
        )
    })
};

function displayInventory() {
    var query = "SELECT item_id, product_name, price FROM products;"

    // Show user shop's inventory: Include the ids, names, and prices of products for sale.
    connection.query(
        query, function (err, response) {
            if (err) throw err;
            console.table(response);
            start();
        }
    )
}



//Prompt user how much of the selected item they would like to buy