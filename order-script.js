import { checkCombo, createElement, dishes, loadDishes } from './utils.js'

// Глобальная переменная для хранения выбранных блюд
let selectedDishes = {}

// --- Основные DOM-элементы ---
const orderItemsContainer = document.getElementById('order-items-container')
const customerForm = document.querySelector('.customer-form')
const formErrorMessage = document.getElementById('form-error-message')

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

// --- Инициализация ---

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()

	if (dishes.length === 0) {
		orderItemsContainer.innerHTML =
			'<p>Не удалось загрузить меню. Пожалуйста, попробуйте обновить страницу позже.</p>'
		return
	}

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

		const comboCheck = checkCombo(selectedDishes)
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

		const formData = new FormData(customerForm)
		const orderData = {
			id: Date.now(),
			date: new Date().toISOString(),
			...Object.fromEntries(formData.entries()),
			dishes: Object.values(selectedDishes)
				.filter(d => d)
				.map(d => d.keyword),
		}

		try {
			const allOrders = JSON.parse(localStorage.getItem('allOrders')) || []
			allOrders.push(orderData)
			localStorage.setItem('allOrders', JSON.stringify(allOrders))

			localStorage.removeItem('currentOrder')
			selectedDishes = {}
			renderOrderItems()
			renderFormSummary()
			customerForm.reset()

			alert('Заказ успешно оформлен!')
		} catch (error) {
			console.error('Error:', error)
			alert(`Произошла ошибка при сохранении заказа: ${error.message}`)
		}
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
