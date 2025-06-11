const productContainer = document.querySelector(".product-list");
const isProductDetailPage = document.querySelector(".product-detail");
const isCartPage = document.querySelector(".cart");


if (productContainer) {
  displayProductList(products);
}
if (isProductDetailPage) {
  displayProductDetail();
}
if (isCartPage) {
  displayCart();
}


function displayProductList(productsToDisplay) {
  productContainer.innerHTML = "";

  if (!productsToDisplay || productsToDisplay.length === 0) {
    productContainer.innerHTML = "<p>Ürün bulunamadı.</p>";
    return;
  }

  productsToDisplay.forEach(item => {
    const mainImg = item.colors?.[0]?.mainImage || "";

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
      <div class="img-box">
        <img src="${mainImg}" alt="${item.title}" />
      </div>
      <h2 class="title">${item.title}</h2>
      <span class="price">${item.price}</span>
      <button class="favorite-btn"><i class="ri-heart-line"></i></button>
    `;

    productContainer.appendChild(productCard);


    productCard.querySelector(".img-box").addEventListener("click", () => {
      sessionStorage.setItem("selectedproduct", JSON.stringify(item));
      window.location.href = "product-detail.html";
    });

  
    productCard.querySelector(".favorite-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToFavorites(item);
    });
  });
}


function displayProductDetail() {
  const productdata = JSON.parse(sessionStorage.getItem("selectedproduct"));
  if (!productdata) return;

  const titleEl = document.querySelector(".title");
  const priceEl = document.querySelector(".price");
  const descriptionEl = document.querySelector(".description");
  const mainImageContainer = document.querySelector(".main-img");
  const thumbnailContainer = document.querySelector(".thumbnail-list");
  const colorContainer = document.querySelector(".color-options");
  const sizeContainer = document.querySelector(".size-options");
  const addToCartBtn = document.querySelector("#add-cart-btn");

  let selectedColor = productdata.colors?.[0];
  let selectedSize = selectedColor?.sizes?.[0];

  function updateProductDisplay(colorData) {
    if (!colorData.sizes.includes(selectedSize)) {
      selectedSize = colorData.sizes[0];
    }

    mainImageContainer.innerHTML = `<img src="${colorData.mainImage}" alt="Main Image">`;
    thumbnailContainer.innerHTML = "";

    const thumbnails = [colorData.mainImage, ...(colorData.thumbnails || []).slice(0, 3)];
    thumbnails.forEach(th => {
      const img = document.createElement("img");
      img.src = th;
      img.alt = "Thumbnail";
      thumbnailContainer.appendChild(img);
      img.addEventListener("click", () => {
        mainImageContainer.innerHTML = `<img src="${th}" alt="Main Image">`;
      });
    });

    colorContainer.innerHTML = "";
    productdata.colors.forEach(color => {
      const img = document.createElement("img");
      img.src = color.mainImage;
      img.alt = color.name;
      if (color.name === colorData.name) img.classList.add("selected");
      colorContainer.appendChild(img);
      img.addEventListener("click", () => {
        selectedColor = color;
        updateProductDisplay(color);
      });
    });

    sizeContainer.innerHTML = "";
    colorData.sizes.forEach(size => {
      const btn = document.createElement("button");
      btn.textContent = size;
      if (size === selectedSize) btn.classList.add("selected");
      sizeContainer.appendChild(btn);
      btn.addEventListener("click", () => {
        document.querySelectorAll(".size-options button").forEach(el => el.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSize = size;
      });
    });
  }

  titleEl.textContent = productdata.title;
  priceEl.textContent = productdata.price;
  descriptionEl.textContent = productdata.description;

  updateProductDisplay(selectedColor);

  addToCartBtn.addEventListener("click", () => {
    addToCart(productdata, selectedColor, selectedSize);
    alert("Ürün sepete eklendi!");
  });
}


function addToCart(product, color, size) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const existingItem = cart.find(item => item.id === product.id && item.color === color.name && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: color.mainImage,
      color: color.name,
      size: size,
      quantity: 1
    });
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}


function addToFavorites(product) {
  let favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
  const exists = favorites.find(fav => fav.id === product.id);

  if (!exists) {
    favorites.push(product);
    sessionStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoriteBadge();
    alert("Favorilere eklendi!");
  } else {
    alert("Bu ürün zaten favorilerde.");
  }
}


function displayCart() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const cartContainer = document.querySelector(".cart-items");
  const subtotalEl = document.querySelector(".subtotal");
  const grandTotalEl = document.querySelector(".grand-total");

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Sepetiniz boş.</p>";
    subtotalEl.textContent = "$0.00";
    grandTotalEl.textContent = "$0.00";
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = parseFloat(item.price.replace("$", "")) * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <div class="product">
        <img src="${item.image}" alt="${item.title}">
        <div class="item-detail">
          <p>${item.title}</p>
          <div class="size-color-box">
            <span class="size">${item.size}</span>
            <span class="color">${item.color}</span>
          </div>
        </div>
      </div>
      <span class="price">${item.price}</span>
      <div class="quantity">
        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
      </div>
      <span class="total-price">$${itemTotal.toFixed(2)}</span>
      <button class="remove" data-index="${index}"><i class="ri-close-line"></i></button>
    `;
    cartContainer.appendChild(cartItem);
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  grandTotalEl.textContent = `$${subtotal.toFixed(2)}`;

  attachCartEvents();
}

function attachCartEvents() {
  
  document.querySelectorAll(".remove").forEach(button => {
    button.addEventListener("click", function () {
      let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
      const index = parseInt(this.getAttribute("data-index"));
      cart.splice(index, 1);
      sessionStorage.setItem("cart", JSON.stringify(cart));
      displayCart();
      updateCartBadge();
    });
  });

 
  document.querySelectorAll(".quantity-input").forEach(input => {
    input.addEventListener("change", function () {
      let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
      const index = parseInt(this.getAttribute("data-index"));
      const newQty = parseInt(this.value);
      if (newQty < 1) {
        this.value = cart[index].quantity; 
        return;
      }
      cart[index].quantity = newQty;
      sessionStorage.setItem("cart", JSON.stringify(cart));
      displayCart();
      updateCartBadge();
    });
  });
}


function updateCartBadge() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const badge = document.querySelector(".cart-item-count");

  if (badge) {
    badge.textContent = cartCount;
    badge.style.display = cartCount > 0 ? "block" : "none";
  }
}


function updateFavoriteBadge() {
  const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];
  const badge = document.querySelector(".favorite-item-count");

  if (badge) {
    badge.textContent = favorites.length;
    badge.style.display = favorites.length > 0 ? "block" : "none";
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".favorite-list");
  if (!container) return;

  const favorites = JSON.parse(sessionStorage.getItem("favorites")) || [];

  container.innerHTML = "";

  if (favorites.length === 0) {
    container.innerHTML = "<p>Henüz favori ürününüz yok.</p>";
    return;
  }

  favorites.forEach(product => {
    const item = document.createElement("div");
    item.classList.add("cart-item");
    const mainImg = product.colors?.[0]?.mainImage || "images/product1_green_1.jpg";

    item.innerHTML = `
      <div class="product">
        <img src="${mainImg}" alt="${product.title}">
        <div class="item-detail">
          <p>${product.title}</p>
        </div>
      </div>
      <span class="price">${product.price}</span>
      <button class="remove-fav" data-id="${product.id}"><i class="ri-close-line"></i></button>
    `;

    container.appendChild(item);
  });

  document.querySelectorAll(".remove-fav").forEach(button => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      let fav = JSON.parse(sessionStorage.getItem("favorites")) || [];
      fav = fav.filter(p => p.id != id);
      sessionStorage.setItem("favorites", JSON.stringify(fav));
      location.reload();
    });
  });
});


function searchProducts() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchInput)
  );

  displayProductList(filteredProducts);
}

if (document.getElementById("searchInput")) {
  document.getElementById("searchInput").addEventListener("input", searchProducts);
}


updateCartBadge();
updateFavoriteBadge();
