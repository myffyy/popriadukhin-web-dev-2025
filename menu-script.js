// Импортируем данные о блюдах
import dishes from './dishes.js'

// Получаем ссылки на основные элементы
const dishesContainer = document.getElementById('dishes-container')
const categoryButtonsContainer = document.getElementById('category-buttons')
const comboInfoContainer = document.getElementById('combo-info')

// Определение комбо
const combos = [
	{ name: 'Комбо 1', categories: ['soup', 'main_dish', 'salad', 'drink'] },
	{ name: 'Комбо 2', categories: ['soup', 'main_dish', 'drink'] },
	{ name: 'Комбо 3', categories: ['soup', 'drink'] },
	{ name: 'Комбо 4', categories: ['main_dish', 'salad', 'drink'] },
	{ name: 'Комбо 5', categories: ['main_dish', 'drink'] },
	{ name: 'Комбо 6', categories: ['salad', 'drink'] },
]

// Объект для отслеживания выбранных блюд
let selectedDishes = {
	soup: null,
	main_dish: null,
	drink: null,
	salad: null,
	dessert: null,
}

// Функция для создания карточки блюда
function createDishCard(dish) {
	// Создаем контейнер карточки
	const dishItem = document.createElement('div')
	dishItem.className = 'dish-item'
	dishItem.dataset.dish = dish.keyword

	// Создаем изображение
	const img = document.createElement('img')
	img.src = dish.image
	img.alt = dish.name

	// Создаем элемент цены
	const price = document.createElement('p')
	price.className = 'price'
	price.textContent = `${dish.price} ₽`

	// Создаем элемент названия блюда
	const name = document.createElement('p')
	name.className = 'dish-name'
	name.textContent = dish.name

	// Создаем элемент веса/объема
	const weight = document.createElement('p')
	weight.className = 'weight'
	weight.textContent = dish.count

	// Создаем кнопку "Добавить"
	const button = document.createElement('button')
	button.textContent = 'Добавить'
	button.addEventListener('click', () => addToOrder(dish))

	// Собираем все элементы в карточку
	dishItem.appendChild(img)
	dishItem.appendChild(price)
	dishItem.appendChild(name)
	dishItem.appendChild(weight)
	dishItem.appendChild(button)

	return dishItem
}

// Функция для добавления блюда в заказ
function addToOrder(dish) {
	// Если блюдо уже выбрано, убираем его
	if (
		selectedDishes[dish.category] &&
		selectedDishes[dish.category].keyword === dish.keyword
	) {
		removeFromOrder(dish.category)
		return
	}

	// Удаляем выделение с предыдущего блюда той же категории
	if (selectedDishes[dish.category]) {
		const prevDishElement = document.querySelector(
			`[data-dish="${selectedDishes[dish.category].keyword}"]`
		)
		if (prevDishElement) {
			prevDishElement.style.border = '2px solid transparent'
			const prevButton = prevDishElement.querySelector('button')
			prevButton.textContent = 'Добавить'
			prevButton.classList.remove('remove-button')
		}
	}

	// Сохраняем выбранное блюдо
	selectedDishes[dish.category] = dish

	// Выделяем новое блюдо и меняем кнопку
	const dishElement = document.querySelector(`[data-dish="${dish.keyword}"]`)
	if (dishElement) {
		dishElement.style.border = '2px solid #bb86fc'
		const button = dishElement.querySelector('button')
		button.textContent = 'Убрать'
		button.classList.add('remove-button')
	}

	// Обновляем отображение заказа
	updateOrderDisplay()
}

// Функция для удаления блюда из заказа
function removeFromOrder(category) {
	const dish = selectedDishes[category]
	if (!dish) return

	// Убираем выделение с карточки и меняем кнопку
	const dishElement = document.querySelector(`[data-dish="${dish.keyword}"]`)
	if (dishElement) {
		dishElement.style.border = '2px solid transparent'
		const button = dishElement.querySelector('button')
		button.textContent = 'Добавить'
		button.classList.remove('remove-button')
	}

	// Убираем блюдо из выбранных
	selectedDishes[category] = null

	// Обновляем отображение заказа
	updateOrderDisplay()
}

