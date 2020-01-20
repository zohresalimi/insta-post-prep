const rp = require("request-promise")
const cheerio = require("cheerio")
var $

async function processProduct(url) {
	console.log("Started parsing url: ", url)
	const html = await rp(url).catch(err => {
		console.log(err)
		return "error"
	})

	$ = cheerio.load(html)

	const brand = getProductBrand()
	const productImages = getProductImages()
	const productTitle = getProductTitle()
	const productPrice = getProductPrice()
	const shortenerUrl = await getShortenerUrl(url, productTitle, brand)

	console.log("URL parse complete...", brand)
	return {
		brand,
		productImages,
		productTitle,
		productPrice,
		shortenerUrl
	}
}

function getRandomName(name) {
	return name.join("") + Math.round(Math.random() * 1000)
}

async function getShortenerUrl(short, title, brand) {
	const uri = "https://cutt.ly/api/api.php"
	const nameRegex = (title + brand).match(/[a-zA-Z]+/g)
	let name = getRandomName(nameRegex)
	console.log("Shortening...... : ", nameRegex)
	var options = {
		uri,
		qs: {
			key: "483d90b0ec16528f8f4964080ab532253e213",
			short,
			name
		}
	}

	const shortenedUrl = await rp(options)
	return JSON.parse(shortenedUrl)
}

function getProductBrand() {
	return $(".h-product-title h2").text()
}

function getProductImages() {
	let images = $("img")

	var srcList = []
	for (var i = 0; i < images.length; i++) {
		let { src } = images[i].attribs
		if (src.includes("?imwidth")) {
			let imageSrc = src.split("?")[0]
			let imageWidth = src.split("?")[1]
			srcList.push({
				src: imageSrc,
				size: imageWidth.split("=")[1]
			})
		}
	}
	return srcList
}

function getProductTitle() {
	return $(".h-product-title h1").text() || "No Title"
}

function getProductPrice() {
	var productPrice = {}
	productPrices = $(".h-product-price > *")
	if (productPrices.length > 1) {
		productPrice.discount = getProductDiscount(productPrices)
		let prices = getProductPrices(productPrices)
		productPrice.oldPrice = Math.max(...prices)
		productPrice.newPrice = Math.min(...prices)
	} else {
		let priceText = $(productPrices).text()
		priceText = priceText.replace(/\s/g, "")
		productPrice.amount = parseInt(priceText)
	}
	return productPrice
}

function getProductPrices(prices) {
	let priceList = []
	for (let i = 0; i < prices.length; i++) {
		const element = prices[i]
		if (
			!$(element)
				.text()
				.includes("%")
		) {
			let priceText = $(element).text()
			priceText = priceText.replace(/\s/g, "")
			priceList.push(parseInt(priceText))
		}
	}
	return priceList
}

function getProductDiscount(prices) {
	for (let i = 0; i < prices.length; i++) {
		const element = prices[i]
		if (
			$(element)
				.text()
				.includes("%")
		) {
			return parseInt($(element).text())
		}
	}
}
module.exports = { processProduct }
