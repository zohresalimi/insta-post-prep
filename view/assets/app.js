const processBtn = document.querySelector(".button-wrapper button")
const form = document.getElementById("form")
const textContainerElement = document.querySelector(".text-container")

async function paste(e) {
	e.preventDefault()
	var pasteText = document.querySelector(".url-input")
	const text = await navigator.clipboard.readText()
	pasteText.textContent = text
	if (pasteText.textContent) {
		processBtn.disabled = false
	}

	console.log(text)
}
const pasteBtn = document.querySelector("#paste-btn")

async function readFromClipboard() {
	const clipboardText = await navigator.clipboard.readText().catch(err => {
		console.log(`can't read from clipboard:`, err)
	})

	if (clipboardText) {
		pasteBtn.style.display = "block"
	} else {
		pasteBtn.style.display = "none"
	}
}

setInterval(readFromClipboard, 1000)
pasteBtn.addEventListener("click", paste)

function formSubmit(e) {
	e.preventDefault()
	const url = e.target.action
	const method = e.target.method
	const data = {
		url: document.getElementById("url").value
	}
	axios({ method, url, data }).then(function(res) {
		console.log(res)
		if (res.status) {
			renderTemplate(res.data.data)
			textContainerElement.style.display = "block"
		}
	})
}

function renderTemplate(temp) {
	const { brand, productImages, productTitle, productPrice } = temp
	const targetElement = document.querySelector(".text-container .content")
	const titleInput = document.createElement("input")
	titleInput.value = productTitle
	const propertyInput = document.createElement("input")
	propertyInput.value = productTitle
	const innerParagraph = document.createElement("div")
	innerParagraph.className = "rtl-text"

	innerParagraph.innerText = `
    برند: ${brand}
    ---------------
    خرید و ارسال از اروپا
    ${getPriceLabel(productPrice)}
    قیمت جدید + هزینه ارسال از اروپا  85 یورو (تا اطلاع ثانوی)
    قیمت نهایی به ریال در زمان ثبت سفارش محاسبه می شود
    ---------------
    ثبت سفارش پس از واریز 40 درصد قیمت کالا
    تسویه در زمان دریافت سفارش
    بررسی موجودیت کالا پیش از واریز وجه
    محاسبه قیمت ریالی در زمان ثبت سفارش
`

	targetElement.appendChild(titleInput)
	targetElement.appendChild(propertyInput)
	targetElement.appendChild(innerParagraph)
}

form.addEventListener("submit", formSubmit)