// Функция для обновления отображения заказа
function updateOrderDisplay() {
	// Получаем контейнер для отображения выбранных блюд
	const selectedItemsContainer = document.getElementById(
		'selected-items-container'
	)

	// Очищаем контейнер
	selectedItemsContainer.innerHTML = ''

	// Проверяем, есть ли выбранные блюда
	const hasSelectedDishes = Object.values(selectedDishes).some(
		dish => dish !== null
	)

	if (!hasSelectedDishes) {
		// Если ничего не выбрано, отображаем сообщение
		const noSelectionMessage = document.createElement('p')
		noSelectionMessage.textContent = 'Ничего не выбрано'
		noSelectionMessage.style.color = '#b0bec5'
		selectedItemsContainer.appendChild(noSelectionMessage)
		return
	}

	// Создаем заголовок
	const title = document.createElement('h3')
	title.textContent = 'Выбранные блюда'
	selectedItemsContainer.appendChild(title)

	// Создаем разделы для каждой категории
	const categories = ['soup', 'main_dish', 'salad', 'dessert', 'drink']
	const categoryLabels = {
		soup: 'Супы',
		main_dish: 'Горячие блюда',
		salad: 'Салаты и стартеры',
		dessert: 'Десерты',
		drink: 'Напитки',
	}

	categories.forEach(category => {
		const categoryDiv = document.createElement('div')
		// Убираем margin-bottom для вертикального расположения
		categoryDiv.style.marginBottom = '5px'

		// Создаем заголовок категории
		const categoryTitle = document.createElement('strong')
		categoryTitle.textContent = `${categoryLabels[category]}: `
		categoryDiv.appendChild(categoryTitle)

		// Добавляем выбранное блюдо или сообщение
		if (selectedDishes[category]) {
			const dishInfoSpan = document.createElement('span')
			dishInfoSpan.textContent = `${selectedDishes[category].name} - ${selectedDishes[category].price} ₽`
			dishInfoSpan.style.color = '#bb86fc'

			const removeButton = document.createElement('button')
			removeButton.textContent = '✖'
			removeButton.className = 'remove-from-order-btn'
			removeButton.onclick = () => removeFromOrder(category)

			categoryDiv.appendChild(dishInfoSpan)
			categoryDiv.appendChild(removeButton)
		} else {
			const noSelectionMessage = document.createElement('span')
			noSelectionMessage.textContent =
				category === 'drink' ? 'Напиток не выбран' : 'Блюдо не выбрано'
			noSelectionMessage.style.color = '#b0bec5'
			categoryDiv.appendChild(noSelectionMessage)
		}

		selectedItemsContainer.appendChild(categoryDiv)
	})

	// Рассчитываем и отображаем общую стоимость
	calculateAndDisplayTotal()
	// Проверяем комбо
	checkCombo()
}

// Функция для проверки комбо
function checkCombo() {
	const selectedCategories = Object.keys(selectedDishes).filter(
		category => selectedDishes[category] !== null
	)

	let bestMatch = { combo: null, missing: [] }
	let isCombo = false

	for (const combo of combos) {
		const missing = combo.categories.filter(
			cat => !selectedCategories.includes(cat)
		)
		const extra = selectedCategories.filter(
			cat => !combo.categories.includes(cat) && cat !== 'dessert'
		)

		if (extra.length === 0) {
			if (
				bestMatch.combo === null ||
				missing.length < bestMatch.missing.length
			) {
				bestMatch = { combo, missing }
			}
		}
	}

	const selectedItemsContainer = document.getElementById(
		'selected-items-container'
	)
	let comboMessageElement = document.getElementById('combo-message')
	if (!comboMessageElement) {
		comboMessageElement = document.createElement('p')
		comboMessageElement.id = 'combo-message'
		selectedItemsContainer.appendChild(comboMessageElement)
	}

	if (bestMatch.combo && bestMatch.missing.length > 0) {
		const categoryLabels = {
			soup: 'Суп',
			main_dish: 'Горячее блюдо',
			salad: 'Салат/стартер',
			dessert: 'Десерт',
			drink: 'Напиток',
		}
		const missingLabels = bestMatch.missing.map(cat => categoryLabels[cat])
		comboMessageElement.textContent = `Добавьте ${missingLabels.join(
			' / '
		)} для завершения комбо.`
		comboMessageElement.style.color = '#ffeb3b'
	} else if (bestMatch.combo && bestMatch.missing.length === 0) {
		comboMessageElement.textContent = 'Комбо собрано!'
		comboMessageElement.style.color = '#4caf50'
		isCombo = true
	} else {
		comboMessageElement.textContent =
			'Выбранные блюда не соответствуют ни одному комбо.'
		comboMessageElement.style.color = '#f44336'
	}

	if (selectedCategories.length === 0) {
		comboMessageElement.textContent = ''
	}

	return {
		isCombo,
		message: comboMessageElement.textContent,
	}
}

