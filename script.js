let ruleCounter = 0;

function addDiscountRule() {
    const rulesContainer = document.getElementById('discountRules');
    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'discount-rule';
    ruleDiv.innerHTML = `
        <button class="remove-rule" onclick="removeRule(this)">×</button>
        <div class="input-group">
            <label>Buy This Quantity:</label>
            <input type="number" id="qty${ruleCounter}" min="1" class="small-input" placeholder="Enter quantity">
        </div>
        <div class="input-group">
            <label>Get Discount %:</label>
            <input type="number" id="discount${ruleCounter}" min="0" max="100" class="small-input" placeholder="Enter discount">
        </div>
    `;
    rulesContainer.appendChild(ruleDiv);
    ruleCounter++;

    // Add validation to new inputs
    const inputs = ruleDiv.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function(e) {
            if (e.target.id.startsWith('qty')) {
                validateNumericInput(e.target, 1, 999999);
            } else if (e.target.id.startsWith('discount')) {
                validateNumericInput(e.target, 0, 100);
            }
        });
    });
}

function removeRule(button) {
    const ruleDiv = button.parentElement;
    ruleDiv.remove();
}

function calculateDiscount() {
    // Get input values
    const price = parseFloat(document.getElementById('price').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const discountQty = parseInt(document.getElementById('discountQty').value) || 0;
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;

    // Calculate original total
    const originalTotal = price * quantity;

    // Calculate discount amount and final price
    let discountAmount = 0;
    let finalPrice = originalTotal;

    // Check if quantity is greater than or equal to the discount rule
    if (quantity >= discountQty && discountQty > 0) {
        // Calculate number of complete groups
        const completeGroups = Math.floor(quantity / discountQty);
        // Calculate remaining items
        const remainingItems = quantity % discountQty;
        
        // Calculate discount for complete groups
        const groupDiscount = (price * discountQty * discountPercent) / 100;
        discountAmount = groupDiscount * completeGroups;
        
        // Calculate final price
        finalPrice = originalTotal - discountAmount;
    }

    // Update the results
    document.getElementById('originalTotal').textContent = formatCurrency(originalTotal);
    document.getElementById('discountAmount').textContent = formatCurrency(discountAmount);
    document.getElementById('finalPrice').textContent = formatCurrency(finalPrice);

    // Show which discount rule was applied (if any)
    const discountInfo = document.getElementById('discountInfo');
    if (quantity >= discountQty && discountQty > 0) {
        const completeGroups = Math.floor(quantity / discountQty);
        const remainingItems = quantity % discountQty;
        if (remainingItems > 0) {
            discountInfo.textContent = `已應用折扣：${completeGroups} 組完整折扣（每組 ${discountQty} 件商品獲得 ${discountPercent}% 折扣），剩餘 ${remainingItems} 件未達折扣標準`;
        } else {
            discountInfo.textContent = `已應用折扣：${completeGroups} 組完整折扣（每組 ${discountQty} 件商品獲得 ${discountPercent}% 折扣）`;
        }
        discountInfo.style.color = '#4CAF50';
    } else {
        discountInfo.textContent = '未應用折扣 - 數量未達折扣標準';
        discountInfo.style.color = '#666';
    }

    // Update seller's view if cost price is set
    if (document.getElementById('costPrice').value) {
        calculateSellerProfit();
    }
}

function calculateSellerProfit() {
    // Get input values
    const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const minProfit = parseFloat(document.getElementById('minProfit').value) || 20;
    const sellingPrice = parseFloat(document.getElementById('price').value) || 0;
    const discountQty = parseInt(document.getElementById('discountQty').value) || 0;
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;

    // Calculate costs and revenue
    const totalCost = costPrice * quantity;
    let totalRevenue = sellingPrice * quantity;

    // Apply discount if quantity matches
    if (quantity === discountQty && discountQty > 0) {
        const discountAmount = (totalRevenue * discountPercent) / 100;
        totalRevenue -= discountAmount;
    }

    // Calculate profit
    const profitAmount = totalRevenue - totalCost;
    const profitMargin = (profitAmount / totalCost) * 100;

    // Update the results
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('profitAmount').textContent = formatCurrency(profitAmount);
    document.getElementById('profitMargin').textContent = profitMargin.toFixed(2) + '%';

    // Show profit status
    const profitInfo = document.getElementById('profitInfo');
    if (profitMargin >= minProfit) {
        profitInfo.textContent = `利潤率良好 (${profitMargin.toFixed(2)}% ≥ ${minProfit}%)`;
        profitInfo.className = 'profit-info success';
    } else {
        profitInfo.textContent = `警告：利潤率 (${profitMargin.toFixed(2)}%) 低於最低要求 (${minProfit}%)`;
        profitInfo.className = 'profit-info warning';
    }
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// Add input validation for all numeric inputs
function validateNumericInput(input, min, max) {
    const value = parseFloat(input.value);
    if (value < min) input.value = min;
    if (value > max) input.value = max;
}

// Add event listeners for all numeric inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function(e) {
        if (e.target.id === 'discountQty') {
            validateNumericInput(e.target, 1, 999999);
        } else if (e.target.id === 'discountPercent') {
            validateNumericInput(e.target, 0, 100);
        } else if (e.target.id === 'price' || e.target.id === 'costPrice') {
            validateNumericInput(e.target, 0, 999999);
        } else if (e.target.id === 'quantity') {
            validateNumericInput(e.target, 1, 999999);
        } else if (e.target.id === 'minProfit') {
            validateNumericInput(e.target, 20, 100);
        }
    });
});

// Add initial discount rule when page loads
window.onload = function() {
    addDiscountRule();
}; 