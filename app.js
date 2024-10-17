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
        this.handleGetStarted();
        this.updateProfileStats();
    },

    bindEvents: function() {
        console.log('Binding events...');
        const addShoeForm = document.getElementById('addShoeForm');
        if (addShoeForm) {
            console.log('Add Shoe form found, adding event listener');
            addShoeForm.addEventListener('submit', this.addShoe.bind(this));
        } else {
            console.error('Add Shoe form not found');
        }
        
        const searchBar = document.getElementById('searchBar');
        if (searchBar) {
            console.log('Search bar found, adding event listener');
            searchBar.addEventListener('input', this.searchShoes.bind(this));
        } else {
            console.error('Search bar not found');
        }

        const updateShoeForm = document.getElementById('updateShoeForm');
        if (updateShoeForm) {
            console.log('Update Shoe form found, adding event listener');
            updateShoeForm.addEventListener('submit', this.updateShoe.bind(this));
        } else {
            console.error('Update Shoe form not found');
        }

        const closeModalBtn = document.querySelector('.close');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('updateShoeModal').style.display = 'none';
            });
        }
    },

    handleNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('main > section');

        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                
                if (targetId === 'home') {
                    sections.forEach(section => {
                        section.style.display = 'block';
                    });
                } else {
                    sections.forEach(section => {
                        section.style.display = section.id === targetId ? 'block' : 'none';
                    });
                }
            });
        });
    },

    handleGetStarted: function() {
        const getStartedBtn = document.getElementById('getStartedBtn');
        const shoesSection = document.getElementById('my-shoes');

        getStartedBtn.addEventListener('click', function() {
            document.querySelectorAll('main > section').forEach(section => {
                section.style.display = 'block';
            });
            shoesSection.scrollIntoView({ behavior: 'smooth' });
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

    getImagePath: function(imagePath) {
        if (!imagePath) {
            return 'path/to/default-placeholder.jpg'; // Replace with an actual placeholder image path
        }
        // Check if the imagePath is already a valid URL
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath; // Return full URLs as-is
        }
        return window.location.origin + '/' + imagePath.replace(/^\//, '');
    },

    renderShoes: function() {
        const shoeGrid = document.querySelector('.shoe-grid');
        shoeGrid.innerHTML = '';
        this.shoes.forEach(shoe => {
            const shoeElement = document.createElement('div');
            shoeElement.className = 'shoe-item';
            shoeElement.innerHTML = `
                <img src="${this.getImagePath(shoe.imageUrl)}" 
                     alt="${shoe.brand} ${shoe.model}" 
                     onerror="this.onerror=null; this.src='path/to/default-placeholder.jpg';">
                <h3>${shoe.brand} ${shoe.model}</h3>
                <p>Size: ${shoe.size}</p>
                <p>Style: ${shoe.style}</p>
                <p>Condition: ${shoe.condition}</p>
                <p>Availability: ${shoe.availability ? 'Available' : 'Not Available'}</p>
                <button onclick="ShoeSphere.viewShoeDetails(${shoe.id})">View Details</button>
                <button onclick="ShoeSphere.openUpdateShoeModal(${shoe.id})">Update</button>
                <button onclick="ShoeSphere.deleteShoe(${shoe.id})">Delete</button>
            `;
            shoeGrid.appendChild(shoeElement);
        });
    },

    addShoe: function(event) {
        console.log('Add Shoe function called');
        event.preventDefault();
        const form = event.target;
        console.log('Form data:', {
            brand: form.brand.value,
            model: form.model.value,
            size: form.size.value,
            style: form.style.value,
            condition: form.condition.value,
            imageUrl: form.imageUrl.value
        });
    
        const newShoe = new Shoe(
            Date.now(), // Temporary ID
            form.brand.value,
            form.model.value,
            parseInt(form.size.value),
            form.style.value,
            form.condition.value,
            true,
            form.imageUrl.value // Use the exact URL provided by the user
        );
    
        console.log('New shoe object:', newShoe);
    
        fetch('http://localhost:3000/shoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newShoe),
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
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
            console.log('Updated shoes array:', this.shoes);
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

    openUpdateShoeModal: function(id) {
        const shoe = this.shoes.find(s => s.id === id);
        if (shoe) {
            document.getElementById('updateShoeId').value = shoe.id;
            document.getElementById('updateBrand').value = shoe.brand;
            document.getElementById('updateModel').value = shoe.model;
            document.getElementById('updateSize').value = shoe.size;
            document.getElementById('updateStyle').value = shoe.style;
            document.getElementById('updateCondition').value = shoe.condition;
            document.getElementById('updateImageUrl').value = shoe.imageUrl;
            document.getElementById('updateShoeModal').style.display = 'block';
        }
    },

    updateShoe: function(event) {
        event.preventDefault();
        const id = document.getElementById('updateShoeId').value;
        const updatedShoe = {
            id: parseInt(id),
            brand: document.getElementById('updateBrand').value,
            model: document.getElementById('updateModel').value,
            size: parseInt(document.getElementById('updateSize').value),
            style: document.getElementById('updateStyle').value,
            condition: document.getElementById('updateCondition').value,
            imageUrl: document.getElementById('updateImageUrl').value,
            availability: true // You might want to add an availability toggle in the form
        };

        fetch(`http://localhost:3000/shoes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedShoe),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Updated shoe data:', data);
            const index = this.shoes.findIndex(s => s.id === parseInt(id));
            if (index !== -1) {
                this.shoes[index] = new Shoe(
                    data.id,
                    data.brand,
                    data.model,
                    data.size,
                    data.style,
                    data.condition,
                    data.availability,
                    data.imageUrl
                );
                this.renderShoes();
                this.updateProfileStats();
                document.getElementById('updateShoeModal').style.display = 'none';
            }
        })
        .catch(error => console.error('Error updating shoe:', error));
    },

    deleteShoe: function(id) {
        if (confirm('Are you sure you want to delete this shoe?')) {
            fetch(`http://localhost:3000/shoes/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    this.shoes = this.shoes.filter(s => s.id !== id);
                    this.renderShoes();
                    this.updateProfileStats();
                } else {
                    throw new Error('Failed to delete shoe');
                }
            })
            .catch(error => console.error('Error deleting shoe:', error));
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
                <img src="${this.getImagePath(shoe.imageUrl)}" 
                     alt="${shoe.brand} ${shoe.model}" 
                     onerror="this.onerror=null; this.src='path/to/default-placeholder.jpg';">
                <h3>${shoe.brand} ${shoe.model}</h3>
                <p>Size: ${shoe.size}</p>
                <p>Style: ${shoe.style}</p>
                <p>Condition: ${shoe.condition}</p>
                <p>Availability: ${shoe.availability ? 'Available' : 'Not Available'}</p>
                <button onclick="ShoeSphere.viewShoeDetails(${shoe.id})">View Details</button>
                <button onclick="ShoeSphere.openUpdateShoeModal(${shoe.id})">Update</button>
                <button onclick="ShoeSphere.deleteShoe(${shoe.id})">Delete</button>
            `;
            shoeGrid.appendChild(shoeElement);
        });
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