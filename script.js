document.addEventListener('DOMContentLoaded', function() {
    const productList = document.getElementById('productList');
    const barcodeModal = document.getElementById('barcodeModal');
    const barcodeContainer = document.getElementById('barcodeContainer');
    const favoritesModal = document.getElementById('favoritesModal');
    const modalFavoritesList = document.getElementById('modalFavoritesList');
    const favoritesSearchBox = document.getElementById('favoritesSearchBox');
    const clearAllButton = document.getElementById('clearAllButton');
    const selectToDeleteButton = document.getElementById('selectToDeleteButton');
    const showFavoritesButton = document.getElementById('showFavoritesButton');
    const closeFavoritesButton = document.getElementById('closeFavoritesButton');

    const defaultImage = "https://images.sftcdn.net/images/t_app-icon-s/p/0642cb1f-18e9-46e6-860c-3f9254debea6/2321330045/migros-sanal-market-logo";

    let products = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentFavorite = null;
    let selectingToDelete = false;

    // Fetch products from upcode.txt
    fetch('upcode.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            products = lines.map(line => {
                const [name, code, image] = line.split(' - ');
                return { name, code, image: image || defaultImage };
            }).filter(product => product.name && product.code);
            renderProducts(products);
        })
        .catch(error => console.error('Dosya yükleme hatası:', error));

    function renderProducts(products) {
        productList.innerHTML = '';
        products.sort((a, b) => a.name.localeCompare(b.name)).forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-code">Kasa Kodu: ${product.code}</div>
                </div>
                <div class="button-container">
                    <button class="button favorite-button" onclick="addToFavorites('${product.name}', '${product.code}', '${product.image}')">Favorilere Ekle</button>
                    <button class="button barcode-button" onclick="generateBarcode('${product.code}')">Barkoda Dönüştür</button>
                </div>
            `;
            productList.appendChild(li);
        });
    }

    window.addToFavorites = function(name, code, image) {
        const favorite = { name, code, image };
        if (!favorites.some(fav => fav.name === name)) {
            favorites.push(favorite);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }
    }

    function renderFavorites(searchTerm = '') {
        modalFavoritesList.innerHTML = '';
        favorites.filter(favorite => favorite.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .forEach(favorite => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${selectingToDelete ? '<input type="checkbox" class="select-checkbox">' : ''}
                    <img src="${favorite.image}" alt="${favorite.name}">
                    <div class="product-info">
                        <div class="product-name">${favorite.name}</div>
                        <div class="product-code">Kasa Kodu: ${favorite.code}</div>
                    </div>
                `;
                li.onclick = function() {
                    currentFavorite = favorite;
                    if (!selectingToDelete) {
                        showActionModal();
                    }
                };
                modalFavoritesList.appendChild(li);
            });
    }

    window.generateBarcode = function(code) {
        if (code.length === 7 && !isNaN(code)) {
            barcodeContainer.innerHTML = ''; // Clear previous barcode
            const svg = document.createElement('svg');
            JsBarcode(svg, code, {
                format: "CODE128",
                displayValue: true
            });
            barcodeContainer.appendChild(svg);
            showBarcodeModal();
        } else {
            alert("Geçerli bir 7 haneli kasa kodu değil!");
        }
    }

    function showBarcodeModal() {
        barcodeModal.style.display = 'flex';
        barcodeModal.style.animation = 'fadeIn 0.4s forwards';
    }

    window.closeBarcodeModal = function() {
        barcodeModal.style.animation = 'fadeOut 0.4s forwards';
        setTimeout(() => barcodeModal.style.display = 'none', 400);
    }

    showFavoritesButton.addEventListener('click', function() {
        renderFavorites();
        favoritesModal.style.display = 'flex';
        favoritesModal.style.animation = 'fadeIn 0.4s forwards';
    });

    closeFavoritesButton.addEventListener('click', function() {
        favoritesModal.style.animation = 'fadeOut 0.4s forwards';
        setTimeout(() => favoritesModal.style.display = 'none', 400);
    });

    favoritesSearchBox.addEventListener('input', function() {
        const searchTerm = favoritesSearchBox.value;
        renderFavorites(searchTerm);
    });

    clearAllButton.addEventListener('click', function() {
        if (confirm("Tüm favorileri silmek istediğinizden emin misiniz?")) {
            favorites = [];
            localStorage.removeItem('favorites');
            renderFavorites();
        }
    });

    selectToDeleteButton.addEventListener('click', function() {
        if (!selectingToDelete) {
            selectingToDelete = true;
            selectToDeleteButton.textContent = 'Seçilenleri Temizle';
        } else {
            const checkboxes = document.querySelectorAll('.select-checkbox');
            checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                    favorites.splice(index, 1);
                }
            });
            selectingToDelete = false;
            selectToDeleteButton.textContent = 'Seçip Temizle';
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        renderFavorites();
    });

    renderFavorites();
});