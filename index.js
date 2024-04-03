const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/buscar', async (req, res) => {
    const placa = req.body.placa;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://consultas.atm.gob.ec/PortalWEB/paginas/clientes/clp_criterio_consulta.jsp');
    await page.focus('#ps_placa');
    await page.keyboard.type(placa);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#consultar')
    ]);

    await page.waitForSelector('.titulo');

    const datos = await page.evaluate(() => {
        const titulos = document.querySelectorAll('.titulo');
        const detalles = document.querySelectorAll('.detalle_formulario');

        const resultado = {};

        for (let i = 0; i < titulos.length; i++) {
            const titulo = titulos[i].textContent.trim();
            const detalle = detalles[i].textContent.trim();
            resultado[titulo] = detalle;
        }

        return resultado;
    });

    await browser.close();

    res.render('resultado', { datos });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
