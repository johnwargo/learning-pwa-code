// @ts-check

// https://flaviocopes.com/how-to-format-number-as-currency-javascript/
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})

function updateTipAmounts() {
    // grab the meal cost from the page
    let mealCost = document.getElementById("mealCost").value;
    // populate the table with tip amounts
    document.getElementById('tip10').innerHTML = formatter.format(mealCost * 0.10);
    document.getElementById('tip15').innerHTML = formatter.format(mealCost * 0.15);
    document.getElementById('tip18').innerHTML = formatter.format(mealCost * 0.18);
    document.getElementById('tip20').innerHTML = formatter.format(mealCost * 0.20);
    document.getElementById('tip22').innerHTML = formatter.format(mealCost * 0.22);
}

// register the event listener for the input field
document.getElementById('mealCost').oninput = updateTipAmounts;
