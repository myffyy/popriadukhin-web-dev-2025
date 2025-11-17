// --- Общие данные ---

// Данные о блюдах, загружаемые один раз
export let dishes = []

// Определение комбо-наборов
export const combos = [
	{ name: 'Комбо 1', categories: ['soup', 'main-course', 'salad', 'drink'] },
	{ name: 'Комбо 2', categories: ['soup', 'main-course', 'drink'] },
	{ name: 'Комбо 3', categories: ['soup', 'drink'] },
	{ name: 'Комбо 4', categories: ['main-course', 'salad', 'drink'] },
	{ name: 'Комбо 5', categories: ['main-course', 'drink'] },
	{ name: 'Комбо 6', categories: ['salad', 'drink'] },
]

// --- Общие функции ---

/**
 * Асинхронно загружает данные о блюдах с сервера.
 */
export async function loadDishes() {
	if (dishes.length > 0) return // Не загружать, если уже загружено
	const url = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		// Присваиваем загруженные данные экспортируемой переменной
		dishes.splice(0, dishes.length, ...(await response.json()))
	} catch (error) {
		console.error('Ошибка при загрузке данных о блюдах:', error)
		// Можно добавить уведомление для пользователя
	}
}

/**
 * Утилита для создания DOM-элементов.
 * @param {string} tag - Имя тега.
 * @param {object} attributes - Объект с атрибутами элемента.
 * @param  {...any} children - дочерние элементы.
 * @returns {HTMLElement} - Созданный элемент.
 */
export function createElement(tag, attributes, ...children) {
	const element = document.createElement(tag)
	Object.assign(element, attributes)
	if (children.length > 0) {
		element.append(...children.filter(c => c !== null))
	}
	return element
}

/**
 * Проверяет, соответствует ли набор выбранных блюд какому-либо комбо.
 * @param {object} selectedDishes - Объект с выбранными блюдами.
 * @returns {{isCombo: boolean, message: string}} - Результат проверки.
 */
export function checkCombo(selectedDishes) {
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
			return { isCombo: true, message: 'Комбо собрано!' }
		}
	}

	return {
		isCombo: false,
		message: 'Выбранные блюда не соответствуют ни одному комбо.',
	}
}
