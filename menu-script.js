import {
	checkCombo,
	combos,
	createDishCard,
	createElement,
	dishes,
	loadDishes,
	loadFromStorage,
	saveToStorage,
} from './utils.js'

let selectedDishes = {
	soup: null,
	'main-course': null,
	drink: null,
	salad: null,
	dessert: null,
}

const dishesContainer = document.getElementById('dishes-container')
const categoryButtonsContainer = document.getElementById('category-buttons')
const comboInfoContainer = document.getElementById('combo-info')
const checkoutPanel = document.getElementById('checkout-panel')
const panelTotalCost = document.getElementById('panel-total-cost')
const checkoutLink = document.getElementById('checkout-link')

function saveOrder() {
	const orderToSave = {}
	for (const category in selectedDishes) {
		if (selectedDishes[category])
			orderToSave[category] = selectedDishes[category].keyword
	}
	saveToStorage('currentOrder', orderToSave)
}

function updateDishCardAppearance(keyword, isSelected) {
	const dishElement = document.querySelector(
		`.dish-item[data-dish="${keyword}"]`
	)
	if (!dishElement) return

	const button = dishElement.querySelector('button')
	dishElement.style.border = isSelected
		? '2px solid #bb86fc'
		: '2px solid transparent'
	button.textContent = isSelected ? 'Убрать' : 'Добавить'
	button.classList.toggle('remove-button', isSelected)
}

function addToOrder(dish) {
	const { category, keyword } = dish
	const currentlySelected = selectedDishes[category]

	if (currentlySelected?.keyword === keyword) {
		removeFromOrder(category)
		return
	}

	if (currentlySelected)
		updateDishCardAppearance(currentlySelected.keyword, false)

	selectedDishes[category] = dish
	updateDishCardAppearance(keyword, true)
	updateCheckoutPanel()
	saveOrder()
}

function removeFromOrder(category) {
	const dish = selectedDishes[category]
	if (!dish) return

	updateDishCardAppearance(dish.keyword, false)
	selectedDishes[category] = null
	updateCheckoutPanel()
	saveOrder()
}

function updateCheckoutPanel() {
	const selected = Object.values(selectedDishes).filter(d => d)

	if (selected.length === 0) {
		checkoutPanel.classList.remove('visible')
		return
	}

	checkoutPanel.classList.add('visible')
	panelTotalCost.textContent = selected.reduce(
		(sum, dish) => sum + dish.price,
		0
	)

	const { isCombo } = checkCombo(selectedDishes)
	if (isCombo) {
		checkoutLink.classList.remove('disabled')
		checkoutLink.href = 'order.html'
	} else {
		checkoutLink.classList.add('disabled')
		checkoutLink.removeAttribute('href')
	}
}

function displayDishesByCategory(category) {
	dishesContainer.innerHTML = ''
	dishes
		.filter(dish => dish.category === category)
		.forEach(dish => {
			const card = createDishCard(dish, 'Добавить', () => addToOrder(dish))
			dishesContainer.appendChild(
				createElement('div', { className: 'col' }, card)
			)
		})

	Object.values(selectedDishes).forEach(dish => {
		if (dish) updateDishCardAppearance(dish.keyword, true)
	})

	document.querySelectorAll('.category-button').forEach(button => {
		button.classList.toggle('active', button.dataset.category === category)
	})
}

function createCategoryButtons() {
	const categories = {
		soup: 'Супы',
		'main-course': 'Горячие блюда',
		salad: 'Салаты и стартеры',
		dessert: 'Десерты',
		drink: 'Напитки',
	}

	Object.entries(categories).forEach(([category, name]) => {
		const button = createElement('button', {
			className: 'category-button',
			textContent: name,
			onclick: () => displayDishesByCategory(category),
		})
		button.dataset.category = category
		categoryButtonsContainer.appendChild(button)
	})
}

function displayComboInfo() {
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
			return index < comboKeys.length - 1
				? [
						img,
						createElement('span', {
							textContent: ' + ',
							className: 'combo-separator',
						}),
				  ]
				: [img]
		})
		return createElement('div', { className: 'combo-option' }, ...icons)
	})

	const comboElementsWithSeparators = comboIcons.flatMap((combo, index) =>
		index < comboIcons.length - 1
			? [
					combo,
					createElement('span', {
						textContent: '|',
						className: 'combo-separator',
						style: 'margin: 0 10px;',
					}),
			  ]
			: [combo]
	)

	const comboIconsContainer = createElement(
		'div',
		{ id: 'combo-icons' },
		...comboElementsWithSeparators
	)
	const comboContent = createElement(
		'div',
		{ className: 'combo-content' },
		createElement('h3', { textContent: 'Возможные комбо:' }),
		comboIconsContainer
	)
	comboInfoContainer.appendChild(comboContent)
}

document.addEventListener('DOMContentLoaded', async () => {
	await loadDishes()

	if (dishes.length === 0) {
		dishesContainer.innerHTML =
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

	createCategoryButtons()
	displayComboInfo()
	displayDishesByCategory('soup')
	updateCheckoutPanel()
})
