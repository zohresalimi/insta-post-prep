const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000;
const path = require('path')


const { processProduct } = require('./main')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('view'))

app.get('/', (request, response) => {
    response.sendFile(path.resolve('view/index.html'))
})

app.post('/process', async (req, res) => {
    const responseJson = {
        ok: true
    }
    var processedProduct = await processProduct(req.body.url).catch(error => {
        responseJson.status = false
    })

    if (processProduct) {
        responseJson.data = processedProduct
    }

    res.json(responseJson)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))