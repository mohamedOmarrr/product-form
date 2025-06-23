let allInputs = document.querySelectorAll('.form .feild');
let formBtn = document.querySelector('.submit');
let contain = document.querySelector('.products-wrapper');
let formLink = document.querySelector('.submit a');
let searchInput = document.querySelector('.search');
let currentIndex = null;
let productList = [];
let oldImageForEdit = ''

// validtion regex
const priceRegex = /(^[1-9][0-9]{2,3}$|^10000$)/;
const nameRegex = /^[A-Z]\w+(?: [A-Z]\w+){0,2}$/;
const catRegex = /(^mobile$|^pc$|^labtop$|^tv$|^tablet$|^camera$|^keyboard$)/i;
const descRegex = /^(?!.* {2})[\s\S]{50,200}$/;



allInputs[0].addEventListener('input', function() {
  validateInput(this, nameRegex, '.nameWarning');
});
allInputs[1].addEventListener('input', function() {
  validateInput(this, priceRegex, '.priceWarning');
});
allInputs[2].addEventListener('input', function() {
  validateInput(this, catRegex, '.catWarning');
});
allInputs[3].addEventListener('input', function() {
  validateInput(this, descRegex, '.descWarning');
});

// validtion func
function validateInput(input, regex, warningSelector) {
  if (regex.test(input.value) && input.value.trim() !== "") {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    document.querySelector(warningSelector).classList.replace('d-block', 'd-none');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    document.querySelector(warningSelector).classList.replace('d-none', 'd-block');
  }
}


formBtn.addEventListener('click', function(e) {
  e.preventDefault();// prevent default events for form btn
  formLink.textContent = 'Add Product';

  const image = allInputs[4].files[0];
  const readImage = new FileReader();

  const handleAddProduct = (finalImage) => {
    if (!finalImage || finalImage.trim() === "") {
      document.querySelector('.imageWarning').classList.replace('d-none', 'd-block');
      return;
    } else {
      document.querySelector('.imageWarning').classList.replace('d-block', 'd-none');
    }

    let isValid = true;
    allInputs.forEach(input => {
      if (!input.classList.contains('is-valid') && input !== allInputs[4]) {
        isValid = false;
      }
    });

    if (!isValid){
        return;
    }

    let productInfo = {
      name: allInputs[0].value,
      price: allInputs[1].value,
      category: allInputs[2].value,
      description: allInputs[3].value,
      img: finalImage
    };

    createCard(productInfo);
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });

    allInputs.forEach(input => {
      input.classList.remove('is-valid');
    });
  };

  if (image) {
    readImage.onload = function() {
      handleAddProduct(readImage.result);
    };
    readImage.readAsDataURL(image);
  } else {
    const oldImg = oldImageForEdit;
    handleAddProduct(oldImg);
  }
});


// diplay prouducts func
function display() {
  contain.innerHTML = '';
  productList.forEach(card => {
    contain.appendChild(card);
  });
}


// creat proudts func
function createCard(obj, skipStorage = false) {
  const Card = document.createElement('div');
  Card.className = 'product col-sm-12 col-md-6 col-lg-4 my-4';
  Card.id = 'products';

  Card.innerHTML = `
    <div class="in-product d-flex flex-column align-items-center">
      <img class="data w-100 p-1" src="${obj.img}" alt="${obj.name}">
      <h1 class="data name text-white">${obj.name}</h1>
      <div class="d-flex">
      <h4 class="data text-white fw-light fs-5 me-1">${obj.price}</h4>
      <h4 class="text-white fw-light fs-5">L.E</h4>
      </div>
      <h4 class="data text-white">${obj.category}</h4>
      <div class="wrapper px-2 bg-white border rounded-3">
        <p class="data">${obj.description}</p>
      </div>
      <div class="card-btn mb-4">
        <button class="update-btn px-4 py-1 rounded-3 bg-warning-subtle border">
          <a class="text-decoration-none text-warning" href="#form">Update</a>
        </button>
        <button class="delete-btn px-4 py-1 rounded-3 bg-danger-subtle text-danger border">Delete</button>
      </div>
    </div>`;

  if (currentIndex !== null) {
    productList[currentIndex] = Card;
    currentIndex = null;
  } else {
    productList.push(Card);
  }

  if (!skipStorage){
    setProductInStorage();
  }    


//   delete btn
  Card.querySelector('.delete-btn').addEventListener('click', function () {
    let index = productList.indexOf(Card);
    if (index !== -1) {
      productList.splice(index, 1);
      setProductInStorage();
      display();
    }
  });


// update btn
  Card.querySelector('.update-btn').addEventListener('click', function () {
    formLink.textContent = 'Update';
    let index = productList.indexOf(Card);
    if (index !== -1) {
      const fetchData = productList[index].querySelectorAll('.data');
      allInputs[0].value = fetchData[1]?.textContent || '';
      allInputs[1].value = fetchData[2]?.textContent || '';
      allInputs[2].value = fetchData[3]?.textContent || '';
      allInputs[3].value = fetchData[4]?.textContent || '';
      oldImageForEdit = fetchData[0]?.getAttribute('src') || '';
   
      allInputs.forEach(card => {
        card.classList.add('is-valid');
      });
      currentIndex = index;
    }
  });

  display();
  resetForm();
}


// reset input feilds
function resetForm() {
  allInputs.forEach(In => {
    In.value = '';
  });
}


// set in local storage
function setProductInStorage() {
  let getStringList = productList.map(card => {
    let cardInfo = card.querySelectorAll('.data');
    return {
      img: cardInfo[0]?.getAttribute('src') || '',
      name: cardInfo[1]?.textContent || '',
      price: cardInfo[2]?.textContent || '',
      category: cardInfo[3]?.textContent || '',
      description: cardInfo[4]?.textContent || ''
    };
  });
  localStorage.setItem('productList', JSON.stringify(getStringList));
}


// get from local storage
function getProductFromStorage() {
  let inStorage = localStorage.getItem('productList');
  if (!inStorage) return;
  let parseString = JSON.parse(inStorage);
  productList = [];
  parseString.forEach(obj => {
    createCard(obj, true);
  });
}

window.addEventListener('DOMContentLoaded', getProductFromStorage);

// search func
searchInput.addEventListener('input', function() {
  let filterList = productList.filter(card => {
    return card.querySelector('.name').textContent.toLowerCase().includes(searchInput.value.toLowerCase());
  });
  contain.innerHTML = '';
  filterList.forEach(card => {
    contain.appendChild(card);
  });
});



