let client = {
    table: "",
    hour: "",
    order: []
}

const categories = {
    1: "Food",
    2: "Drink",
    3: "Dessert"
}

const btnSaveClient = document.querySelector("#save-client");
btnSaveClient.addEventListener("click", saveClient);

function saveClient() {
    const table = document.querySelector("#table").value;
    const hour = document.querySelector("#hour").value;

    const files = [ table, hour ].some( file => file === "");

    const alertIsHere = document.querySelector(".invalid-feedback");

    if(files){
        if(!alertIsHere) {      
            const alert = document.createElement("div");
            alert.classList.add("invalid-feedback", "d-block", "text-center");
            alert.textContent = "All files are required"
            document.querySelector(".modal-body form").append(alert);

            setTimeout(() =>  {
                alert.remove();
            }, 3000)
        }
        return;
    } 

    client = { ...client, table, hour };

    //Close modal
    const modalForm = document.querySelector("#formModal");
    const modalBootsrap = bootstrap.Modal.getInstance(modalForm);
    modalBootsrap.hide();

    // Show sections
    showSections();

    //Get Api Json-Server
    getApi();

}

function showSections() {
    const hideSections = document.querySelectorAll(".d-none");
    hideSections.forEach( section => section.classList.remove("d-none"));
}

function getApi() {
    const url = "http://localhost:4000/menu";

    fetch(url)
        .then( response => response.json() )
        .then( result => showApiResult(result) )
        .catch( error => console.log(error) )
}

function showApiResult (allMenu) {
    const content = document.querySelector("#menu .content");

    allMenu.map( menu => {

        const row = document.createElement("div");
        row.classList.add("row", "py-3", "border-top");

        const name = document.createElement("div");
        name.classList.add("col-md-4");
        name.textContent = menu.name;

        const price = document.createElement("div");
        price.classList.add("col-md-3", "fw-bold");
        price.textContent = `$${menu.price}`;

        const category = document.createElement("div");
        category.classList.add("col-md-3");
        category.textContent = categories[menu.category];

        const inputQuantity = document.createElement("input");
        inputQuantity.type = "number";
        inputQuantity.value = 0;
        inputQuantity.min = 0;
        inputQuantity.max = 10;
        inputQuantity.id = `product-${menu.id}`;
        inputQuantity.classList.add("form-control");

        //function read the input value
        inputQuantity.onchange = (() => {
            const quantity = parseInt(inputQuantity.value);
            makeMenu({...menu, quantity});
        });

        const addInput = document.createElement("div");
        addInput.classList.add("col-md-2");
        addInput.appendChild(inputQuantity);

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(category);
        row.appendChild(addInput);

        content.appendChild(row);

    })

}

function makeMenu(porducts) {
    let { order } = client;

    // Check the quantity 
    if( porducts.quantity > 0 ) {
        if( order.some( article => article.id === porducts.id ) ){
            const actualOrder = order.map( article => {
                if(article.id === porducts.id) {
                    article.quantity = porducts.quantity;
                }
                return article;
            } );
            client.order = [...actualOrder];

        } else {
            client.order = [...order, porducts];
        }  

    } else {
        //Delete elements quantity 0
        const result = order.filter( article => article.id !== porducts.id )
        client.order = [...result];
    }

    //Clean html 
    cleanHTML();

    if(client.order.length) {
        updateOrder();
    } else {
        msgNoOrder();
    }
    
}

function updateOrder() {
    const contentSummary = document.querySelector("#summary .content");

    const summary = document.createElement("div");
    summary.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    //Table order
    const table = document.createElement("p");
    table.textContent = "Table: ";
    table.classList.add("fw-bold");

    const tableSpan = document.createElement("span");
    tableSpan.textContent = client.table;
    tableSpan.classList.add("fw-normal");
    table.appendChild(tableSpan);

    // hour order
    const hour = document.createElement("p");
    hour.textContent = "Hour: ";
    hour.classList.add("fw-bold");

    const hourSpan = document.createElement("span");
    hourSpan.textContent = client.hour;
    hourSpan.classList.add("fw-normal");
    hour.appendChild(hourSpan);

    //Section title
    const heading = document.createElement("h3");
    heading.textContent = "Menu Ordered";
    heading.classList.add("my-4", "text-center");

    //mapping the order
    const group = document.createElement("ul");
    group.classList.add("list-group");

    const { order } = client;
    order.forEach( article => {
        const { name, quantity, price, id } = article

        const list = document.createElement("li");
        list.classList.add("list-group-item");

        const nameEl = document.createElement("h4");
        nameEl.classList.add("my-4");
        nameEl.textContent = name;

        //Quanty
        const quantityEl = document.createElement("p");
        quantityEl.classList.add("fw-bold");
        quantityEl.textContent = "Quantity: "

        const quantityValue = document.createElement("span");
        quantityValue.classList.add("fw-normal");
        quantityValue.textContent = quantity;

        //Price
        const priceEl = document.createElement("p");
        priceEl.classList.add("fw-bold");
        priceEl.textContent = "Price: "

        const priceValue = document.createElement("span");
        priceValue.classList.add("fw-normal");
        priceValue.textContent = `$${price}`;

        //Subtotal
        const subTotalEl = document.createElement("p");
        subTotalEl.classList.add("fw-bold");
        subTotalEl.textContent = "Subtotal: "

        const subTotalValue = document.createElement("span");
        subTotalValue.classList.add("fw-normal");
        subTotalValue.textContent = calcSubTotal(price, quantity);

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn", "btn-danger");
        btnDelete.textContent = "Delete";
    
        //Funtion to delete a product to the order
        btnDelete.onclick = (() => { deleteProduct(id) } )

        quantityEl.appendChild(quantityValue);
        priceEl.appendChild(priceValue);
        subTotalEl.appendChild(subTotalValue);

        list.appendChild(nameEl);
        list.appendChild(quantityEl);
        list.appendChild(priceEl);
        list.appendChild(subTotalEl);
        list.appendChild(btnDelete);

        group.appendChild(list);

    })

    summary.appendChild(heading);
    summary.appendChild(table);
    summary.appendChild(hour);
    summary.appendChild(group);

    contentSummary.appendChild(summary);

    //Show form reward
    formReward();

}

