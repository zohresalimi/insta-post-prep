const processBtn = document.querySelector(".button-wrapper button")
const form = document.getElementById("form")
const textContainerElement = document.querySelector(".text-container")
const urlInput = document.querySelector(".url-input")
const pasteBtn = document.querySelector("#paste-btn")

// const eurRate = async () => {
// 	const result = await getEurRate()
// 	return result
// }

const eurRate = getEurRate()

urlInput.addEventListener("change", function (e) {
	if (e.target.textContent) {
		e.target.disabled = false
	}
})

async function pasteFromClipboard(e) {
	e.preventDefault()
	const text = await navigator.clipboard.readText()
	urlInput.textContent = text
	if (urlInput.textContent) {
		processBtn.disabled = false
	}
}

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
pasteBtn.addEventListener("click", pasteFromClipboard)
var productDetail = {}

async function formSubmit(e) {
	e.preventDefault()
	const { action: url, method } = e.target
	const inputUrl = urlInput.value
	const data = {
		url: inputUrl
	}

	const resalt = await axios({ method, url, data })
	if (resalt.status) {
		productDetail = resalt.data.data
		renderTemplate()
		textContainerElement.style.display = "block"
	}
}

async function getEurRate() {
	const url = "https://api.exchangeratesapi.io/latest?symbols=SEK"
	const method = "get"
	const headers = {
		"Access-Control-Allow-Origin": "*"
	}

	return await axios({ method, url }, headers)
}

async function toEuro(sekPrice) {
	// const result = await getEurRate()
	let rate = await eurRate
	return (sekPrice / rate.data.rates.SEK).toFixed(0)
}

async function getPriceLabel(productPrice) {
	const benefit = 20
	var priceTemplate = ``
	const transportationPrice = 5
	if (productPrice.amount) {
		const sekPrice =
			productPrice.amount +
			productPrice.amount * (benefit / 100) +
			transportationPrice
		const mainPriceToEur = await toEuro(productPrice.amount)
		const finalPrice = await toEuro(sekPrice)
		priceTemplate = `
         قیمت: ${mainPriceToEur}
         قیمت جدید + هزینه ارسال از اروپا  ${finalPrice} یورو (تا اطلاع ثانوی)
        `
	} else {
		const sekPrice =
			productPrice.newPrice +
			productPrice.newPrice * (benefit / 100) +
			transportationPrice
		const oldPrice = await toEuro(productPrice.oldPrice)
		const newPrice = await toEuro(productPrice.newPrice)
		const finalPrice = await toEuro(sekPrice)
		priceTemplate = `قیمت: ${oldPrice
			.toString()
			.split("")
			.join("\u0336")} یورو
            قیمت جدید با ${productPrice.discount} درصد تخفیف: ${newPrice} یورو
            قیمت جدید + هزینه ارسال از اروپا  ${finalPrice} یورو (تا اطلاع ثانوی)
        `
	}

	return priceTemplate
}

async function renderTemplate() {
	const {
		brand,
		productImages,
		productTitle,
		productPrice,
		shortenerUrl
	} = productDetail
	const targetElement = document.querySelector(".text-container .content")
	targetElement.innerHTML = ""
	const titleInput = document.createElement("input")
	titleInput.value = productTitle
	titleInput.name = "input-title"
	titleInput.addEventListener("keyup", function (e) {
		// apply input values on final text
		applyTitleAndSize(e)
	})
	const propertyInput = document.createElement("input")
	propertyInput.value = productTitle
	propertyInput.name = "input-property"
	propertyInput.addEventListener("keyup", applyTitleAndSize)
	const innerParagraph = document.createElement("div")
	innerParagraph.id = "final-text"
	innerParagraph.className = "rtl-text"

	setParametersToInnerText(innerParagraph, {
		brand,
		productPrice,
		shortenerUrl
	})

	targetElement.appendChild(titleInput)
	targetElement.appendChild(propertyInput)
	targetElement.appendChild(innerParagraph)
	showImages(productImages)
}

async function setParametersToInnerText(elem, values) {
	elem.innerText = `
    ${values.title ? values.title : ""}
    برند: ${values.brand}${
		values.size
			? `
    ${values.size}`
			: ""
		}
    ---------------
    خرید و ارسال از اروپا
    ${await getPriceLabel(values.productPrice)}
    قیمت نهایی به ریال در زمان ثبت سفارش محاسبه می شود
    ---------------
    ثبت سفارش پس از واریز 40 درصد قیمت کالا
    تسویه در زمان دریافت سفارش
    بررسی موجودیت کالا پیش از واریز وجه
    محاسبه قیمت ریالی در زمان ثبت سفارش

    ${values.shortenerUrl.url.shortLink}
`
}

function showImages(productImages) {
	const imageWrapper = document.getElementById("images-wrapper")
	imageWrapper.innerHTML = ""
	for (let i = 0; i < productImages.length; i++) {
		const elementSrc = productImages[i].src
		const img = document.createElement("img")
		img.src = elementSrc
		imageWrapper.appendChild(img)
	}
}

function hideTextContainer() {
	const hideDetailBox = document.querySelector(".text-container")
	hideDetailBox.style.display = "none"
	document.querySelector(".url-input").textContent = ""
}

function applyTitleAndSize(e) {
	const { brand, productPrice, shortenerUrl } = productDetail
	// get input values
	const inputElements = document.querySelectorAll("input[name^='input-']")
	const title = inputElements[0].value
	const size = inputElements[1].value
	// get final text from page
	const finalTextDiv = document.getElementById("final-text")

	// apply input values to template string
	setParametersToInnerText(finalTextDiv, {
		brand,
		productPrice,
		shortenerUrl,
		title,
		size
	})

	// set changed text to page
}

form.addEventListener("submit", formSubmit)
