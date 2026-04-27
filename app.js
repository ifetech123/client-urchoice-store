
// Cart state
let cart = JSON.parse(localStorage.getItem('urchoice-cart')) || [];

// DOM elements
const cartBadge = document.getElementById('cartBadge');
const floatingCart = document.getElementById('floatingCart');
const checkoutBar = document.getElementById('checkoutBar');
const viewBagBtn = document.getElementById('viewBagBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsList = document.getElementById('cartItemsList');
const drawerTotal = document.getElementById('drawerTotal');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutItems = document.getElementById('checkoutItems');
const locationInput = document.getElementById('locationInput');
const completeOrderBtn = document.getElementById('completeOrderBtn');
const orderNowBtn = document.getElementById('orderNowBtn');
const categoryTabs = document.querySelectorAll('.category-tab');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    updateUI();
    
    // Event listeners
    floatingCart.addEventListener('click', toggleCart);
    viewBagBtn.addEventListener('click', toggleCart);
    completeOrderBtn.addEventListener('click', sendToWhatsApp);
    orderNowBtn.addEventListener('click', () => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }));
    
    // Category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => switchCategory(e.target.dataset.category || e.target.textContent));
    });
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: Date.now(), name, price, quantity: 1 });
    }
    saveCart();
    renderCart();
    updateUI();
    
    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Added! ✓';
    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1000);
}

function increaseQty(id) {
    const item = cart.find(item => item.id === parseInt(id));
    if (item) {
        item.quantity += 1;
        saveCart();
        renderCart();
        updateUI();
    }
}

function decreaseQty(id) {
    const item = cart.find(item => item.id === parseInt(id));
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== parseInt(id));
        }
        saveCart();
        renderCart();
        updateUI();
    }
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== parseInt(id));
    saveCart();
    renderCart();
    updateUI();
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function renderCart() {
    cartItemsList.innerHTML = cart.length ? 
        cart.map(item => `
            <div class="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                <div class="flex items-center space-x-4 flex-1">
                    <div class="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                        🍪
                    </div>
                    <div>
                        <h4 class="font-semibold text-lg text-gray-900">${item.name}</h4>
                        <div class="text-2xl font-bold text-orange-500">₦${(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                </div>
                <div class="flex items-center space-x-3 ml-6">
                    <button onclick="decreaseQty(${item.id})" class="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center text-xl hover:bg-gray-100 transition-all duration-200">-</button>
                    <span class="text-2xl font-bold text-gray-900 min-w-[2rem] text-center">${item.quantity}</span>
                    <button onclick="increaseQty(${item.id})" class="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center text-xl hover:bg-gray-100 transition-all duration-200">+</button>
                    <button onclick="removeItem(${item.id})" class="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-200 transition-all duration-200">✕</button>
                </div>
            </div>
        `).join('') : 
        '<div class="text-center py-20"><div class="text-6xl mb-4">🛍️</div><p class="text-xl text-gray-500 font-semibold">Your bag is empty</p></div>';
    
    drawerTotal.textContent = `₦${calculateTotal().toLocaleString()}`;
}

function updateUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = calculateTotal();
    
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    
    checkoutTotal.textContent = `₦${totalPrice.toLocaleString()}`;
    checkoutItems.textContent = totalItems ? `${totalItems} items` : 'No items';
    
    checkoutBar.classList.toggle('hidden', totalItems === 0);
    floatingCart.style.display = totalItems > 0 ? 'flex' : 'flex';
}

function toggleCart() {
    cartDrawer.classList.toggle('hidden');
    if (!cartDrawer.classList.contains('hidden')) {
        cartDrawer.querySelector('.absolute').classList.remove('translate-y-full');
        renderCart();
        locationInput.value = localStorage.getItem('urchoice-location') || '';
    }
}

function closeCart() {
    cartDrawer.querySelector('.absolute').classList.add('translate-y-full');
    setTimeout(() => cartDrawer.classList.add('hidden'), 500);
}

function switchCategory(category) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.menu-category').forEach(cat => cat.classList.add('hidden'));
    document.getElementById(`${category.toLowerCase()}-products`).classList.remove('hidden');
}

function sendToWhatsApp() {
    const total = calculateTotal();
    if (total === 0) return;
    
    const location = locationInput.value || 'Not specified';
    localStorage.setItem('urchoice-location', location);
    
    let message = `Urchoice Store Order:\n\nItems:\n`;
    cart.forEach(item => {
        message += `${item.name} x${item.quantity} (₦${item.price.toLocaleString()} each)\n`;
    });
    message += `\nTotal: ₦${total.toLocaleString()}\n\nCustomer Location: ${location}`;
    
    const phoneNumber = '2347064402934';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
    closeCart();
}

function saveCart() {
    localStorage.setItem('urchoice-cart', JSON.stringify(cart));
}

// Close drawer on outside click
document.addEventListener('click', (e) => {
    if (e.target === cartDrawer) closeCart();
});