function cleanHTML() {
    const content = document.querySelector("#summary .content");
    while( content.firstChild ) {
        content.removeChild( content.firstChild );
    }
}

function calcSubTotal(price, quantity) {
    return `$${price * quantity}`
}

function deleteProduct(id) {
    const { order } = client;
    const result = order.filter( article => article.id !== id )
    client.order = [...result];

    cleanHTML();

    if(client.order.length) {
        updateOrder();
    } else {
        msgNoOrder();
    }

    //Return the 0 value to the input
    const productDeleted = `#product-${id}`
    const inputDeleted = document.querySelector(productDeleted);
    inputDeleted.value = 0;

}

function msgNoOrder() {
    const content = document.querySelector("#summary .content");

    const text = document.createElement("p");
    text.classList.add("text-center");
    text.textContent = "Add the elements of the order";

    content.appendChild(text);
}

function formReward() {
    const content = document.querySelector("#summary .content");

    const form = document.createElement("div");
    form.classList.add("col-md-6", "form");

    const divForm = document.createElement("div");
    divForm.classList.add( 'card', 'py-2', 'px-3', 'shadow' );

    const heading = document.createElement("h3");
    heading.classList.add("my-4", "text-center");
    heading.textContent = "Reward";

    //Radio Button 10%
    const radio10 = document.createElement("input");
    radio10.type = "radio";
    radio10.name = "reward"
    radio10.value = "10";
    radio10.classList.add("form-check-input");
    radio10.onclick = calcReward;

    const radio10Label = document.createElement("label");
    radio10Label.textContent = "10 %";
    radio10Label.classList.add("form-check-label");

    const radio10Div = document.createElement("div");
    radio10Div.classList.add("form-check");

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);


    //Radio Button 25%
    const radio25 = document.createElement("input");
    radio25.type = "radio";
    radio25.name = "reward"
    radio25.value = "25";
    radio25.classList.add("form-check-input");
    radio25.onclick = calcReward;

    const radio25Label = document.createElement("label");
    radio25Label.textContent = "25 %";
    radio25Label.classList.add("form-check-label");

    const radio25Div = document.createElement("div");
    radio25Div.classList.add("form-check");

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);


    //Radio Button 50%
    const radio50 = document.createElement("input");
    radio50.type = "radio";
    radio50.name = "reward"
    radio50.value = "50";
    radio25.classList.add("form-check-input");
    radio50.onclick = calcReward;

    const radio50Label = document.createElement("label");
    radio50Label.textContent = " 50 %";
    radio50Label.classList.add("form-check-label");

    const radio50Div = document.createElement("div");
    radio50Div.classList.add("form-check");

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    divForm.appendChild(heading);
    divForm.appendChild(radio10Div);
    divForm.appendChild(radio25Div);
    divForm.appendChild(radio50Div);

    form.appendChild(divForm);

    content.appendChild(form);

}

function calcReward() {
    const { order } = client;
    let Subtotal = 0;
    
    order.forEach( article => {
        Subtotal += article.quantity * article.price;
    })

    const rewardSelected = document.querySelector( '[name="reward"]:checked' ).value;

    const rewardFinal = ((Subtotal * parseInt(rewardSelected)) / 100);
    
    const finalPrice = rewardFinal + Subtotal;
    
    showTotalHTML(Subtotal, finalPrice, rewardFinal);

}

function showTotalHTML(Subtotal, finalPrice, rewardFinal) {
    
    const divResults = document.createElement("div");
    divResults.classList.add("total-pay");

    //Subtotal
    const subTotalTitle = document.createElement("p");
    subTotalTitle.classList.add("fs-3", "fw-bold", "mt-2");
    subTotalTitle.textContent = "Subtotal: "

    const subTotalSpan = document.createElement("span");
    subTotalSpan.classList.add("fw-normal");
    subTotalSpan.textContent = `$${Subtotal}`

    subTotalTitle.appendChild(subTotalSpan);

    //Reward
    const rewardTitle = document.createElement("p");
    rewardTitle.classList.add("fs-3", "fw-bold", "mt-2");
    rewardTitle.textContent = "Reward: "

    const rewardSpan = document.createElement("span");
    rewardSpan.classList.add("fw-normal");
    rewardSpan.textContent = `$${rewardFinal}`
    
    rewardTitle.appendChild(rewardSpan);

    //Final price
    const finalPriceTitle = document.createElement("p");
    finalPriceTitle.classList.add("fs-3", "fw-bold", "mt-2");
    finalPriceTitle.textContent = "Reward: ";

    const finalPriceSpan = document.createElement("span");
    finalPriceSpan.classList.add("fw-normal");
    finalPriceSpan.textContent = `$${finalPrice}`

    finalPriceTitle.appendChild(finalPriceSpan);

    //Clean HTML
    const totalPayDiv = document.querySelector(".total-pay");
    if( totalPayDiv ) {
        totalPayDiv.remove();
    }

    divResults.appendChild(subTotalTitle);
    divResults.appendChild(rewardTitle);
    divResults.appendChild(finalPriceTitle);

    const form = document.querySelector(".form > div");
    form.appendChild(divResults);

}