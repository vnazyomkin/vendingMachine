'use strict';
const menu = {
    espresso: {
        text: 'Эспрессо',
        coast: 90,
        volume: 100,
        recipes: {
            milk: 0,
        },
        type: 'standart',
    },
    latte: {
        text: 'Латте',
        coast: 130,
        volume: 250,
        recipes: {
            milk: 100,
        },
        type: 'standart',
    },
    cappuccino: {
        text: 'Капучино',
        coast: 110,
        volume: 250,
        recipes: {
            milk: 80,
        },
        type: 'standart',
    },
    bananaLatte: {
        text: 'Банановый латте',
        coast: 150,
        volume: 300,
        recipes: {
            milk: 100,
            bananaSyrop: 50,
        },
        type: 'invariable',
    },
    vanillaCappuccino: {
        text: 'Ванильный капучино',
        coast: 150,
        volume: 300,
        recipes: {
            milk: 80,
            vanillaSyrop: 50,
        },
        type: 'invariable',
    },
    flatWhite: {
        text: 'Флэт уайт',
        coast: 110,
        volume: 280,
        recipes: {
            milk:120,
        },
        type: 'invariable',
    },
    milk: {
        text: 'Молоко',
        coast: 25,
        volume: 50,
        recipes: {
            milk: 50,
        },
        type: 'ingredients',
    },
    cherrySyrop: {
        text: 'Вишневый сироп',
        coast: 35,
        volume: 50,
        recipes: {
            cherrySyrop: 50,
        },
        type: 'ingredients',
    },
};
const volumeIngredients = {
    milk: 1000,
    cherrySyrop: 500,
    bananaSyrop: 500,
    vanillaSyrop: 500,
};
const glasses = {
    250: 5,
    320: 6,
};

const order = {
    name: [],
    ingredients:[],
    text: '',
    volume: 0,
    coast: 0,
    type: '',
};

let options = [];

const main = document.querySelector('.main');
const interactive = main.querySelector('.interactive');
const drinkName = interactive.querySelector('.drink_name');
const drinkVolume = interactive.querySelector('.drink_volume');
const [, price, picture] = interactive.children;
const payment = main.querySelector('.payment');
const result = main.querySelector('.result');
const progress = picture.children[0];
const audio = main.querySelector('audio');

setOptions();
setActive();
showIngredientsAndGlasses();

main.addEventListener('click', function(event) {
    let target = event.target;

    if (target.classList.contains('active')) {      //Нажатие на напитки
        removeClass('active');

        setOrder(target);
        setOptions();

        setActive();
        render();
    }
    if (target.classList.contains('cancel')) {      //Отмена
        finishOrder();
        showHideCancel();
    }

    if (target.classList.contains('activePayment')) {       //Оплата
        countGlass();
        countIngredients();

        removeClass('activePayment');
        removeClass('active');


        picture.classList.remove('cancel');
        picture.textContent = '';
        makeOrder()
            .then(showCoffee)
            .then(blinkBorder)
            .then(takeCoffee);
    }

});
function showIngredientsAndGlasses() {
    main.querySelector('.v-milk').textContent = `Молоко: ${volumeIngredients.milk} мл.`;
    main.querySelector('.v-cherrySyrop').textContent = `Вишневый сироп: ${volumeIngredients.cherrySyrop} мл.`;
    main.querySelector('.v-bananaSyrop').textContent = `Банановый сироп: ${volumeIngredients.bananaSyrop} мл.`;
    main.querySelector('.v-vanillaSyrop').textContent = `Ванильный сироп: ${volumeIngredients.vanillaSyrop} мл.`;
    main.querySelector('.v-glass250').textContent = `Стаканчики 250 мл: ${glasses[250]} шт.`;
    main.querySelector('.v-glass320').textContent = `Стаканчики 320 мл: ${glasses[320]} шт.`;

}

function showCoffee() {
    result.classList.add('coffee_visible');
}
function hideCoffee() {
    result.classList.remove('coffee_visible');
}
function blinkBorder() {
    result.classList.add('border_blink');
}
function takeCoffee() {
    let countTake = 0;
    setTimeout(() => {
        if (countTake < 1) {
            audio.play();
            audio.addEventListener('ended', () => {
                audio.play();
            });
        }
    },5000);
    setTimeout(() => {
        if (countTake < 1) {
            audio.pause();
            result.classList.remove('border_blink');
            alert('Напиток в зоне выдачи. Для продолжения нажмите на него.');
        }
    },20000);
    result.addEventListener('click', function(event){
        if (picture.textContent == '') {
            countTake++;
            audio.pause();
            finishOrder();
            hideCoffee();
            picture.style.background = '';
            result.classList.remove('border_blink');
        }
    });
}

function setOptions() {
    options = [];
    let typeOrder = [];

    if (order.name.length < 1 && order.ingredients.length < 1) {    // Если первый клик, то перебираются все
        typeOrder.push('standart', 'invariable', 'ingredients');
    }
    else if (order.type !== 'invariable') {
        typeOrder.push('standart', 'ingredients');
    }
    for (let i=0; i < typeOrder.length; i++) {
        let arr = Array.from( main.querySelectorAll(`.${typeOrder[i]}`) );
            arr.forEach(item => {
                options.push(item);
            });
    }
}

