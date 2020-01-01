const rp = require("request-promise")
const cheerio = require("cheerio")
var $

async function processProduct(url) {
	console.log("Started parsing url: ", url)
	const html = await rp(url).catch(function(err) {
		console.log(err)
		return "error"
	})

	$ = cheerio.load(html)

	var brandName = getProductBrand()
	var productImages = getProductImages()
	var productTitle = getProductTitle()
	var productPrice = getProductPrice()

	console.log("URL parse complete...", brandName)
	return {
		brand: brandName,
		productImages: productImages,
		productTitle: productTitle,
		productPrice: productPrice
	}
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
		productPrice.amount = parseInt($(productPrices).text())
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
			priceList.push(parseInt($(element).text()))
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
