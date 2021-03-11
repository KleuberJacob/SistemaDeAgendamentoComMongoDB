//Ao inves de utilizarmos os controllers estamos utilizando apenas Service
const mongoose = require('mongoose')
let appointment = require('../models/Appointment')
let AppointmentFactory = require('../factories/AppointmentFactory')
const nodeMailer = require('nodemailer')

const Appo = mongoose.model('Appointment', appointment)

class AppointmentService {
    
    async Create(name, email, cpf, description, date, time){//Funcao para criar os agendamentos
        let newAppo = new Appo({
            name,
            email,            
            cpf,
            description,
            date,
            time,
            finished: false,
            notified: false
        })
        try {
            await newAppo.save()
            return true
        } catch (err) {
            console.log(err)
            return false
        }        
    }

    async getAll(showFinished){//Funcao que busca todos agendamentos armazenados no DB

        if(showFinished){
            return await Appo.find()//Buscando todos os agendamentos salvos, incluindo os finalizados
        }else{
            let appos = await Appo.find({'finished': false})//Buscando somente agendamentos nao finalizados
            let appointments = []//Criando um array vazio
            
            appos.forEach(appointment => {//Percorrendo cada consulta encontrada armazenada na var=appos
                if(appointment.date != undefined){//Processando apenas consultas que possuam data != undefined
                    appointments.push(AppointmentFactory.Build(appointment))//Inserindo no novo array cada consulta encontrada depois de processada
                }                
            })

            return appointments//Retornando novo array com os dados devidamente tratados
        }
    }

    async getById(id){//Funcao responsavel por buscar os agendamentos por ID
        try {            
            let result = await Appo.findOne({'_id': id})
            if(result != undefined){
                return result
            }else{
                return false
            }            
        } catch (error) {
            console.log(error)
        }       
    }

    async finishAppointment(id){
        try {
            await Appo.findByIdAndUpdate(id, {finished: true})
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async searchAppointment(query){
        try {
            let res = await Appo.find().or([{email: query}, {cpf: query}])//Metodo para consulta ao DB atraves de 2 parametros
            return res                   
        } catch (error) {
            console.log(error)
            return []
        }
    }

    async sendNotification(){
        let appos = await this.getAll(false)

        let transporter = nodeMailer.createTransport({//Criando transporter para Nodemailer com dados do servico de testes Mailtrap
            host: 'smtp.mailtrap.io',
            port: 25,
            auth: {
                user: '7849a178a49360',
                pass: '0c5b58e903e76e'
            }
        })

        appos.forEach(async app => {
            let date = app.start.getTime()//Armazenando na variavel o start salvo no DB em milisegundos atraves da funcao getTime() 
            let hour = 1000 * 60 * 60 //Calculo de hora em milisegundos
            let gap = date - Date.now()//Pegando a hora da consulta salva no DB menos a hora atual 

            if(gap <= hour){
                
                if(!app.notified){

                    await Appo.findByIdAndUpdate(app.id,{notified: true})//Assim que ver que a consulta nao foi notificada estamos alterando o status de notificacao para true

                    transporter.sendMail({
                        from: 'Kleuber Jacob <emailficticio@email.com>',
                        to: app.email,
                        subject: 'Sua consulta vai acontecer em breve',
                        text: 'Sua consulta acontece dentro de uma hora'
                    }).then(() => {

                    }).catch(error => {
                        console.log(error)
                    })                   
                }
            }
        })
    }
}

module.exports = new AppointmentService()