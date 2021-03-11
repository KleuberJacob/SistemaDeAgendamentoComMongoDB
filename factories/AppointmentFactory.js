 class AppointmentFactory{//Utilizada para que passemos objetos simples gerando objetos + complexos

    Build(simpleAppointment){//Responsavel por juntar os dados de data e hora das consultas geradas

        //Pegando os dados de data e hora para organizar dentro do calendario
        let day = simpleAppointment.date.getDate()+1//Devido horario gerado estar em 00:00 temos de acrescentar +1 para que o agendamento esteja na data correta e nao na data anterior
        let month = simpleAppointment.date.getMonth()
        let year = simpleAppointment.date.getFullYear()
        let hour = Number.parseInt(simpleAppointment.time.split(':')[0])
        let minute = Number.parseInt(simpleAppointment.time.split(':')[1])

        let newDate = new Date(year, month, day, hour, minute, 0, 0)
        //newDate.setHours( newDate.getHours() - 3 )//Setando timezone BR(-3) pois Date() utiliza padrao UTC(Universal)

        let appo = {
            id: simpleAppointment._id,
            title: simpleAppointment.name + ' - ' + simpleAppointment.description,
            start: newDate,
            end: newDate,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email            
        }

        return appo
    }

 }

 module.exports = new AppointmentFactory()