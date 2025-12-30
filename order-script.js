import {
	checkCombo,
	createDishCard,
	createElement,
	dishes,
	loadDishes,
	loadFromStorage,
	saveToStorage,
} from './utils.js'

let selectedDishes = {}

const orderItemsContainer = document.getElementById('order-items-container')
const customerForm = document.querySelector('.customer-form')
const formErrorMessage = document.getElementById('form-error-message')
const deliveryTimeSelect = document.getElementById('delivery-time')
const specificTimeContainer = document.getElementById('specific-time-container')

function saveOrder() {
	const orderToSave = {}
	for (const category in selectedDishes) {
		if (selectedDishes[category])
			orderToSave[category] = selectedDishes[category].keyword
	}
	saveToStorage('currentOrder', orderToSave)
}

function removeFromOrder(category) {
	selectedDishes[category] = null
	saveOrder()
	renderOrderItems()
	renderFormSummary()
}

function renderOrderItems() {
	const orderedDishes = Object.values(selectedDishes).filter(dish => dish)

	if (orderedDishes.length === 0) {
		orderItemsContainer.innerHTML =
			'<p>Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="menu.html">Собрать ланч</a>.</p>'
		return
	}

	orderItemsContainer.innerHTML = ''
	orderedDishes.forEach(dish => {
		const card = createDishCard(dish, 'Удалить', () =>
			removeFromOrder(dish.category)
		)
		card.querySelector('button').className = 'remove-button'
		orderItemsContainer.appendChild(
			createElement('div', { className: 'col' }, card)
		)
	})
}

function renderFormSummary() {
	const summaryContainer = document.getElementById('form-order-summary')
	const categoryLabels = {
		soup: 'Суп',
		'main-course': 'Горячее блюдо',
		salad: 'Салат',
		dessert: 'Десерт',
		drink: 'Напиток',
	}

	summaryContainer.innerHTML = ''
	summaryContainer.appendChild(
		createElement('h3', { textContent: 'Состав заказа', className: 'my-4' })
	)

	let total = 0
	Object.entries(categoryLabels).forEach(([category, label]) => {
		const dish = selectedDishes[category]
		const text = dish ? `${dish.name} - ${dish.price} ₽` : 'Не выбрано'
		total += dish ? dish.price : 0
		summaryContainer.appendChild(
			createElement('p', { textContent: `${label}: ${text}` })
		)
	})

	summaryContainer.appendChild(
		createElement('p', {
			textContent: `Итого: ${total} ₽`,
			className: 'total-cost',
			style:
				'margin-top: auto; font-weight: bold; text-align: center; padding-top: 15px;',
		})
	)
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()

	if (dishes.length === 0) {
		orderItemsContainer.innerHTML =
			'<p>Не удалось загрузить меню. Пожалуйста, попробуйте обновить страницу позже.</p>'
		return
	}

	const savedOrder = loadFromStorage('currentOrder')
	if (savedOrder) {
		for (const category in savedOrder) {
			const dish = dishes.find(d => d.keyword === savedOrder[category])
			if (dish) selectedDishes[category] = dish
		}
	}

	renderOrderItems()
	renderFormSummary()

	deliveryTimeSelect.addEventListener('change', e => {
		specificTimeContainer.style.display =
			e.target.value === 'time' ? 'block' : 'none'
	})

	customerForm.addEventListener('submit', event => {
		event.preventDefault()

		const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish)
		if (!hasSelectedDishes) {
			formErrorMessage.textContent = 'Вы не выбрали ни одного блюда.'
			return
		}

		const comboCheck = checkCombo(selectedDishes)
		if (!comboCheck.isCombo) {
			formErrorMessage.textContent = comboCheck.message
			return
		}

		formErrorMessage.textContent = ''

		const orderData = {
			id: Date.now(),
			date: new Date().toISOString(),
			...Object.fromEntries(new FormData(customerForm)),
			dishes: Object.values(selectedDishes)
				.filter(d => d)
				.map(d => d.keyword),
		}

		try {
			const allOrders = loadFromStorage('allOrders') || []
			allOrders.push(orderData)
			saveToStorage('allOrders', allOrders)

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
