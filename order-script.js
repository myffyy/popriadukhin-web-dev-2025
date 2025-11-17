// Глобальная переменная для хранения данных о блюдах
let dishes = []
// Глобальная переменная для хранения выбранных блюд
let selectedDishes = {}

// --- Основные DOM-элементы ---
const orderItemsContainer = document.getElementById('order-items-container')
const customerForm = document.querySelector('.customer-form')
const formErrorMessage = document.getElementById('form-error-message')

// --- Определение комбо ---
const combos = [
	{ name: 'Комбо 1', categories: ['soup', 'main-course', 'salad', 'drink'] },
	{ name: 'Комбо 2', categories: ['soup', 'main-course', 'drink'] },
	{ name: 'Комбо 3', categories: ['soup', 'drink'] },
	{ name: 'Комбо 4', categories: ['main-course', 'salad', 'drink'] },
	{ name: 'Комбо 5', categories: ['main-course', 'drink'] },
	{ name: 'Комбо 6', categories: ['salad', 'drink'] },
]

// --- Функции для работы с localStorage ---

function loadOrderFromLocalStorage() {
	const savedOrder = localStorage.getItem('currentOrder')
	return savedOrder ? JSON.parse(savedOrder) : {}
}

function saveOrderToLocalStorage() {
	const orderToSave = {}
	for (const category in selectedDishes) {
		if (selectedDishes[category]) {
			orderToSave[category] = selectedDishes[category].keyword
		}
	}
	localStorage.setItem('currentOrder', JSON.stringify(orderToSave))
}

// --- Функции для создания DOM-элементов ---

function createElement(tag, attributes, ...children) {
	const element = document.createElement(tag)
	Object.assign(element, attributes)
	if (children.length > 0) {
		element.append(...children)
	}
	return element
}

// --- Функции для отображения и управления заказом ---

function createDishCard(dish) {
	const img = createElement('img', { src: dish.image, alt: dish.name })
	const price = createElement('p', {
		className: 'price',
		textContent: `${dish.price} ₽`,
	})
	const name = createElement('p', {
		className: 'dish-name',
		textContent: dish.name,
	})
	const weight = createElement('p', {
		className: 'weight',
		textContent: dish.count,
	})
	const button = createElement('button', {
		textContent: 'Удалить',
		className: 'remove-button',
		onclick: () => removeFromOrder(dish.category),
	})

	const dishItem = createElement(
		'div',
		{ className: 'dish-item' },
		img,
		price,
		name,
		weight,
		button
	)
	dishItem.dataset.dish = dish.keyword

	return dishItem
}

function removeFromOrder(category) {
	selectedDishes[category] = null
	saveOrderToLocalStorage()
	renderOrderItems()
	renderFormSummary()
}

function renderOrderItems() {
	orderItemsContainer.innerHTML = ''
	const orderedDishes = Object.values(selectedDishes).filter(
		dish => dish !== null
	)

	if (orderedDishes.length === 0) {
		orderItemsContainer.innerHTML = `<p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="menu.html">Собрать ланч</a>.</p>`
		return
	}

	orderedDishes.forEach(dish => {
		const card = createDishCard(dish)
		orderItemsContainer.appendChild(card)
	})
}

function renderFormSummary() {
	const summaryContainer = document.getElementById('form-order-summary')
	summaryContainer.innerHTML = ''

	const title = createElement('h3', { textContent: 'Состав заказа' })
	summaryContainer.appendChild(title)

	const categories = ['soup', 'main-course', 'salad', 'dessert', 'drink']
	const categoryLabels = {
		soup: 'Суп',
		'main-course': 'Горячее блюдо',
		salad: 'Салат',
		dessert: 'Десерт',
		drink: 'Напиток',
	}

	let total = 0
	categories.forEach(category => {
		const dish = selectedDishes[category]
		const text = dish ? `${dish.name} - ${dish.price} ₽` : 'Не выбрано'
		total += dish ? dish.price : 0
		const p = createElement('p', {
			textContent: `${categoryLabels[category]}: ${text}`,
		})
		summaryContainer.appendChild(p)
	})

	const totalEl = createElement('p', {
		textContent: `Итого: ${total} ₽`,
		className: 'total-cost',
	})
	summaryContainer.appendChild(totalEl)
}

function checkCombo() {
	const selectedCategories = Object.keys(selectedDishes).filter(
		category => selectedDishes[category] !== null && category !== 'dessert'
	)

	const selectedSet = new Set(selectedCategories)

	for (const combo of combos) {
		const comboSet = new Set(combo.categories)
		if (
			selectedSet.size === comboSet.size &&
			[...selectedSet].every(cat => comboSet.has(cat))
		) {
			return {
				isCombo: true,
				message: 'Комбо собрано!',
			}
		}
	}

	return {
		isCombo: false,
		message: 'Выбранные блюда не соответствуют ни одному комбо.',
	}
}

// --- Инициализация ---

async function loadDishes() {
	const url = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		dishes = data
	} catch (error) {
		console.error('Ошибка при загрузке данных о блюдах:', error)
		orderItemsContainer.innerHTML =
			'<p>Не удалось загрузить меню. Пожалуйста, попробуйте обновить страницу позже.</p>'
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()
	const savedOrder = loadOrderFromLocalStorage()

	for (const category in savedOrder) {
		const dishKeyword = savedOrder[category]
		const dish = dishes.find(d => d.keyword === dishKeyword)
		if (dish) {
			selectedDishes[category] = dish
		}
	}

	renderOrderItems()
	renderFormSummary()

	customerForm.addEventListener('submit', event => {
		event.preventDefault()

		const comboCheck = checkCombo()
		const hasSelectedDishes = Object.values(selectedDishes).some(
			dish => dish !== null
		)

		if (!hasSelectedDishes) {
			formErrorMessage.textContent = 'Вы не выбрали ни одного блюда.'
			return
		}

		if (!comboCheck.isCombo) {
			formErrorMessage.textContent = comboCheck.message
			return
		}

		formErrorMessage.textContent = ''

		// Этап 4: Отправка данных на сервер
		const formData = new FormData(customerForm)
		const orderData = {
			...Object.fromEntries(formData.entries()),
			dishes: Object.values(selectedDishes)
				.filter(d => d)
				.map(d => d.keyword),
		}

		fetch('https://httpbin.org/post', {
			method: 'POST',
			body: JSON.stringify(orderData),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Ошибка сети: ${response.status}`)
				}
				return response.json()
			})
			.then(data => {
				console.log('Success:', data)
				alert('Заказ успешно оформлен!')
				localStorage.removeItem('currentOrder')
				selectedDishes = {}
				renderOrderItems()
				renderFormSummary()
				customerForm.reset()
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Произошла ошибка при оформлении заказа: ${error.message}`)
			})
	})
})

const deliveryTimeSelect = document.getElementById('delivery-time')
const specificTimeContainer = document.getElementById('specific-time-container')

deliveryTimeSelect.addEventListener('change', event => {
	if (event.target.value === 'time') {
		specificTimeContainer.style.display = 'block'
	} else {
		specificTimeContainer.style.display = 'none'
	}
})