// Функция для расчета и отображения общей стоимости
function calculateAndDisplayTotal() {
	// Рассчитываем общую сумму
	let total = 0
	Object.values(selectedDishes).forEach(dish => {
		if (dish) {
			total += dish.price
		}
	})

	// Создаем или получаем элемент для отображения стоимости
	let totalCostElement = document.getElementById('total-cost')
	if (!totalCostElement) {
		totalCostElement = document.createElement('div')
		totalCostElement.id = 'total-cost'
		totalCostElement.className = 'total-cost'
	}

	// Обновляем текст стоимости
	totalCostElement.textContent = `Стоимость заказа: ${total} ₽`

	// Добавляем элемент в DOM, если его еще нет
	const selectedItemsContainer = document.getElementById(
		'selected-items-container'
	)
	if (selectedItemsContainer && !document.getElementById('total-cost')) {
		selectedItemsContainer.appendChild(totalCostElement)
	}
}

// Функция для отображения блюд по выбранной категории
function displayDishesByCategory(category) {
	// Очищаем контейнер перед добавлением новых элементов
	dishesContainer.innerHTML = ''

	// Фильтруем блюда по категории и создаем карточки
	const categoryDishes = dishes.filter(dish => dish.category === category)
	categoryDishes.forEach(dish => {
		const card = createDishCard(dish)
		dishesContainer.appendChild(card)
	})

	// Обновляем активную кнопку
	const buttons = document.querySelectorAll('.category-button')
	buttons.forEach(button => {
		if (button.dataset.category === category) {
			button.classList.add('active')
		} else {
			button.classList.remove('active')
		}
	})
}

// Функция для создания кнопок категорий
function createCategoryButtons() {
	const categories = ['soup', 'main_dish', 'salad', 'dessert', 'drink']
	const categoryNames = {
		soup: 'Супы',
		main_dish: 'Горячие блюда',
		drink: 'Напитки',
		salad: 'Салаты и стартеры',
		dessert: 'Десерты',
	}

	categories.forEach(category => {
		const button = document.createElement('button')
		button.className = 'category-button'
		button.textContent = categoryNames[category]
		button.dataset.category = category
		button.addEventListener('click', () => displayDishesByCategory(category))
		categoryButtonsContainer.appendChild(button)
	})
}

// Функция для отображения информации о комбо
function displayComboInfo() {
	comboInfoContainer.innerHTML = '' // Очищаем контейнер

	const comboContent = document.createElement('div')
	comboContent.className = 'combo-content'

	const title = document.createElement('h3')
	title.textContent = 'Возможные комбо:'
	comboContent.appendChild(title)

	const comboIconsContainer = document.createElement('div')
	comboIconsContainer.id = 'combo-icons'

	// --- ВСТАВЬТЕ ССЫЛКИ НА ИКОНКИ ЗДЕСЬ ---
	const iconPaths = {
		soup: 'images/soupicon.png',
		main_dish: 'images/mainicon.png',
		salad: 'images/saladicon.png',
		drink: 'images/drinkicon.png',
		dessert: 'images/desserticon.png',
	}
	// -----------------------------------------

	const combosToShow = [
		['soup', 'main_dish', 'salad', 'drink'],
		['soup', 'main_dish', 'drink'],
		['soup', 'drink'],
		['main_dish', 'salad', 'drink'],
		['main_dish', 'drink'],
		['salad', 'drink'],
		['dessert'],
	]

	combosToShow.forEach(combo => {
		const comboDiv = document.createElement('div')
		comboDiv.className = 'combo-option'
		combo.forEach((iconKey, index) => {
			const img = document.createElement('img')
			img.src = iconPaths[iconKey] // Путь берется из объекта iconPaths
			img.alt = iconKey
			img.className = 'combo-icon'
			comboDiv.appendChild(img)

			if (index < combo.length - 1) {
				const plus = document.createElement('span')
				plus.textContent = ' + '
				plus.className = 'combo-separator'
				comboDiv.appendChild(plus)
			}
		})
		comboIconsContainer.appendChild(comboDiv)
	})

	comboContent.appendChild(comboIconsContainer)
	comboInfoContainer.appendChild(comboContent)
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	createCategoryButtons()
	displayComboInfo()
	displayDishesByCategory('soup')
	updateOrderDisplay()

	const customerForm = document.querySelector('.customer-form')
	const formErrorMessage = document.getElementById('form-error-message')

	customerForm.addEventListener('submit', event => {
		const comboCheck = checkCombo()
		const hasSelectedDishes = Object.values(selectedDishes).some(
			dish => dish !== null
		)

		if (hasSelectedDishes && !comboCheck.isCombo) {
			event.preventDefault() // Отменяем отправку формы
			formErrorMessage.textContent = comboCheck.message
		} else {
			formErrorMessage.textContent = ''
		}
	})
})