function setActive() {
    let nameClass;   
    let ingredients;       
    let active;     // Переменная, отвечающая за состояние активности блока

    for (let item of options) {
        active = 1;
        nameClass = item.classList.item(1);
        ingredients = menu[nameClass].recipes;

        if (nameClass == 'cherrySyrop') {      // Не больше 100 мл сиропа
            let cherry = order.ingredients.reduce((count, item) => {
                return item == 'cherrySyrop' ? ++count : count;
            }, 0);
            if (cherry > 1) {
                active--;
                break;
            }
        }

        for (let i in ingredients) {
            let v = ingredients[i] + 50 * order.ingredients.filter(el=> {
               if (el == i) return true;
               return false;
            }).length;
            if (v > volumeIngredients[i] || !isGlasses(menu[nameClass].volume + order.volume) )  {
                active--;
                break; 
            }
        }
        if (active > 0) addClass(item, 'active');
    }

}

function addClass(div, name) {
    if (div.classList.contains(`${name}`)) return;
    div.classList.add(`${name}`);
}

function isGlasses(volume) {
    for (let volumeGlass in glasses) {
        if (volumeGlass >= volume && glasses[volumeGlass] > 0) return true;
    }
}

function setOrder(target) {
    setOrdersName(target);
    setOrdersVolume( target.classList.item(1) );
    setOrdersCoast( target.classList.item(1) );
    setOrdersText();
    setOrderType();
}
function setOrdersName(target) {
    switch ( target.classList.item(2) ){
        case 'drink':
            order.name.push( target.classList.item(1) );
            break;

        case 'ingredients':
            order.ingredients.push( target.classList.item(1) );
            break;
    }
}
function setOrdersVolume(nameDrink) {
    order.volume += menu[nameDrink].volume;
}
function setOrdersCoast(nameDrink) {
    order.coast += menu[nameDrink].coast;
}
function setOrdersText() {
    order.text = '';
    order.name.sort();
    order.ingredients.sort();

    if (order.name.length == 1) {
        order.text = menu[ order.name[0] ].text;
    }
    if (order.name.length > 1) {
        order.text = `${menu[ order.name[0] ].text}*${order.name.length}`;    // в order.name только названия напитков. Варианты: двойной эспрессо, двойной капучино. После сортировки, в массиве эспрессо будет в конце. Поэтому нахвание будет Первый элемент массива x длина массива
    }
    
    if (order.text && order.ingredients.length) order.text += ' + доп. ';

    let count = 1;
    order.text += order.ingredients.reduce( (text, nameIngredient, i) => {
        if (i > 0 && order.ingredients[i - 1] == nameIngredient) {
            count++;
            if (i == order.ingredients.length - 1) {
                return text += `${menu[nameIngredient].volume * count} мл. `
            }
            return text;
        }
        if (i > 0) {
            text += `${menu[nameIngredient].volume * count} мл. + `
            count = 1;
        }
        text += `${menu[nameIngredient].text} `;

        if (i == order.ingredients.length - 1) {
            return text += `${menu[nameIngredient].volume * count} мл. `
        }
        return text;
    }, '');
}
function setOrderType() {
    if (order.name.length == 1) {
        return order.type = menu[order.name[0]].type;
    }
    return order.type = 'author';
}

function render() {
   setOrderType(); 
   drinkName.textContent = order.text;
   drinkVolume.textContent = order.volume > 0 ? `${order.volume} мл.` : '';
   price.textContent = order.coast > 0 ? `${order.coast} руб.`: '';
   showHideCancel();
   showPayment();
}

function showHideCancel() {
    if (order.text) {
        picture.classList.add('cancel');
        return picture.textContent = 'Отмена';
    }
    picture.classList.remove('cancel');
    picture.textContent = '';
}
function showPayment() {
    if (order.text !== '' && !payment.classList.contains('activePayment')) {
        return payment.classList.add('activePayment');
    }

}

function isOrder() {
    if (order.name.length > 0) return true;
    return false;
}
function removeClass(nameClass) {
    Array.from( main.querySelectorAll(`.${nameClass}` ) )
        .forEach(item => item.classList.remove(nameClass) );
}

function removeOrder() {
    order.name = [];
    order.ingredients = [];
    order.text = '';
    order.volume = 0;
    order.coast = 0;
    order.type = '';
}

function finishOrder() {
    removeOrder();
    setOptions();
    setActive();
    removeClass('activePayment');
    drinkName.textContent = '';
    drinkVolume.textContent = '';
    price.textContent = '';

}

function countGlass() {
    for (let v in glasses) {
        if (order.volume <= v && glasses[v] > 0) {
            return glasses[v]--;
        }
    }
    alert('Нет стаканчиков');
}

function countIngredients() {
    for (let drink of order.name) {
        for (let ingredient in menu[drink].recipes) {
            volumeIngredients[ingredient] -= menu[drink].recipes[ingredient];
        }
    }
    for (let ingredient of order.ingredients) {
        volumeIngredients[ingredient] -= menu[ingredient].recipes[ingredient];
    }
}

async function makeOrder() {
    let time;
    let url;
    fetch('http://source.unsplash.com/200x200/?coffee')
        .then((resolve) => url = resolve.url);

    showIngredientsAndGlasses();
    if (order.ingredients.length > 0) time = 8;
    else order.type == 'standart' ? time = 3: time = 5;
    picture.textContent = `Время приготовления: ${time}`;

    let promise = new Promise((resolve) => {
        let interval = setInterval(()=>{
            time--;
            picture.textContent = `Время приготовления: ${time}`;
            if (time < 1) {
                clearInterval(interval);
                resolve();
            }
        },1000);
    })
        .then(() => {
            picture.textContent = '';

            picture.style.background = `url(${url}) no-repeat center`;
            picture.style.backgroundSize = 'contain';
        });
        return promise;
}

    

