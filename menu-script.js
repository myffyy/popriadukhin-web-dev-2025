// Импортируем данные о блюдах
import dishes from './dishes.js'

// Получаем ссылки на основные элементы
const dishesContainer = document.getElementById('dishes-container')

// Объект для отслеживания выбранных блюд
let selectedDishes = {
	soup: null,
	main_dish: null,
	drink: null,
}

// Элемент для отображения итоговой стоимости
let totalCostElement = null

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
	// Удаляем выделение с предыдущего блюда той же категории
	if (selectedDishes[dish.category]) {
		const prevDishElement = document.querySelector(
			`[data-dish="${selectedDishes[dish.category].keyword}"]`
		)
		if (prevDishElement) {
			prevDishElement.style.border = '2px solid transparent'
		}
	}

	// Сохраняем выбранное блюдо
	selectedDishes[dish.category] = dish

	// Выделяем новое блюдо
	const dishElement = document.querySelector(`[data-dish="${dish.keyword}"]`)
	if (dishElement) {
		dishElement.style.border = '2px solid #bb86fc'
	}

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
	const categories = ['soup', 'main_dish', 'drink']
	const categoryLabels = {
		soup: 'Супы',
		main_dish: 'Горячие блюда',
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
			const dishInfo = document.createElement('span')
			dishInfo.textContent = `${selectedDishes[category].name} - ${selectedDishes[category].price} ₽`
			dishInfo.style.color = '#bb86fc'
			categoryDiv.appendChild(dishInfo)
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
}

// Функция для расчета и отображения общей стоимости
function calculateAndDisplayTotal() {
	// Создаем или получаем элемент для отображения стоимости
	if (!totalCostElement) {
		totalCostElement = document.createElement('div')
		totalCostElement.id = 'total-cost'
		totalCostElement.className = 'total-cost'
	}

	// Рассчитываем общую сумму
	let total = 0
	Object.values(selectedDishes).forEach(dish => {
		if (dish) {
			total += dish.price
		}
	})

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

// Функция для отображения всех блюд на странице
function displayAllDishes() {
	// Очищаем контейнер перед добавлением новых элементов
	dishesContainer.innerHTML = ''

	// Создаем контейнеры для каждой категории
	const categories = ['soup', 'main_dish', 'drink']
	const categoryNames = {
		soup: 'Супы',
		main_dish: 'Горячие блюда',
		drink: 'Напитки',
	}

	categories.forEach(category => {
		// Создаем заголовок категории
		const categoryHeader = document.createElement('h2')
		categoryHeader.textContent = categoryNames[category]
		dishesContainer.appendChild(categoryHeader)

		// Создаем контейнер для карточек категории
		const categoryContainer = document.createElement('div')
		categoryContainer.className = 'dishes-container'

		// Фильтруем блюда по категории и создаем карточки
		const categoryDishes = dishes.filter(dish => dish.category === category)
		categoryDishes.forEach(dish => {
			const card = createDishCard(dish)
			categoryContainer.appendChild(card)
		})

		dishesContainer.appendChild(categoryContainer)
	})
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	displayAllDishes()
	updateOrderDisplay()
})
