const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const AppointmentService = require('./services/AppointmentService')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/agendamento', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=> {
        console.log('Banco de Dados Conectado!')
    }).catch(error => {
        console.log(error)
})
mongoose.set('useFindAndModify', false);

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/cadastro', (req, res) => {
    res.render('create')
})

app.post('/create', async (req, res) => {        

    let status = await AppointmentService.Create(           
        req.body.name,
        req.body.email,
        req.body.cpf,
        req.body.description,
        req.body.date,
        req.body.time
    )
    
    if(status){
        res.redirect('/')        
    }else{
        res.sendStatus(406)
    }
})

app.get('/getcalendar', async (req, res) => {
    let appointment = await AppointmentService.getAll(false)
    res.json(appointment)
})

app.get('/event/:id', async (req, res) => {    
    let result = await AppointmentService.getById(req.params.id)
    if(result){
        console.log(result)
        res.render('event', {appointment: result})
    }else{
        res.send('O ID da consulta informada nao existe!!!')
    }    
})

app.post('/finish', async (req, res) => {
    let id = req.body.id
    let result = await AppointmentService.finishAppointment(id)

    if(result){
        res.redirect('/')
    }else{
        res.sendStatus(404)
    }
})

app.get('/list', async (req, res) => {   
    let appos = await AppointmentService.getAll(true)
    res.render('list', {appos})    
})

app.get('/searchresult', async (req, res) => {
    let appos = await AppointmentService.searchAppointment(req.query.busca)
    res.render('list', {appos})
})

let time = 1000 * 60 * 5

setInterval(async () => {

    await AppointmentService.sendNotification()     

},time)

app.listen(8080, () => {
    console.log('Servidor OnLine')
})