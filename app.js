// Shoe constructor
function Shoe(id, brand, model, size, style, condition, availability, imageUrl) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.size = size;
    this.style = style;
    this.condition = condition;
    this.availability = availability;
    this.imageUrl = imageUrl;
    this.borrowHistory = [];
}

// ShoeSphere app
const ShoeSphere = {
    shoes: [],

    init: function() {
        this.fetchShoes();
        this.bindEvents();
        this.handleNavigation();
        this.updateProfileStats();
    },

    bindEvents: function() {
        document.getElementById('addShoeForm').addEventListener('submit', this.addShoe.bind(this));
        document.getElementById('searchBar').addEventListener('input', this.searchShoes.bind(this));
    },

    handleNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('main > section');

        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                sections.forEach(section => {
                    section.style.display = section.id === targetId ? 'block' : 'none';
                });
            });
        });
    },

    fetchShoes: function() {
        fetch('http://localhost:3000/shoes')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                if (Array.isArray(data)) {
                    this.shoes = data.map(shoe => new Shoe(
                        shoe.id, 
                        shoe.brand, 
                        shoe.model, 
                        shoe.size, 
                        shoe.style, 
                        shoe.condition, 
                        shoe.availability, 
                        shoe.imageUrl
                    ));
                    this.renderShoes();
                    this.updateProfileStats();
                } else {
                    console.error('Fetched data is not an array:', data);
                }
            })
            .catch(error => console.error('Error fetching shoes:', error));
    },

    renderShoes: function() {
        const shoeGrid = document.querySelector('.shoe-grid');
        shoeGrid.innerHTML = '';
        this.shoes.forEach(shoe => {
            const shoeElement = document.createElement('div');
            shoeElement.className = 'shoe-item';
            shoeElement.innerHTML = `
                <img src="${this.getImagePath(shoe.imageUrl)}" alt="${shoe.brand} ${shoe.model}">
                <h3>${shoe.brand} ${shoe.model}</h3>
                <p>Size: ${shoe.size}</p>
                <p>Style: ${shoe.style}</p>
                <p>Condition: ${shoe.condition}</p>
                <p>Availability: ${shoe.availability ? 'Available' : 'Not Available'}</p>
                <button onclick="ShoeSphere.viewShoeDetails(${shoe.id})">View Details</button>
            `;
            shoeGrid.appendChild(shoeElement);
        });
    },

    addShoe: function(event) {
        event.preventDefault();
        const form = event.target;
        const newShoe = new Shoe(
            Date.now(), // Temporary ID
            form.brand.value,
            form.model.value,
            form.size.value,
            form.style.value,
            form.condition.value,
            true,
            form.imageUrl.value
        );

        fetch('http://localhost:3000/shoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newShoe),
        })
        .then(response => response.json())
        .then(data => {
            this.shoes.push(new Shoe(
                data.id,
                data.brand,
                data.model,
                data.size,
                data.style,
                data.condition,
                data.availability,
                data.imageUrl
            ));
            this.renderShoes();
            this.updateProfileStats();
            form.reset();
        })
        .catch(error => console.error('Error adding shoe:', error));
    },

    viewShoeDetails: function(id) {
        const shoe = this.shoes.find(s => s.id === id);
        if (shoe) {
            alert(`
                Brand: ${shoe.brand}
                Model: ${shoe.model}
                Size: ${shoe.size}
                Style: ${shoe.style}
                Condition: ${shoe.condition}
                Availability: ${shoe.availability ? 'Available' : 'Not Available'}
            `);
        }
    },

    searchShoes: function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredShoes = this.shoes.filter(shoe => 
            shoe.brand.toLowerCase().includes(searchTerm) ||
            shoe.model.toLowerCase().includes(searchTerm) ||
            shoe.style.toLowerCase().includes(searchTerm) ||
            shoe.size.toString().includes(searchTerm)
        );
        this.renderFilteredShoes(filteredShoes);
    },

    renderFilteredShoes: function(filteredShoes) {
        const shoeGrid = document.querySelector('.shoe-grid');
        shoeGrid.innerHTML = '';
        filteredShoes.forEach(shoe => {
            const shoeElement = document.createElement('div');
            shoeElement.className = 'shoe-item';
            shoeElement.innerHTML = `
                <img src="${this.getImagePath(shoe.imageUrl)}" alt="${shoe.brand} ${shoe.model}">
                <h3>${shoe.brand} ${shoe.model}</h3>
                <p>Size: ${shoe.size}</p>
                <p>Style: ${shoe.style}</p>
                <p>Condition: ${shoe.condition}</p>
                <p>Availability: ${shoe.availability ? 'Available' : 'Not Available'}</p>
                <button onclick="ShoeSphere.viewShoeDetails(${shoe.id})">View Details</button>
            `;
            shoeGrid.appendChild(shoeElement);
        });
    },

    getImagePath: function(imagePath) {
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        return window.location.origin + '/' + imagePath;
    },

    updateProfileStats: function() {
        const shoeCount = this.shoes.length;
        const totalBorrows = this.shoes.reduce((total, shoe) => total + shoe.borrowHistory.length, 0);

        document.getElementById('shoeCount').textContent = shoeCount;
        document.getElementById('totalBorrows').textContent = totalBorrows;
    }
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => ShoeSphere.init());