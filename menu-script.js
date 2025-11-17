// Глобальная переменная для хранения данных о блюдах
let dishes = []
// Объект для отслеживания выбранных блюд
let selectedDishes = {
	soup: null,
	'main-course': null,
	drink: null,
	salad: null,
	dessert: null,
}

// --- Основные DOM-элементы ---
const dishesContainer = document.getElementById('dishes-container')
const categoryButtonsContainer = document.getElementById('category-buttons')
const comboInfoContainer = document.getElementById('combo-info')
const checkoutPanel = document.getElementById('checkout-panel')
const panelTotalCost = document.getElementById('panel-total-cost')
const checkoutLink = document.getElementById('checkout-link')

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

function saveOrderToLocalStorage() {
	const orderToSave = {}
	for (const category in selectedDishes) {
		if (selectedDishes[category]) {
			orderToSave[category] = selectedDishes[category].keyword
		}
	}
	localStorage.setItem('currentOrder', JSON.stringify(orderToSave))
}

function loadOrderFromLocalStorage() {
	const savedOrder = localStorage.getItem('currentOrder')
	return savedOrder ? JSON.parse(savedOrder) : null
}

// --- Утилиты для создания DOM-элементов ---

function createElement(tag, attributes, ...children) {
	const element = document.createElement(tag)
	Object.assign(element, attributes)
	if (children.length > 0) {
		element.append(...children)
	}
	return element
}

// --- Функции для управления карточками блюд ---

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
		textContent: 'Добавить',
		onclick: () => addToOrder(dish),
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

function updateDishCardAppearance(keyword, isSelected) {
	const dishElement = document.querySelector(`[data-dish="${keyword}"]`)
	if (!dishElement) return

	const button = dishElement.querySelector('button')
	dishElement.style.border = isSelected
		? '2px solid #bb86fc'
		: '2px solid transparent'
	button.textContent = isSelected ? 'Убрать' : 'Добавить'
	button.classList.toggle('remove-button', isSelected)
}

// --- Функции для управления состоянием заказа ---

function addToOrder(dish) {
	const { category, keyword } = dish
	const currentlySelected = selectedDishes[category]

	if (currentlySelected && currentlySelected.keyword === keyword) {
		removeFromOrder(category)
		return
	}

	if (currentlySelected) {
		updateDishCardAppearance(currentlySelected.keyword, false)
	}

	selectedDishes[category] = dish
	updateDishCardAppearance(keyword, true)

	updateCheckoutPanel()
	saveOrderToLocalStorage()
}

function removeFromOrder(category) {
	const dish = selectedDishes[category]
	if (!dish) return

	updateDishCardAppearance(dish.keyword, false)
	selectedDishes[category] = null

	updateCheckoutPanel()
	saveOrderToLocalStorage()
}

// --- Функции для обновления UI ---

function updateCheckoutPanel() {
	const selected = Object.values(selectedDishes).filter(d => d !== null)

	if (selected.length === 0) {
		checkoutPanel.classList.remove('visible')
		return
	}

	checkoutPanel.classList.add('visible')

	const total = selected.reduce((sum, dish) => sum + dish.price, 0)
	panelTotalCost.textContent = total

	const { isCombo } = checkCombo()
	if (isCombo) {
		checkoutLink.classList.remove('disabled')
		checkoutLink.href = 'order.html'
	} else {
		checkoutLink.classList.add('disabled')
		checkoutLink.removeAttribute('href')
	}
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
			return { isCombo: true }
		}
	}

	return { isCombo: false }
}

function displayDishesByCategory(category) {
	dishesContainer.innerHTML = ''
	const categoryDishes = dishes.filter(dish => dish.category === category)
	categoryDishes.forEach(dish => {
		const card = createDishCard(dish)
		dishesContainer.appendChild(card)
	})

	const buttons = document.querySelectorAll('.category-button')
	buttons.forEach(button => {
		button.classList.toggle('active', button.dataset.category === category)
	})
}

function createCategoryButtons() {
	const categories = ['soup', 'main-course', 'salad', 'dessert', 'drink']
	const categoryNames = {
		soup: 'Супы',
		'main-course': 'Горячие блюда',
		drink: 'Напитки',
		salad: 'Салаты и стартеры',
		dessert: 'Десерты',
	}

	categories.forEach(category => {
		const button = createElement('button', {
			className: 'category-button',
			textContent: categoryNames[category],
			onclick: () => displayDishesByCategory(category),
		})
		button.dataset.category = category
		categoryButtonsContainer.appendChild(button)
	})
}

function displayComboInfo() {
	comboInfoContainer.innerHTML = ''
	const title = createElement('h3', { textContent: 'Возможные комбо:' })
	const iconPaths = {
		soup: 'images/soupicon.png',
		'main-course': 'images/mainicon.png',
		salad: 'images/saladicon.png',
		drink: 'images/drinkicon.png',
		dessert: 'images/desserticon.png',
	}

	const allCombos = [...combos.map(c => c.categories), ['dessert']]

	const comboIcons = allCombos.map(comboKeys => {
		const icons = comboKeys.flatMap((iconKey, index) => {
			const img = createElement('img', {
				src: iconPaths[iconKey],
				alt: iconKey,
				className: 'combo-icon',
			})
			if (index < comboKeys.length - 1) {
				const plus = createElement('span', {
					textContent: ' + ',
					className: 'combo-separator',
				})
				return [img, plus]
			}
			return [img]
		})
		return createElement('div', { className: 'combo-option' }, ...icons)
	})

	const comboIconsContainer = createElement(
		'div',
		{ id: 'combo-icons' },
		...comboIcons
	)
	const comboContent = createElement(
		'div',
		{ className: 'combo-content' },
		title,
		comboIconsContainer
	)
	comboInfoContainer.appendChild(comboContent)
}

// --- Инициализация ---

async function loadDishes() {
	const url = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		dishes = await response.json()
	} catch (error) {
		console.error('Ошибка при загрузке данных о блюдах:', error)
		dishesContainer.innerHTML =
			'<p>Не удалось загрузить меню. Пожалуйста, попробуйте обновить страницу позже.</p>'
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()

	const savedOrder = loadOrderFromLocalStorage()
	if (savedOrder) {
		for (const category in savedOrder) {
			const dishKeyword = savedOrder[category]
			const dish = dishes.find(d => d.keyword === dishKeyword)
			if (dish) {
				selectedDishes[category] = dish
			}
		}
	}

	createCategoryButtons()
	displayComboInfo()
	displayDishesByCategory('soup')

	Object.values(selectedDishes).forEach(dish => {
		if (dish) {
			updateDishCardAppearance(dish.keyword, true)
		}
	})
	updateCheckoutPanel()
})
